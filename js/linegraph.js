// linegraph.js

class LineGraph {
    constructor(parentElement, data, xLabel, yLabel, chartTitle, lineColor, dotColor) {
        this.parentElement = parentElement;
        this.data = data;
        this.xLabel = xLabel;
        this.yLabel = yLabel;
        this.chartTitle = chartTitle;
        this.lineColor = lineColor;
        this.dotColor = dotColor;

        this.initGraph();
    }

    initGraph() {
        const vis = this;

        // Set up the SVG drawing area
        vis.margin = { top: 20, right: 20, bottom: 40, left: 40 };
        vis.width = 500 - vis.margin.left - vis.margin.right;
        vis.height = 300 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3
            .select(`#${vis.parentElement}`)
            .append('svg')
            .attr('width', vis.width + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        // Initialize scales and axes
        vis.xScale = d3.scaleLinear().range([0, vis.width]);
        vis.yScale = d3.scaleLinear().range([vis.height, 0]);

        vis.xAxis = d3.axisBottom().scale(vis.xScale);
        vis.yAxis = d3.axisLeft().scale(vis.yScale);

        // Draw x-axis
        vis.svg
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${vis.height})`);

        // Draw y-axis
        vis.svg.append('g').attr('class', 'y-axis');

        // Draw chart title
        vis.svg
            .append('text')
            .attr('class', 'chart-title')
            .attr('x', vis.width / 2)
            .attr('y', -vis.margin.top / 2)
            .attr('text-anchor', 'middle')
            .text(vis.chartTitle);

        // Update the graph
        vis.updateGraph();
    }

    updateGraph() {
        const vis = this;
    
        // Find the minimum and maximum values of x and y in the data
        const minX = d3.min(vis.data, d => d[vis.xLabel]);
        const maxX = d3.max(vis.data, d => d[vis.xLabel]);
        const minY = d3.min(vis.data, d => d[vis.yLabel]);
        const maxY = d3.max(vis.data, d => d[vis.yLabel]);
    
        // Update scales and axes using the minimum and maximum values
        vis.xScale.domain([minX, maxX]);
        vis.yScale.domain([minY, maxY]);
    
        vis.svg.select('.x-axis')
            .call(vis.xAxis.tickFormat(d3.format('d'))); // Use 'd' format to remove commas
        vis.svg.select('.y-axis').call(vis.yAxis);
    
        // Draw lines connecting circles
        const line = d3.line()
            .x(d => vis.xScale(d[vis.xLabel]))
            .y(d => vis.yScale(d[vis.yLabel]));
    
        vis.svg.selectAll('.line').remove(); // Remove existing lines
        vis.svg
            .append('path')
            .datum(vis.data)
            .attr('class', 'line')
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', vis.lineColor); // Set line color
    
        // Draw circles
        vis.svg.selectAll('.circle').remove(); // Remove existing circles
        vis.svg
            .selectAll('.circle')
            .data(vis.data)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('fill', vis.dotColor) // Set dot color
            .attr('cx', d => vis.xScale(d[vis.xLabel]))
            .attr('cy', d => vis.yScale(d[vis.yLabel]))
            .attr('r', 4); // Adjust the radius as needed
    }

    updateData(newData) {
        this.data = newData;
        this.updateGraph();
    }
    
}

// Other utility functions or constants related to the line graph can be added here
