class YearlyLineChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initGraph();
    }

    initGraph() {
        const vis = this;

        // Set up the SVG drawing area
        vis.margin = { top: 40, right: 20, bottom: 40, left: 40 };
        vis.width = 800 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3
            .select(`#${vis.parentElement}`)
            .append('svg')
            .attr('width', vis.width + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        // Initialize scales and axes
        vis.xScale = d3.scaleTime().range([0, vis.width]);
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
            .text('Yearly Ice Extent Over Time');

        // Trigger the initial animation
        vis.updateGraph();
    }

    updateGraph() {
        const vis = this;

        // Parse date strings in the data
        vis.data.forEach(d => {
            d.Date = new Date(`${d.Year}-${d.Month}-${d.Day}`);
        });

        // Set the xScale domain based on the data
        vis.xScale.domain(d3.extent(vis.data, d => d.Date));
        
        // Set the yScale domain based on the data
        vis.yScale.domain([0, d3.max(vis.data, d => d.Extent)]);

        // Update x-axis with transition
        vis.svg.select('.x-axis')
            .transition()
            .duration(500)
            .call(vis.xAxis
                .ticks(d3.timeMonth.every(1))
                .tickFormat(d3.timeFormat('%B')));

        // Update y-axis with transition
        vis.svg.select('.y-axis')
            .transition()
            .duration(500)
            .call(vis.yAxis);

        // Draw lines connecting circles
        const line = d3.line()
            .x(d => vis.xScale(d.Date))
            .y(d => vis.yScale(d.Extent));

        // Remove existing lines
        vis.svg.selectAll('.line')
            .attr('opacity', 0)
            .remove();

        // Append new line with transition
        const linePath = vis.svg
            .append('path')
            .datum(vis.data)
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke-width', 3)
            .attr('stroke-linejoin', 'round')
            .attr('opacity', 0.5)
            .attr('stroke', '#78aeeb')
            .attr('d', line);  // Initial position of the line

        // Get the total length of the line
        const totalLength = linePath.node().getTotalLength();

        // Set the initial position of the line to be at the starting point (offscreen to the left)
        linePath.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(800)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0);  // Final position of the line
    }
}

// Usage
const yearlyLineChart = new YearlyLineChart('yourParentElement', yourData);
yearlyLineChart.updateGraph();  // Trigger the animation
