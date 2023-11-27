// healthVis.js 

class HealthVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];

        this.data.forEach(d => {
            d.isParent = d.Parent === 'Yes';
            d.sex = d.Sex;
        });

        this.initVis();

    }

    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 40, bottom: 40, left: 40 };
        vis.width = 960 - vis.margin.left - vis.margin.right;
        vis.height = 700 - vis.margin.top - vis.margin.bottom;

        // Create SVG area
        vis.svg = d3
            .select(`#${vis.parentElement}`)
            .append('svg')
            .attr('width', vis.width + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        // Create a scale for x based on parent status
        vis.xScale = d3.scaleOrdinal()
            .domain([true, false])
            .range([vis.width / 3, 2 * vis.width / 3]);

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
            .attr('fill', d => d.sex === 'F' ? '#fca9e1' : '#7edffc');

        function ticked() {
            vis.nodes
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        }

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        // Additional updates can be implemented here
    }
}