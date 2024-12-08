var bp4 = d3.select("#p3a");
var bp4width = 500;
var bp4height = 500;
var bp4margin = { top: 20, right: 20, bottom: 40, left: 60 };



d3.csv("data/texas_rangers_batting.csv").then(data => {
	data.forEach(d => {
		d.rank = +d.rank;
		d.BA = +d.BA;
	});

	const bp4xScale = d3.scaleLinear()
		.domain([0, d3.max(data, d => d.rank)])
		.range([bp4margin.left, bp4width - bp4margin.right]);
	const bp4yScale = d3.scaleLinear()
		.domain([.230, d3.max(data, d => d.BA)])
		.range([bp4height - bp4margin.bottom, bp4margin.top]);

	bp4.append("g")
		.attr("transform", `translate(0, ${bp4height - bp4margin.bottom})`)
		.call(d3.axisBottom(bp4xScale));
	bp4.append("text")
		.attr("x", bp4width / 2)
		.attr("y", bp4height - 10)
		.attr("text-anchor", "middle")
		.attr("font-size", "10px")
		.attr("fill", "black")
		.text("Top 12 Texas Rangers Batters");
	bp4.append("g")
		.attr("transform", `translate(${bp4margin.left}, 0)`)
		.call(d3.axisLeft(bp4yScale).tickFormat(d3.format(".3f")));
	bp4.append("text")
		.attr("x", -(bp4height / 2))
		.attr("y", 15)
		.attr("transform", "rotate(-90)")
		.attr("text-anchor", "middle")
		.attr("font-size", "10px")
		.attr("fill", "black")
		.text("Batting Average");


	bp4.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", d => bp4xScale(d.rank))
		.attr("cy", d => bp4yScale(d.BA))
		.attr("r", 7)
		.attr("fill", "black");

});