// Bar + line chart
d3.csv("data/RQ1.csv", d => ({
    year: +d.YEAR,
    count_conducted: +d.COUNT_CONDUCTED,
    count_positive: +d.COUNT_POSITIVE,
    percent_positive: +d.POSITIVE_RATE
}))
.then(data => {
    console.log("RQ1 data loaded:", data);

    createChart(data);
    updateStats(data);
})
.catch(error => {
    console.error("Error loading RQ1 CSV:", error);
});


// Dumbbell
d3.csv("data/RQ1+.csv", d => ({
    JURISDICTION: d.JURISDICTION,
    2008: +d["2008"],
    2009: +d["2009"],
    2010: +d["2010"],
    2011: +d["2011"],
    2012: +d["2012"],
    2013: +d["2013"],
    2014: +d["2014"],
    2015: +d["2015"],
    2016: +d["2016"],
    2017: +d["2017"],
    2018: +d["2018"],
    2019: +d["2019"],
    2020: +d["2020"],
    2021: +d["2021"],
    2022: +d["2022"],
    2023: +d["2023"],
    2024: +d["2024"]
}))
.then(data => {
    console.log("RQ2 data loaded:", data);

    createDumbbellChart(data);
    initChart2Interaction(data);
})
.catch(error => {
    console.error("Error loading RQ2 CSV:", error);
});


// Choropleth Map
d3.csv("data/RQ5.csv", d => ({
    YEAR: +d.YEAR,
    JURISDICTION: d.JURISDICTION,
    POSITIVE_DRUG_TESTS_PER_10000: +d.POSITIVE_DRUG_TESTS_PER_10000,
    TOTAL: +d.Total,
    COUNT: +d.COUNT
})).then(data => {
    console.log(data);

    drawChoroplethMap(data);
}).catch(error => {
    console.error("Error loading the CSV file:", error);
});




// Load data functions for other charts
async function loadDrugData() {
    try {
        const data = await d3.csv(DATA_PATHS.drugData);

        globalData.drugs = data.map(d => ({
            drug: d.Drug_Type?.trim(),
            detections: +d.Total_Detections
        }));

        return globalData.drugs;
    } catch (error) {
        console.error('Error loading drug data:', error);
        throw error;
    }
}

async function loadAgeData() {
    try {
        const data = await d3.csv(DATA_PATHS.ageData);

        globalData.age = data.map(d => ({
            ageGroup: d.AGE_GROUP?.trim(),
            count: +d.Positive_Count
        }));

        return globalData.age;
    } catch (error) {
        console.error('Error loading age data:', error);
        throw error;
    }
}

async function loadDrugLocationData() {
    try {
        globalData.drugsByLocation = await d3.csv("data/RQ4.csv", d => ({
            LOCATION: d.LOCATION,
            AMPHETAMINE: +d.AMPHETAMINE,
            CANNABIS: +d.CANNABIS,
            COCAINE: +d.COCAINE,
            ECSTASY: +d.ECSTASY,
            METHYLAMPHETAMINE: +d.METHYLAMPHETAMINE,
            OTHER: +d.OTHER,
            UNKNOWN: +d.UNKNOWN
        }));
        console.log('Drug location data loaded:', globalData.drugsByLocation.length, 'rows');
    } catch (err) {
        console.error('Error loading drug location CSV:', err);
        throw err;
    }
}


async function loadAllData() {
    try {
        await Promise.all([
            loadDrugData(),        // existing drug detection counts
            loadAgeData(),         // existing age demographics
            loadDrugLocationData() // new function for stacked bar chart
        ]);
        console.log('All data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

