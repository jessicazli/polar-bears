// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

function updateAllVisualizations() {
    myMapVis.wrangleData()
}

// Declare chart variables outside the function

let emissionsChart, iceExtentChart, tempChangeChart, dietVisual, healthVisual, adoptVisual, subregionMap, migrationVisual, arcticMap, allHealthVisual, subregionTable;
let slider = d3.select('#time-slider').node();
let migrationSlider = document.getElementById('migrationSlider');


let promises = [

    d3.csv("data/CO2_emissions.csv"), // 0
    d3.csv("data/september_minimum_ice_extent.csv"), // 1
    d3.csv("data/temperature_change.csv"), // 2
    d3.csv("data/polarBearDiet.csv"), // 3
    d3.csv("data/polar_bear_health.csv"), // 4
    d3.csv("data/polar_bear_population_2021.csv"), // 5
    d3.json("data/arctic_ice.json"), // 6
    d3.csv("data/migration.csv"), // 7
    d3.json("data/linegraph_arcticice.json"), // 8



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
    let polarBearDietData = data[3];
    let healthData = data[4];
    let subregionData = data[5];
    let arctic_ice = data[6];
    let migrationData = data[7];
    let linegraph_arcticice = data[8];

    // console.log(data);
    // console.log("Emissions Data:", emissionsData);
    // console.log("Ice Extent Data:", iceExtentData);
    // console.log("Temperature Change Data:", temperatureChangeData);
    // console.log("subregion", subregionData)


    // Create a line chart for CO2 emissions with red lines and dots
    emissionsChart = new LineGraph('emissions', emissionsData, "Year", "Emissions", "CO2 Emissions Over Time", '#f7a42a', '#fc9700');

    // Create a line chart for ice extent with blue lines and dots
    iceExtentChart = new LineGraph('icemass', iceExtentData, "Year", "Ice Extent", "Minimum Ice Extent Over Time", '#78aeeb', '#0060cf');

    // Create a line chart for temperature change with green lines and dots
    tempChangeChart = new LineGraph('avgtemp', temperatureChangeData, "Year", "Temperature Change", "Global Temperature Change Over Time", '#fc7168', '#de1507');
    
    healthVisual = new HealthVis('healthDiv', healthData);

    dietVisual = new DietVis('dietDiv', polarBearDietData);
    
    adoptVisual = new AdoptBear('adoptDiv', healthData);

    allHealthVisual = new AllHealthVis('allHealthDiv', healthData);

    migrationVisual = new MigrationVis('migrationDiv', arctic_ice, migrationData);
   
    // create subregionVisual
    subregionMap = new SubregionMap('subregionMap', subregionData);
    subregionTable = new SubregionTable('subregionTable', subregionData, subregionMap);

    // create arcticMap
    arcticMap = new ArcticMap('arcticmap', linegraph_arcticice, migrationData);

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

    // Initialize slider for migration map where the start is the oldest year in the dataset and end is the most recent
    const minBearYear = d3.min(migrationData, d => new Date(d.DateTimeUTC_ud).getFullYear());
    const maxBearYear = d3.max(migrationData, d => new Date(d.DateTimeUTC_ud).getFullYear());

    // Initialize slider for migration map with dynamic range
    noUiSlider.create(migrationSlider, {
        start: [minBearYear, maxBearYear],
        connect: true,
        step: 1,
        tooltips: [true, true],
        format: {
            to: value => Math.round(value),
            from: value => parseFloat(value)
        },
        range: {
            min: minBearYear,
            max: maxBearYear
        },
    });


    // d3.selectAll(".noUi-handle .noUi-tooltip").classed("range-slider-value", true);


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

    // Attach an event handler to update the migration map when the slider changes
    migrationSlider.noUiSlider.on('change', async function (values) {
        const startYear = parseInt(values[0]);
        const endYear = parseInt(values[1]);

        const filteredMigrationData = migrationData.filter(d => new Date(d.DateTimeUTC_ud).getFullYear() >= startYear && new Date(d.DateTimeUTC_ud).getFullYear() <= endYear);

        // Update the data for the migration map
        await migrationVisual.updateData(filteredMigrationData);

        console.log("Migration Data:", filteredMigrationData);
    });

    // event listener
    document.getElementById('adoptButton').addEventListener('click', function() {
        adoptVisual.updateBear();
        document.getElementById(adoptVisual.parentElement).innerHTML = adoptVisual.description;
    });
    

}

// let selectedCategory = document.getElementById('dietFilter').value;

function dietCategoryChange() {
    // Get the selected value
    selectedDietCategory = document.getElementById('dietFilter').value;

    dietVisual.wrangleData(selectedDietCategory);
}

function healthCategoryChange() {
    let selectedHealthCategory = document.getElementById('healthFilter').value;

    healthVisual.selectedHealthCategory = selectedHealthCategory;

    healthVisual.updateVis(selectedHealthCategory, healthVisual.selectedSex, healthVisual.selectedAgeclass);
}

function sexHealthCategoryChange() {
    selectedSex = document.getElementById('sexHealthFilter').value;

    healthVisual.updateVis(healthVisual.selectedHealthCategory, selectedSex, healthVisual.selectedAgeclass);
}

function ageclassHealthCategoryChange() {
    selectedAgeclass = document.getElementById('ageclassHealthFilter').value;

    healthVisual.updateVis(healthVisual.selectedHealthCategory, healthVisual.selectedSex, selectedAgeclass);
}

function changeSubregionFilter() {
    subregionMap.wrangleData();
    subregionTable.wrangleData();
}

function revealText() {
    document.getElementById('hiddenText').style.display = 'block';
}