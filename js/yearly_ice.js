class YearlyLineChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initGraph();
    }

    initGraph() {
        const vis = this;

        // Set up the SVG drawing area
        vis.margin = { top: 60, right: 30, bottom: 30, left: 20 };
        vis.width = 928 - vis.margin.left - vis.margin.right;
        vis.height = 650 - vis.margin.top - vis.margin.bottom;

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
            .domain([0, 18])
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
                .attr("class", "path")
                .attr("d", vis.line(values))
                .attr("stroke", vis.z(year))
                .attr("stroke-dasharray", "0,1")
                .on("mouseover", function () {
                    vis.highlightLine(this, year);
                    vis.showTooltip(this, year);
                    d3.select(this).attr("stroke", "darkorange");
                })
                .on("mouseout", function () {
                    vis.unhighlightLine(this);
                    vis.hideTooltip();
                    d3.select(this).attr("stroke", vis.z(year));
                })
                .transition()
                .ease(d3.easeLinear)
                .duration(200)
                .attrTween("stroke-dasharray", vis.dashTween);

            await new Promise(resolve => path.on("end", resolve));

            if (!isNaN(values[values.length - 1].Extent)) {
                // Inside the animate method, where you create the text element for the year
                const text = vis.g.append("text")
                .attr("class", `year-text year-${year}`) // Add a unique class based on the year
                .attr("paint-order", "stroke")
                .attr("stroke", "white")
                .attr("stroke-width", 3)
                .attr("fill", vis.z(year))
                .attr("dx", 4)
                .attr("dy", "0.32em")
                .style("font-size", "18px")
                .text(year);

                const lastDataPoint = values[values.length - 1];
                const xPos = vis.x(new Date(2000, lastDataPoint.Month - 1, lastDataPoint.Day)) - 15;
                const yPos = vis.y(lastDataPoint.Extent);

                text.attr("transform", `translate(${xPos},${yPos})`);
            }
        }

        // Display replay button after the animation is complete
        const replayButton = vis.svg.append("rect")
            .attr("x", vis.width - 100)
            .attr("y", vis.height - 50)
            .attr("width", 80)
            .attr("height", 30)
            .attr("fill", "steelblue")
            .attr("rx", 5)
            .attr("ry", 5)
            .style("cursor", "pointer")
            .on("click", () => vis.replay())
            // .on("mouseover", function () {
            //     d3.select(replayButton).attr("fill", "darkorange");
            // }.bind(this))  // or use an arrow function: .on("mouseover", () => { ... })

            .on("mouseout", function () {
                d3.select(this).attr("fill", "steelblue");
            });

        vis.svg.append("text")
            .attr("x", vis.width - 60)
            .attr("y", vis.height - 30)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("cursor", "pointer")
            .on("click", () => vis.replay())
            .on("mouseover", function () {
                d3.select(replayButton).attr("fill", "darkorange");
            })
            .on("mouseout", function () {
                d3.select(replayButton).attr("fill", "steelblue");
            })
            .text("Replay");
    }

    replay() {
        // Clear existing lines before replaying
        this.g.selectAll("path").remove();
        this.g.selectAll("text").remove();

        // Restart the animation
        this.animate();
    }

    // Inside the YearlyLineChart class
    highlightLine(element, year) {
        // Highlight the line
        d3.select(element).classed("highlighted", true);

        // Highlight the corresponding text
        this.g.selectAll(`.year-text.year-${year}`).classed("highlighted", true);

        // Fade out other lines
        this.g.selectAll(".path:not(.year-" + year + ")").classed("faded", true);

        // Fade out other text
        this.g.selectAll(".year-text:not(.year-" + year + ")").classed("faded", true);
    }

    unhighlightLine(element, year) {
        // Restore the original color for the line
        d3.select(element).classed("highlighted", false);

        // Restore the original color for the corresponding text
        this.g.selectAll(`.year-text.year-${year}`).classed("highlighted", false);

        // Restore the opacity of other lines
        this.g.selectAll(".path").classed("faded", false);

        // Restore the opacity of other text
        this.g.selectAll(".year-text").classed("faded", false);
    }

    dashTween() {
        const l = this.getTotalLength();
        const i = d3.interpolateString("0," + l, l + "," + l);
        return t => i(t);
    }
}
