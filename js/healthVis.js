// healthVis.js 

class HealthVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];
        this.selectedHealthCategory = 'parents';
        this.selectedSex = 'all';
        this.selectedAgeclass = 'all';

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

        // Scale
        vis.xScale = d3.scaleOrdinal()
            .domain([true, false])
            .range([vis.width / 3, 2 * vis.width / 3]);

        vis.updateVis(this.selectedHealthCategory, this.selectedSex, this.selectedAgeclass);
    }

    updateVis(selectedHealthCategory, selectedSex, selectedAgeclass) {
        let vis = this;

        vis.selectedHealthCategory = selectedHealthCategory;
        vis.selectedSex = selectedSex;
        vis.selectedAgeclass = selectedAgeclass;

        // Clear existing visualization elements if necessary
        vis.svg.selectAll('*').remove();

        // Create tooltip element
        vis.tooltip = d3.select("body").append("div")
        .attr("class", "health-tooltip")
        .style("opacity", 0);

        let filteredData;
        let titles;
        let xDomain;

        // Check what option is selected and update the visualization accordingly
        if (selectedHealthCategory === 'parents') {

            filteredData = vis.data.filter(d => {
                const isParent = d.Parent === 'Yes' || d.Parent === 'No';
                const sexFilter = selectedSex === 'all' || d.Sex === selectedSex;
                const ageFilter = selectedAgeclass === 'all' || d.Ageclass === selectedAgeclass;
                return isParent && sexFilter && ageFilter;
            });

            titles = ['Parent', 'Not Parent'];
            xDomain = ['Yes', 'No'];
        } else {
            
            filteredData = vis.data.filter(d => {
                const isStatusPrior = d.StatusPriorYR === 'ON' || d.StatusPriorYR === 'OFF';
                const sexFilter = selectedSex === 'all' || d.Sex === selectedSex;
                const ageFilter = selectedAgeclass === 'all' || d.Ageclass === selectedAgeclass;
                return isStatusPrior && sexFilter && ageFilter;
            });
            titles = ['Land', 'Sea Ice'];
            xDomain = ['ON', 'OFF'];
        }
        
        console.log(selectedHealthCategory, selectedSex, selectedAgeclass, filteredData);

        // Update xScale domain
        vis.xScale.domain(xDomain);


        // Add titles for the groups
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
            vis.simulation = d3.forceSimulation(filteredData)
                .force('x', d3.forceX(d => vis.xScale(d[selectedHealthCategory === 'parents' ? 'Parent' : 'StatusPriorYR'])).strength(1))
                .force('y', d3.forceY(vis.height / 2).strength(0.1))
                .force('collide', d3.forceCollide(10))
                .on('tick', ticked);

            // Create nodes (circles) and assign them colors based on sex
            vis.nodes = vis.svg.selectAll('circle')
                .data(filteredData)
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
                    const addDataToTooltip = (label, value, unit) => {
                        if (unit === undefined) {
                            unit = "";
                        };
                        if (value && value.trim() !== "") {
                            tooltipContent += `${label}: ${value}${unit}<br>`;
                        };
                    };

                    // Add data to tooltip content
                    addDataToTooltip("Age", d.Age);
                    addDataToTooltip("Ageclass", d.Ageclass);
                    addDataToTooltip("Sex", d.Sex);
                    addDataToTooltip("Parent", d.Parent);
                    if (d.isParent) {
                        addDataToTooltip("Dependents", d.NumDependents);
                    }
                    addDataToTooltip("Body Length", d.BodyLength, "cm");
                    addDataToTooltip("Mass", d.Mass, "kg");
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
    }