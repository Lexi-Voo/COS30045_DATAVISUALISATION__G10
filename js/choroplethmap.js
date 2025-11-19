const drawChoroplethMap = (data) => {
    // Load GeoJSON for Australia
    d3.json("https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson")
        .then(geoData => {

            // Map jurisdiction to full state names
            const stateNameMap = {
                "NSW": "New South Wales",
                "VIC": "Victoria",
                "QLD": "Queensland",
                "SA": "South Australia",
                "WA": "Western Australia",
                "TAS": "Tasmania",
                "NT": "Northern Territory",
                "ACT": "Australian Capital Territory"
            };

            // Create SVG
            const svg = d3.select("#choroplethmap")
                .append("svg")
                .attr("viewBox", `0 0 ${width} ${height + 170}`)
                .style("margin", "0 auto");
            
            // Add chart title
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", margin.top / 2)
                .attr("text-anchor", "middle")
                .attr("class", "chart-title")
                .style("font-size", "18px")
                .style("font-weight", "bold")
                .text("Positive Drug Tests per 10,000 Driver Licences by Jurisdiction");
                
            // Define map projection
            const projection = d3.geoMercator()
                .center([133, -27]) // center of Australia
                .scale(850)
                .translate([width / 2, (height / 2) + 100]);

            const path = d3.geoPath().projection(projection);

            // Get list of unique years
            const years = Array.from(new Set(data.map(d => d.YEAR))).sort((a, b) => a - b);

            // Populate dropdown
            const dropdown = d3.select("#yearSelect");
            dropdown.selectAll("option")
                .data(years)
                .join("option")
                .attr("value", d => d)
                .text(d => d);

            // Define color scale
            const maxValue = d3.max(data, d => d.POSITIVE_DRUG_TESTS_PER_10000);
            const colorScale = d3.scaleSequential()
                .domain([maxValue, 0])
                .interpolator(d3.interpolateInferno);

            const tooltip = createTooltip(); 

            // Function to update map per year
            function updateMap(selectedYear) {
                const yearData = data.filter(d => d.YEAR === +selectedYear);

                // Convert short codes to full names for lookup
                const valueByState = new Map(
                    yearData.map(d => [stateNameMap[d.JURISDICTION], d.POSITIVE_DRUG_TESTS_PER_10000])
                );

                updateInfoBox(selectedYear);

                // Draw map
                svg.selectAll("path")
                    .data(geoData.features)
                    .join("path")
                    .attr("d", path)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1)
                    .attr("fill", d => {
                        const val = valueByState.get(d.properties.STATE_NAME);
                        if (!val || val === 0) return "#d3d3d3"; // gray for missing/zero
                        return colorScale(val);
                    })
                    .on("mouseover", function(event, d) {
                        const stateName = d.properties.STATE_NAME;
                        const val = valueByState.get(stateName);
                        const baseColor = (!val || val === 0) ? "#d3d3d3" : colorScale(val);

                        // darken the fill color smoothly
                        d3.select(this)
                            .transition()
                            .duration(150)
                            .attr("fill", (!val || val === 0) ? baseColor : d3.color(baseColor).darker(0.7))
                            .attr("stroke", "#000")
                            .attr("stroke-width", 2);

                        // move arrow on legend
                        if (val && val > 0) {
                            const x = legendScale(val);
                            arrow.transition().duration(150)
                                .attr("transform", `translate(${x - 5}, -5)`)
                                .style("opacity", 1);
                        }

                        const shortCode = Object.keys(stateNameMap)
                            .find(k => stateNameMap[k] === stateName);
                        updateJurisdictionInfo(shortCode, selectedYear);

                        // show tooltip
                        showTooltip(tooltip, `<b>${stateName}</b><br>${val ? val.toFixed(2) : "No data"} per 10,000`, event);
                    })
                    .on("mousemove", function(event) {
                        // move tooltip with mouse
                        tooltip
                            .style("left", `${event.pageX + 12}px`)
                            .style("top", `${event.pageY - 28}px`);
                    })
                    .on("mouseout", function(event, d) {
                        const stateName = d.properties.STATE_NAME;
                        const val = valueByState.get(stateName);
                        const baseColor = (!val || val === 0) ? "#d3d3d3" : colorScale(val);

                        // revert fill and stroke
                        d3.select(this)
                            .transition()
                            .duration(150)
                            .attr("fill", baseColor)
                            .attr("stroke", "#fff")
                            .attr("stroke-width", 1);
                        
                        // hide arrow
                        arrow.transition().duration(150)
                            .style("opacity", 0);

                        updateInfoBox(selectedYear);
                            
                        // hide tooltip
                        hideTooltip(tooltip);

                        d3.select("#jurisdictionName").text("All Jurisdictions");
                    });

                // Remove old legend before redrawing
                svg.selectAll(".legend").remove();

                // Draw color scale legend
                const legendWidth = 300;
                const legendHeight = 10;

                const legendGroup = svg.append("g")
                    .attr("class", "legend")
                    .attr("transform", `translate(${margin.left}, ${height + 100})`);

                const defs = svg.append("defs");
                const linearGradient = defs.append("linearGradient")
                    .attr("id", "linear-gradient");

                linearGradient.selectAll("stop")
                    .data(d3.ticks(0, 1, 10))
                    .enter()
                    .append("stop")
                    .attr("offset", d => `${d * 100}%`)
                    .attr("stop-color", d => colorScale(d * maxValue));

                legendGroup.append("rect")
                    .attr("width", legendWidth)
                    .attr("height", legendHeight)
                    .style("fill", "url(#linear-gradient)")
                    .style("stroke", "#000")
                    .style("stroke-width", 0.5);

                const legendScale = d3.scaleLinear()
                    .domain([0, maxValue])
                    .range([0, legendWidth]);

                const legendAxis = d3.axisBottom(legendScale)
                    
                legendGroup.append("g")
                    .attr("transform", `translate(0, ${legendHeight})`)
                    .call(legendAxis);

                // Add arrow indicator for hover
                const arrow = legendGroup.append("polygon")
                    .attr("points", "0,0 10,0 5,10") // triangle pointing up
                    .attr("fill", "black")
                    .attr("transform", `translate(0, -5)`)
                    .style("opacity", 0);
            }

            // Initialize map with the latest year
            const latestYear = years[years.length - 1];
            updateMap(latestYear);
            dropdown.property("value", latestYear);

            // Update when dropdown changes
            dropdown.on("change", function() {
                updateMap(this.value);
            });

            // --- Info box updater ---
            function updateInfoBox(year) {
                const yearData = data.filter(d => d.YEAR === +year);

                const totalLicences = d3.sum(yearData, d => d.TOTAL);
                const totalPositive = d3.sum(yearData, d => d.COUNT);

                d3.select("#totalLicences").text(totalLicences.toLocaleString());
                d3.select("#positiveTests").text(totalPositive.toLocaleString());
                d3.select("#ratePer10k").text("–");
            }

            function updateJurisdictionInfo(jurisdiction, year) {
                d3.select("#jurisdictionName").text(stateNameMap[jurisdiction]);

                const record = data.find(d => 
                    d.JURISDICTION === jurisdiction && d.YEAR === +year
                );

                if (record) {
                    d3.select("#totalLicences").text(record.TOTAL.toLocaleString());
                    d3.select("#positiveTests").text(record.COUNT.toLocaleString());
                    d3.select("#ratePer10k").text(record.POSITIVE_DRUG_TESTS_PER_10000.toFixed(2));
                } else {
                    d3.select("#totalLicences").text("–");
                    d3.select("#positiveTests").text("–");
                    d3.select("#ratePer10k").text("No data");
                }
            }

        })
        .catch(error => {
            console.error("Error loading GeoJSON:", error);
        });
};
