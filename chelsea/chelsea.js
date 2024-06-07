function init() {
    var w = 600;
    var h = 400;
    var padding = 50;

    d3.csv("chelsea_reformatted.csv").then(function (data) {
        // Parse the data, convert to number
        data.forEach(d => {
            d.value = +d.value;
            d.year = +d.year;
        });

        // Get unique years for the dropdown
        var years = [...new Set(data.map(d => d.year))];

        var select = d3.select("#yearSelector");
        // Populate the dropdown list
        select.selectAll("option")
            .data(years)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d);

        // Initial year to draw scatter
        var initYear = years[0];
        updateScatter(initYear);

        // Event listener to update scatter on selected year
        select.on("change", function () {
            var selectedYear = +this.value;
            updateScatter(selectedYear);
        });

        // Event handlers for tooltip and mouse events
        var tooltip = d3.select("#chelseaChart")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("background-color", "#212121")
            .style("color", "#fff")
            .style("border-radius", "5px")
            .style("padding", "7px")
            .style("position", "absolute")
            .style("font-size", "10px");

        function mouseover(event, d) {
            tooltip.style("opacity", 1);
            d3.select(this)
                .style("stroke", "yellow")
                .style("opacity", 1);
        }

        function mousemove(event, d) {
            tooltip.html(`${d.country} (${d.year}): <br> >> ${d.pharma} DDD per 1000 Inhabitants per Day <br> >> ${d.deaths} deaths per 1000 deaths`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        }

        function mouseleave(event, d) {
            tooltip.style("opacity", 0);
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8);
        }

        function updateScatter(selectedYear) {
            // Filter data based on year
            var filtered = data.filter(d => d.year === selectedYear);

            // Convert the format
            var dataset = filtered.map(d => ({
                country: d.country,
                pharma: d.type === "PHARMA" ? d.value : null,
                deaths: d.type === "DEATH" ? d.value : null,
                year: d.year
            }));

            // Combine data points of each country into a single object
            var scatterData = dataset.reduce((acc, curr) => {
                var item = acc.find(d => d.country === curr.country);

                if (item) {
                    item.pharma = curr.pharma || item.pharma;
                    item.deaths = curr.deaths || item.deaths;
                } else {
                    acc.push(curr);
                }
                return acc;
            }, []);

            // Filter out data points with null values for pharma or deaths
            scatterData = scatterData.filter(d => d.pharma !== null && d.deaths !== null);

            // Update scatter plot with transitions
            var svg = d3.select("#chelseaChart svg");

            // Check if svg exists
            if (!svg.empty()) {
                // Update scales of new data
                var maxPharma = d3.max(scatterData, d => d.pharma);
                var maxDeaths = d3.max(scatterData, d => d.deaths);

                var xScale = d3.scaleLinear()
                    .domain([0, maxPharma])
                    .range([padding, w - padding]);

                var yScale = d3.scaleLinear()
                    .domain([0, maxDeaths])
                    .range([h - padding, padding]);

                var xAxis = d3.axisBottom(xScale)
                    .tickSize(-h + 2 * padding);
                var yAxis = d3.axisLeft(yScale)
                    .tickSize(-w + 2 * padding);

                // Update x-axis and y-axis marks
                svg.select(".x-axis")
                    .transition()
                    .duration(500)
                    .call(xAxis);

                svg.select(".y-axis")
                    .transition()
                    .duration(500)
                    .call(yAxis);

                // Bind the new data
                var circles = svg.selectAll("circle")
                    .data(scatterData, d => d.country);

                // Update the existing circles
                circles.transition()
                    .duration(500)
                    .attr("cx", d => xScale(d.pharma))
                    .attr("cy", d => yScale(d.deaths))
                    .attr("r", 5);

                // Enter the new circles
                circles.enter()
                    .append("circle")
                    .attr("cx", d => xScale(d.pharma))
                    .attr("cy", d => yScale(d.deaths))
                    .attr("r", 0)
                    .style("opacity", 0.8)
                    .attr("fill", function (d) {
                        return "rgb(0, 0, " + Math.round(d.deaths / d.pharma) + ")"
                    })
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)
                    .transition()
                    .duration(500)
                    .attr("r", 5); // Transition to expand circle

                // Remove the old circles
                circles.exit()
                    .transition()
                    .duration(500)
                    .attr("r", 0)
                    .remove();

                svg.call(zoomInstance);
            }
            else {

                scatterChelsea(scatterData, "#chelseaChart");
            }
        }

        var zoomInstance;

        function scatterChelsea(data, chartId) {
            var svg = d3.select(chartId)
                .append("svg")
                .attr("width", w)
                .attr("height", h);

            // Check for valid data before setting scale domains
            var maxPharma = d3.max(data, d => d.pharma);
            var maxDeaths = d3.max(data, d => d.deaths);

            var xScale = d3.scaleLinear()
                .domain([0, maxPharma])
                .range([padding, w - padding]);

            var yScale = d3.scaleLinear()
                .domain([0, maxDeaths])
                .range([h - padding, padding]);

            var xAxis = d3.axisBottom(xScale)
                .tickSize(-h + 2 * padding);
            var yAxis = d3.axisLeft(yScale)
                .tickSize(-w + 2 * padding);

            // Append x and y axes
            var gX = svg.append("g")
                .attr("transform", `translate(0, ${h - padding})`)
                .attr("class", "x-axis")
                .call(xAxis);

            var gY = svg.append("g")
                .attr("transform", `translate(${padding}, 0)`)
                .attr("class", "y-axis")
                .call(yAxis);

            // Add scatter points
            svg.selectAll("circle")
                .data(data.filter(d => d.pharma !== null && d.deaths !== null)) // Filter out null values
                .enter()
                .append("circle")
                .attr("cx", d => xScale(d.pharma))
                .attr("cy", d => yScale(d.deaths))
                .attr("r", 5)
                .attr("fill", function (d) {
                    return "rgb(0, 0, " + Math.round(d.deaths / d.pharma) * 100 + ")"
                })
                .style("opacity", 0.8)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave);

            // X axis label
            svg.append("text")
                .attr("class", "x-axis-label")  // Class for styling
                .attr("x", w / 2)  // Center the label
                .attr("y", h - padding + 30)  // Position below the axis
                .attr("text-anchor", "middle")
                .text("Drugs Consumption in Defined Daily Dosage (DDD) per 1000 Inhabitants per Day");

            // Y axis label
            svg.append("text")
                .attr("class", "y-axis-label")  // Class for styling
                .attr("x", padding)
                .attr("y", padding - 10)  // Position to left of the axis
                .attr("text-anchor", "middle")
                .text("Number of Deaths");

            // Zoom feature
            zoomInstance = d3.zoom()
                .scaleExtent([0.5, 4])
                .on("zoom", function (event) {
                    var transform = event.transform;

                    // Apply zoom to circles
                    svg.selectAll("circle")
                        .attr("cx", d => transform.rescaleX(xScale)(d.pharma))
                        .attr("cy", d => transform.rescaleY(yScale)(d.deaths));

                    // Update axes
                    gX.call(xAxis.scale(transform.rescaleX(xScale)));
                    gY.call(yAxis.scale(transform.rescaleY(yScale)));
                });

            svg.call(zoomInstance);

            d3.select(".reset")
                .on("click", function () {
                    zoomInstance.transform(svg, d3.zoomIdentity);
                });
        }

    }).catch(function (error) {
        console.log("Error loading data: " + error);
    });

}

window.onload = init;
