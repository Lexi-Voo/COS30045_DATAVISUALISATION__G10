function createDumbbellChart(data, yearStart="2008", yearEnd="2024") {
    d3.select("#dumbbell-chart").selectAll("*").remove();

    // SVG Container
    const svg = d3.select("#dumbbell-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet"); 

    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d[yearStart], d[yearEnd])) * 1.1])
        .range([0, innerWidth]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.JURISDICTION))
        .range([0, innerHeight])
        .padding(0.4);

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

    // Y-axis
    chartGroup.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#2c3e50")
        .attr("dx", "-0.5em");

    // X-axis label
    chartGroup.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 50)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .attr("fill", "#2c3e50")
        .text("Positivity Rate (%)");

    // Y-axis label
    chartGroup.append("text")
        .attr("x", -innerHeight / 2)
        .attr("y", -60)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .attr("fill", "#2c3e50")
        .text("Jurisdiction");

    // Connect Lines
    chartGroup.selectAll("line.connect")
        .data(data)
        .join("line")
        .attr("class", "connect")
        .attr("x1", d => x(d[yearStart]))
        .attr("x2", d => x(d[yearEnd]))
        .attr("y1", d => y(d.JURISDICTION) + y.bandwidth()/2)
        .attr("y2", d => y(d.JURISDICTION) + y.bandwidth()/2)
        .attr("stroke", colorLineConnect)
        .attr("stroke-width", 2);

    // Circles (Start & End)
    // Start circles
    chartGroup.selectAll("circle.start")
        .data(data)
        .join("circle")
        .attr("class", "start")
        .attr("cx", d => x(d[yearStart]))
        .attr("cy", d => y(d.JURISDICTION) + y.bandwidth()/2)
        .attr("r", 8)
        .attr("fill", colorDumbbellStart);

    // End circles
    chartGroup.selectAll("circle.end")
        .data(data)
        .join("circle")
        .attr("class", "end")
        .attr("cx", d => x(d[yearEnd]))
        .attr("cy", d => y(d.JURISDICTION) + y.bandwidth()/2)
        .attr("r", 8)
        .attr("fill", colorDumbbellEnd);

    // Start value labels
    chartGroup.selectAll("text.start-value")
        .data(data)
        .join("text")
        .attr("class", "start-value")
        .attr("x", d => x(d[yearStart]) - 5)
        .attr("y", d => y(d.JURISDICTION) + y.bandwidth()/2 - 10)
        .attr("text-anchor", "end")
        .style("font-size", "16px")
        .style("fill", colorDumbbellStart)
        .text(d => d[yearStart]);

    // End value labels
    chartGroup.selectAll("text.end-value")
        .data(data)
        .join("text")
        .attr("class", "end-value")
        .attr("x", d => x(d[yearEnd]) + 5)
        .attr("y", d => y(d.JURISDICTION) + y.bandwidth()/2 - 10)
        .attr("text-anchor", "start")
        .style("font-size", "16px")
        .style("fill", colorDumbbellEnd)
        .text(d => d[yearEnd]);

    // Legend
    const legend = chartGroup.append("g")
        .attr("transform", `translate(${innerWidth - 170},10)`);

    legend.append("rect")
        .attr("x", -10)
        .attr("y", -10)
        .attr("width", 150)
        .attr("height", 70)
        .attr("fill", "#f4f6f9")
        .attr("rx", 8)
        .attr("ry", 10)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);

    legend.append("circle")
        .attr("cx", 10)
        .attr("cy", 15)
        .attr("r", 7)
        .attr("fill", colorDumbbellStart);

    legend.append("text")
        .attr("x", 30)
        .attr("y", 20)
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "#2c3e50")
        .text("Start Year");

    legend.append("circle")
        .attr("cx", 10)
        .attr("cy", 45)
        .attr("r", 7)
        .attr("fill", colorDumbbellEnd);

    legend.append("text")
        .attr("x", 30)
        .attr("y", 50)
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "#2c3e50")
        .text("End Year");

    // Annotation Below X-axis
    chartGroup.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 80)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-style", "italic")
        .style("fill", "#7f8c8d")
        .text("Missing data: Data prior to 2021, 2023 and 2024 Northern Territory data are unavailable due to significant data quality issues");
}
