// subregionMap.js

class SubregionMap {
  constructor(parentElement, data) {
    this.parentElement = parentElement;
    this.subregionData = data;


    this.selectedSubregionFilter = document.getElementById('subregionFilter').value;
    // color - gray, red, myorange, green, orange, med blue, lightblue, pink, purple, darkblue, blue2
    this.colors = ['#DBE1E8', 'crimson', 'orange', 'forestgreen', '#EDA57F', '#4074B7', '#b5cfff', '#F2ABE9', '#367bf7', '#134078', '#25b4c4']
    this.colors2=['#AED1E6', '#d1e6f7', '#98c4e7','#26547C', '#112A59']

    this.subregionData.forEach(d => {
      d.Bear_Population = +d.Bear_Population;
      d.Sea_Ice_Change = +d.Sea_Ice_Change;
    })

    console.log(this.subregionData)
    // Initialize the chart
    this.initVis();

    // // Call updateChart on window resize
    // window.addEventListener('resize', this.updateChart.bind(this));
  }

  initVis() {
    // Set up dimensions
    let vis = this;


    vis.margin = { top: 50, right: 50, bottom: 50, left: 50 };
    vis.originalWidth = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
    vis.width = vis.originalWidth
    vis.height = 600;

    // Create SVG container

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
      .attr('width', vis.width + vis.margin.left + vis.margin.right)
      .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
      // .attr('viewBox', `0 0 ${vis.width} ${vis.height}`)
      // .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
    // .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);



    // tooltip
    vis.tooltip = d3.select("body").append('div')
      .attr('class', "tooltip")
      .attr('id', 'subregionTooltip')

    // colors
    vis.popChangeColors = d3.scaleOrdinal()
    .domain(['Likely increased', 'Likely decreased', 'Likely stable', 'NA'])
    .range([
        d3.color(vis.colors[2]).copy({opacity: 0.5}),
        d3.color(vis.colors[1]).copy({opacity: 0.5}),
        d3.color(vis.colors[3]).copy({opacity: 0.5}),
        d3.color(vis.colors[0]).copy({opacity: 0.7})
    ]);


    vis.ecoregionsColor = d3.scaleOrdinal()
    .domain(["Divergent", "Seasonal", "Archipelago", "Convergent", "NA"])
    .range([
      d3.color(vis.colors[5]).copy({opacity: 0.5}),
      d3.color(vis.colors2[2]).copy({opacity: 0.5}),
      d3.color(vis.colors2[3]).copy({opacity: 0.7}),
      d3.color(vis.colors2[4]).copy({opacity: 0.7}),
      d3.color(vis.colors[0]).copy({opacity: 0.7})
    ]);


    vis.popFilteredData = vis.subregionData.filter(row => row.Bear_Population !== 'NA');


    vis.populationMax = d3.max(vis.popFilteredData, d => d["Bear_Population"])
    vis.populationMin = d3.min(vis.popFilteredData, d => d["Bear_Population"])
    vis.populationSizeColor = d3.scaleSequential(t => d3.interpolate(d3.color("indigo").copy({opacity: 0.7}), d3.color("orange").copy({opacity: 0.7}))(t))
      .domain([vis.populationMin, vis.populationMax]);




    vis.seaIceFilteredData = vis.subregionData.filter(row => row.Sea_Ice_Change !== 'NA');

    vis.seaIceMax = d3.max(vis.seaIceFilteredData, d => d["Sea_Ice_Change"])
    vis.seaIceMin = d3.min(vis.seaIceFilteredData, d => d["Sea_Ice_Change"])
    vis.seaIceChangeColor = d3.scaleSequential(t => d3.interpolate(d3.color("indigo").copy({opacity: 0.7}), d3.color("orange").copy({opacity: 0.7}))(t))

      .domain([vis.seaIceMax, vis.seaIceMin]);


    // Update the chart
    this.wrangleData();
  }

  wrangleData() {
    let vis = this;

    // get filter value
    vis.selectedSubregionFilter = document.getElementById('subregionFilter').value;

    vis.updateChart()
  }


