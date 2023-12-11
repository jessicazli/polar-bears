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
        vis.margin = { top: 40, right: 20, bottom: 40, left: 60 };
        vis.width = 500 - vis.margin.left - vis.margin.right;
        vis.height = 300 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3
            .select(`#${vis.parentElement}`)
            .append('svg')
            .attr('width', vis.width + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
            // .attr("style", "max-width: 100%; max-height: 100%;")
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
            .style("font-size", "12px")
            .style("font-weight", "600")
            .attr('x', vis.width / 2)
            .attr('y', -vis.margin.top / 2)
            .attr('text-anchor', 'middle')
            .text(vis.chartTitle);


        // Draw x-axis label
        vis.svg
            .append('text')
            .attr('class', 'x-axis-label')
            .attr('x', vis.width / 2)
            .attr('y', vis.height + vis.margin.bottom - 5)
            .attr('text-anchor', 'middle')
            .style("font-size", "10px")
            .text(vis.xLabel);

        // Draw y-axis label
        vis.svg
            .append('text')
            .attr('class', 'y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -vis.height / 2)
            .attr('y', -vis.margin.left +30)
            .attr('text-anchor', 'middle')
            .style("font-size", "10px")
            .text(vis.yLabel);

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
        vis.yScale.domain([minY - 0.2, maxY]);

        // Update x-axis with transition
        vis.svg.select('.x-axis')
            .transition()
            .duration(500)
            .call(vis.xAxis.tickFormat(d3.format('d')));

        // Update y-axis with transition
        vis.svg.select('.y-axis')
            .transition()
            .duration(500)
            .call(vis.yAxis);

        // Draw lines connecting circles
        const line = d3.line()
            .x(d => vis.xScale(d[vis.xLabel]))
            .y(d => vis.yScale(d[vis.yLabel]));

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
            .attr('stroke', vis.lineColor)
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

        // Remove existing circles
        vis.svg.selectAll('.circle').remove();

        // Append new circles with transition
        vis.svg
            .selectAll('.circle')
            .data(vis.data)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('fill', vis.dotColor)
            .attr('cx', d => vis.xScale(d[vis.xLabel]))
            .attr('cy', d => vis.yScale(d[vis.yLabel]))
            .attr('r', 4)
            .style('opacity', 0)  // Initial opacity of 0
            .transition()
            .duration(1000)
            .style('opacity', 1);  // Final opacity of 1
    }

    updateData(newData) {
        this.data = newData;
        this.updateGraph();
    }

}

// Other utility functions or constants related to the line graph can be added here
