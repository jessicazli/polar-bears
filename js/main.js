// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

// Declare chart variables outside the function
let migrationVisual, yearlyIce, emissionsChart, tempChangeChart, subregionMap, 
subregionTable, dietStacked, dietVisual, bearInfo, allHealthVisual;

let slider = d3.select('#time-slider').node();
let migrationSlider = document.getElementById('migrationSlider');

let promises = [
    d3.csv("data/CO2_emissions.csv"), // 0
    d3.csv("data/dailyice.csv"), // 1
    d3.csv("data/temperature_change.csv"), // 2
    d3.csv("data/polarBearDiet.csv"), // 3
    d3.csv("data/polar_bear_health.csv"), // 4
    d3.csv("data/polar_bear_population_2021.csv"), // 5
    d3.json("data/arctic_ice.json"), // 6
    d3.csv("data/migration.csv"), // 7
    d3.json("data/coastline.json"), // 8
    d3.json("data/land.json"), // 9
    d3.json("data/ocean.json"), // 10
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
    let yearlyIceData = data[1];
    let temperatureChangeData = data[2];
    let polarBearDietData = data[3];
    let healthData = data[4];
    let subregionData = data[5];
    let arctic_ice = data[6];
    let migrationData = data[7];
    let marineData = data[8];
    let landData = data[9];
    let oceanData = data[10];
    

    // Migration Map
    migrationVisual = new MigrationVis('migrationDiv', arctic_ice, migrationData, marineData, landData, oceanData);

    // Yearly Ice Map
    yearlyIce = new YearlyLineChart('yearlyIce', yearlyIceData);

    // CO2 Emissions Chart
    emissionsChart = new LineGraph('emissions', emissionsData, "Year", "Emissions", "CO2 Emissions Over Time in Billion Metric Tons", '#f7a42a', '#fc9700');

    // Temperature Chart
    tempChangeChart = new LineGraph('avgtemp', temperatureChangeData, "Year", "Temperature Change", "Global Avg. Temperature Change Over Time in °C", 'indigo', 'indigo');
    
    // Subregion Map
    subregionMap = new SubregionMap('subregionMap', subregionData);
    subregionTable = new SubregionTable('subregionTable', subregionData, subregionMap);
    
    // Diet Charts
    dietStacked = new DietStacked('dietStacked', polarBearDietData)
    dietVisual = new DietVis('dietDiv', polarBearDietData);
    
    // Bear Info
    bearInfo = new BearInfo('bearInfoDiv', healthData);

    // All Health Visualization
    allHealthVisual = new AllHealthVis('allHealthDiv', healthData);


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

    // Attach an event handler to update the graphs when the slider changes
    slider.noUiSlider.on('change', function (values) {
        const startYear = parseInt(values[0]);
        const endYear = parseInt(values[1]);

        // Filter data based on the selected range and update graphs
        const filteredEmissionsData = emissionsData.filter(d => d.Year >= startYear && d.Year <= endYear);
        // const filteredIceExtentData = iceExtentData.filter(d => d.Year >= startYear && d.Year <= endYear);
        const filteredTemperatureChangeData = temperatureChangeData.filter(d => d.Year >= startYear && d.Year <= endYear);

        emissionsChart.updateData(filteredEmissionsData);
        // iceExtentChart.updateData(filteredIceExtentData);
        tempChangeChart.updateData(filteredTemperatureChangeData);
    });

    // Attach an event handler to update the migration map when the slider changes
    migrationSlider.noUiSlider.on('change', async function (values) {
        const startYear = parseInt(values[0]);
        const endYear = parseInt(values[1]);

        const filteredMigrationData = migrationData.filter(d => new Date(d.DateTimeUTC_ud).getFullYear() >= startYear && new Date(d.DateTimeUTC_ud).getFullYear() <= endYear);

        // Update the data for the migration map
        migrationVisual.updateData(filteredMigrationData);
        migrationVisual.updateVis();

        console.log("Migration Data:", filteredMigrationData);
    });

    // Button Event Listeners
    document.getElementById('bearInfoButton').addEventListener('click', function() {
        bearInfo.updateBear(bearInfo.selectedSex, bearInfo.selectedAgeclass);
        document.getElementById(bearInfo.parentElement).innerHTML = bearInfo.description;
    });

    document.getElementById('resetButton').addEventListener('click', function() {
        allHealthVisual.resetSelection();
        bearInfo.clearDescription(); 
    });
}


// Diet Visualization Event Listeners
function dietCategoryChange() {
    // Get the selected value
    selectedDietCategory = document.getElementById('dietFilter').value;

    dietVisual.wrangleData(selectedDietCategory);
}

// Bear Info & All Health Visualization Event Listeners
function sexAllHealthCategoryChange() {
    selectedSex = document.getElementById('sexAllHealthFilter').value;
 
    allHealthVisual.resetSelection();
    bearInfo.updateBear(selectedSex, bearInfo.selectedAgeclass);
    bearInfo.clearDescription(); 
    allHealthVisual.updateVis(selectedSex, allHealthVisual.selectedAgeclass);
}

function ageclassAllHealthCategoryChange() {
    selectedAgeclass = document.getElementById('ageclassAllHealthFilter').value;
   
    allHealthVisual.resetSelection();
    bearInfo.updateBear(bearInfo.selectedSex, selectedAgeclass);
    bearInfo.clearDescription(); 
    allHealthVisual.updateVis(allHealthVisual.selectedSex, selectedAgeclass);
}

// Subregion Map & Table Event Listeners
function changeSubregionFilter() {
    subregionMap.wrangleData();
    subregionTable.wrangleData();
}


function revealText() {
    document.getElementById('hiddenText').style.display = 'block';
}

function updateAllVisualizations() {
    myMapVis.wrangleData()
}