var bp5_data = new Map([]);

Promise.all([
    d3.csv('./data/player_savant_data.csv'),
]).then(([data]) => {
    const rankedData = calculateRanks(data);
    console.log(rankedData.length);
    bp5_data.set('xWOBA', +rankedData[97]['xwoba_rank']/rankedData.length);
    bp5_data.set('Sweet Spot %', +rankedData[97]['sweet_spot_percent_rank']/rankedData.length);
    bp5_data.set('Barrel %', +rankedData[97]['barrel_batted_rate_rank']/rankedData.length);
    bp5_data.set('K %', 1-(+rankedData[97]['k_percent_rank']/rankedData.length));
    bp5_data.set('Exit Velocity', +rankedData[97]['avg_hyper_speed_rank']/rankedData.length);
    console.log(Array.from(bp5_data.entries()));

    const maxValue = 1;  // Maximum value for normalization
    const levels = 5;

    var svg = d3.select("#p5");

    var svgWidth = +svg.attr('width');
    var svgHeight = +svg.attr('height');
    var margin = 20
    var radius = Math.min(svgWidth/2, (svgHeight-50)) / 2 - margin;

    svg_center = svg.append("g")
        .attr("transform", `translate(${svgWidth / 2 + (svgWidth / 3.75)}, ${svgHeight / 2 - 20})`);
    // Scale for radius
    const rScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, radius]);

    svg_center.append('text')
        .attr('class', 'star-plot-label')
        .attr('transform', 'translate('+[-120,175]+')').text("Corey Seager, 2023 (relative)");

    // Angle for each axis
    const angleSlice = (Math.PI * 2) / bp5_data.size;

    // Draw concentric circles
    for (let i = 1; i <= levels; i++) {
        const levelRadius = (radius / levels) * i;
        svg_center.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", levelRadius)
            .style("fill", "none")
            .style("stroke", "#ccc");
    }

    // Draw axis lines
    const axes = svg_center.selectAll(".axis")
        .data(bp5_data.entries())
        .enter().append("g")
        .attr("class", "axis");

    axes.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => rScale(maxValue) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (d, i) => rScale(maxValue) * Math.sin(angleSlice * i - Math.PI / 2))
        .style("stroke", "#999")
        .style("stroke-width", 1);

    // Add axis labels
    axes.append("text")
        .attr("class", "pm-8-axis-label")
        .attr("x", (d, i) => (rScale(maxValue) + 10) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y", (d, i) => (rScale(maxValue) + 10) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("text-anchor", "middle")
        .text(d => d[0]);

    const closedData = [...Array.from(bp5_data.entries()), Array.from(bp5_data.entries())[0]];

    // Line generator for data points
    const lineGenerator = d3.lineRadial()
        .angle((d, i) => i * angleSlice)
        .radius(d => rScale(d[1]));

    
    // Draw the data
    svg_center.append("path")
        .datum(closedData)
        .attr("class", "pm-8-area")
        .attr("d", lineGenerator);

    svg_center.append("path")
        .datum(closedData)
        .attr("class", "pm-8-line")
        .attr("d", lineGenerator);

    // Add points
    svg_center.selectAll(".point")
        .data(bp5_data.entries())
        .enter().append("circle")
        .attr("class", "point")
        .attr("cx", (d, i) => rScale(d[1]) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("cy", (d, i) => rScale(d[1]) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("r", 4)
        .style("fill", "steelblue");
})