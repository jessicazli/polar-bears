// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

let dietVisual;


// (1) Load data with promises

let promises = [
    d3.csv("data/polarBearDiet.csv"),

];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function createVis(dataArray) {
    let polarBearDietData = dataArray[0]
   
    // error, perDayData, metaData
    // if(error) { console.log(error); }

    console.log("diet data",dataArray[0])

    dietVisual = new DietVis('dietDiv', dataArray[0])



    // (3) Create event handler
    // *** TO-DO ***

    // (4) Create visualization instances
    // let countVis = new CountVis("countvis", allData);

    // *** TO-DO ***
    //  pass event handler to CountVis, at constructor of CountVis above

    // *** TO-DO ***
    //let ageVis = new AgeVis("agevis", allData);
    //let prioVis =


    // (5) Bind event handler

    // *** TO-DO ***
    // eventHandler.bind("selectionChanged", function(event){ ...

}

let selectedCategory =  document.getElementById('dietFilter').value;

function dietCategoryChange() {
    // Get the selected value
    selectedDietCategory = document.getElementById('dietFilter').value;

    // Update the visualization with the selected category
    // dietVis.selectedFilter = selectedDietCategory;
    // dietVis.wrangleData(selectedDietCategory); 
}