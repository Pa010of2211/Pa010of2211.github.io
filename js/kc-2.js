// Dimensions and margins
var kc2width = 600;
var kc2height = 500;
var kc2margin = { top: 20, right: 20, bottom: 20, left: 20 };

// Grid properties
var kc2rows = 6;
var kc2cols = 5;
var kc2cellWidth = (kc2width - kc2margin.left - kc2margin.right) / kc2cols;
var kc2cellHeight = (kc2height - kc2margin.top - kc2margin.bottom) / kc2rows;

// Create SVG canvas
var kc2svg = d3.select("#p3");

// Load CSV data
d3.csv("data/team_pitching.csv").then(data => {
    data.forEach(d => {
        d.W = +d.W; 
    });

    var maxWins = d3.max(data, d => d.W);
    var radiusScale = d3.scaleSqrt()
        .domain([0, maxWins])
        .range([5, cellWidth / 20]); 
        var maxHR = d3.max(data, d => d.HR);
        var minHR = d3.min(data, d => d.HR);
        var colorScale = d3.scaleLinear()
        .domain([minHR, maxHR]) 
        .range(["yellow", "red"]); 


    kc2svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => kc2margin.left + (i % kc2cols) * kc2cellWidth + kc2cellWidth / 2)
    .attr("cy", (d, i) => kc2margin.top + Math.floor(i / kc2cols) * kc2cellHeight + kc2cellHeight / 2)
    .attr("r", d => radiusScale(d.W))
    .attr("fill", d => colorScale(d.HR)) 
    .attr("stroke", "black")
    .attr("stroke-width", 1);


    kc2svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", (d, i) => kc2margin.left + (i % kc2cols) * kc2cellWidth + kc2cellWidth / 2)
        .attr("y", (d, i) => kc2margin.top + Math.floor(i / kc2cols) * kc2cellHeight + kc2cellHeight / 2 + 4)
        .attr("text-anchor", "middle")
        .text(d => d.Team)
        .style("font-size", "10px")
        .style("fill", "black");
});
