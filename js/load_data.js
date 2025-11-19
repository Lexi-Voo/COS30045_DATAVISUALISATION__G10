// ---------------------------
// Load RQ1 — Chart 1 (Bar + Line)
// ---------------------------
d3.csv("data/RQ1.csv", d => ({
    year: +d.YEAR,
    count_conducted: +d.COUNT_CONDUCTED,
    count_positive: +d.COUNT_POSITIVE,
    percent_positive: +d.POSITIVE_RATE
}))
.then(data => {
    console.log("RQ1 data loaded:", data);

    // Chart 1 (Bar + Line)
    createChart(data);

    // Update overview statistics (your Page 1 small stats)
    updateStats(data);

})
.catch(error => {
    console.error("Error loading RQ1 CSV:", error);
});


// ---------------------------
// Load RQ2 — Chart 2 (Dumbbell)
// ---------------------------
d3.csv("data/RQ2.csv", d => ({
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

    // Chart 2 (Dumbbell)
    createDumbbellChart(data);

    // Initialize filter + tooltip interactivity for Chart 2
    initChart2Interaction(data);
})
.catch(error => {
    console.error("Error loading RQ2 CSV:", error);
});







d3.csv("data/police_enforcement_2024_location.csv", d => ({
    LOCATION: d.LOCATION,
    AMPHETAMINE: +d.AMPHETAMINE,
    CANNABIS: +d.CANNABIS,
    COCAINE: +d.COCAINE,
    ECSTASY: +d.ECSTASY,
    METHYLAMPHETAMINE: +d.METHYLAMPHETAMINE,
    OTHER: +d.OTHER,
    UNKNOWN: +d.UNKNOWN
})).then(data => {
    console.log(data);

    drawStackedBarChart(data);

}).catch(error => {
    console.error("Error loading the CSV file:", error);
});

d3.csv("data/police_enforcement_2024_positive_drug_test_per_10000.csv", d => ({
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