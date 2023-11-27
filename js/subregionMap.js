// subregionMap.js

class SubregionMap {
  constructor(parentElement, data) {
      this.parentElement = parentElement;
      this.subregionData = data;
  

      this.selectedSubregionFilter = document.getElementById('subregionFilter').value;
      // color - gray, yellow, red, green, orange, med blue, lightblue, pink, purple, darkblue
      this.colors = ['#DBE1E8', '#FEF192', '#F85959', '#A4E296', '#EDA57F', '#4074B7', '#add8e6', '#F2ABE9', '#ABABF2', '#134078']

      this.subregionData.forEach(d => {
        d.Bear_Population = +d.Bear_Population;
        d.Sea_Ice_Change = +d.Sea_Ice_Change;
      })
      
      console.log(this.subregionData)
      // Initialize the chart
      this.initVis();


  }

  initVis() {
      // Set up dimensions
      let vis = this;


        vis.margin = { top: 20, right: 20, bottom: 50, left: 50 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 500;

        // Create SVG container
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr('width', vis.width + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'subregionTooltip')
        // colors
        vis.popChangeColors = d3.scaleOrdinal()
          .domain(['Likely increased', 'Likely decreased', 'Likely stable', 'NA'])
          .range([vis.colors[2], vis.colors[1], vis.colors[3], vis.colors[0]]);

        vis.ecoregionsColor = d3.scaleOrdinal()
          .domain(["Divergent", "Seasonal", "Archipelago", "Convergent", "NA"])
          .range([vis.colors[6], vis.colors[7], vis.colors[8], vis.colors[1], vis.colors[0]])

        vis.popFilteredData = vis.subregionData.filter(row => row.Bear_Population !== 'NA');
        console.log(vis.popFilteredData, "pop data", vis.popFilteredData.map(d => d.Bear_Population))

        vis.populationMax = d3.max(vis.popFilteredData, d => d["Bear_Population"])
        vis.populationMin = d3.min(vis.popFilteredData, d => d["Bear_Population"])
        console.log(vis.populationMax, vis.populationMin)
        vis.populationSizeColor = d3.scaleSequential()
          .domain([vis.populationMin, vis.populationMax])
          .interpolator(d3.interpolateGnBu); 


        vis.seaIceFilteredData = vis.subregionData.filter(row => row.Sea_Ice_Change !== 'NA');
        console.log(vis.seaIceFilteredData, "sea ice data", vis.seaIceFilteredData.map(d => d.Sea_Ice_Change))
        vis.seaIceMax = d3.max(vis.seaIceFilteredData, d => d["Sea_Ice_Change"])
        vis.seaIceMin = d3.min(vis.seaIceFilteredData, d => d["Sea_Ice_Change"])
        console.log(vis.seaIceMin, vis.seaIceMax)
        vis.seaIceChangeColor = d3.scaleSequential()
          .interpolator(d3.interpolateGnBu)
          .domain([vis.seaIceMax, vis.seaIceMin]); 

 
      
      // Update the chart
      this.wrangleData();
    }

  wrangleData() {
    let vis = this;

    vis.selectedSubregionFilter = document.getElementById('subregionFilter').value;
    console.log("subregion filter", vis.selectedSubregionFilter)

    vis.updateChart()
  }

  updateChart() {
    let vis = this;
    console.log(vis.selectedSubregionFilter, "selected category update vis sub region")

    let subregionPaths = vis.svg.selectAll('path')
    .data(vis.subregionData);

    subregionPaths.enter()
    .append('path')
    .merge(subregionPaths)
    .attr("d", d => d.Path_Data)
    .attr('stroke', vis.colors[5]) // Set the stroke color
    .attr('stroke-width', 1.5)
    .attr('fill', d => setColor(vis.selectedSubregionFilter, d[vis.selectedSubregionFilter]))
    .on('mouseover', function(event, d) {
      d3.select(this)
      .attr('stroke-width', '2.5px')
        .attr('stroke', vis.colors[9])

        vis.tooltip
            .style('opacity', 0.98)
            .html(`
            <div style="border-radius: 5px;  border: 2px solid #34629C; text-align: left; background: #D9E8F3; color: ${vis.colors[9]}; padding: 20px">
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
    .on('mouseout', function(event, d){
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
    
      vis.svg.append('text')
        .attr('x', centroidX)
        .attr('y', centroidY)
        .text(d.Abbr)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-size', 10)
        .attr('fill', vis.colors[9]);
    });

  subregionPaths.exit().remove();


  function setColor(filterType, regionData) {
    switch (filterType) {
      case 'Ecoregions':
        return vis.ecoregionsColor(regionData) || vis.colors[0];
      case 'Population_Change':
        console.log(vis.popChangeColors(regionData), vis.colors, "pop change");
        return vis.popChangeColors(regionData) || vis.colors[0];
      case 'Bear_Population':
        console.log(vis.populationSizeColor(regionData), "pop size")
        return vis.populationSizeColor(regionData) || vis.colors[0];
      case 'Sea_Ice_Change':
        console.log(vis.seaIceChangeColor(regionData), 'sea ice change')
        return vis.seaIceChangeColor(regionData) || vis.colors[0];
      default:
        return vis.colors[0];
    }
  }
  
}

  
  }


