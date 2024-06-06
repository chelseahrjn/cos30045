// Set up the SVG container
function init() {
    var h = 600,
        w = 1000;
    var xPadding = 150,
        yPadding = 50;

    var svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    // Load the CSV data
    d3.csv("check.csv").then(function (data) {
        // Log data to ensure it is loaded correctly
        //console.log(data);

        // Process the data
        data.forEach(d => {
            d.country = d.Country;
            d["2010"] = +d["2010"];
            d["2011"] = +d["2011"];
            d["2012"] = +d["2012"];
            d["2013"] = +d["2013"];
            d["2014"] = +d["2014"];
            d["2015"] = +d["2015"];
            d["2016"] = +d["2016"];
            d["2017"] = +d["2017"];
            d["2018"] = +d["2018"];
            d["2019"] = +d["2019"];
            d["2020"] = +d["2020"];
            d["2021"] = +d["2021"];
            d["2022"] = +d["2022"];
        });

        // Define the stack function
        var stack = d3.stack().keys([
            "2010",
            "2011",
            "2012",
            "2013",
            "2014",
            "2015",
            "2016",
            "2017",
            "2018",
            "2019",
            "2020",
            "2021",
            "2022",
        ]);

        // Stack the data
        var stackedData = stack(data);

        // Set up the scales
        var xScale = d3
            .scaleBand()
            .domain(data.map(d => d.country))
            .range([xPadding, w - xPadding])
            .padding(0.4);  // Increase padding to make columns wider

        var yScale = d3
            .scaleLinear()
            .domain([
                0,
                d3.max(stackedData, d => d3.max(d, d => d[1])),
            ])
            .range([h - yPadding, yPadding]);

        // setting up axes
        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

        // Set up the colors
        var colorScale = d3
            .scaleOrdinal()
            .domain([
                "2010",
                "2011",
                "2012",
                "2013",
                "2014",
                "2015",
                "2016",
                "2017",
                "2018",
                "2019",
                "2020",
                "2021",
                "2022",
            ])
            .range(d3.schemeCategory10);

        // Create the legend
        var legend = d3.select("#legend");

        var years = [
            "2010",
            "2011",
            "2012",
            "2013",
            "2014",
            "2015",
            "2016",
            "2017",
            "2018",
            "2019",
            "2020",
            "2021",
            "2022",
        ];

        var legendItems = legend
            .selectAll(".legend-item")
            .data(years)
            .enter()
            .append("div")
            .attr("class", "legend-item");

        legendItems
            .append("div")
            .attr("class", "legend-color")
            .style("background-color", d => colorScale(d));

        legendItems
            .append("div")
            .attr("class", "legend-label")
            .text(d => d);

        // Create the stacked bars
        svg
            .selectAll("g")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("fill", d => colorScale(d.key))
            .selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", d => {
                if (!d.data || !d.data.country) {
                    console.error('Data point missing country:', d);
                    return 0; // Handle the error appropriately
                }
                return xScale(d.data.country);
            })
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .style("opacity", 0) // Set initial opacity to 0
            // Add transitions
            .on("mouseover", function (event, d) {
                // Show tooltip
                d3.select("#tooltip")
                    .style("display", "block")
                    .style("opacity", "1")
                    .style("left", event.pageX + 40 + "px")
                    .style("top", event.pageY - 20 + "px")
                    .select("#value")
                    .html(
                        '<p id="year">' +
                        d.data.country +
                        '</p><br><p><span id="property">' +
                        d3.select(this.parentNode).datum().key +
                        '</span>, <span id="variable">' +
                        (d[1] - d[0]).toLocaleString() +
                        "</span></p>"
                    )
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mouseleave", function (event, d) {
                // Hide tooltip
                d3.select("#tooltip").style("opacity", 0);
            })
            .transition()
            .duration(1000) // Set the duration of the transition in milliseconds
            .style("opacity", 1); // Transition to full opacity

        // Add axes
        svg
            .append("g")
            .attr("transform", "translate(0," + (h - yPadding) + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .attr("fill", "blue")
            .attr("font-weight", "bold")
            .attr("font-size", "10px");  // Adjust font size if necessary

        svg
            .append("g")
            .attr("transform", "translate(" + xPadding + ", 0)")
            .call(yAxis)
            .attr("fill", "red")
            .selectAll("text")
            .attr("transform", "translate(" + (xPadding - 155) + ", 0)")
            .attr("fill", "blue")
            .attr("font-weight", "bold")
            .attr("font-size", "20px");
    }).catch(function (error) {
        console.error('Error loading or processing data:', error);
    });
}

window.onload = init;
