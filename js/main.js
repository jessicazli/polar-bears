// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");


// (1) Load data with promises

let promises = [
    d3.json("data/perDayData.json"),
    d3.json("data/myWorldFields.json")
];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function createVis(data) {
    let perDayData = data[0]
    let metaData = data[1]
    // error, perDayData, metaData
    // if(error) { console.log(error); }

    console.log(data)
    // (2) Make our data look nicer and more useful
    allData = perDayData.map(function (d) {

        let result = {
            time: dateParser(d.day),
            count: +d["count(*)"] + 1
        };

        // Convert votes for the 15 priorities from key-value format into one single array (for each day)
        result.priorities = d3.range(0, 15).map(function (counter) {
            return d["sum(p" + counter + ")"]
        });
        // [d["sum(p0)"], d["sum(p1)"], d["sum(p2)"],...]
        // Example: [10,200,500,... ]

        // Create an array of values for age 0 - 99
        result.ages = d3.range(0, 99).map(function () {
            return 0;
        });

        // Insert the votes in the newly created array 'result.ages'
        d.age.forEach(function (a) {
            if (a.age < 100) {
                result.ages[a.age] = a["count(*)"];
            }
        })

        return result;
    });


    // (3) Create event handler
    // *** TO-DO ***

    // (4) Create visualization instances
    let countVis = new CountVis("countvis", allData);

    // *** TO-DO ***
    //  pass event handler to CountVis, at constructor of CountVis above

    // *** TO-DO ***
    //let ageVis = new AgeVis("agevis", allData);
    //let prioVis =


    // (5) Bind event handler

    // *** TO-DO ***
    // eventHandler.bind("selectionChanged", function(event){ ...

}
