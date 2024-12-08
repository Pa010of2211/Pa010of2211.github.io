var pm8_data = new Map([]);

Promise.all([
    d3.csv('./data/team_data.csv'),
    d3.csv("./data/team_pitching.csv")
]).then(([datab, datap]) => {
    const rankedData1 = calculateRanks(datab);
    const rankedData2 = calculateRanks(datap);
    //console.log(rankedData2[5]);
    pm8_data.set('HR perc.', +rankedData1[5]['HR_rank']/30);
    pm8_data.set('OBP perc.', +rankedData1[5]['OBP_rank']/30);
    pm8_data.set('TB perc.', +rankedData1[5]['TB_rank']/30);
    pm8_data.set('F% perc.', +rankedData1[5]['Fld%_rank']/30);
    pm8_data.set('WHIP perc.', +rankedData2[5]['WHIP_rank']/30);
    //console.log(Array.from(pm8_data.entries()));

    const maxValue = 1;  // Maximum value for normalization
    const levels = 5;

    var svg = d3.select("#p6");

    var svgWidth = +svg.attr('width');
    var svgHeight = +svg.attr('height');
    var margin = 20
    var radius = Math.min(svgWidth/2, (svgHeight-50)) / 2 - margin;

    svg_center = svg.append("g")
        .attr("transform", `translate(${svgWidth / 3.75}, ${svgHeight / 2 - 20})`);
    // Scale for radius
    const rScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, radius]);

    svg_center.append('text')
        .attr('class', 'star-plot-label')
        .attr('transform', 'translate('+[-150,175]+')').text("Texas Rangers, 2023 (relative)");

    // Angle for each axis
    const angleSlice = (Math.PI * 2) / pm8_data.size;

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
        .data(pm8_data.entries())
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

    const closedData = [...Array.from(pm8_data.entries()), Array.from(pm8_data.entries())[0]];

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
        .data(pm8_data.entries())
        .enter().append("circle")
        .attr("class", "point")
        .attr("cx", (d, i) => rScale(d[1]) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("cy", (d, i) => rScale(d[1]) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("r", 4)
        .style("fill", "steelblue");
})