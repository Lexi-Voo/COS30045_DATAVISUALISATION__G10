const drawStackedBarChart = (data) => {
    // Define the SVG container
    const svg = d3.select("#stackedbarchart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height + 30}`);

    const innerChart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2 - 10)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Drug Type Composition by Location Type");

    // Define the drug type keys
    const keys = ["AMPHETAMINE", "CANNABIS", "COCAINE", "ECSTASY", "METHYLAMPHETAMINE", "OTHER", "UNKNOWN"];

    // Define the color scale for the drug types
    colorScale
        .domain(keys)
        .range(drugColorScheme);

    // Sort the locations logically
    const locationOrder = [
        "Major Cities of Australia",
        "Inner Regional Australia",
        "Outer Regional Australia",
        "Remote Australia",
        "Very Remote Australia",
        "Unknown"
    ];
    data.sort((a, b) => locationOrder.indexOf(a.LOCATION) - locationOrder.indexOf(b.LOCATION));

    // Stack the data by drug type
    const stackedData = d3.stack()
        .keys(keys)(data);

    // Define x and y scales
    const xScaleS = d3.scaleBand()
        .domain(data.map(d => d.LOCATION))
        .range([0, innerWidth])
        .padding(0.2);

    const yScaleS = d3.scaleLinear()
        .domain([0, d3.max(data, d => {
            let total = 0;
            keys.forEach(k => total += d[k]);
            return total;
        })])
        .nice()
        .range([innerHeight, 0]);

    const tooltip = createTooltip();

    // Draw the stacked bars
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
        .style("pointer-events", "all")
        .attr("stroke", bodyBackgroundColor)
        .attr("stroke-width", 1)
        .on("mouseover", (event, d) => {
            const rect = d3.select(event.currentTarget);
            const drugType = event.currentTarget.parentNode.__data__.key;
            const baseColor = colorScale(drugType);
            const value = d.data[drugType];
            const location = d.data.LOCATION;

            // darken color smoothly
            rect.transition().duration(150)
                .attr("fill", d3.color(baseColor).darker(0.7));

            // show tooltip
            showTooltip(
                tooltip,
                `<b>${location}</b><br>${drugType}: ${d3.format(",")(value)}`,
                event
            );
        })
        .on("mousemove", (event) => {
            // update tooltip position continuously
            tooltip
                .style("left", `${event.pageX + 12}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", (event) => {
            const rect = d3.select(event.currentTarget);
            const drugType = event.currentTarget.parentNode.__data__.key;
            const baseColor = colorScale(drugType);

            // revert color
            rect.transition().duration(150)
                .attr("fill", baseColor);

            // hide tooltip
            hideTooltip(tooltip);
        });
    
    // Add data labels above the bars
    innerChart.selectAll(".bar-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => xScaleS(d.LOCATION) + xScaleS.bandwidth() / 2)
        .attr("y", d => yScaleS(keys.reduce((sum, k) => sum + d[k], 0)) - 4)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .text(d => d3.format(",")(keys.reduce((sum, k) => sum + d[k], 0)));

    // Add X Axis
    const bottomAxis = d3.axisBottom(xScaleS);
    innerChart.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(bottomAxis)
        .selectAll("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-25)")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em");

    // Add Y Axis
    const leftAxis = d3.axisLeft(yScaleS).ticks(6);
    innerChart.append("g").call(leftAxis);

    // Axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top + innerHeight + 115)
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Location Type");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Number of Positive Drug Tests");

    // Add horizontal legend above the chart
    const legend = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top / 2 + 20})`);

    let xOffset = 0;  // horizontal position
    let yOffset = 0;  // vertical position
    const legendItemSpacing = 10; // space between items
    const legendRectSize = 12;    // rectangle size
    const maxWidth = innerWidth;  // max width before wrapping

    keys.forEach((key) => {
        // Temporary group to measure width
        const temp = legend.append("g");

        temp.append("rect")
            .attr("width", legendRectSize)
            .attr("height", legendRectSize)
            .attr("fill", colorScale(key));

        temp.append("text")
            .attr("x", legendRectSize + 4)
            .attr("y", legendRectSize)
            .attr("font-size", "12px")
            .text(key);

        // Get the width of the legend item
        const legendWidth = temp.node().getBBox().width;

        // If exceeding max width, wrap to next row
        if (xOffset + legendWidth > maxWidth) {
            xOffset = 0;
            yOffset += legendRectSize + 8; // next row
        }

        // Move the temp group to correct position
        temp.attr("transform", `translate(${xOffset}, ${yOffset})`);

        // Update xOffset for next item
        xOffset += legendWidth + legendItemSpacing;
    });

    // Adjust innerChart translation to leave space for legend
    innerChart.attr("transform", `translate(${margin.left},${margin.top + yOffset + legendRectSize + 10})`);

};
