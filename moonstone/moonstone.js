function init() {
    var w = 600;
    var h = 400;
    var padding = 50;

    // Load the CSV data
    d3.csv('check1.csv').then(data => {
        // Convert data to the required format
        data.forEach(d => {
            d.Year = +d.Year;
            d.Value = +d.Value;
        });

        // Group data by country
        const groupedData = d3.group(data, d => d.Country);

        // Create a chart for each country
        groupedData.forEach((values, country) => {
            scatterMoons(values, country, "#moonschart");
        });
    });

    function scatterMoons(data, country, chartId) {
        const svg = d3.select(chartId)
            .append("svg")
            .attr("width", w)
            .attr("height", h + padding) // Adjust height to leave space for the country name
            .attr("class", "chart");

        // Set the scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.Year))
            .range([padding, w - padding]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.Value))
            .range([h - padding, padding]);

        const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")); // Format ticks as integers
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("transform", `translate(0, ${h - padding})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${padding}, 0)`)
            .call(yAxis);

        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.Year))
            .attr("cy", d => yScale(d.Value))
            .attr("r", 5)
            .attr("fill", "purple")
            .append("title")
            .text(d => `Year: ${d.Year}, Value: ${d.Value}`);

        // Add country name below the chart
        svg.append("text")
            .attr("x", w / 2)
            .attr("y", h + padding - 10) // Adjusted position to be below the chart
            .attr("text-anchor", "middle")
            .text(country);
    }
}

window.onload = init;
