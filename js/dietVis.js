// dietvis.js


class DietVis {
  constructor(parentElement, data) {
      this.parentElement = parentElement;
      this.data = data;
      this.displayData = [];

      this.colors=["#134078", "#add8e6"]
      console.log(this.data)
      // Initialize the chart
      this.initVis();


  }

  initVis() {
      // Set up dimensions
      let vis = this;


        vis.margin = { top: 20, right: 20, bottom: 50, left: 50 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 400;

        // Create SVG container
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr('width', vis.width + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'dietTooltip')
      // // Create scales
      vis.xScale = d3.scaleBand().range([30, vis.width - 30]).padding(0.1);
      vis.yScale = d3.scaleLinear().range([vis.height, 0]);

      // axes
      vis.xAxis = d3.axisBottom(vis.xScale);

      vis.yAxis = d3.axisLeft(vis.yScale);

        // groups
      vis.xGroup = vis.svg.append("g")
        .attr("class", "x-axis axis diet-axis")
        .attr("transform", "translate(0," + vis.height + ")");

      vis.yGroup = vis.svg.append("g")
          .attr("class", "y-axis axis diet-axis")
          .attr("transform", "translate(30, 0)");

      // create bars
      vis.bar = vis.svg.selectAll("rect")
        .attr("class", "bar")
        .data([]);

      // axis labels
      vis.xLabel = vis.svg.append("text")
        .attr("class", "x-axis-label")
        .attr("transform", `translate(${vis.width / 2}, ${vis.height + vis.margin.bottom - 2})`)
        .style("text-anchor", "middle")
   
      vis.yLabel = vis.svg.append("text")
          .attr("class", "y-axis-label")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - vis.margin.left)
          .attr("x", 0 - (vis.height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")

      // Update the chart
      this.wrangleData();
    }

  wrangleData() {
    let vis = this;
    let filteredData = [];
    // Convert strings to numbers where needed
    vis.data.forEach(d => {
      d.Year = +d.Year;
      d.Bearded_seal = +d.Bearded_seal;
      d.Ringed_seal = +d.Ringed_seal;
      d.Beluga_whale = +d.Beluga_whale;
      d.Bowhead_whale = +d.Bowhead_whale;
      d.Seabird_nestling = +d.Seabird_nestling;

    });

    console.log("wrangle data", vis.data)

    vis.displayData = d3.rollups(
      vis.data,
      v => ({
          num_bears: v.length,
          total_consumption: +d3.sum(v, d => d.Bearded_seal + d.Ringed_seal + d.Beluga_whale + d.Bowhead_whale + d.Seabird_nestling).toFixed(2),
          total_Bearded_seal: d3.sum(v, d => d.Bearded_seal),
          avg_Bearded_seal: +(d3.sum(v, d => d.Bearded_seal)/v.length).toFixed(2),
          total_Ringed_seal: d3.sum(v, d => d.Ringed_seal),
          avg_Ringed_seal: +(d3.sum(v, d => d.Ringed_seal)/v.length).toFixed(2),
          total_Beluga_whale: d3.sum(v, d => d.Beluga_whale),
          avg_Beluga_whale: +(d3.sum(v, d => d.Beluga_whale)/v.length).toFixed(2),
          total_Bowhead_whale: d3.sum(v, d => d.Bowhead_whale),
          avg_Bowhead_whale: +(d3.sum(v, d => d.Bowhead_whale)/v.length).toFixed(2),
          total_Seabird_nestling: d3.sum(v, d => d.Seabird_nestling),
          avg_Seabird_nestling: +(d3.sum(v, d => d.Seabird_nestling)/v.length).toFixed(2),
      }),
      d => d.Year
  );

    // Sort by the total consumption in descending order
    vis.displayData.sort((a, b) => b[1].total_consumption - a[1].total_consumption);

    console.log("wrangle display data",vis.displayData)
      // filter
    vis.updateChart()
  }

  updateChart() {
    let vis = this;
    console.log("update chart diet", vis.displayData)

    // max domain
    vis.domainMax = d3.max(vis.displayData[1], d => d.total_consumption);
    console.log(vis.domainMax)
    // Sort by year
    vis.displayData.sort((a, b) => a[0] - b[0]);

    console.log("years", vis.displayData.map(d => d[0]))
    
    // Update scales
    vis.yScale.domain([0, vis.domainMax]);
    vis.xScale.domain(vis.displayData.map(d => d[0]));

    // Update axes
    vis.xGroup.call(vis.xAxis)
      .selectAll("text")
      .attr("dx", "0.5em") // Adjust the horizontal position if needed
      .attr("dy", "1em")



    vis.yGroup.call(vis.yAxis);


    vis.xLabel
      .text("Years")
      .style("fill", vis.colors[0]);
    vis.yLabel
      .text("Total Consumption")
      .style("fill", vis.colors[0]);

    // Create a bar chart
    vis.bar = vis.svg.selectAll('.bar')
        .data(vis.displayData);

    vis.bar.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => vis.xScale(d[0]))
        .attr('y', d => vis.yScale(d[1].total_consumption))
        .attr("height", d => vis.height - vis.yScale(d[1].total_consumption))

        .attr('width', d => vis.xScale.bandwidth())
        .style("fill", vis.colors[1])

        .on('mouseover', (event, d) => {
            vis.tooltip
                .style('opacity', 0.9)
                .html(`
                <div style="border: thin solid lightblue; border-radius: 5px; text-align: left; background: ${vis.colors[0]}; color: white; padding: 20px">
                <h3>${d[0]}</h3>
                <p> <span style="font-weight: bold;color: #dfeaf8;"> Year: </span>${d[0]} 
                <br>
                <span style="font-weight: bold;color: #dfeaf8;"> Total Consumption: </span> ${d[1].total_consumption}
                <br>
                <span style="font-weight: bold; color: #dfeaf8;"> Number of Polar Bears Captured: </span> ${d[1].num_bears} </p>
                  </div>`)
                .style('left', event.pageX + 10 + 'px')
                .style('top', event.pageY - 15 + 'px');
        })
        .on('mouseout', () => {
            vis.tooltip.style('opacity', 0);
        });

    vis.bar.exit().remove();
}

}

