class migrationVis {

  constructor(parentElement, geoData) {
    this.parentElement = parentElement;
    this.geoData = geoData;

    this.initVis()
  }

  initVis() {
    let vis = this;

    vis.margin = { top: 20, right: 0, bottom: 20, left: 0 };
    vis.width = 600
    vis.height = 600

    vis.svg = d3
            .select(`#${vis.parentElement}`)
            .append('svg')
            .attr('width', vis.width + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

    // Create a projection
    vis.projection = d3.geoOrthographic()
      .scale(vis.height / 1.1)
      .translate([vis.width / 2, vis.height / 1.9])
      .rotate([0, -90])
      .clipAngle(100)
      .precision(.5);


    // Define a geo generator and pass the projection to it
    vis.path = d3.geoPath()
      .projection(vis.projection);

    // Load GeoJSON data
    // d3.json("vis.geoData").then(function (json) {
      // Bind data and create one path per GeoJSON feature
      vis.svg.selectAll("path")
        .data(vis.geoData.features)
        .enter()
        .append("path")
        .attr("d", vis.path)
        .attr("stroke", "black")
        .style("fill", "steelblue");
    // });
  }

}