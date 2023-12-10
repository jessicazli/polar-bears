class MigrationVis {
  constructor(parentElement, geoData, bearData) {
    this.parentElement = parentElement;
    this.geoData = geoData;
    this.bearData = bearData;
    this.displayData = bearData;

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.margin = { top: 20, right: 0, bottom: 20, left: 0 };
    vis.width = 600;
    vis.height = 500;


    vis.svg = d3
      .select(`#${vis.parentElement}`)
      .append('svg')
      .attr('width', vis.width + vis.margin.left + vis.margin.right)
      .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
      .append('g')
      .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

    // Create a projection
    vis.projection = d3.geoOrthographic()
      .scale(vis.height / 0.3)
      .translate([vis.width - 100, vis.height + 150])
      .rotate([0, -90])
      .clipAngle(100)
      .precision(.5);

    // Define a geo generator and pass the projection to it
    vis.path = d3.geoPath()
      .projection(vis.projection);

    // Append tooltip
    vis.tooltip = d3.select(`#${vis.parentElement}`).append('div')
      .attr('class', 'tooltip')
      .attr('id', 'migrationTooltip');

    // Parse timestamps to create a time scale
    const parseTime = d3.timeParse("%m/%d/%Y %H:%M");
    const maxDate = d3.max(vis.bearData, d => parseTime(d.DateTimeUTC_ud));
    const minDate = d3.min(vis.bearData, d => parseTime(d.DateTimeUTC_ud));
    const startDate = dateFormatter(new Date(d3.min(vis.displayData, entry => new Date(entry.DateTimeUTC_ud))));
    const endDate = dateFormatter(new Date(d3.max(vis.displayData, entry => new Date(entry.DateTimeUTC_ud))));

    // Sort the displayData based on DateTimeUTC_ud
    vis.displayData.sort((a, b) => d3.ascending(parseTime(a.DateTimeUTC_ud), parseTime(b.DateTimeUTC_ud)));

    // Create a time scale for circle sizes
    vis.radiusScale = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([5, 0.2]); // Adjust the range for the desired size variation

    // Create a sequential color scale for time
    vis.colorScale = d3.scaleSequential()
      .domain([minDate, maxDate])
      .interpolator(d3.interpolateYlGnBu); // You can adjust the color scheme if needed



    // Bind data and create one path per GeoJSON feature
    vis.svg.selectAll("path")
      .data(vis.geoData.features)
      .enter()
      .append("path")
      .attr("d", vis.path)
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.2)
      .attr("fill-opacity", 0.2)
      .style("fill", "steelblue");



    // Append circles with tooltips
    vis.svg.selectAll(".circle")
      .data(vis.displayData)
      .enter()
      .append('circle')
      .attr("class", "circle")
      .attr("cx", d => vis.projection([d.longitude_ud, d.latitude_ud])[0])
      .attr("cy", d => vis.projection([d.longitude_ud, d.latitude_ud])[1])
      .attr("r", 0) // Start with radius 0
      .attr("stroke", "black")
      .attr("stroke-opacity", 0.4)
      .attr("fill", d => vis.colorScale(parseTime(d.DateTimeUTC_ud)))
      .attr("fill-opacity", 0.5)
      .on('mouseover', function (event, d) {
        d3.select(this).style('opacity', 1);
        const bearID = d.BearID_ud; // Corrected the typo

        vis.svg.selectAll('.circle')
          .style('opacity', d => (d.BearID_ud === bearID) ? 1 : 0.05);

        // vis.svg.selectAll('path')
        //   .style('opacity', d => (d.BearID_ud === bearID) ? 1 : 0.05);

        vis.tooltip.transition()
          .duration(100)
          .style('opacity', 0.9);

        vis.tooltip.html(`
          <div style="border-radius: 5px;  border: 2px solid #34629C; text-align: left; background: #D9E8F3; padding: 20px">
          <strong>Bear ID:</strong> ${bearID}
          <br>
          <strong>Locations found from:</strong> ${startDate} to ${endDate}
          </div>
          `)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
        vis.svg.selectAll('.circle').style('opacity', 1);
        vis.svg.selectAll('path').style('opacity', 1);

        vis.tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      })


      .transition()
      .duration(200) // Adjust the duration as needed
      .ease(d3.easeLinear)
      .delay((d, i) => i * 1) // Delay for each bear
      .attr("r", d => vis.radiusScale(parseTime(d.DateTimeUTC_ud)))

    // Append color legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legend = vis.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${vis.width - legendWidth},${vis.height - legendHeight - 10})`);

    const defs = legend.append('defs');

    const linearGradient = defs.append('linearGradient')
      .attr('id', 'linear-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    linearGradient.selectAll('stop')
      .data([
        { offset: '0%', color: vis.colorScale(minDate) },
        { offset: '100%', color: vis.colorScale(maxDate) }
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#linear-gradient)');

    // Add legend axis
    const legendScale = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .tickSize(0)
      .ticks(5);

    legend.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis);

    // Create zoom behavior
    vis.zoom = d3.zoom()
      .scaleExtent([1, 8]) // Set the minimum and maximum zoom levels
      .on("zoom", function (event) {
        vis.svg.attr("transform", event.transform);
      });

    // Apply zoom behavior to the SVG
    vis.svg.call(vis.zoom);




    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // Parse timestamps to create a time scale
    const parseTime = d3.timeParse("%m/%d/%Y %H:%M");

    // Sort the displayData based on DateTimeUTC_ud
    vis.displayData.sort((a, b) => d3.ascending(parseTime(a.DateTimeUTC_ud), parseTime(b.DateTimeUTC_ud)));

    const startDate = dateFormatter(new Date(d3.min(vis.displayData, entry => new Date(entry.DateTimeUTC_ud))));
    const endDate = dateFormatter(new Date(d3.max(vis.displayData, entry => new Date(entry.DateTimeUTC_ud))));

    // Update projection based on zoom
    vis.projection
      .scale(vis.height / 0.3)
      .translate([vis.width - 100, vis.height + 150]);

    // Update path based on new projection
    vis.path.projection(vis.projection);

    // Update GeoJSON paths
    vis.svg.selectAll("path")
      .attr("d", vis.path);

    // Update circle positions
    vis.svg.selectAll(".circle")
      .attr("cx", d => vis.projection([d.longitude_ud, d.latitude_ud])[0])
      .attr("cy", d => vis.projection([d.longitude_ud, d.latitude_ud])[1]);

    // Append new circles with transition
    const circles = vis.svg.selectAll(".circle")
      .data(vis.displayData);

    circles.enter()
      .append('circle')
      .attr("class", "circle")
      .attr("cx", d => vis.projection([d.longitude_ud, d.latitude_ud])[0])
      .attr("cy", d => vis.projection([d.longitude_ud, d.latitude_ud])[1])
      .attr("r", 0) // Start with radius 0
      .attr("stroke", "black")
      .attr("stroke-opacity", 0.4)
      .attr("fill", d => vis.colorScale(parseTime(d.DateTimeUTC_ud)))
      .attr("fill-opacity", 0.5)
      .on('mouseover', function (event, d) {
        d3.select(this).style('opacity', 1);
        const bearID = d.BearID_ud;

        vis.svg.selectAll('.circle')
          .style('opacity', d => (d.BearID_ud === bearID) ? 1 : 0.02)
          .attr("r", d => vis.radiusScale(parseTime(d.DateTimeUTC_ud)));

        // vis.svg.selectAll('path')
        //   .style('opacity', d => (d.BearID_ud === bearID) ? 1 : 0.02);

        vis.tooltip.transition()
          .duration(100)
          .style('opacity', 0.9);

        vis.tooltip.html(`
        <div style="border-radius: 5px;  border: 2px solid #34629C; text-align: left; background: #D9E8F3; padding: 20px">
        <strong>Bear ID:</strong> ${bearID}
        <br>
        <strong>Locations found from:</strong> ${startDate} to ${endDate}
        </div>
        `)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
        vis.svg.selectAll('.circle').style('opacity', 1);
        vis.svg.selectAll('path').style('opacity', 1);

        vis.tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      })
      .transition()
      .duration(200) // Adjust the duration as needed
      .ease(d3.easeLinear)
      .delay((d, i) => i * 1) // Delay for each bear
      .attr("r", d => vis.radiusScale(parseTime(d.DateTimeUTC_ud)));

    // Remove circles that are no longer needed
    circles.exit().remove();
  }

  updateData(newData) {
    this.displayData = newData;
    this.updateVis();
  }
}
