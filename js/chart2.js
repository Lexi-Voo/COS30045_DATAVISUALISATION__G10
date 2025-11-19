function createDumbbellChart(data, yearStart="2008", yearEnd="2024") {
    d3.select("#dumbbell-chart").selectAll("*").remove();

    const svg = d3.select("#dumbbell-chart")
        .append("svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("class", "responsive-svg")
        .append("g")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d[yearStart], d[yearEnd])) * 1.1])
        .range([0, INNER_WIDTH]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.JURISDICTION))
        .range([0, INNER_HEIGHT])
        .padding(0.4);

    // Axes
    svg.append("g").attr("transform", `translate(0,${INNER_HEIGHT})`).call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));

    // Lines connecting points
    svg.selectAll("line.connect")
        .data(data)
        .join("line")
        .attr("class", "connect")
        .attr("x1", d => x(d[yearStart]))
        .attr("x2", d => x(d[yearEnd]))
        .attr("y1", d => y(d.JURISDICTION) + y.bandwidth()/2)
        .attr("y2", d => y(d.JURISDICTION) + y.bandwidth()/2)
        .attr("stroke", COLOR_LINE_CONNECT)
        .attr("stroke-width", 2);

    // Start circle
    svg.selectAll("circle.start")
        .data(data)
        .join("circle")
        .attr("class", "start")
        .attr("cx", d => x(d[yearStart]))
        .attr("cy", d => y(d.JURISDICTION) + y.bandwidth()/2)
        .attr("r", 6)
        .attr("fill", COLOR_DUMBBELL_START);

    // End circle
    svg.selectAll("circle.end")
        .data(data)
        .join("circle")
        .attr("class", "end")
        .attr("cx", d => x(d[yearEnd]))
        .attr("cy", d => y(d.JURISDICTION) + y.bandwidth()/2)
        .attr("r", 6)
        .attr("fill", COLOR_DUMBBELL_END);

    // Display Values
    svg.selectAll("text.start-value")
        .data(data)
        .join("text")
        .attr("class", "start-value")
        .attr("x", d => x(d[yearStart]) - 5)
        .attr("y", d => y(d.JURISDICTION) + y.bandwidth()/2 - 10)
        .attr("text-anchor", "end")
        .style("font-size", "12px")
        .style("fill", COLOR_DUMBBELL_START)
        .text(d => d[yearStart]);

    svg.selectAll("text.end-value")
        .data(data)
        .join("text")
        .attr("class", "end-value")
        .attr("x", d => x(d[yearEnd]) + 5)
        .attr("y", d => y(d.JURISDICTION) + y.bandwidth()/2 - 10)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .style("fill", COLOR_DUMBBELL_END)
        .text(d => d[yearEnd]);

    // --- Legend ---
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${INNER_WIDTH - 150}, -10)`);

    legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 6)
        .attr("fill", COLOR_DUMBBELL_START);

    legend.append("text")
        .attr("x", 15)
        .attr("y", 4)
        .style("font-size", "12px")
        .text("Start Year");

    legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 20)
        .attr("r", 6)
        .attr("fill", COLOR_DUMBBELL_END);

    legend.append("text")
        .attr("x", 15)
        .attr("y", 24)
        .style("font-size", "12px")
        .text("End Year");

    // Title
    svg.append("text")
        .attr("x", INNER_WIDTH/2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(`Dumbbell Chart: ${yearStart} vs ${yearEnd}`);
}
