// ---------------------------
// Tooltip Div
// ---------------------------
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "#222")
    .style("color", "#fff")
    .style("border-radius", "4px")
    .style("opacity", 0)
    .style("padding", "10px 14px")
    .style("font-size", "14px")
    .style("line-height", "1.4")
    .style("max-width", "220px");

// ---------------------------
// Attach Tooltip to Any Selection
// ---------------------------
function attachTooltip(selection) {
    selection.on("mouseenter", (event, d) => {
        let el = d3.select(event.currentTarget);
        let htmlContent = "";

        // Chart1: bar or dot
        if (el.classed("bar") || el.classed("dot")) {
            const count = el.attr("data-count") || d.count_conducted;
            const rate = el.attr("data-rate") || d.percent_positive;
            htmlContent = `Count: ${count}<br>Rate: ${rate}%`;
        }

        // Chart2: start, end, or line connect
        else if (el.classed("start") || el.classed("end") || el.classed("connect")) {
            const startVal = el.attr("data-start") || el.attr("data-value")?.split(" → ")[0];
            const endVal = el.attr("data-end") || el.attr("data-value")?.split(" → ")[1];
            htmlContent = `Start: ${startVal}<br>End: ${endVal}`;
        }

        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(htmlContent);
    })
    .on("mousemove", event => {
        tooltip.style("left", (event.pageX + 12) + "px")
               .style("top", (event.pageY - 35) + "px");
    })
    .on("mouseleave", () => {
        tooltip.transition().duration(200).style("opacity", 0);
    });
}

// ---------------------------
// Dumbbell Chart Filter + Tooltip
// ---------------------------
function initChart2Interaction(data) {
    const yearStartSelect = d3.select("#yearStart");
    const yearEndSelect = d3.select("#yearEnd");

    const years = Array.from({ length: 2024 - 2008 + 1 }, (_, i) => (2008 + i).toString());
    years.forEach(y => {
        yearStartSelect.append("option").attr("value", y).text(y);
        yearEndSelect.append("option").attr("value", y).text(y);
    });

    yearStartSelect.property("value", "2008");
    yearEndSelect.property("value", "2024");

    d3.select("#updateChart").on("click", () => {
        const start = yearStartSelect.property("value");
        const end = yearEndSelect.property("value");

        createDumbbellChart(data, start, end);

        // Reapply tooltip after redraw
        d3.selectAll("#dumbbell-chart circle, #dumbbell-chart line.connect")
            .call(attachTooltip);
    });
}










//jody
// Create a tooltip container
function createTooltip() {
    let tooltip = d3.select("body").select(".tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", tooltipBg)
            .style("border", `1px solid ${tooltipBorder}`)
            .style("padding", "6px 8px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("color", tooltipTextColor)
            .style("opacity", 0);
    }
    return tooltip;
}

// Show tooltip with smooth fade-in
function showTooltip(tooltip, html, event) {
    tooltip
        .html(html)
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY - 28}px`)
        .transition()
        .duration(150)
        .style("opacity", 1);
}

// Hide tooltip smoothly
function hideTooltip(tooltip) {
    tooltip
        .transition()
        .duration(150)
        .style("opacity", 0);
}