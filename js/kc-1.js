// SVG container
var kc1svg = d3.select("#p4-2");

var kc1width = 400;
var kc1height = 400;

kc1svg.append("image")
    .attr("xlink:href", "images/baseball-diamond-png.webp")
    .attr("width", kc1width);

d3.csv("data/team_data.csv").then(data => {
    data.forEach(d => {
        d.OBP = +d.OBP;
        d.W = +d.W;
    });

    var maxOBP = d3.max(data, d => d.OBP);
    var maxWins = d3.max(data, d => d.W);

    var infieldLengthScale = d3.scaleLinear()
        .domain([0, maxOBP])
        .range([50, 150]);

    var outfieldLengthScale = d3.scaleLinear()
        .domain([0, maxWins])
        .range([75, 100]);

    var angleScale = d3.scaleLinear()
        .domain([0, data.length - 1])
        .range([-45, 45]);

    // Center of home plate
    var homeX = kc1width / 2;
    var homeY = kc1height - 100;

    var tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("display", "none")
        .style("z-index", "999");

    data.forEach((d, i) => {
        var angle = angleScale(i) * (Math.PI / 180); 
        var infieldLength = infieldLengthScale(d.OBP);
        var outfieldLength = outfieldLengthScale(d.W);

        // Infield line coordinates
        var infieldX2 = homeX + infieldLength * Math.sin(angle);
        var infieldY2 = homeY - infieldLength * Math.cos(angle);

        // Outfield line coordinates
        var outfieldX2 = infieldX2 + outfieldLength * Math.sin(angle);
        var outfieldY2 = infieldY2 - outfieldLength * Math.cos(angle);

        // Infield line
        kc1svg.append("line")
            .attr("x1", homeX)
            .attr("y1", homeY)
            .attr("x2", infieldX2)
            .attr("y2", infieldY2)
            .attr("stroke", "white") 
            .attr("stroke-width", 2)
            .attr("opacity", 0.3)
            .on("mouseover", function () {
                d3.select(this).attr("opacity", 1);
                tooltip
                    .style("display", "block")
                    .html(`<strong>Team:</strong> ${d.Team}<br><strong>OBP:</strong> ${d.OBP}`);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("top", (event.pageY + 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("opacity", 0.3);
                tooltip.style("display", "none");
            });

        // Outfield line
        kc1svg.append("line")
            .attr("x1", infieldX2)
            .attr("y1", infieldY2)
            .attr("x2", outfieldX2)
            .attr("y2", outfieldY2)
            .attr("stroke", "orange")
            .attr("stroke-width", 2)
            .attr("opacity", 0.3)
            .on("mouseover", function () {
                d3.select(this).attr("opacity", 1);
                tooltip
                    .style("display", "block")
                    .html(`<strong>Team:</strong> ${d.Team}<br><strong>Wins:</strong> ${d.W}`);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("top", (event.pageY + 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("opacity", 0.3);
                tooltip.style("display", "none");
            });
    });
});
