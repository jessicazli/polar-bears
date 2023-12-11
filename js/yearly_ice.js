class YearlyLineChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initGraph();
    }

    initGraph() {
        const vis = this;

        // Set up the SVG drawing area
        vis.margin = { top: 20, right: 30, bottom: 30, left: 40 };
        vis.width = 928 - vis.margin.left - vis.margin.right;
        vis.height = 720 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3
            .select(`#${vis.parentElement}`)
            .append('svg')
            .attr('width', vis.width + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
            .attr("viewBox", [0, 0, 928, 720])
            .attr("style", "max-width: 100%; max-height: 200%;")
            .append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        // Create the scales.
        vis.x = d3.scaleLinear()
            .domain(d3.extent(vis.data, d => d3.timeParse("%Y-%m-%d")(`${d.Year}-01-01`)))
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .domain([0, d3.max(vis.data, d => d.Extent)])
            .range([vis.height, 0]);

        vis.z = d3.scaleSequential(d3.extent(vis.data, d => d.Year), t => d3.interpolateSpectral(1 - t));

        vis.line = d3.line()
            .defined(d => !isNaN(d.Extent))
            .x(d => vis.x(d3.timeParse("%Y-%m-%d")(`${d.Year}-01-01`)))
            .y(d => vis.y(d.Extent));

        // Create the axes.
        vis.svg.append("g")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.x)
                .ticks(vis.width / 80)
                .tickSizeOuter(0));

        vis.svg.append("g")
            .call(d3.axisLeft(vis.y).ticks(null, "s"))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick:not(:first-of-type) line").clone()
                .attr("x2", vis.width)
                .attr("stroke", "#ddd"))
            .call(g => g.select(".tick:last-of-type text").clone()
                .attr("x", 3)
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text('Extent'));  // Fix the y-axis label

        // Create the container for lines.
        vis.g = vis.svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("fill", "none")
            .attr("stroke-width", 1.5)
            .attr("stroke-miterlimit", 1);

        // Start the animation and return the chart.
        requestAnimationFrame(vis.animate.bind(vis));
    }

    async animate() {
        const vis = this;

        for (const [key, values] of d3.group(vis.data, d => d.Year)) {
            await vis.g.append("path")
                .attr("d", vis.line(values))
                .attr("stroke", vis.z(key))
                .attr("stroke-dasharray", "0,1")
                .transition()
                .ease(d3.easeLinear)
                .attrTween("stroke-dasharray", vis.dashTween)
                .end();

            if (!isNaN(values[values.length - 1].Extent)) {
                vis.g.append("text")
                    .attr("paint-order", "stroke")
                    .attr("stroke", "white")
                    .attr("stroke-width", 3)
                    .attr("fill", vis.z(key))
                    .attr("dx", 4)
                    .attr("dy", "0.32em")
                    .attr("x", vis.x(d3.timeParse("%Y-%m-%d")(`${values[values.length - 1].Year}-01-01`)))
                    .attr("y", vis.y(values[values.length - 1].Extent))
                    .text(key);
            }
        }
    }

    dashTween() {
        const l = this.getTotalLength();
        const i = d3.interpolateString("0," + l, l + "," + l);
        return t => i(t);
    }
}

// // Usage
// const yourData = [
//     { Year: 1978, Month: 10, Day: 26, Extent: 10.231, Missing: 0 },
//     // ... add more data entries
// ];

// const yearlyIce = new YearlyLineChart('yearlyIce', yourData);
