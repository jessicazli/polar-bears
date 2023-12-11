// allHealthVis.js 

class AllHealthVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = this.filterData(data);
        this.keys = Object.keys(this.data[0]).slice(3);

        this.selectedSex = 'all';
        this.selectedAgeclass = 'all';

        this.initVis();
    }

    filterData(data) {
        return data.filter(row => row.BodyLength != "" && row.Mass != "" 
                            && row.BMI != "" && row.StorageEnergy != "" && row.HairWeight != "" 
                            && row.HairCortisol != "" && row.ReactiveOxySpecies != "" 
                            && row.Lysis != "" && row.OxidativeBarrier != "") 
            .map(row => ({
                BearID: row.BearID,
                Sex: row.Sex,
                Ageclass: row.Ageclass,
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
        vis.x = new Map(vis.keys.map(key => [key, d3.scaleLinear()
            .domain(d3.extent(vis.data, d => d[key]))
            .range([0, vis.width])]));
        vis.y = d3.scalePoint(vis.keys, [0, vis.height]);
        vis.color = d3.scaleSequential(d3.extent(vis.data, d => d[vis.keys[0]]), d3.interpolateBrBG);

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
        vis.axes = vis.svg.selectAll("g")
            .data(vis.keys)
            .join("g")
                .attr("transform", d => `translate(0,${vis.y(d)})`)
                .each(function(d) { d3.select(this).call(d3.axisBottom(vis.x.get(d))); })
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

        // Create groups for paths
        vis.pathsGroup = vis.svg.append("g").attr("class", "paths");

        // Initialize the brush
        vis.brush = d3.brushX()
            .extent([
                [0, -(50 / 2)],
                [vis.width, 50 / 2]
            ])
            .on("start brush end", brushed);

        vis.axes.call(vis.brush);

        const selections = new Map();

        function brushed({selection}, key) {
            if (selection === null) {
                selections.delete(key);
            } else {
                selections.set(key, selection.map(vis.x.get(key).invert));
            }
        
            vis.pathsGroup.selectAll("path.line").each(function(d) {
                const element = d3.select(this);
                const isHighlighted = element.classed("line-highlight");
                const isActive = isHighlighted || Array.from(selections).every(([currentKey, [min, max]]) => {
                    return d[currentKey] >= min && d[currentKey] <= max;
                });
        
                // Update the stroke color only if this isn't the highlighted line
                if (!isHighlighted) {
                    element.style("stroke", isActive ? vis.color(d[vis.keys[0]]) : "#ddd");
                }
            });
        
            // Raise the highlighted line so it's on top
            vis.svg.selectAll(".line-highlight").raise();
        }

        // Call updateVis to render the initial visualization
        vis.updateVis(this.selectedSex, this.selectedAgeclass);
    }

    updateVis(selectedSex, selectedAgeclass) {
        let vis = this;

        vis.selectedSex = selectedSex;
        vis.selectedAgeclass = selectedAgeclass;

        let filteredData = vis.data.filter(d => {
            const sexFilter = selectedSex === 'all' || d.Sex === selectedSex;
            const ageFilter = selectedAgeclass === 'all' || d.Ageclass === selectedAgeclass;
            return sexFilter && ageFilter;
        });

        // Filter data based on the selected options
        console.log("selectedSex: " + selectedSex);
        console.log("selectedAgeclass: " + selectedAgeclass);

        vis.line = d3.line()
            .defined(([, value]) => value != null)
            .x(([key, value]) => vis.x.get(key)(value))
            .y(([key]) => vis.y(key));

        let lines = vis.pathsGroup.selectAll("path.line")
            .data(filteredData, d => d.BearID);

        lines.enter()
            .append("path")
            .merge(lines)
            .attr("class", d => `line line-${d.BearID}`)
            .attr("stroke", d => vis.color(d[vis.keys[0]]))
            .attr("fill", "none")  // This ensures that the path is not filled
            .attr("d", d => vis.line(Array.from(vis.x, ([key]) => [key, d[key]])));

        lines.exit().remove();

        vis.axes.raise();
    }

    highlightBear(bearID) {
        // First, reset any previously highlighted lines
        this.svg.selectAll(".line-highlight").classed("line-highlight", false);
    
        // Highlight the new line
        this.svg.select(`.line-${bearID}`).classed("line-highlight", true).raise();
    }

    resetSelection() {
        // Remove any highlighting from lines
        this.svg.selectAll(".line-highlight").classed("line-highlight", false);
    }
}