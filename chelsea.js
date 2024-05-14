function init() {
    var w = 600;
    var h = 400;
    var padding = 50;

    // Hard coded
    const dataset = [
        {
            Australia: {
                pharma: 57.8, deaths: 3946
            }
        },
        {
            Austria: {
                pharma: 45.4, deaths: 3011
            }
        },
        {
            Belgium: {
                pharma: 60.5, deaths: 1623
            }
        },
        {
            Canada: {
                pharma: 75.8, deaths: 6942
            }
        },
        {
            Chile: {
                pharma: 61.1, deaths: 3684
            }
        },
        {
            Colombia: {
                pharma: 48, deaths: 6859
            }
        },
        {
            "Costa Rica": {
                pharma: 0, deaths: 769
            }
        }
        // ...
    ];

    scatterChelsea(dataset, "#chelseaChart")

    function scatterChelsea(data, chartId) {
        
        const svg = d3.select(chartId)
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        // Extracting the country names and their corresponding data
        const country = data.map(obj => Object.keys(obj)[0]);
        const countryData = data.map(obj => Object.values(obj)[0]);

        // Extracting pharma and deaths data
        const pharmaData = countryData.map(country => country.pharma);
        const deathsData = countryData.map(country => country.deaths);

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(pharmaData)])
            .range([padding, w - padding]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(deathsData)])
            .range([h - padding, padding]);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("transform", `translate(0, ${h - padding})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${padding}, 0)`)
            .call(yAxis);

        svg.selectAll("circle")
            .data(countryData)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.pharma))
            .attr("cy", d => yScale(d.deaths))
            .attr("r", 5)
            .attr("fill", "steelblue")
            .append("title")
            .text((d, i) => country[i]);
    }

}

window.onload = init;