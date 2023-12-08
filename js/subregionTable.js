class SubregionTable {

  constructor(parentElement, data) {
      this.parentElement = parentElement;
      this.subregionData = data;
      this.displayData = [];
   
      // color - gray, yellow, red, green, orange, med blue, lightblue, pink, purple, darkblue
      this.colors = ['#DBE1E8', '#FEF192', '#F85959', '#A4E296', '#EDA57F', '#4074B7', '#add8e6', '#F2ABE9', '#ABABF2', '#134078']
      // get filter
      this.selectedSubregionFilter = document.getElementById('subregionFilter').value;

      this.subregionData.forEach(d => {
        d.Bear_Population = +d.Bear_Population;
        d.Sea_Ice_Change = +d.Sea_Ice_Change;
      })
      
      console.log(this.subregionData)
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

      tableObject.popChangeColors = d3.scaleOrdinal()
      .domain(['Likely increased', 'Likely decreased', 'Likely stable', 'NA'])
      .range([tableObject.colors[2], tableObject.colors[1], tableObject.colors[3], tableObject.colors[0]]);

      tableObject.ecoregionsColor = d3.scaleOrdinal()
        .domain(["Divergent", "Seasonal", "Archipelago", "Convergent", "NA"])
        .range([tableObject.colors[6], tableObject.colors[7], tableObject.colors[8], tableObject.colors[1], tableObject.colors[0]])

      tableObject.popFilteredData = tableObject.subregionData.filter(row => row.Bear_Population !== 'NA');
      console.log(tableObject.popFilteredData, "pop data", tableObject.popFilteredData.map(d => d.Bear_Population))

      tableObject.populationMax = d3.max(tableObject.popFilteredData, d => d["Bear_Population"])
      tableObject.populationMin = d3.min(tableObject.popFilteredData, d => d["Bear_Population"])
      tableObject.populationSizeColor = d3.scaleSequential()
        .domain([tableObject.populationMin, tableObject.populationMax])
        .interpolator(d3.interpolateGnBu); 


        tableObject.seaIceFilteredData = tableObject.subregionData.filter(row => row.Sea_Ice_Change !== 'NA');
        tableObject.seaIceMax = d3.max(tableObject.seaIceFilteredData, d => d["Sea_Ice_Change"])
        tableObject.seaIceMin = d3.min(tableObject.seaIceFilteredData, d => d["Sea_Ice_Change"])
        tableObject.seaIceChangeColor = d3.scaleSequential()
        .interpolator(d3.interpolateRdPu)
        .domain([tableObject.seaIceMax, tableObject.seaIceMin]); 

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
        if (tableObject.selectedSubregionFilter === "Sea_Ice_Change"){
          return valueA - valueB;
        } else{
          return valueB - valueA
        }
      });
    }
   
      console.log(tableObject.displayData, "display data");

      tableObject.updateTable();

  }

  updateTable() {
      let tableObject = this;

      console.log("col name", tableObject.rolName, tableObject.selectedSubregionFilter, "selected category update vis sub region")
      console.log(tableObject.displayData, "display data in update table");

      function setColor(filterType, regionData) {
        switch (filterType) {
          case 'Ecoregions':
            return tableObject.ecoregionsColor(regionData) || tableObject.colors[0];
          case 'Population_Change':
            return tableObject.popChangeColors(regionData) || tableObject.colors[0];
          case 'Bear_Population':
            return tableObject.populationSizeColor(regionData) || tableObject.colors[0];
          case 'Sea_Ice_Change':
            console.log('sea ice change', regionData)
            return tableObject.seaIceChangeColor(regionData) || tableObject.colors[0];
          default:
            return tableObject.colors[0];
        }
      }

      // update table cols
      tableObject.thead.html(
        `<tr>
            <th scope="col">Region</th>
            <th scope="col">Abbr</th>
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
          row.style('opacity', 0.5);
          console.log('background color', `rgba(${setColor(tableObject.selectedSubregionFilter, region[tableObject.rolName])}80)`)
          // if (typeof region[tableObject.rolName] === 'number') {
          //   // If the value is a number, use the quantitative color scale
          //   row.style('background-color', `${colorScale(region[tableObject.rolName])}80`);
          // } else {
          //   // If the value is not a number (e.g., 'NA'), use a default color
          //   row.style('background-color', 'gray');
          // }
      
          // row.on('mouseover', function () {
          //     console.log(' you hovered over a row - the selected state is', state.state)
          //     selectedState = state.state;
          //     myBrushVis.wrangleDataResponsive();
          // })
      })

      

  }
}