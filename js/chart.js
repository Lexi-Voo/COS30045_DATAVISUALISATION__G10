function createChart(data) {
    // Remove any existing SVG
    d3.select("#chart").selectAll("*").remove();

    // Append responsive SVG
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("class", "responsive-svg")
        .append("g")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // X scale
    const x = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, INNER_WIDTH])
        .padding(0.2);

    // Y scale - left axis
    const yLeft = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count_conducted) * 1.1])
        .range([INNER_HEIGHT, 0]);

    // Y scale - right axis
    const yRight = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.percent_positive) * 1.1])
        .range([INNER_HEIGHT, 0]);

    // --- Axes ---
    svg.append("g")
        .attr("transform", `translate(0,${INNER_HEIGHT})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");

    svg.append("g").call(d3.axisLeft(yLeft));
    svg.append("g")
        .attr("transform", `translate(${INNER_WIDTH},0)`)
        .call(d3.axisRight(yRight));

    // --- Bars ---
    svg.selectAll(".bar")
        .data(data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.year))
        .attr("y", d => yLeft(d.count_conducted))
        .attr("width", x.bandwidth())
        .attr("height", d => INNER_HEIGHT - yLeft(d.count_conducted))
        .attr("fill", COLOR_BAR);

    // --- Line ---
    const line = d3.line()
        .x(d => x(d.year) + x.bandwidth() / 2)
        .y(d => yRight(d.percent_positive));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", COLOR_LINE)
        .attr("stroke-width", 2)
        .attr("d", line);

    // --- Markers ---
    svg.selectAll(".dot")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.year) + x.bandwidth() / 2)
        .attr("cy", d => yRight(d.percent_positive))
        .attr("r", 4)
        .attr("fill", COLOR_LINE);

    // --- Axis Labels ---
    svg.append("text")
        .attr("x", -INNER_HEIGHT / 2)
        .attr("y", -45)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .attr("fill", COLOR_BAR)
        .text("Number of Drug Tests Conducted");

    svg.append("text")
        .attr("x", INNER_WIDTH + 40)
        .attr("y", INNER_HEIGHT / 2)
        .attr("transform", `rotate(90, ${INNER_WIDTH + 40}, ${INNER_HEIGHT / 2})`)
        .attr("text-anchor", "middle")
        .attr("fill", COLOR_LINE)
        .text("Positivity Rate (%)");

    // --- Title ---
    svg.append("text")
        .attr("x", INNER_WIDTH / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Yearly Drug Tests Conducted vs Positivity Rate");

    // --- Legend ---
    const legend = svg.append("g")
        .attr("transform", `translate(${INNER_WIDTH - 200}, -10)`);

    legend.append("rect")
        .attr("x", 0).attr("y", 0).attr("width", 15).attr("height", 15)
        .attr("fill", COLOR_BAR);
    legend.append("text").attr("x", 20).attr("y", 12).text("Drug Tests Conducted");

    legend.append("circle")
        .attr("cx", 7).attr("cy", 30).attr("r", 6)
        .attr("fill", COLOR_LINE);
    legend.append("text").attr("x", 20).attr("y", 34).text("Positivity Rate (%)");

    // ---------------------------
// APPLY TOOLTIPS (Chart 1)
// ---------------------------
svg.selectAll(".bar, .dot")
    .call(attachTooltip);

}

function updateStats(data) {
    const total2024 = data.find(d => d.year === 2024)?.count_conducted || 0;
    document.getElementById("totalTests").textContent = total2024.toLocaleString();

    const maxPositive = d3.max(data, d => d.percent_positive) || 0;
    document.getElementById("positiveRate").textContent = maxPositive.toFixed(1) + "%";

    const maxYear = data.reduce((a, b) => (a.count_positive > b.count_positive ? a : b), data[0]).year;
    document.getElementById("highestYear").textContent = maxYear;
}
