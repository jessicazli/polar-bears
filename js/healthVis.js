// healthVis.js 

class HealthVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];
        this.selectedHealthCategory = 'parents'

        this.data.forEach(d => {
            d.isParent = d.Parent === 'Yes';
        });

        this.initVis();

    }

    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 40, bottom: 40, left: 40 };
        vis.width = 960 - vis.margin.left - vis.margin.right;
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

        // Create SVG area
        vis.svg = d3
            .select(`#${vis.parentElement}`)
            .append('svg')
            .attr('width', vis.width + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        // Scales
        vis.xScale = d3.scaleOrdinal()
            .domain([true, false])
            .range([vis.width / 3, 2 * vis.width / 3]);

        vis.xScaleBMI = d3.scaleLinear()
            .domain([d3.min(vis.data, d => d.BMI), d3.max(vis.data, d => d.BMI)])
            .range([0, vis.width]);

        vis.xScaleCortisol = d3.scaleLinear()
            .domain([d3.min(vis.data, d => d['Hair Cortisol']), d3.max(vis.data, d => d['Hair Cortisol'])])
            .range([0, vis.width]);
        
        vis.updateVis(this.selectedHealthCategory);

    }

    updateVis(selectedHealthCategory) {
        let vis = this;

        console.log(selectedHealthCategory);

        // Clear existing visualization elements if necessary
        vis.svg.selectAll('*').remove();

        // Create tooltip element
        vis.tooltip = d3.select("body").append("div")
        .attr("class", "health-tooltip")
        .style("opacity", 0);

        // Check what option is selected and update the visualization accordingly
        if (selectedHealthCategory === 'parents') {

            // Add titles for the groups
            const titles = ['Parents', 'Not Parents'];
            vis.svg.selectAll('.title')
                .data(titles)
                .enter()
                .append('text')
                .attr('class', 'title')
                .attr('x', (d, i) => i === 0 ? vis.xScale(true) : vis.xScale(false))
                .attr('y', -5) // Position above the nodes
                .attr('text-anchor', 'middle')
                .text(d => d);

            // Define the legend
            vis.legend = vis.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width - 100},${vis.height - 100})`); // Position the legend

            // Data for the legend
            const legendData = [
                {color: '#fca9e1', text: 'Female'},
                {color: '#7edffc', text: 'Male'}
            ];

            // Create one group per legend item
            const legendItem = vis.legend.selectAll('.legend-item')
                .data(legendData)
                .enter()
                .append('g')
                .attr('class', 'legend-item')
                .attr('transform', (d, i) => `translate(0, ${i * 20})`); // Stack legend items vertically

            // Draw legend colored rectangles
            legendItem.append('circle')
                .attr('x', 0)
                .attr('r', 8)
                .style('fill', d => d.color);

            // Draw legend text
            legendItem.append('text')
                .attr('class', 'legend-text')
                .attr('x', 24)
                .attr('y', 0)
                .attr('dy', '0.35em') // Center text vertically
                .text(d => d.text);

            // Create force simulation with forces for grouping by parent status and sex
            vis.simulation = d3.forceSimulation(vis.data)
                .force('x', d3.forceX(d => vis.xScale(d.isParent)).strength(1))
                .force('y', d3.forceY(vis.height / 2).strength(0.1))
                .force('collide', d3.forceCollide(10))
                .on('tick', ticked);

            // Create nodes (circles) and assign them colors based on sex
            vis.nodes = vis.svg.selectAll('circle')
                .data(vis.data)
                .enter()
                .append('circle')
                .attr('r', 8)
                .attr('fill', d => d.Sex === 'F' ? '#fca9e1' : '#7edffc');

            function ticked() {
                vis.nodes
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);
            }

            // Add mouseover and mouseout events for tooltip
            vis.nodes.on("mouseover", function(event, d) {
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

                    let tooltipContent = `<strong>Polar Bear ID: ${d.BearID}</strong><br>`;
                    
                    // Function to add data to the tooltip if not null or empty
                    const addDataToTooltip = (label, value) => {
                        if (value && value.trim() !== "") {
                            tooltipContent += `${label}: ${value}<br>`;
                        }
                    };

                    // Add data to tooltip content
                    addDataToTooltip("Age", d.Age);
                    addDataToTooltip("Sex", d.Sex);
                    addDataToTooltip("Parent", d.Parent);
                    if (d.isParent) {
                        addDataToTooltip("Dependents", d.Dependents);
                    }
                    addDataToTooltip("Mass", d.Mass);
                    addDataToTooltip("Body Length", d['Body length']);
                    addDataToTooltip("BMI", d.BMI);

            vis.tooltip.html(tooltipContent)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        }

        else if (selectedHealthCategory === 'bmi') {
            
            // Determine the number of bins
            const numBins = Math.sqrt(vis.data.length); // Example dynamic bin count, can be adjusted
            
            // Create a histogram layout generator
            const histogram = d3.histogram()
            .value(d => d.BMI)
            .domain(vis.xScaleBMI.domain())
            .thresholds(vis.xScaleBMI.ticks(numBins)); // Create threshold ticks based on the scale
            
            // Bin the data
            const bins = histogram(vis.data);
            
            
            // Prepare data points with additional layout information
            const stackedPoints = [];
            bins.forEach((bin, i) => {
                // Calculate the y-offset for each point in the bin
                let yOffset = 0;
                bin.forEach(d => {
                    stackedPoints.push({ data: d, yOffset: yOffset });
                    yOffset -= 15; // Adjust for visual spacing between points
                });
            });

            // Draw the points
            vis.svg.selectAll('circle')
                .data(stackedPoints)
                .enter()
                .append('circle')
                .attr('cx', d => vis.xScaleBMI(d.data.BMI))
                .attr('cy', d => vis.height / 2 + d.yOffset + 200) // Center vertically and apply yOffset
                .attr('r', 8) // transition to the final radius
                .attr('fill', d => d.data.Sex === 'F' ? '#fca9e1' : '#7edffc')
                .on("mouseover", function(event, d) {
                    vis.tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);

                    let tooltipContent = `<strong>BMI: ${d.data.BMI}</strong><br>`;
                    
                    // Function to add data to the tooltip if not null or empty
                    const addDataToTooltip = (label, value) => {
                        if (value && value.trim() !== "") {
                            tooltipContent += `${label}: ${value}<br>`;
                        }
                    };

                    // Add data to tooltip content
                    addDataToTooltip("Polar Bear ID", d.data.BearID);
                    addDataToTooltip("Age", d.data.Age);
                    addDataToTooltip("Sex", d.data.Sex);
                    addDataToTooltip("Parent", d.data.Parent);
                    if (d.isParent) {
                        addDataToTooltip("Dependents", d.data.Dependents);
                    }
                    addDataToTooltip("Mass", d.data.Mass);
                    addDataToTooltip("Body Length", d.data['Body length']);

                    vis.tooltip.html(tooltipContent)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    vis.tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            // Create the x-axis
            vis.xAxis = d3.axisBottom(vis.xScaleBMI)
            .ticks(numBins) // Set the number of ticks to match the number of bins
            .tickFormat(d3.format(".1s")); // Format the ticks if necessary

            // Append the x-axis to the svg
            vis.svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + (vis.height - vis.margin.bottom) + ")") // Position the x-axis at the bottom
                .call(vis.xAxis);

            // Optional: Add a label to the x-axis
            vis.svg.append("text")
                .attr("class", "x-axis-label")
                .attr("text-anchor", "end")
                .attr("x", vis.width)
                .attr("y", vis.height - 5) // Adjust the positioning as needed
                .text("BMI");
        }
        else {
            // Determine the number of bins
            const numBins = Math.sqrt(vis.data.length); // Example dynamic bin count, can be adjusted

            // Create a histogram layout generator
            const histogram = d3.histogram()
                .value(d => d['Hair Cortisol'])
                .domain(vis.xScaleCortisol.domain())
                .thresholds(vis.xScaleCortisol.ticks(numBins)); // Create threshold ticks based on the scale

            // Bin the data
            const bins = histogram(vis.data);
 
            // Prepare data points with additional layout information
            const stackedPoints = [];
            bins.forEach((bin, i) => {
                // Calculate the y-offset for each point in the bin
                let yOffset = 0;
                bin.forEach(d => {
                    stackedPoints.push({ data: d, yOffset: yOffset });
                    yOffset -= 20; // Adjust for visual spacing between points
                });
            });
 
            // Draw the points
            vis.svg.selectAll('circle')
                .data(stackedPoints)
                .enter()
                .append('circle')
                .attr('cx', d => vis.xScaleCortisol(d.data['Hair Cortisol']))
                .attr('cy', d => vis.height / 2 + d.yOffset + 200) // Center vertically and apply yOffset
                .attr('r', 8)
                .attr('fill', d => d.data.Sex === 'F' ? '#fca9e1' : '#7edffc')
                .on("mouseover", function(event, d) {
                    vis.tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);

                    let tooltipContent = `<strong>Hair Cortisol: ${d.data['Hair Cortisol']}</strong><br>`;
                    
                    // Function to add data to the tooltip if not null or empty
                    const addDataToTooltip = (label, value) => {
                        if (value && value.trim() !== "") {
                            tooltipContent += `${label}: ${value}<br>`;
                        }
                    };
 
                    // Add data to tooltip content
                    addDataToTooltip("Polar Bear ID", d.data.BearID);
                    addDataToTooltip("Age", d.data.Age);
                    addDataToTooltip("Sex", d.data.Sex);
                    addDataToTooltip("Parent", d.data.Parent);
                    if (d.isParent) {
                        addDataToTooltip("Dependents", d.data.Dependents);
                    }
                    addDataToTooltip("Mass", d.data.Mass);
                    addDataToTooltip("Body Length", d.data['Body length']);

                    vis.tooltip.html(tooltipContent)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    vis.tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
 
            // Create the x-axis
            vis.xAxis = d3.axisBottom(vis.xScaleCortisol)
            .ticks(7) // Set the number of ticks to match the number of bins
            .tickFormat(d3.format(".1s")); // Format the ticks if necessary

            // Append the x-axis to the svg
            vis.svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + (vis.height - vis.margin.bottom) + ")") // Position the x-axis at the bottom
                .call(vis.xAxis);

            // Optional: Add a label to the x-axis
            vis.svg.append("text")
                .attr("class", "x-axis-label")
                .attr("text-anchor", "end")
                .attr("x", vis.width)
                .attr("y", vis.height - 5) // Adjust the positioning as needed
                .text("Hair Cortisol");
        }
    }
}