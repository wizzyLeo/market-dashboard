import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function generateSimulatedDataForCompany(startDate, numDays, startingPrice) {
    let currentDate = new Date(startDate);
    const timestamps = [];
    const prices = [];
    const volumes = [];
    let currentPrice = startingPrice;

    for (let i = 0; i < numDays; i++) {
        timestamps.push(currentDate.getTime() / 1000);
        currentPrice += currentPrice * (Math.random() - 0.5) * 0.02;
        prices.push(currentPrice);
        volumes.push(Math.floor(Math.random() * (1000000 - 500000) + 500000));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate a random capital for the company between 10 billion and 100 billion
    const capital = Math.floor(Math.random() * (100e9 - 10e9) + 10e9);

    return {
        timestamps: timestamps,
        prices: prices,
        volumes: volumes,
        capital: capital
    };
}

const companies = [
    { name: "TechCorp", data: generateSimulatedDataForCompany("2023-10-17", 5, 150) },
    { name: "EcoVentures", data: generateSimulatedDataForCompany("2023-10-17", 5, 80) },
    { name: "HealthWave", data: generateSimulatedDataForCompany("2023-10-17", 5, 120) },
    { name: "MegaMinds", data: generateSimulatedDataForCompany("2023-10-17", 5, 90) },
    { name: "SpaceRise", data: generateSimulatedDataForCompany("2023-10-17", 5, 200) }
];

// Calculate the fictional index using weighted average based on company capital
function calculateIndex(companies) {
    const totalCapital = companies.reduce((sum, company) => sum + company.data.capital, 0);
    const indexValues = [];

    for (let i = 0; i < companies[0].data.prices.length; i++) {
        let weightedSum = 0;
        for (const company of companies) {
            const weight = company.data.capital / totalCapital;
            weightedSum += company.data.prices[i] * weight;
        }
        indexValues.push(weightedSum);
    }

    return {
        name: "FictionalStockIndex",
        values: indexValues
    };
}

const fictionalIndex = calculateIndex(companies);


// Now, let's create functions to determine the market trend, leading company, etc.

function getMarketTrend(index) {
    const latestValue = index.values[index.values.length - 1];
    const previousValue = index.values[index.values.length - 2];
    return latestValue >= previousValue ? 'Bullish' : 'Bearish';
}

function getLeadingCompany(companies) {
    const latestGrowthRates = companies.map(company => {
        const latestPrice = company.data.prices[company.data.prices.length - 1];
        const previousPrice = company.data.prices[company.data.prices.length - 2];
        return ((latestPrice - previousPrice) / previousPrice) * 100;
    });

    const maxGrowthRate = Math.max(...latestGrowthRates);
    const leadingCompany = companies[latestGrowthRates.indexOf(maxGrowthRate)];

    return {
        company: leadingCompany,
        growthRate: maxGrowthRate
    };
}

function getTopAndWorstStocks(companies) {
    const latestGrowthRates = companies.map(company => {
        const latestPrice = company.data.prices[company.data.prices.length - 1];
        const previousPrice = company.data.prices[company.data.prices.length - 2];
        return ((latestPrice - previousPrice) / previousPrice) * 100;
    });

    const maxGrowthRate = Math.max(...latestGrowthRates);
    const topStock = companies[latestGrowthRates.indexOf(maxGrowthRate)];

    const minGrowthRate = Math.min(...latestGrowthRates);
    const worstStock = companies[latestGrowthRates.indexOf(minGrowthRate)];

    return {
        topStock: {
            company: topStock,
            growthRate: maxGrowthRate
        },
        worstStock: {
            company: worstStock,
            growthRate: minGrowthRate
        }
    };
}

// Dummy function for the sake of this simulation since we don't have sectors
// It simply returns the company with the highest and lowest simulated capital
function getHottestAndWorstSectors(companies) {
    const sortedCompanies = [...companies].sort((a, b) => b.data.capital - a.data.capital);
    return {
        hottest: sortedCompanies[0],
        worst: sortedCompanies[sortedCompanies.length - 1]
    };
}

// This will go inside your main.js file

document.addEventListener("DOMContentLoaded", function() {
    const marketTrend = getMarketTrend(fictionalIndex);
    document.querySelector(".indicator-container--main").textContent = marketTrend;
    if (marketTrend === 'Bullish') {
        document.querySelector(".indicator-container--trend-up").style.display = 'block';
    } else {
        document.querySelector(".indicator-container--trend-down").style.display = 'block';
    }

    const leadingCompanyData = getLeadingCompany(companies);
    document.querySelector(".indicator-container--main").textContent = leadingCompanyData.company.name;
    document.querySelector(".indicator-container--trend-up").textContent = leadingCompanyData.growthRate.toFixed(2) + "%";

    const topAndWorst = getTopAndWorstStocks(companies);
    document.querySelector(".indicator-container--main").textContent = topAndWorst.topStock.company.name;
    document.querySelector(".indicator-container--trend-up").textContent = topAndWorst.topStock.growthRate.toFixed(2) + "%";
    document.querySelector(".indicator-container--main").textContent = topAndWorst.worstStock.company.name;
    document.querySelector(".indicator-container--trend-down").textContent = topAndWorst.worstStock.growthRate.toFixed(2) + "%";

    const hottestAndWorstSectors = getHottestAndWorstSectors(companies);
    document.querySelector(".indicator-container--main").textContent = hottestAndWorstSectors.hottest.name;
    document.querySelector(".indicator-container--main").textContent = hottestAndWorstSectors.worst.name;
});

function createLineChart() {
    // Assuming the fictionalIndex variable is available
    const data = fictionalIndex.values;

    // Select the SVG container
    const svg = d3.select("#indexChart");

    // Determine dynamic width and height based on the parent container
    const container = d3.select("#index-chart-wrapper");
    const width = container.node().getBoundingClientRect().width;
    const height = 400; // You can adjust this or make it dynamic based on the container as well

    // Update SVG size
    svg.attr('width', width).attr('height', height);

    // Clear any existing content in the SVG
    svg.selectAll("*").remove();

    // Set up the scales and axes
    const xScale = d3.scaleUtc()
        .domain(d3.extent(companies[0].data.timestamps, d => new Date(d * 1000)))
        .range([50, width-50]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data) * 0.95, d3.max(data) * 1.05])  // A bit of padding
        .range([height-50, 50]);

    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.utcFormat("%Y-%m-%d"));
    const yAxis = d3.axisLeft(yScale);

    // Append axes to the SVG
    svg.append("g")
        .attr("transform", `translate(0, ${height - 50})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(50, 0)")
        .call(yAxis);

    // Create the line generator function
    const line = d3.line()
        .x((d, i) => 20+xScale(new Date(companies[0].data.timestamps[i] * 1000)))
        .y(d => yScale(d));

    // Append the line to the SVG
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#940B92")
        .attr("stroke-width", 1.5)
        .style('font-size', '0.5rem')
        .attr("d", line);
}


// Call the function to render the chart
createLineChart();

function createBarChart() {
    // Calculate price change for each company
    const priceChanges = companies.map(company => {
        const startPrice = company.data.prices[0];
        const endPrice = company.data.prices[company.data.prices.length - 1];
        const change = ((endPrice - startPrice) / startPrice) * 100;  // percentage change
        return {
            name: company.name,
            change: change
        };
    });

    // Sort by change (from high to low)
    priceChanges.sort((a, b) => b.change - a.change);

    // Select the SVG container
    const svg = d3.select("#companyChart");

    const container = d3.select("#company-bar-chart-wrapper");
    const width = container.node().getBoundingClientRect().width;
    const height = 400;

    // Update SVG size
    svg.attr('width', width).attr('height', height);

    const xScale = d3.scaleLinear()
        .domain([d3.min(priceChanges, d => d.change), d3.max(priceChanges, d => d.change)])
        .range([100, width - 50]);

    const yScale = d3.scaleBand()
        .domain(priceChanges.map(d => d.name))
        .range([height - 50, 50])
        .padding(0.4);

    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d => d + "%");
    const yAxis = d3.axisLeft(yScale);

    // Append axes to the SVG
    svg.append("g")
        .attr("transform", `translate(0, ${height - 50})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(100, 0)")
        .call(yAxis);

    // Append bars to the SVG
    svg.selectAll(".bar")
        .data(priceChanges)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(Math.min(0, d.change)))
        .attr("y", d => yScale(d.name))
        .attr("width", d => Math.abs(xScale(d.change) - xScale(0)))
        .attr("height", yScale.bandwidth())
        .attr("fill", d => d.change > 0 ? "#2ECC71" : "#E74C3C")  // Green for positive, Red for negative
        .on("mouseover", function(event, d) {
            showTooltip(d);
        })
        .on("mousemove", function(event) {
            moveTooltip(event);
        })
        .on("mouseout", hideTooltip);
}

