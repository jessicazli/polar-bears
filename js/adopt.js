// adopt.js 

class AdoptBear {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = this.filterData(data);

        this.selectedSex = 'all';
        this.selectedAgeclass = 'all';
    }

    filterData(data) {
        return data.filter(row => row.BodyLength != "" && row.Mass != "" 
                            && row.BMI != "" && row.StorageEnergy != "" && row.HairWeight != "" 
                            && row.HairCortisol != "" && row.ReactiveOxySpecies != "" 
                            && row.Lysis != "" && row.OxidativeBarrier != "");
    };

    updateBear(selectedSex, selectedAgeclass) {
        let vis = this;

        vis.selectedSex = selectedSex;
        vis.selectedAgeclass = selectedAgeclass;

        console.log(selectedSex, selectedAgeclass);

        let filteredData = vis.data.filter(d => {
            const sexFilter = selectedSex === 'all' || d.Sex === selectedSex;
            const ageFilter = selectedAgeclass === 'all' || d.Ageclass === selectedAgeclass;
            return sexFilter && ageFilter;
        });

        let randomNum = Math.floor(Math.random() * filteredData.length)

        let bear = filteredData[randomNum]

        let description = `<strong>Polar Bear #: ${bear.BearID}</strong><br>`;

        // Function to add data to the description if not null or empty
        const addDataToDescription = (label, value, unit) => {
            if (unit === undefined) {
                unit = "";
            };
            if (value !== "") {
                description += `${label}: ${value} ${unit}<br>`;
            };
        };

        // Add data to description
        addDataToDescription("Age", bear.Age);
        addDataToDescription("Ageclass", bear.Ageclass);
        addDataToDescription("Sex", bear.Sex);
        addDataToDescription("Parent", bear.Parent);
        if (bear.Parent === 'Yes') {
            addDataToDescription("Dependents", bear.NumDependents);
        }
        addDataToDescription("Body Length", bear.BodyLength, "cm");
        addDataToDescription("Mass", bear.Mass, "kg");
        addDataToDescription("BMI", bear.BMI);
        addDataToDescription("Storage Energy", bear.StorageEnergy, "MJ");
        addDataToDescription("Hair Weight", bear.HairWeight, "mg");
        addDataToDescription("Hair Cortisol", bear.HairCortisol, "ng/g");
        addDataToDescription("Reactive Oxygen Species", bear.ReactiveOxySpecies, "mM/H2O2");
        addDataToDescription("Lysis", bear.Lysis, "CH50 units/ml");
        addDataToDescription("Oxidative Barrier", bear.OxidativeBarrier, "mmol/L");

        this.description = description;

        allHealthVisual.highlightBear(bear.BearID);

    }

    clearDescription() {
        this.description = ""; // Clear the description property
        document.getElementById(this.parentElement).innerHTML = ""; // Clear the HTML content
    }

}