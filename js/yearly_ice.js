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
        vis.height = 800 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3
            .select(`#${vis.parentElement}`)
            .append('svg')
            .attr('width', vis.width + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
            .attr("viewBox", [0, 0, 928, 720])
            .attr("style", "max-width: 100%; max-height: 100%;")
            .append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        // Create the scales.
        vis.x = d3.scaleTime()
            .domain([new Date(2000, 0, 1), new Date(2000, 11, 31)])  // Assuming 365 days in a year
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .domain([0, 17])
            .range([vis.height, 0]);

        vis.z = d3.scaleSequential(d3.extent(vis.data, d => d.Year), t => d3.interpolate(d3.color("orange"), d3.color("indigo"))(1 - t));

        vis.line = d3.line()
            .defined(d => !isNaN(d.Extent))
            .x(d => vis.x(new Date(2000, d.Month - 1, d.Day)))  // x position based on date
            .y(d => vis.y(d.Extent));

        // Create the axes.
        vis.svg.append("g")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.x)
                .ticks(d3.timeMonth.every(1))  // Set explicit tick values for each month
                .tickFormat(d3.timeFormat("%B"))
            );

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
                .text('Ice Extent km^2'));

        // Create the container for lines.
        vis.g = vis.svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 13)
            .attr("fill", "none")
            .attr("stroke-width", 1.5)
            .attr("stroke-miterlimit", 1);

        // Add a title
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", -vis.margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text("Arctic Sea Ice Extent 1978-2023");

        // Start the animation and return the chart.
        requestAnimationFrame(vis.animate.bind(vis));
    }

    async animate() {
        const vis = this;
    
        for (const [year, values] of d3.group(vis.data, d => d.Year)) {
            const path = vis.g.append("path")
                .attr("d", vis.line(values))
                .attr("stroke", vis.z(year))
                .attr("stroke-dasharray", "0,1")
                .transition()
                .ease(d3.easeLinear)
                .duration(200) // Adjust the duration in milliseconds
                .attrTween("stroke-dasharray", vis.dashTween);
    
            await new Promise(resolve => path.on("end", resolve));
    
            if (!isNaN(values[values.length - 1].Extent)) {
                const text = vis.g.append("text")
                    .attr("paint-order", "stroke")
                    .attr("stroke", "white")
                    .attr("stroke-width", 3)
                    .attr("fill", vis.z(year))
                    .attr("dx", 4)
                    .attr("dy", "0.32em")
                    .text(year);
    
                const lastDataPoint = values[values.length - 1];
                const xPos = vis.x(new Date(2000, lastDataPoint.Month - 1, lastDataPoint.Day)) + 2;
                const yPos = vis.y(lastDataPoint.Extent);
    
                text.attr("transform", `translate(${xPos},${yPos})`);
            }
        }
    }
    
    
    
    

    dashTween() {
        const l = this.getTotalLength();
        const i = d3.interpolateString("0," + l, l + "," + l);
        return t => i(t);
    }
}