function showTooltip(data) {
    const tooltip = d3.select("#tooltip");
    tooltip.style("display", "block");

    // Find the corresponding company data
    const companyData = companies.find(company => company.name === data.name).data;

    // Calculate the last day's change
    const lastDayChange = ((companyData.prices[companyData.prices.length - 1] - companyData.prices[0]) / companyData.prices[0]) * 100;

    // Create a mini line chart for the company's stock price changes throughout the week
    const miniXScale = d3.scaleLinear()
        .domain([0, companyData.prices.length - 1])
        .range([0, 250]);

    const miniYScale = d3.scaleLinear()
        .domain([Math.min(...companyData.prices), Math.max(...companyData.prices)])
        .range([100, 0]);

    const line = d3.line()
        .x((d, i) => miniXScale(i))
        .y(d => miniYScale(d));

    // Clear the tooltip
    tooltip.html("");

    // Append the last day's change and the title
    tooltip.append("div")
        .text(`Change: ${lastDayChange.toFixed(2)}%`)
        .attr("class", "tooltip-title");

    tooltip.append("div")
        .text("Trend for the past week")
        .attr("class", "tooltip-subtitle");

    // Append the mini line chart
    tooltip.append("svg")
        .attr("width", 160)
        .attr("height", 110)
        .append("path")
        .datum(companyData.prices)
        .attr("fill", "none")
        .attr("stroke", "#E95793")
        .attr("d", line);
}

