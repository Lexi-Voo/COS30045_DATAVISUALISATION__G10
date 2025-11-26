const drawStackedBarChart = (data) => {
    // Clear previous chart
    d3.select("#stackedbarchart").html("");

    // SVG container
    const svg = d3.select("#stackedbarchart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height + 30}`);

    const innerChart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2 - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .style("font-weight", "bold")
        .style("fill", "#2c3e50")
        .text("Drug Type Composition by Location Type");

        // Annotation explaining the "Unknown" category
    svg.append("text")
        .attr("x", width - 20)
        .attr("y", margin.top / 2 + 10)
        .attr("text-anchor", "end")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#e53e3e")
        .text('Note: Unknown location indicate location was missing in the dataset.');


    const keys = ["AMPHETAMINE", "CANNABIS", "COCAINE", "ECSTASY", "METHYLAMPHETAMINE", "OTHER", "UNKNOWN"];

    colorScale
        .domain(keys)
        .range(drugColorScheme);

    // Sort locations
    const locationOrder = [
        "Major Cities of Australia",
        "Inner Regional Australia",
        "Outer Regional Australia",
        "Remote Australia",
        "Very Remote Australia",
        "Unknown"
    ];
    data.sort((a, b) => locationOrder.indexOf(a.LOCATION) - locationOrder.indexOf(b.LOCATION));

    // Stack the data
    const stackedData = d3.stack()
        .keys(keys)(data);

    const xScaleS = d3.scaleBand()
        .domain(data.map(d => d.LOCATION))
        .range([0, innerWidth])
        .padding(0.2);

    const yScaleS = d3.scaleLinear()
        .domain([0, d3.max(data, d => keys.reduce((sum, k) => sum + d[k], 0))])
        .nice()
        .range([innerHeight, 0]);

    const tooltip = createTooltip();

    // Bars
    innerChart.selectAll("g.layer")
        .data(stackedData)
        .join("g")
        .attr("class", "layer")
        .attr("fill", d => colorScale(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => xScaleS(d.data.LOCATION))
        .attr("y", d => yScaleS(d[1]))
        .attr("height", d => yScaleS(d[0]) - yScaleS(d[1]))
        .attr("width", xScaleS.bandwidth())
        .attr("stroke", bodyBackgroundColor)
        .attr("stroke-width", 1)
        .on("mouseover", (event, d) => {
            const rect = d3.select(event.currentTarget);
            const drugType = event.currentTarget.parentNode.__data__.key;
            const baseColor = colorScale(drugType);
            const value = d.data[drugType];
            const location = d.data.LOCATION;

            rect.transition().duration(150)
                .attr("fill", d3.color(baseColor).darker(0.7));

            showTooltip(
                tooltip,
                `<b>${location}</b><br>${drugType}: ${d3.format(",")(value)}`,
                event
            );
        })
        .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 12}px`)
                   .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", (event) => {
            const rect = d3.select(event.currentTarget);
            const drugType = event.currentTarget.parentNode.__data__.key;
            rect.transition().duration(150)
                .attr("fill", colorScale(drugType));
            hideTooltip(tooltip);
        });

    // Data labels
    innerChart.selectAll(".bar-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => xScaleS(d.LOCATION) + xScaleS.bandwidth() / 2)
        .attr("y", d => yScaleS(keys.reduce((sum, k) => sum + d[k], 0)) - 4)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .style("fill", "#2c3e50")
        .text(d => d3.format(",")(keys.reduce((sum, k) => sum + d[k], 0)));

    // X Axis
    innerChart.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScaleS))
        .selectAll("text")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("fill", "#2c3e50")
        .attr("text-anchor", "middle");

    // Y Axis
    innerChart.append("g")
        .call(d3.axisLeft(yScaleS).ticks(6))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#2c3e50");

    // Axis Labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top + innerHeight + 120)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "#2c3e50")
        .text("Location Type");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", - (height / 2))
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "#2c3e50")
        .text("Number of Positive Drug Tests");

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top / 2 + 20})`);

    let xOffset = 0;
    let yOffset = 0;
    const legendItemSpacing = 10;
    const legendRectSize = 12;
    const maxWidth = innerWidth;

    keys.forEach((key) => {
        const temp = legend.append("g");

        temp.append("rect")
            .attr("width", legendRectSize)
            .attr("height", legendRectSize)
            .attr("fill", colorScale(key));

        temp.append("text")
            .attr("x", legendRectSize + 4)
            .attr("y", legendRectSize)
            .style("font-size", "12px")
            .text(key);

        const legendWidth = temp.node().getBBox().width;

        if (xOffset + legendWidth > maxWidth) {
            xOffset = 0;
            yOffset += legendRectSize + 8;
        }

        temp.attr("transform", `translate(${xOffset}, ${yOffset})`);
        xOffset += legendWidth + legendItemSpacing;
    });

    innerChart.attr(
        "transform",
        `translate(${margin.left},${margin.top + yOffset + legendRectSize + 10})`
    );
};
