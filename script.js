// Load the data from data.json
d3.json('data.json').then(data => {
    // Process the data to group by race and aggregate points
    const groupedData = d3.groups(data, d => d.race_name)
        .map(([race_name, entries]) => {
            return {
                race_name: race_name,
                max_points: entries.find(d => d.driver === 'Max Verstappen').points,
                lewis_points: entries.find(d => d.driver === 'Lewis Hamilton').points
            };
        });

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#bar-chart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand()
        .domain(groupedData.map(d => d.race_name))
        .range([0, width])
        .paddingInner(0.1);

    const x1 = d3.scaleBand()
        .domain(['Max Verstappen', 'Lewis Hamilton'])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => Math.max(d.max_points, d.lewis_points))])
        .nice()
        .range([height, 0]);

    svg.append('g')
        .selectAll('g')
        .data(groupedData)
        .enter().append('g')
        .attr('transform', d => `translate(${x0(d.race_name)},0)`)
        .selectAll('rect')
        .data(d => [
            { points: d.max_points, driver: 'Max Verstappen' },
            { points: d.lewis_points, driver: 'Lewis Hamilton' }
        ])
        .enter().append('rect')
        .attr('x', d => x1(d.driver))
        .attr('y', d => y(d.points))
        .attr('width', x1.bandwidth())
        .attr('height', d => height - y(d.points))
        .attr('fill', (d, i) => i === 0 ? 'blue' : 'red');

    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x0));

    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y));
}).catch(error => {
    console.error('Error loading data:', error);
});