function moveTooltip(event) {
    const tooltip = d3.select("#tooltip");
    tooltip.style("left", (event.clientX) + "px")
        .style("top", (event.clientY - tooltip.node().getBoundingClientRect().height - 10) + "px").style('transform', 'translate(-50%, -50%)');
}

function hideTooltip() {
    const tooltip = d3.select("#tooltip");
    tooltip.style("display", "none");
}

createBarChart();

function createHeatMap() {
    // Select the SVG container
    const svg = d3.select("#heatmapSVG");

    const container = d3.select("#heatmap-wrapper");
    const width = container.node().getBoundingClientRect().width;
    const height = companies.length * 100; // Assuming each company takes up 40 pixels vertically

    // Update SVG size
    svg.attr('width', width).attr('height', height);

    const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateBlues)
        .domain([0, d3.max(companies, company => d3.max(company.data.volumes))]);

    const xScale = d3.scaleBand()
        .domain(companies[0].data.timestamps.map(d => new Date(d * 1000)))
        .range([100, width - 50]);

    const yScale = d3.scaleBand()
        .domain(companies.map(d => d.name))
        .range([0, height - 50])
        .padding(0.2);

    svg.selectAll("rect")
        .data(companies.flatMap(company => company.data.volumes.map((volume, i) => ({
            name: company.name,
            volume: volume,
            date: company.data.timestamps[i]
        }))))
        .enter()
        .append("rect")
        .attr("x", d => xScale(new Date(d.date * 1000)))
        .attr("y", d => yScale(d.name))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.volume))
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);

    // Append axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.utcFormat("%Y-%m-%d"));
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0, ${height - 50})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(100, 0)")
        .call(yAxis);
}

createHeatMap();


