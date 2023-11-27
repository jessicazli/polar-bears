// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");


// Declare chart variables outside the function
let emissionsChart, iceExtentChart, tempChangeChart, dietVis, healthVis;
let slider = d3.select('#time-slider').node();

let promises = [

    d3.csv("data/CO2_emissions.csv"),
    d3.csv("data/september_minimum_ice_extent.csv"),
    d3.csv("data/temperature_change.csv"),
    d3.csv("data/polarBearDiet.csv"),
    d3.csv("data/polar_bear_health.csv"),


];

Promise.all(promises)
    .then(function (data) {
        createVis(data);
    })
    .catch(function (err) {
        console.log(err);
    });


function createVis(data) {
    let emissionsData = data[0];
    let iceExtentData = data[1];
    let temperatureChangeData = data[2];

    console.log(data);
    console.log("Emissions Data:", emissionsData);
    console.log("Ice Extent Data:", iceExtentData);
    console.log("Temperature Change Data:", temperatureChangeData);

    let polarBearDietData = data[3]
    console.log("diet data", data[3])

    let healthData = data[4]
    console.log("Health Data:", healthData)

    
    // Create a line chart for CO2 emissions with red lines and dots
    emissionsChart = new LineGraph('emissions', emissionsData, "Year", "Emissions", "CO2 Emissions Over Time", '#f7a42a', '#fc9700');
    
    // Create a line chart for ice extent with blue lines and dots
    iceExtentChart = new LineGraph('icemass', iceExtentData, "Year", "Ice Extent", "Minimum Ice Extent Over Time", '#78aeeb', '#0060cf');
    
    // Create a line chart for temperature change with green lines and dots
    tempChangeChart = new LineGraph('avgtemp', temperatureChangeData, "Year", "Temperature Change", "Global Temperature Change Over Time", '#fc7168', '#de1507');
    
    dietVisual = new DietVis('dietDiv', polarBearDietData)

    healthVisual = new HealthVis('healthDiv', healthData)
   
    // Initialize slider
    noUiSlider.create(slider, {
        start: [1979, 2023],
        connect: true,
        step: 1,
        margin: 1,
        // behavior: 'drag',
        tooltips: [true, true],
        format: {
            to: value => Math.round(value),
            from: value => parseFloat(value)
        },
        range: {
            min: 1979,
            max: 2023
        },
    });

    d3.selectAll(".noUi-handle .noUi-tooltip").classed("range-slider-value", true);

    // Attach an event handler to update the graphs when the slider changes
    slider.noUiSlider.on('change', function (values) {
        const startYear = parseInt(values[0]);
        const endYear = parseInt(values[1]);

        // Filter data based on the selected range and update graphs
        const filteredEmissionsData = emissionsData.filter(d => d.Year >= startYear && d.Year <= endYear);
        const filteredIceExtentData = iceExtentData.filter(d => d.Year >= startYear && d.Year <= endYear);
        const filteredTemperatureChangeData = temperatureChangeData.filter(d => d.Year >= startYear && d.Year <= endYear);

        emissionsChart.updateData(filteredEmissionsData);
        iceExtentChart.updateData(filteredIceExtentData);
        tempChangeChart.updateData(filteredTemperatureChangeData);
    });


}

console.log('Slider element:', slider);

// let selectedCategory = document.getElementById('dietFilter').value;

function dietCategoryChange() {
    // Get the selected value
    selectedDietCategory = document.getElementById('dietFilter').value;

    // Update the visualization with the selected category
    // dietVis.selectedFilter = selectedDietCategory;
    dietVisual.wrangleData(selectedDietCategory);
}

function healthCategoryChange() {
    selectedHealthCategory = document.getElementById('healthFilter').value;

    healthVisual.updateVis(selectedHealthCategory);
}