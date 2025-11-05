// js/scatter.js
function createScatterPlot(data) {
  const svg = d3.select("#scatter-chart")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT)
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("class", "responsive-svg")
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

  //Define Scales 
  const x = d3.scaleLinear()
    .domain([d3.min(data, d => d.star) - 1, d3.max(data, d => d.star) + 1])
    .range([0, INNER_WIDTH]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.energy)])
    .nice()
    .range([INNER_HEIGHT, 0]);

  const dotsize = 3;

  // Axes
  svg.append("g")
    .attr("transform", `translate(0, ${INNER_HEIGHT})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));

  // Points
 svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.star))    
    .attr("cy", d => y(d.energy))   
    .attr("r", dotsize)             
    .attr("fill", "#1f77b4")       
    .attr("opacity", 0.7)

  // Labels
   svg.append("text")
    .attr("x", INNER_WIDTH / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Energy Consumption vs Star Rating");

  svg.append("text")
    .attr("x", INNER_WIDTH / 2)
    .attr("y", INNER_HEIGHT + 40)
    .attr("text-anchor", "middle")
    .text("Star Rating");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -INNER_HEIGHT / 2)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .text("Energy Consumption (kWh/year)");

}
