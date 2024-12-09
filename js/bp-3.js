var bp3_svg = d3.select('#p2_svg');

// Get layout parameters
var svgWidth = 600;
var svgHeight = +bp3_svg.attr('height');

var padding = {t: 40, r: 40, b: 40, l: 40};
var cellPadding = 10;

// Create a group element for appending chart elements
var chartG = bp3_svg.append('g')
.attr('id', 'p2_g')
.attr('transform', 'translate('+[padding.l, padding.t]+')');

var N = 1;

// Compute chart dimensions
var cellWidth = (svgWidth - padding.l - padding.r);
var cellHeight = (svgHeight - padding.t - padding.b);

// Global x and y scales to be used for all SplomCells
var bp3_xScale = d3.scaleLinear().range([0, cellWidth - cellPadding]);
var bp3_yScale = d3.scaleLinear().range([cellHeight - cellPadding, 0]);
// Ordinal color scale for cylinders color mapping
const colorScale = d3.scaleLinear()
    .domain([0,5])
    .range(["darkred", "green"]);
//var colorScale = d3.scaleOrdinal(customColors);
// Map for referencing min/max per each attribute
var extentByAttribute = [];
// Object for keeping state of which cell is currently being brushed
var brushCell;

const status_map = new Map([
    ["0", 'No postseason'],
    ["1", 'Reached Wild Card Series'],
    ["2", 'Reached Division Series'],
    ["3", 'Reached Championship Series'],
    ["4", 'Reached World Series'],
    ["5", 'Won World Series']
  ]);

scatterplot = chartG.append('g').attr('class', 'cell')
    .attr("transform", "translate("+[cellPadding / 2, cellPadding / 2]+")");
        
sp_xAxis = scatterplot.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate('+[cellPadding / 2, 0]+')');

sp_yAxis = scatterplot.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate('+[cellPadding / 2, 0]+')');
scatterplot.append('text')
    .attr('class', 'yaxis-label')
    .attr('transform', 'translate('+[-15, 75]+')rotate(270)').text("W/L %");

scatterplot.append('text')
    .attr('class', 'xaxis-label')
    .attr('transform', 'translate('+[25, 740]+')').text("Non-Postseason Teams");

scatterplot.append('text')
    .attr('class', 'xaxis-label')
    .attr('transform', 'translate('+[265, 740]+')').text("Postseason Teams");

var toolTip1 = d3.tip()
    .attr("class", "d3-tip")
    .style("z-index", "3")
    .offset([-12, 0])
    .html(function(event, d) {
        // Inject html, when creating your html I recommend editing the html within your index.html first
        return "<h5>"+d['Team']+"</h5><table><thead><tr><td>Wins</td><td>Losses</td><td>League</td></tr></thead>"
                        + "<tbody><tr><td>"+d['W']+"</td><td>"+d['L']+"</td><td>"+d['Lg']+"</td></tr></tbody>"
                        + "<thead><tr><td>End of Season Status</td></tr></thead>"
                        + "<tbody><tr><td>"+status_map.get(d['Playoff'])+"</td><</tr></tbody></table>"
    }); 

const boxX = 650;
const boxY = 300; 
const boxWidth = 300;
const boxHeight = 150;
const boxColor = "#cce7ff";
const textLines = ["The Texas Rangers and", "Arizona Diamondbacks are", "#6 and #12 in term of WL%"];
// Add a box
bp3_svg.append("rect")
    .attr("x", boxX)
    .attr("y", boxY)
    .attr("width", boxWidth)
    .attr("height", boxHeight)
    .attr("fill", boxColor)
    .attr("stroke", "black")
    .attr("stroke-width", 2);

const textGroup = bp3_svg.append("text")
    .attr("x", boxX + boxWidth / 2) 
    .attr("y", boxY + 55) 
    .attr("text-anchor", "middle") 
    .style("font-family", "Arial")
    .style("font-size", "24px")
    .style("fill", "black");

// Add multiple lines of text using tspans
textLines.forEach((line, index) => {
    textGroup.append("tspan")
        .attr("x", boxX + boxWidth / 2) // Center horizontally
        .attr("dy", index === 0 ? "0" : "1.2em") // Offset each line (first line stays at y)
        .text(line);
});

const textLines2 = ["This indicates that winning a", "lot of games is not all", "it takes to make it to the post", "season or even to win","the world series"];

const textGroup2 = bp3_svg.append("text")
    .attr("x", boxX + (boxWidth+50) / 2) 
    .attr("y", boxY + 250) 
    .attr("text-anchor", "middle") 
    .style("font-family", "Arial")
    .style("font-size", "24px")
    .style("fill", "white");

