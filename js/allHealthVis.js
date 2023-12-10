// allHealthVis.js 

class AllHealthVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = this.filterData(data);
        this.keys = Object.keys(this.data[0]);
        this.initVis();
    }

    filterData(data) {
        return data.filter(row => row.BodyLength != "" && row.Mass != "" 
                            && row.BMI != "" && row.StorageEnergy != "" && row.HairWeight != "" 
                            && row.HairCortisol != "" && row.ReactiveOxySpecies != "" 
                            && row.Lysis != "" && row.OxidativeBarrier != "") 
            .map(row => ({
                BearID: row.BearID,
                BodyLength: +row.BodyLength, 
                Mass: +row.Mass,
                BMI: +row.BMI,
                StorageEnergy: +row.StorageEnergy,
                HairWeight: +row.HairWeight,
                HairCortisol: +row.HairCortisol,
                ReactiveOxySpecies: +row.ReactiveOxySpecies,
                Lysis: +row.Lysis,
                OxidativeBarrier: +row.OxidativeBarrier
            }));
    };

    initVis() {

        let vis = this;

        // Define dimensions and margins
        vis.margin = { top: 30, right: 10, bottom: 30, left: 10 };
        vis.width = 800 - vis.margin.left - vis.margin.right;
        vis.height = vis.keys.length * 60; // Adjust as needed

        // Create SVG area
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append('svg')
            .attr('width', vis.width + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        // Scales and Axes
        const x = new Map(vis.keys.map(key => [key, d3.scaleLinear()
            .domain(d3.extent(vis.data, d => d[key]))
            .range([0, vis.width])]));

        const y = d3.scalePoint(vis.keys, [0, vis.height]);

        // Color scale
        const color = d3.scaleSequential(d3.extent(vis.data, d => d[vis.keys[0]]), d3.interpolateBrBG);

        // Lines
        const line = d3.line()
            .defined(([, value]) => value != null)
            .x(([key, value]) => x.get(key)(value))
            .y(([key]) => y(key));

        const path = vis.svg.append("g")
            .selectAll("path")
            .data(vis.data)
            .join("path")
                .attr("class", d => `line line-${d.BearID}`)
                .attr("stroke", d => color(d[vis.keys[0]]))
                .attr("d", d => line(Array.from(x, ([key]) => [key, d[key]])));

        const units = {
            BodyLength: "cm",
            Mass: "kg",
            BMI: "", 
            StorageEnergy: "MJ",
            HairWeight: "mg",
            HairCortisol: "ng/g",
            ReactiveOxySpecies: "mM/H2O2",
            Lysis: "CH50 units/ml",
            OxidativeBarrier: "mmol/L"
        };

        // Axes
        const axes = vis.svg.selectAll("g")
            .data(vis.keys)
            .join("g")
                .attr("transform", d => `translate(0,${y(d)})`)
                .each(function(d) { d3.select(this).call(d3.axisBottom(x.get(d))); })
                .call(g => g.append("text")
                    .attr("x", 0)
                    .attr("y", -6)
                    .attr("text-anchor", "start")
                    .attr("fill", "currentColor")
                    .text(d => d + (units[d] ? ` (${units[d]})` : '')))
                .call(g => g.selectAll("text")
                    .clone(true).lower()
                    .attr("fill", "none")
                    .attr("stroke-width", 5)
                    .attr("stroke-linejoin", "round")
                    .attr("stroke", "white"));

        // Brush Behavior
        const brushHeight = 50;
        const brush = d3.brushX()
            .extent([
                [0, -(brushHeight / 2)],
                [vis.width, brushHeight / 2]
            ])
            .on("start brush end", brushed);

        axes.call(brush);

        const selections = new Map();

        function brushed({selection}, key) {
            if (selection === null) {
                selections.delete(key);
            } else {
                selections.set(key, selection.map(x.get(key).invert));
            }
            // Set the stroke of the path based on whether it is within the brushed extents
            path.style("stroke", d => {
                // Skip the styling for the highlighted line
                if (d3.select(this).classed("line-highlight")) {
                    return; 
                }
        
                const active = Array.from(selections).every(([currentKey, [min, max]]) => {
                    return d[currentKey] >= min && d[currentKey] <= max;
                });
        
                return active ? color(d[vis.keys[0]]) : "#ddd";
            });
        
            // Handle raising lines and the highlighted line
            path.each(function(d) {
                const active = Array.from(selections).every(([currentKey, [min, max]]) => {
                    return d[currentKey] >= min && d[currentKey] <= max;
                });
        
                if (active && !d3.select(this).classed("line-highlight")) {
                    d3.select(this).raise();
                }
            });
        
            if (!vis.svg.select(".line-highlight").empty()) {
                vis.svg.select(".line-highlight").raise();
            }
        }
    }

    highlightBear(bearID) {
        // First, reset any previously highlighted lines
        this.svg.selectAll(".line-highlight").classed("line-highlight", false);
    
        // Highlight the new line
        this.svg.select(`.line-${bearID}`).classed("line-highlight", true);
    }
}