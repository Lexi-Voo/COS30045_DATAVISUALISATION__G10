const createChart = (data) => {

    // SVG Container
    const svg = d3.select("#chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "none");

    // Chart Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .style("font-weight", "bold")
        .attr("fill", "#2c3e50")
        .text("Yearly Drug Tests Conducted vs Positivity Rate");

    // Legend 
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 180}, 10)`);

    legend.append("rect")
        .attr("x", -10)
        .attr("y", -10)
        .attr("width", 180)
        .attr("height", 100)
        .attr("fill", "#f4f6f9")
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);

    legend.append("rect")
        .attr("x", 10)
        .attr("y", 15)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", colorBar);

    legend.append("text")
        .attr("x", 40)
        .attr("y", 30)
        .style("font-size", "12px")
        .style("text-anchor", "start")
        .text("Drug Tests Conducted");

    // Line legend
    legend.append("circle")
        .attr("cx", 20)
        .attr("cy", 60)
        .attr("r", 8)
        .attr("fill", colorLine);

    legend.append("text")
        .attr("x", 40)
        .attr("y", 65)
        .style("font-size", "12px")
        .style("text-anchor", "start")
        .text("Positivity Rate (%)");

    // Chart Group 
    const chartOffset = 20;
    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top + chartOffset})`);

    // Scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, innerWidth])
        .padding(0.1)
        .paddingOuter(0.4);

    const yLeft = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count_conducted) * 1.1])
        .range([innerHeight, 0]);

    const yRight = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.percent_positive) * 1.1])
        .range([innerHeight, 0]);

    // X-axis
    chartGroup.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("dy", "1em")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#2c3e50")
        .style("text-anchor", "middle");

    // Y axis Left
    chartGroup.append("g")
        .attr("transform", "translate(10,0)")
        .call(d3.axisLeft(yLeft))
        .selectAll("text")
        .style("fill", "#2c3e50")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .attr("dx", "-0.5em");

    // Y axis Right
    chartGroup.append("g")
        .attr("transform", `translate(${innerWidth},0)`)
        .call(d3.axisRight(yRight))
        .selectAll("text")
        .style("fill", "#2c3e50")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .attr("dx", "0.5em");

    // X-axis label
    chartGroup.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 50)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .attr("fill", "#2c3e50")
        .text("Year");

    // Y-axis left
    chartGroup.append("text")
        .attr("x", -innerHeight / 2)
        .attr("y", -80)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .attr("fill", "#2c3e50")
        .text("Number of Drug Tests Conducted");

    // Y-axis right
    chartGroup.append("text")
        .attr("x", innerWidth + 40)
        .attr("y", innerHeight / 2)
        .attr("transform", `rotate(90, ${innerWidth + 40}, ${innerHeight / 2})`)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .attr("fill", "#2c3e50")
        .text("Positivity Rate (%)");

    // Bars
    chartGroup.selectAll(".bar")
        .data(data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.year))
        .attr("y", d => yLeft(d.count_conducted))
        .attr("width", x.bandwidth())
        .attr("height", d => innerHeight - yLeft(d.count_conducted))
        .attr("fill", colorBar)
        .attr("data-count", d => d.count_conducted)
        .attr("data-rate", d => d.percent_positive);

    // Line & Dots
    const line = d3.line()
        .x(d => x(d.year) + x.bandwidth() / 2)
        .y(d => yRight(d.percent_positive));

    chartGroup.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colorLine)
        .attr("stroke-width", 2)
        .attr("d", line);

    chartGroup.selectAll(".dot")
        .data(data)
        .join("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.year) + x.bandwidth() / 2)
        .attr("cy", d => yRight(d.percent_positive))
        .attr("r", 4)
        .attr("fill", colorLine)
        .attr("data-count", d => d.count_conducted)
        .attr("data-rate", d => d.percent_positive);

    // Tooltips
    chartGroup.selectAll(".bar").call(attachTooltip);
    chartGroup.selectAll(".dot").call(attachTooltip);
}

// Update Stats Panel
function updateStats(data) {
    const total2024 = data.find(d => d.year === 2024)?.count_conducted || 0;
    document.getElementById("totalTests").textContent = total2024.toLocaleString();

    const maxPositive = d3.max(data, d => d.percent_positive) || 0;
    document.getElementById("positiveRate").textContent = maxPositive.toFixed(1) + "%";

    const maxYear = data.reduce((a, b) => (a.count_positive > b.count_positive ? a : b), data[0]).year;
    document.getElementById("highestYear").textContent = maxYear;
}
