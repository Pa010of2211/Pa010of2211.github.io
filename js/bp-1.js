
var bp1width = 800;
var bp1height = 400;
var bp1margin = { top: 20, right: 30, bottom: 50, left: 50 };

var bp1svg = d3.select("#p4");

d3.csv("data/player_pitchers_top_200_SOs.csv").then(data => {
    data.forEach(d => {
        d.ERA = +d.ERA; 
    });

    var top20 = data.sort((a, b) => a.ERA - b.ERA).slice(0, 20);

    console.log(top20);
    var teamCounts = d3.rollups(
        top20,
        v => v.length,
        d => d.Team 
    );

    teamCounts.sort((a, b) => d3.ascending(a[0], b[0]));

    var xScale = d3.scaleBand()
        .domain(teamCounts.map(d => d[0])) 
        .range([bp1margin.left, bp1width - bp1margin.right])
        .padding(0.2);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(teamCounts, d => d[1])]) 
        .range([bp1height - bp1margin.bottom, bp1margin.top]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale).ticks(5);

    bp1svg.append("g")
        .attr("transform", `translate(0,${bp1height - bp1margin.bottom})`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    bp1svg.append("g")
        .attr("transform", `translate(${bp1margin.left},0)`)
        .call(yAxis);

    bp1svg.selectAll("rect")
        .data(teamCounts)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => bp1height - bp1margin.bottom - yScale(d[1]))
        .attr("fill", d => {
            if (d[0] === "ARI" || d[0] === "TEX") {
                return "red"
            } else {
                return "steelblue"
            }
        });

    bp1svg.selectAll(".label")
        .data(teamCounts)
        .enter()
        .append("text")
        .attr("x", d => xScale(d[0]) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d[1]) - 5)
        .attr("text-anchor", "middle")
        .text(d => d[1])
        .style("font-size", "12px")
        .style("fill", "black");
});
