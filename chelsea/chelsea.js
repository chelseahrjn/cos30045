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

        function updateScatter(selectedYear) {
            // Filter data based on year
            var filtered = data.filter(d => d.year === selectedYear);

            // Convert the format
            var dataset = [];

            filtered.forEach(d => {
                dataset.push({
                    country: d.country,
                    pharma: d.type === "PHARMA" ? d.value : null,
                    deaths: d.type === "DEATH" ? d.value : null,
                    year: d.year
                });
            });

            // Combine data points of each country into a single object
            var scatterData = dataset.reduce((acc, curr) => {
                var item = acc.find(d => d.country === curr.country);

                if (item) {
                    item.pharma = curr.pharma || item.pharma;
                    item.deaths = curr.deaths || item.deaths;
                }
                else {
                    acc.push(curr);
                }
                return acc;
            }, []);

            console.log(scatterData);


            // Update scatter plot with transitions
            var svg = d3.select("#chelseaChart svg");
            
            // Check if svg exists
            if (svg.empty()) {
                scatterChelsea(dataset, "#chelseaChart");
            }
            else {
                // Update scales of new data
                var maxPharma = d3.max(scatterData, d => (d.pharma !== null) ? d.pharma : 0);
                var maxDeaths = d3.max(scatterData, d => (d.deaths !== null) ? d.deaths : 0);
    
                var xScale = d3.scaleLinear()
                    .domain([0, maxPharma])
                    .range([padding, w - padding]);
    
                var yScale = d3.scaleLinear()
                    .domain([0, maxDeaths])
                    .range([h - padding, padding]);
    
                var xAxis = d3.axisBottom(xScale);
                var yAxis = d3.axisLeft(yScale);
    
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
                    .attr("r", 5)
                    .attr("fill", "steelblue")
                    .style("opacity", 0.8);
    
                // Enter the new circles
                circles.enter()
                    .append("circle")
                    .attr("cx", d => xScale(d.pharma))
                    .attr("cy", d => yScale(d.deaths))
                    .attr("r", 5)
                    .attr("fill", "steelblue")
                    .style("opacity", 0.8)
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)
                    .transition()
                    .duration(500);
                
                // Remove the old circles
                circles.exit()
                    .transition()
                    .duration(500)
                    .attr("r", 0)
                    .remove();
            }


            // // ????
            // // Clear the previous scatter
            // d3.select("#chelseaChart").html("");

            // console.log(dataset);
            // scatterChelsea(dataset, "#chelseaChart");
        }
    })
        .catch(function (error) { // Display error message if any
            console.log("Error loading data: " + error);
        });

    function scatterChelsea(data, chartId) {

        var svg = d3.select(chartId)
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        // Check for valid data before setting scale domains
        var maxPharma = d3.max(data, d => (d.pharma !== null) ? d.pharma : 0);
        var maxDeaths = d3.max(data, d => (d.deaths !== null) ? d.deaths : 0);

        var xScale = d3.scaleLinear()
            .domain([0, maxPharma])
            .range([padding, w - padding]);

        var yScale = d3.scaleLinear()
            .domain([0, maxDeaths])
            .range([h - padding, padding]);

        // var xScale = d3.scaleLinear()
        //     .domain([0, d3.max(data, d => d.pharma)])
        //     .range([padding, w - padding]);

        // var yScale = d3.scaleLinear()
        //     .domain([0, d3.max(data, d => d.deaths)])
        //     .range([h - padding, padding]);

        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

        var tooltip = d3.select(chartId)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("background-color", "#212121")
            .style("color", "#fff")
            .style("border-radius", "5px")
            .style("padding", "7px")
            .style("position", "absolute")
            .style("font-size", "10px");

        var mouseover = function (d) {
            tooltip.style("opacity", 1);
            d3.select(this)
                .style("stroke", "#212121")
                .style("opacity", 1)
        }

        var mousemove = function (event, d) {
            tooltip.html(`${d.country} (${d.year}): <br> >> ${d.pharma} DDD per 1000 Inhabitants per Day <br> >> ${d.deaths} deaths per 1000 deaths`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        }

        var mouseleave = function (d) {
            tooltip.style("opacity", 0);
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8);
        }

        svg.append("g")
            .attr("transform", `translate(0, ${h - padding})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${padding}, 0)`)
            .call(yAxis);

        // Add scatter points
        svg.selectAll("circle")
            .data(data.filter(d => d.pharma !== null && d.deaths !== null)) // Filter out null values
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.pharma))
            .attr("cy", d => yScale(d.deaths))
            .attr("r", 5)
            .attr("fill", "steelblue")
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
    }
}

window.onload = init;