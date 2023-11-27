// /* * * * * * * * * * * * * *
// *          MapVis          *
// * * * * * * * * * * * * * */


// class MapVis {

//   constructor(parentElement, migrationData) {
//     this.parentElement = parentElement;
//     this.migrationData = migrationData;

//     // // define colors
//     // this.colors = ['#fddbc7', '#f4a582', '#d6604d', '#b2182b']

//     this.initVis()
//   }

//   initVis() {
//     let vis = this;

//     vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
//     vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
//     vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

//     // Create a projection
//     vis.projection = d3.geoOrthographic()
//       .translate([vis.width / 2, vis.height / 2]);

//     // Define a geo generator and pass the projection to it
//     vis.path = d3.geoPath()
//       .projection(vis.projection);


//     d3.json("map.json", function (json) {
//       svg.selectAll("path")
//         .data(json.features)
//         .enter()
//         .append("path")
//         .attr("d", path);
//     });

//     // Convert TopoJSON data into a GeoJSON data structure
//     vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features;

//     // Set the scale based on the screen size and proportion
//     vis.zoomFactor = vis.height / 600; // You can adjust this as needed
//     vis.projection.scale(249.5 * vis.zoomFactor);

//     // Initialize the drawing area
//     vis.svg = d3.select("#" + vis.parentElement).append("svg")
//       .attr("width", vis.width)
//       .attr("height", vis.height)
//       .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`);

//   //   // Add title
//   //   vis.svg.append('g')
//   //     .attr('class', 'title')
//   //     .attr('id', 'map-title')
//   //     .append('text')
//   //     .text('Title for Map')
//   //     .attr('transform', `translate(${vis.width / 2}, 20)`)
//   //     .attr('text-anchor', 'middle');

//   //   // Appen tooltip
//   //   vis.tooltip = d3.select("body").append("div")
//   //     .attr("class", "tooltip")
//   //     .attr("id", "mapTooltip")
//   //     .style("opacity", 0)


//   //   vis.svg.append("path")
//   //     .datum({ type: "Sphere" })
//   //     .attr("class", "graticule")
//   //     .attr("fill", '#ADDEFF')
//   //     .attr("stroke", "rgba(129, 129, 129, 0.35)")
//   //     .attr("d", vis.path);



//   //   // Draw the countries
//   //   vis.countries = vis.svg.selectAll(".country")
//   //     .data(vis.world)
//   //     .enter().append("path")
//   //     .attr('class', 'country')
//   //     .attr("d", vis.path);


//   //   let m0,
//   //     o0;

//   //   vis.svg.call(
//   //     d3.drag()
//   //       .on("start", function (event) {

//   //         let lastRotationParams = vis.projection.rotate();
//   //         m0 = [event.x, event.y];
//   //         o0 = [-lastRotationParams[0], -lastRotationParams[1]];
//   //       })
//   //       .on("drag", function (event) {
//   //         if (m0) {
//   //           let m1 = [event.x, event.y],
//   //             o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
//   //           vis.projection.rotate([-o1[0], -o1[1]]);
//   //         }

//   //         // Update the map
//   //         vis.path = d3.geoPath().projection(vis.projection);
//   //         d3.selectAll(".country").attr("d", vis.path)
//   //         d3.selectAll(".graticule").attr("d", vis.path)
//   //       })
//   //   )

//   //   vis.addLegend();

//   //   vis.wrangleData();
//   // }

//   // addLegend() {
//   //   let vis = this;

//   //   vis.legend = vis.svg.append("g")
//   //     .attr('class', 'legend')
//   //     .attr('transform', `translate(${vis.width * 2.8 / 4}, ${vis.height - 60})`);

//   //   vis.legend.selectAll("rect")
//   //     .data(vis.colors)
//   //     .enter()
//   //     .append("rect")
//   //     .attr("x", (d, i) => i * 30) // Adjust the spacing as needed
//   //     .attr("width", 30) // Adjust the width of the legend items
//   //     .attr("height", 20) // Adjust the height of the legend items
//   //     .attr("fill", d => d);

//   //   const legendScale = d3.scaleLinear()
//   //     .domain([0, vis.colors.length - 1])
//   //     .range([0, 40 * (vis.colors.length - 1)]);

//   //   const middleTick = (vis.colors.length - 1) / 2; // Calculate the middle position

//   //   const legendAxisGroup = vis.legend.append("g")
//   //     .attr("transform", `translate(0, 30)`); // Position the axis below the legend items

//   //   const legendAxis = d3.axisBottom(legendScale)
//   //     .tickValues([0, middleTick, vis.colors.length - 1])
//   //     .tickFormat(d => {
//   //       if (d === 0) return "0";
//   //       if (d === middleTick) return "50";
//   //       if (d === vis.colors.length - 1) return "100";
//   //     });

//   //   legendAxisGroup.call(legendAxis);
//   // }




//   // wrangleData() {
//   //   let vis = this;

//   //   // create random data structure with information for each land
//   //   vis.countryInfo = {};
//   //   vis.geoData.objects.countries.geometries.forEach(d => {
//   //     let randomCountryValue = Math.random() * 4
//   //     vis.countryInfo[d.properties.name] = {
//   //       name: d.properties.name,
//   //       category: 'category_' + Math.floor(randomCountryValue),
//   //       color: vis.colors[Math.floor(randomCountryValue)],
//   //       value: randomCountryValue / 4 * 100
//   //     }
//   //   })

//   //   vis.updateVis()
//   // }
  

//   // updateVis() {
//   //   let vis = this;

//   //   // Select all countries
//   //   // vis.countries
//   //   //     .attr("fill", d => vis.countryInfo[d.properties.name].color) // Update fill attribute based on the countryInfo lookup

//   //   // Add a tooltip and hover effects
//   //   console.log(vis.countryInfo, "hello", vis.countries)
//   //   vis.countries
//   //     .attr("fill", d => vis.countryInfo[d.properties.name].color)
//   //     // tooltip
//   //     .on("mouseover", function (event, d) {
//   //       d3.select(this)
//   //         .attr('stroke-width', '2px')
//   //         .attr('stroke', 'black')
//   //         .attr('fill', 'green')

//   //       vis.tooltip
//   //         .style("opacity", 1)
//   //         .style("left", event.pageX + 20 + "px")
//   //         .style("top", event.pageY + "px")
//   //         .html(`<div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
//   //                 <h3>${d.properties.name}<h3>
//   //                 <h4> Name: ${d.properties.name}</h4>      
//   //                 <h4> Category: ${vis.countryInfo[d.properties.name].category}</h4>
//   //                 <h4> Color: ${vis.countryInfo[d.properties.name].color}</h4>   
//   //                 <h4> Value: ${vis.countryInfo[d.properties.name].value}</h4>                         
//   //             </div>`)
//   //     })
//   //     .on("mouseout", function (event, d) {
//   //       d3.select(this)
//   //         .attr('stroke-width', '0px')
//   //         .attr('fill', d => vis.countryInfo[d.properties.name].color)

//   //       vis.tooltip
//   //         .style("opacity", 0)
//   //         .style("left", 0)
//   //         .style("top", 0)
//   //         .html(``)
//   //     })



//   }
// }