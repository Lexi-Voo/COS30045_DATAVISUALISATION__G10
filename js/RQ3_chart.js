function createAgeChart(data) {
    const container = d3.select('#main-content');
    container.html('');

    const chartDiv = container.append('div')
        .attr('id', 'chart')
        .attr('class', 'chart-container');

    chartDiv.append('h2')
        .style('text-align', 'center')
        .style('font-size', '22px')
        .style('color', '#2d3748')
        .style('font-weight', 'bold')
        .style('margin', '30px 0 10px 0')
        .text('Drug Detection by Age Demographics');

    const statsDiv = container.append('div')
        .attr('class', 'stats-grid')
        .attr('id', 'stats');

    // Tooltip setup
    let tooltip = d3.select('.tooltip');
    if (tooltip.empty()) {
        tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .attr('id', 'tooltip');
    }

    const margin = { top: 100, right: 80, bottom: 120, left: 140 };

    // Responsive SVG
    const svg = chartDiv.append('svg')
        .attr('viewBox', `0 0 1100 700`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = 1100 - margin.left - margin.right;
    const innerHeight = 700 - margin.top - margin.bottom;

    const x = d3.scaleBand()
        .domain(data.map(d => d.ageGroup))
        .range([0, innerWidth])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count) * 1.1])
        .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.ageGroup))
        .range(COLOR_SCHEMES.age);

    // X Axis
    svg.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#2c3e50')
        .style('text-anchor', 'middle');

    // Y Axis
    svg.append('g')
        .call(d3.axisLeft(y).ticks(8))
        .selectAll('text')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#2c3e50');

    // Axis labels
    svg.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 50)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .attr('fill', '#2c3e50')
        .text('Age Group');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -80)
        .attr('x', -innerHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .attr('fill', '#2c3e50')
        .text('Number of Positive Tests');

    // Bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.ageGroup))
        .attr('width', x.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('fill', d => colorScale(d.ageGroup))
        .attr('rx', 4)
        .on('mouseover', (event, d) => {
            const total = d3.sum(data, d => d.count);
            const percentage = ((d.count / total) * 100).toFixed(1);
            tooltip.style('opacity', 1)
                .html(`<strong>${d.ageGroup}</strong><br/>Positive Tests: ${d.count.toLocaleString()}<br/>Percentage: ${percentage}%`);
        })
        .on('mousemove', event => {
            tooltip.style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 15) + 'px');
        })
        .on('mouseout', () => tooltip.style('opacity', 0))
        .transition()
        .duration(CONFIG.animationDuration)
        .delay((d, i) => i * CONFIG.animationDelay)
        .attr('y', d => y(d.count))
        .attr('height', d => innerHeight - y(d.count));

    // Value labels
    svg.selectAll('.label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.ageGroup) + x.bandwidth() / 2)
        .attr('y', innerHeight)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .style('fill', '#2d3748')
        .style('opacity', 0)
        .text(d => d.count.toLocaleString())
        .transition()
        .duration(CONFIG.animationDuration)
        .delay((d, i) => i * CONFIG.animationDelay)
        .attr('y', d => y(d.count) - 8)
        .style('opacity', 1);

    // Stats
    const total = d3.sum(data, d => d.count);
    const highestGroup = data.reduce((max, d) => d.count > max.count ? d : max, data[0]);
    const avgCount = (total / data.length).toFixed(0);
    const youngDrivers = data.filter(d => d.ageGroup === '0-16' || d.ageGroup === '17-25')
        .reduce((sum, d) => sum + d.count, 0);
    const youngPercentage = ((youngDrivers / total) * 100).toFixed(1);

    const stats = [
        { label: 'Total Positive Tests', value: total.toLocaleString() },
        { label: 'Highest Risk Group', value: highestGroup.ageGroup },
        { label: 'Young Drivers (0-25)', value: `${youngPercentage}%` },
        { label: 'Average per Group', value: avgCount }
    ];

    d3.select('#stats')
        .selectAll('.stat-card')
        .data(stats)
        .enter()
        .append('div')
        .attr('class', 'stat-card')
        .style('opacity', 0)
        .html(d => `<div class="stat-label">${d.label}</div><div class="stat-value">${d.value}</div>`)
        .transition()
        .duration(600)
        .delay((d, i) => 1000 + i * 100)
        .style('opacity', 1);
}
