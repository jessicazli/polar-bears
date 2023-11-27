class MigrationVis {

  constructor(parentElement, geoData, bearData) {
    this.parentElement = parentElement;
    this.geoData = geoData;
    this.bearData = bearData;

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
      .scale(vis.height / 0.4)
      .translate([vis.width - 200, vis.height + 100])
      .rotate([0, -90])
      .clipAngle(100)
      .precision(.5);

    // Define a geo generator and pass the projection to it
    vis.path = d3.geoPath()
      .projection(vis.projection);

    // Create color scale for unique bear IDs
    vis.colorScale = d3.scaleOrdinal(d3.schemeBlues[9]);

    // Parse timestamps to create a time scale
    const parseTime = d3.timeParse("%m/%d/%Y %H:%M");
    const maxDate = d3.max(vis.bearData, d => parseTime(d.DateTimeUTC_ud));
    const minDate = d3.min(vis.bearData, d => parseTime(d.DateTimeUTC_ud));

    // Create a time scale for circle sizes
    vis.radiusScale = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([1, 5]); // Adjust the range for the desired size variation

    // Bind data and create one path per GeoJSON feature
    vis.svg.selectAll("path")
      .data(vis.geoData.features)
      .enter()
      .append("path")
      .attr("d", vis.path)
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.2)
      .attr("fill-opacity", 0.5)
      .style("fill", "steelblue");

    // Bind bear data and create circles for each location
    vis.svg.selectAll("circle")
      .data(vis.bearData)
      .enter()
      .append("circle")
      .attr("cx", d => vis.projection([d.longitude_ud, d.latitude_ud])[0])
      .attr("cy", d => vis.projection([d.longitude_ud, d.latitude_ud])[1])
      .attr("r", d => vis.radiusScale(parseTime(d.DateTimeUTC_ud)))
      .attr("stroke", "black")
      .attr("stroke-opacity", 0.5)
      .attr("fill", d => vis.colorScale(d.BearID_ud))
      .attr("fill-opacity", 0.8);
  }
}