// Add multiple lines of text using tspans
textLines2.forEach((line, index) => {
    textGroup2.append("tspan")
        .attr("x", boxX + boxWidth / 2) // Center horizontally
        .attr("dy", index === 0 ? "0" : "1.2em") // Offset each line (first line stays at y)
        .text(line);
});
//Arrowhead
bp3_svg.append("defs")
    .append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", 6) 
    .attr("markerHeight", 6)
    .attr("orient", "auto") 
    .append("path")
    .attr("d", "M0,-5L10,0L0,5") 
    .style("fill", "steelblue"); 

d3.csv('data/team_data.csv').then(function(dataset) {
    teams = dataset;
    
    bp3_yScale.domain([0.3, 1]);
    bp3_xScale.domain([0, 3]);
    sp_xAxis.call(d3.axisBottom(bp3_xScale).ticks(0).tickSize(cellHeight - cellPadding, 0, 0));
    //.selectAll(".xaxis-label").text("2023 Teams");
        
    sp_yAxis.call(d3.axisLeft(bp3_yScale).ticks(6).tickSize(-(cellWidth - cellPadding), 0, 0));
    //d3.selectAll(".yaxis-label").text("W/L %");

    const spbrush = d3.brushY()
        .extent([[0, 0], [cellWidth - cellPadding, cellHeight - cellPadding]])
        .on("start", spbrushstart)
        .on("brush", spbrushmove)
        .on("end", spbrushend);
    bp3_svg.call(toolTip1);
    scatterplot.append("g")
            .attr("class", "brush")
            .attr('transform', 'translate('+[cellPadding / 2, cellPadding / 2]+')')
            .call(spbrush);
    
    

    sp_points = scatterplot.selectAll(".bp3_dot")
        .data(dataset).enter()
        .append("circle")
        .attr('class', 'bp3_dot')
        .attr("cx", function (d) {
            var xbase = 1.9;
            if (d['Playoff'] == 0) {
                xbase = 0.65;
            };
            return bp3_xScale(xbase + Math.random() * 0.2);
        })
        .attr("cy", d => bp3_yScale(+d['WL%']))
        .attr("r", 5)
        .attr("fill", d => {
            const value = d['Playoff'];
            return value != null ? colorScale(value) : "#000000";
        }).on('mouseover', toolTip1.show)
        .on('mouseout', toolTip1.hide);
    
    dataset.filter(d => +d['Playoff'] > 3)
        .forEach(d => {
            const startX = bp3_xScale(2.1) + 300; 
            const startY = bp3_yScale(+d['WL%']) - 110;

            scatterplot.append("line")
            .attr("class", "arrow") 
                .attr("x1", startX)
                .attr("y1", startY)
                .attr("x2", bp3_xScale(2.1))
                .attr("y2", bp3_yScale(+d['WL%']))
                .attr("marker-end", "url(#arrowhead)")
                .attr('stroke', 'steelblue').attr('fill', 'none').attr('stroke-width', '4px');
            });

    function spbrushstart(event) {
        // Check if this g element is different than the previous brush
        if(brushCell !== this) {

            // Clear the old brush
            //mapbrush.move(d3.select(brushCell), null);

            // Update the global scales for the subsequent brushmove events
            bp3_yScale.domain([0.3, 1]);
            bp3_xScale.domain([0, 3]);

            // Save the state of this g element as having an active brush
            brushCell = this;
        }
    }

    function spbrushmove(event) {
        // cell is the object

        // Get the extent or bounding box of the brush event, this is a 2x2 array
        var e = event.selection;
        if(e) {

            // Select all .dot circles, and add the "hidden" class if the data for that circle
            // lies outside of the brush-filter applied for this SplomCells x and y attributes
            selectedPoints = teams.filter(function(d){
                return e[0] <= bp3_yScale(d['WL%']) && bp3_yScale(d['WL%']) <= e[1];
            });

            bp3_svg.selectAll(".bp3_dot").classed("hidden", true).classed("highlight", false);
            
            bp3_svg.selectAll(".bp3_dot").data(dataset).classed("hidden", d => !selectedPoints.includes(d))
                .classed("highlight", d => selectedPoints.includes(d));
        }
    }

    function spbrushend(event) {
        // If there is no longer an extent or bounding box then the brush has been removed
        if(!event.selection) {
            // Bring back all hidden .dot elements
            bp3_svg.selectAll('.hidden').classed('hidden', false);
            bp3_svg.selectAll('.highlight').classed('highlight', false);
            // Return the state of the active brushCell to be undefined
            brushCell = undefined;
        }
    }

    
});