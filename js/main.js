// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

// Declare chart variables outside the function
let emissionsChart, iceExtentChart, tempChangeChart;

// main.js
// (1) Load data with promises

let promises = [
    d3.csv("data/CO2_emissions.csv"),
    d3.csv("data/september_minimum_ice_extent.csv"),
    d3.csv("data/temperature_change.csv"),
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

    // (2) Make our data look nicer and more useful
    // ...

    // (3) Create event handler
    // *** TO-DO ***

    // (4) Create visualization instances

    // Create a line chart for CO2 emissions with red lines and dots
    emissionsChart = new LineGraph('emissions', emissionsData, "Year", "Emissions", "CO2 Emissions Over Time", 'red', 'red');

    // Create a line chart for ice extent with blue lines and dots
    iceExtentChart = new LineGraph('icemass', iceExtentData, "Year", "Ice Extent", "Minimum Ice Extent Over Time", 'blue', 'blue');

    // Create a line chart for temperature change with green lines and dots
    tempChangeChart = new LineGraph('avgtemp', temperatureChangeData, "Year", "Temperature Change", "Global Temperature Change Over Time", 'green', 'green');
    // *** TO-DO ***
    //  pass event handler to CountVis, at constructor of CountVis above

    // *** TO-DO ***
    // let ageVis = new AgeVis("agevis", allData);
    // let prioVis =

    // (5) Bind event handler
    // *** TO-DO ***
    // eventHandler.bind("selectionChanged", function(event){ ...
}
