
class DietStacked {
  constructor(parentElement, data) {
    this.parentElement = parentElement;
    this.data = data;
    this.displayData = [];

    this.initVis();
  }

  initVis() {
    let vis = this;

    // Set up dimensions
    vis.margin = { top: 20, right: 20, bottom: 50, left: 50 };
    vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
    vis.height = (document.getElementById(vis.parentElement).getBoundingClientRect().height / 1.5 ) ;

    // Create SVG container
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
      .attr('width', vis.width + vis.margin.left + vis.margin.right)
      .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
      .append('g')
      .attr("class", "svg-group")
      .attr('transform', `translate(0,${vis.margin.top})`);

    // Initialize tooltip
    vis.tooltip = d3.select("body").append('div')
      .attr('class', "tooltip")
      .attr('id', 'dietTooltip')
      .style('opacity', 0);
      
    vis.colors = ['#AED1E6', '#d1e6f7', '#98c4e7','#26547C', '#112A59']

    vis.chartGroup = vis.svg.append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(50, 20)`);



    // Create SVG container for legend
    vis.legend = vis.svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(0, ${-vis.margin.top})`); // Adjust the vertical position

    // Define the categories and corresponding colors
    const categories = ['Ringed seal','Beared seal','Seabird nestling','Bowhead whale', 'Beluga whale'];


    // Create legend rectangles
    vis.legend.selectAll('.legend-rect')
      .data(categories)
      .enter().append('rect')
      .attr('class', 'legend-rect')
      .attr('x', (d, i) => i * vis.width/4.5)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 20) 
      .attr('fill', (d, i) => vis.colors[i]);

    // Create legend text
    vis.legend.selectAll('.legend-text')
      .data(categories)
      .enter().append('text')
      .attr('class', 'legend-text')
      .attr('x', (d, i) => i * vis.width/4.5 + 25) 
      .attr('y', 15) 
      .text(d => d);
      // axis labels
    vis.xLabel = vis.svg.append("text")
        .attr("class", "x-axis-label")
        .attr("transform", `translate(${vis.width / 2 + 50}, ${vis.height + vis.margin.bottom -5})`)
        .style("text-anchor", "middle")
      .text("Year")
      .style("fill", "#134078")

    vis.yLabel = vis.svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", `rotate(-90)`)
        .attr("y", 0)
        .attr("x", -140)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Breakdown by Diet Type (%)")
        .style("fill","#134078")
    // Call updateVis to render the initial chart
    vis.wrangleData();
  }

  wrangleData(selectedDietCategory) {
    let vis = this;

    vis.selectedDietCategory = selectedDietCategory;

   // restructure data to create categories and series
    console.log(vis.data)
    vis.data.forEach(d => {
      d.Year = +d.Year;
      d.Bearded_seal = +d.Bearded_seal;
      d.Ringed_seal = +d.Ringed_seal;
      d.Beluga_whale = +d.Beluga_whale;
      d.Bowhead_whale = +d.Bowhead_whale;
      d.Seabird_nestling = +d.Seabird_nestling;
    });
  
    let rolledup = d3.rollups(
      vis.data,
      v => ({
        year: v[0].Year,
        Beared_seal: d3.sum(v, d => d.Bearded_seal),
        Beluga_whale: d3.sum(v, d => d.Beluga_whale),
        Bowhead_whale: d3.sum(v, d => d.Bowhead_whale),
        Ringed_seal: d3.sum(v, d => d.Ringed_seal),
        Seabird_nestling: d3.sum(v, d => d.Seabird_nestling),
        total: d3.sum(v, d => d.Seabird_nestling + d.Bearded_seal + d.Beluga_whale+d.Ringed_seal+d.Bowhead_whale),
      }),
      d => d.Year
    );


    vis.displayData = rolledup.map(([year, data]) => ({
        year: year,
        Beared_seal: +((data.Beared_seal / data.total) * 100).toFixed(2),
        Beluga_whale: +((data.Beluga_whale / data.total) * 100).toFixed(2),
        Bowhead_whale: +((data.Bowhead_whale / data.total) * 100).toFixed(2),
        Ringed_seal: +((data.Ringed_seal / data.total) * 100).toFixed(2),
        Seabird_nestling: +((data.Seabird_nestling / data.total) * 100).toFixed(2),
      }));
    // Sort by year
    vis.displayData.sort((a, b) => a["year"] - b["year"]);

    console.log("displaydata dietstacked", vis.displayData)
    // filter
    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // Update scales
    vis.yScale = d3.scaleLinear().range([vis.height-20, 0]).domain([0, 100]);
    vis.xScale = d3.scaleBand().range([0, vis.width]).padding(0.1).domain(vis.displayData.map(d => d.year));
  
  
    // Update axes
    vis.xAxis = d3.axisBottom(vis.xScale);
    vis.yAxis = d3.axisLeft(vis.yScale);
  
    vis.chartGroup.selectAll('.axis').remove();
  
    vis.xGroup = vis.chartGroup.append('g')
      .attr('class', 'x-axis axis diet-axis')
      .attr('transform', `translate(0, ${vis.height-20})`)
      .call(vis.xAxis)
      .selectAll("text")
      .attr("dx", "0.5em") // Adjust the horizontal position if needed
      .attr("dy", "1em");
  
    vis.yGroup = vis.chartGroup.append('g')
      .attr('class', 'y-axis axis diet-axis')
      .call(vis.yAxis)
      
  
    // Create a stack generator
    let stack = d3.stack()
      .keys(['Ringed_seal','Beared_seal','Seabird_nestling','Bowhead_whale', 'Beluga_whale'])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);
  
    // Stack the data
    let series = stack(vis.displayData.map(d => d));

    // Create color scale
    const color = d3.scaleOrdinal()
      .domain(['Ringed_seal','Beared_seal','Seabird_nestling','Bowhead_whale', 'Beluga_whale'])
      .range(vis.colors);
  
    // Create/update stacked bars
    vis.chartGroup.selectAll('.stacked-bar').remove();

    vis.chartGroup.selectAll('.stacked-bar')
      .data(series)
      .enter().append('g')
      .attr('class', 'stacked-bar')
      .attr('fill', d => color(d.key))
      .selectAll('rect')
      .data(d => d)
      .enter().append('rect')
      .attr('x', d => vis.xScale(d.data.year))
      .attr('y', d => vis.yScale(d[1]))
      .attr('height', d => vis.yScale(d[0]) - vis.yScale(d[1]))
      .attr('width', vis.xScale.bandwidth())
      .on('mouseover', function (event, d) {
        d3.select(this)
          .attr('stroke-width', '1px')
          .attr('stroke', '#333');
  

    const key = d3.select(this.parentNode).datum().key;
    const yearData = vis.displayData.find(entry => entry.year === d.data.year);
    console.log(yearData, "yeardata")
    const percent = yearData[key]
  
    vis.tooltip
      .style('opacity', 0.9)
      .html(`
        <div style="border: thin solid lightblue; border-radius: 5px; text-align: left; background: #fff; color: black; padding: 10px">
          <h3>${d.data.year}</h3>
          <p>${key}: ${percent}%</p>
        </div>`)
      .style('left', event.pageX + 10 + 'px')
      .style('top', event.pageY - 15 + 'px');
    })
    
    .on('mouseout', function (event, d) {
      d3.select(this)
        .attr('stroke-width', '0px');

      vis.tooltip
        .style('opacity', 0)
        .style("left", 0)
        .style("top", 0)
        .html(``);
    });

  }
  
}