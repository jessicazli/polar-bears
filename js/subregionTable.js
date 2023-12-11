class SubregionTable {

  constructor(parentElement, data, subregionMap) {
    this.parentElement = parentElement;
    this.subregionData = data;
    this.displayData = [];
    this.subregionMap = subregionMap

    // color - gray, myorange, red, green, orange, med blue, lightblue, pink, purple, darkblue, blue2
    this.colors = ['#DBE1E8', 'crimson', 'orange', 'forestgreen', '#EDA57F', '#4074B7', '#b5cfff', '#F2ABE9', '#367bf7', '#134078', '#25b4c4']
    this.colors2 = ['#AED1E6', '#d1e6f7', '#98c4e7', '#26547C', '#112A59']
    // get filter
    this.selectedSubregionFilter = document.getElementById('subregionFilter').value;

    this.subregionData.forEach(d => {
      d.Bear_Population = +d.Bear_Population;
      d.Sea_Ice_Change = +d.Sea_Ice_Change;
    })

    // Initialize the chart
    this.initTable();
  }

  initTable() {
    let tableObject = this
    tableObject.table = d3.select(`#${tableObject.parentElement}`)
      .append("table")
      .attr("class", "table table-hover")

    // append table head
    tableObject.thead = tableObject.table.append("thead")

    // append table body
    tableObject.tbody = tableObject.table.append("tbody")

    // color scales
    tableObject.popChangeColors = d3.scaleOrdinal()
      .domain(['Likely increased', 'Likely decreased', 'Likely stable', 'NA'])
      .range([
        d3.color(tableObject.colors[2]).copy({ opacity: 0.5 }),
        d3.color(tableObject.colors[1]).copy({ opacity: 0.5 }),
        d3.color(tableObject.colors[3]).copy({ opacity: 0.5 }),
        d3.color(tableObject.colors[0]).copy({ opacity: 0.7 })
      ]);



    tableObject.ecoregionsColor = d3.scaleOrdinal()
      .domain(["Divergent", "Seasonal", "Archipelago", "Convergent", "NA"])
      .range([
        d3.color(tableObject.colors2[4]).copy({ opacity: 0.5 }),
        d3.color(tableObject.colors2[2]).copy({ opacity: 0.5 }),
        d3.color(tableObject.colors2[3]).copy({ opacity: 0.8 }),
        d3.color(tableObject.colors[5]).copy({ opacity: 0.7 }),
        d3.color(tableObject.colors[0]).copy({ opacity: 0.7 })
      ]);


    tableObject.popFilteredData = tableObject.subregionData.filter(row => row.Bear_Population !== 'NA');

    tableObject.populationMax = d3.max(tableObject.popFilteredData, d => d["Bear_Population"])
    tableObject.populationMin = d3.min(tableObject.popFilteredData, d => d["Bear_Population"])
    tableObject.populationSizeColor = d3.scaleSequential(t => d3.interpolate(d3.color("orange").copy({ opacity: 0.7 }), d3.color("indigo").copy({ opacity: 0.7 }))(t))
      .domain([tableObject.populationMin, tableObject.populationMax]);




    tableObject.seaIceFilteredData = tableObject.subregionData.filter(row => row.Sea_Ice_Change !== 'NA');
    tableObject.seaIceMax = d3.max(tableObject.seaIceFilteredData, d => d["Sea_Ice_Change"])
    tableObject.seaIceMin = d3.min(tableObject.seaIceFilteredData, d => d["Sea_Ice_Change"])
    tableObject.seaIceChangeColor = d3.scaleSequential(t => d3.interpolate(d3.color("indigo").copy({ opacity: 0.7 }), d3.color("orange").copy({ opacity: 0.7 }))(t))
      .domain([tableObject.seaIceMin, tableObject.seaIceMax]);


    // set table order
    tableObject.EcoOrder = ['Divergent', 'Seasonal', 'Archipelago', 'Convergent', 'NA']
    tableObject.PopOrder = ['Likely stable', 'Likely increased', 'Likely decreased', 'NA']
    // wrangleData
    tableObject.wrangleData()
  }

  wrangleData() {
    let tableObject = this
    // reset data
    tableObject.displayData = [];

    // convert column name to string
    function convertColName(inputName) {
      let words = inputName.split('_');

      // Capitalize each word and join them with a space
      let outputString = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      return outputString;
    }

    // get filter value
    tableObject.selectedSubregionFilter = document.getElementById('subregionFilter').value;
    tableObject.rolName = convertColName(tableObject.selectedSubregionFilter)

    // update display data
    tableObject.subregionData.forEach(region => {
      // Create an object with dynamically named property
      let displayDataItem = {
        "Region": region.Region,
        "Abbr": region.Abbr,
      };

      // Dynamically set the property using tableObject.tableColName as the key
      displayDataItem[tableObject.rolName] = region[tableObject.selectedSubregionFilter];

      tableObject.displayData.push(displayDataItem);
    });

    console.log(tableObject.displayData, "display data")

    // sort display data
    if (
      tableObject.selectedSubregionFilter === "Bear_Population" ||
      tableObject.selectedSubregionFilter === "Sea_Ice_Change"
    ) {
      tableObject.displayData.sort((a, b) => {
        // Convert values to numbers and handle NaN
        let valueA = isNaN(a[tableObject.rolName]) ? 0 : a[tableObject.rolName];
        let valueB = isNaN(b[tableObject.rolName]) ? 0 : b[tableObject.rolName];

        // Sort in order
        if (tableObject.selectedSubregionFilter === "Sea_Ice_Change") {
          return valueA - valueB;
        } else {
          return valueB - valueA
        }
      });
    }

    if (tableObject.selectedSubregionFilter === "Ecoregions") {
      tableObject.displayData.sort((a, b) => {
        return tableObject.EcoOrder.indexOf(a[tableObject.rolName]) - tableObject.EcoOrder.indexOf(b[tableObject.rolName]);
      })
    }

    if (tableObject.selectedSubregionFilter === "Population_Change") {
      tableObject.displayData.sort((a, b) => {

        return tableObject.PopOrder.indexOf(a[tableObject.rolName]) - tableObject.PopOrder.indexOf(b[tableObject.rolName]);
      })
    }


    tableObject.updateTable();

  }

  updateTable() {
    let tableObject = this;
    // add color
    function setColor(filterType, regionData) {
      switch (filterType) {
        case 'Ecoregions':
          return tableObject.ecoregionsColor(regionData) || tableObject.colors[0];
        case 'Population_Change':
          return tableObject.popChangeColors(regionData) || tableObject.colors[0];
        case 'Bear_Population':
          return tableObject.populationSizeColor(regionData) || tableObject.colors[0];
        case 'Sea_Ice_Change':
          return tableObject.seaIceChangeColor(regionData) || tableObject.colors[0];
        default:
          return tableObject.colors[0];
      }
    }

    // update table cols
    tableObject.thead.html(
      `<tr>
            <th scope="col">Region</th>
            <th scope="col">Region Code</th>
            <th scope="col">${tableObject.rolName}</th>
        </tr>`
    )
    // reset tbody
    tableObject.tbody.html('')

    // loop over all regions
    tableObject.displayData.forEach(region => {
      let row = tableObject.tbody.append("tr")
      row.html(
        `<td>${region.Region}</td>
              <td>${region.Abbr}</td>
              <td>${region[tableObject.rolName]}`
      )
      row.style('background-color', setColor(tableObject.selectedSubregionFilter, region[tableObject.rolName]))
      row.on('mouseover', function (event, d) {
        // highlight corresdponding map area and add border
        tableObject.subregionMap.highlightMap(region.Abbr, true);
        row.style('border', '1px solid black');
      });

      row.on('mouseout', function (event, d) {
        // undo highlight corresdponding map area and border
        tableObject.subregionMap.highlightMap(region.Abbr, false);
        row.style('border', '');
      });

    })



  }
}