  updateChart() {
    let vis = this;


    // Update the SVG container width
    vis.svg.attr('width', vis.width + vis.margin.left + vis.margin.right);

    // Update legend
    createLegend(vis.selectedSubregionFilter);

    let imageGroup = vis.svg
      .append('g')
      .attr('class', 'image-group');

    // Append the image to the image group
    imageGroup
      .append('image')
      .attr('xlink:href', '/images/map2.png')



    // Create a group for the paths
    let pathGroup = vis.svg
      .append('g')
      .attr('class', 'path-group')
      .attr('transform', 'translate(45,65)');



    let subregionPaths = pathGroup.selectAll('path').data(vis.subregionData);

    // Update map
    subregionPaths.enter()
      .append('path')
      .merge(subregionPaths)
      .attr("d", d => d.Path_Data)
      .attr('class', d => `path-${d.Abbr}`)
      .attr('stroke', vis.colors[5]) // Set the stroke color
      .attr('stroke-width', 1.5)
      .attr("opacity", 0.85) // Set opacity to see the map under it
      .attr('fill', d => setColor(vis.selectedSubregionFilter, d[vis.selectedSubregionFilter]))
      .on('mouseover', function (event, d) {
        d3.select(this)
          .attr('stroke-width', '3px')
          .attr('stroke', vis.colors[9])

        vis.tooltip
          .style('opacity', 0.95)
          .html(`
                  <div style="border-radius: 5px;  border: 2px solid #34629C; text-align: left; background: white; padding: 20px">
                  <h3>${d.Region}</h3>
                  <p> <span style="font-weight: bold"> Region Code: </span>${d["Abbr"]} 
                  <br>
                  <span style="font-weight: bold"> Ecoregion: </span> ${d["Ecoregions"]}
                  <br>
                  <span style="font-weight: bold"> Population Size: </span> ${d["Bear_Population"]}
                  <br>
                  <span style="font-weight: bold"> Population Change: </span> ${d.Population_Change}
                  <br>
                  <span style="font-weight: bold"> Sea Ice Change: </span> ${d.Sea_Ice_Change}
                  <br>
                  <span>*NA or NaN means unknown or data is not available for 2021.</span>
                  </p>
                  </div>`)
          .style('left', event.pageX + 50 + 'px')
          .style('top', event.pageY - 20 + 'px');
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .attr('stroke-width', '1.5px')
          .attr('stroke', vis.colors[5])
        vis.tooltip
          .style('opacity', 0)
          .style("left", 0)
          .style("top", 0)
          .html(``);
      })
      .each(function (d) {
        // Get the bounding box of the path
        let bbox = this.getBBox();

        // Calculate the centroid of the bounding box
        let centroidX = bbox.x + bbox.width / 2;
        let centroidY = bbox.y + bbox.height / 2;

        // Append a text label
        vis.svg.append('text')
          .attr('class', 'label-text') // Add class to identify text labels
          .attr('x', centroidX)
          .attr('y', centroidY)
          .text(d.Abbr)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .attr('font-size', 10)
          .attr('fill', vis.colors[9])
          .attr('transform', 'translate(45,65)');
      });
    subregionPaths.exit().remove();



    function setColor(filterType, regionData) {
      switch (filterType) {
        case 'Ecoregions':
          return vis.ecoregionsColor(regionData) || vis.colors[0];
        case 'Population_Change':
          return vis.popChangeColors(regionData) || vis.colors[0];
        case 'Bear_Population':
          return vis.populationSizeColor(regionData) || vis.colors[0];
        case 'Sea_Ice_Change':
          return vis.seaIceChangeColor(regionData) || vis.colors[0];
        default:
          return vis.colors[0];
      }
    }

    function createLegend(filterType) {

      vis.svg.selectAll('.label-legend').remove();
      vis.svg.selectAll('.ordinal-legend').remove();
      switch (filterType) {
        case 'Ecoregions':
          return vis.createOrdinalLegend(vis.ecoregionsColor, ["Divergent", "Seasonal", "Archipelago", "Convergent", "NA"]);
        case 'Population_Change':
          return vis.createOrdinalLegend(vis.popChangeColors, ["Likely stable", "Likely increased", "Likely decreased", "NA"]);
        case 'Bear_Population':
          return vis.createGradientLegend(vis.populationSizeColor, vis.populationMax, vis.populationMin, "Bear Population");
        case 'Sea_Ice_Change':
          return vis.createGradientLegend(vis.seaIceChangeColor, vis.seaIceMin, vis.seaIceMax, "Sea Ice Change");
        default:
          return ""
      }
    }

  }


  createGradientLegend(color, domain, min, title) {

    let vis = this;

    // Set up legend group for Sea Ice Change
    let gradientLegend = vis.svg.append('g')
      .attr('class', 'label-legend')

    // Add gradient definition
    let gradient = gradientLegend.append('defs')
      .append('linearGradient')
      .attr('id', 'label-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    // Calculate evenly spaced gradient stops
    let numStops = 20;
    let stopOffsets = d3.range(numStops).map(i => i / (numStops - 1));

    gradient.selectAll('stop')
      .data(stopOffsets)
      .enter()
      .append('stop')
      .attr('offset', d => d * 100 + '%')
      .attr('stop-color', d => color(d * domain));

    // Add gradient rectangle
    gradientLegend.append('rect')
      .attr('width', 15)
      .attr('height', 180)
      .attr('fill', 'url(#label-gradient)')
      .attr('transform', 'translate(20, 560) rotate(-90)')
    // .attr('transform', 'rotate(20)'); // Rotate by 0 degrees


    gradientLegend.append('text')
      .attr('x', 10)
      .attr('y', 580)
      .text(min)
      .attr("fill", vis.colors[9])


    gradientLegend.append('text')
      .attr('x', 190)
      .attr('y', 580)
      .text(domain)
      .attr("fill", vis.colors[9])


    // Legend title
    // gradientLegend.append('text')
    //   .attr('x', -8)
    //   .attr('y', -10)
    //   .attr('text-anchor', 'middle')
    //   .text(title)


  }

  createOrdinalLegend(colorScale, domain, title) {
    let vis = this;

    // Set up legend group for Ecoregions or Population Change
    let ordinalLegend = vis.svg.append('g')
      .attr('class', 'ordinal-legend');

    // Add legend items
    const legendItems = ordinalLegend.selectAll('.ordinal-legend-item')
      .data(domain)
      .enter().append('g')
      .attr('class', 'ordinal-legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20 + 500})`);

    // Add colored rectangles
    legendItems.append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', d => colorScale(d));

    // Add legend text
    legendItems.append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '0.35em')
      .text(d => d)
      .attr("fill", vis.colors[9]);

    // Legend title
    // ordinalLegend.append('text')
    //   .attr('x', 0)
    //   .attr('y', -10)
    //   .attr('text-anchor', 'start')
    //   .text(title)
    //   .attr('transform', `translate(${vis.width - 300}, ${vis.height - 5})`);
  }


  highlightMap(Abbr, bool) {
    let vis = this;

    let mapPath = d3.selectAll(`.path-${Abbr}`);

    if (bool) {
      mapPath.attr('stroke-width', 2.5)
        .attr('stroke', vis.colors[9])
        .attr("opacity", 1);
    } else {
      mapPath.attr('stroke-width', 1.5)
        .attr('stroke', vis.colors[5])
        .attr("opacity", 0.85)
    }
  }



}
