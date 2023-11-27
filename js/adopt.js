// adopt.js 

class AdoptBear {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initBear();
    }

    initBear() {

    }

    updateBear() {
        let vis = this;

        let randomNum = Math.floor(Math.random() * vis.data.length)

        let bear = vis.data[randomNum]

        let description = `<strong>Polar Bear #: ${bear.BearID}</strong><br>`;

        // Function to add data to the description if not null or empty
        const addDataToDescription = (label, value) => {
            if (value && value.trim() !== "") {
                description += `${label}: ${value}<br>`;
            }
        };

        // Add data to description
        addDataToDescription("Age", bear.Age);
        addDataToDescription("Sex", bear.Sex);
        addDataToDescription("Parent", bear.Parent);
        if (bear.Parent === 'Yes') {
            addDataToDescription("Dependents", bear.Dependents);
        }
        addDataToDescription("Mass", bear.Mass);
        addDataToDescription("Body Length", bear['Body length']);

        this.description = description;

    }
}