var svg = d3.select('#p2');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 40, r: 40, b: 40, l: 40};
var cellPadding = 10;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

var dataAttributes = null;
var N = 1;

// Compute chart dimensions
var cellWidth = (svgWidth - padding.l - padding.r);
var cellHeight = (svgHeight - padding.t - padding.b);

// Global x and y scales to be used for all SplomCells
var xScale = d3.scaleLinear().range([0, cellWidth - cellPadding]);
var yScale = d3.scaleLinear().range([cellHeight - cellPadding, 0]);
// axes that are rendered already for you
var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale).ticks(6).tickSize(-cellWidth * N, 0, 0);
// Ordinal color scale for cylinders color mapping
var customColors = ['#ff5733', '#ffbd69', '#45aaf2', '#2ecc71','#8e44ad','#f7dc6f', '#3498db', '#fd79a8', '#1abc9c', '#f39c12' ];
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
    .offset([-12, 0])
    .html(function(event, d) {
        // Inject html, when creating your html I recommend editing the html within your index.html first
        return "<h5>"+d['Team']+"</h5><table><thead><tr><td>Wins</td><td>Losses</td><td>League</td></tr></thead>"
                        + "<tbody><tr><td>"+d['W']+"</td><td>"+d['L']+"</td><td>"+d['Lg']+"</td></tr></tbody>"
                        + "<thead><tr><td>End of Season Status</td></tr></thead>"
                        + "<tbody><tr><td>"+status_map.get(d['Playoff'])+"</td><</tr></tbody></table>"
    }); 

d3.csv('data/team_data.csv').then(function(dataset) {
    teams = dataset;
    
    yScale.domain([0.3, 1]);
    xScale.domain([0, 3]);
    sp_xAxis.call(d3.axisBottom(xScale).ticks(0).tickSize(cellHeight - cellPadding, 0, 0));
    //.selectAll(".xaxis-label").text("2023 Teams");
        
    sp_yAxis.call(d3.axisLeft(yScale).ticks(6).tickSize(-(cellWidth - cellPadding), 0, 0));
    //d3.selectAll(".yaxis-label").text("W/L %");

    const spbrush = d3.brushY()
        .extent([[0, 0], [cellWidth - cellPadding, cellHeight - cellPadding]])
        .on("start", spbrushstart)
        .on("brush", spbrushmove)
        .on("end", spbrushend);

    scatterplot.append("g")
            .attr("class", "brush")
            .attr('transform', 'translate('+[cellPadding / 2, cellPadding / 2]+')')
            .call(spbrush);
    
    svg.call(toolTip1);

    scatterplot.selectAll(".dotp1")
        .data(dataset.filter(d => +d['Playoff'] == 0)).enter()
        .append("circle")
        .attr('class', 'dotp1')
        .attr("cx", d => xScale(0.65 + Math.random() * 0.2))
        .attr("cy", d => yScale(+d['WL%']))
        .attr("r", 5)
        .attr("fill", d => {
            const value = d['Playoff'];
            return value != null ? colorScale(value) : "#000000";
        }).on('mouseover', toolTip1.show)
        .on('mouseout', toolTip1.hide);

    scatterplot.selectAll(".dotp2")
        .data(dataset.filter(d => +d['Playoff'] > 0)).enter()
        .append("circle")
        .attr('class', 'dotp2')
        .attr("cx", d => xScale(1.9 + Math.random() * 0.2))
        .attr("cy", d => yScale(+d['WL%']))
        .attr("r", 5)
        .attr("fill", d => {
            const value = d['Playoff'];
            return value != null ? colorScale(value) : "#000000";
        }).on('mouseover', toolTip1.show)
        .on('mouseout', toolTip1.hide);;

    function spbrushstart(event) {
        // Check if this g element is different than the previous brush
        if(brushCell !== this) {

            // Clear the old brush
            //mapbrush.move(d3.select(brushCell), null);

            // Update the global scales for the subsequent brushmove events
            yScale.domain([0.3, 1]);
            xScale.domain([0, 3]);

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
                return e[0] <= yScale(d['WL%']) && yScale(d['WL%']) <= e[1];
            });

            svg.selectAll(".dotp1").classed("hidden", true).classed("highlight", false);
            
            svg.selectAll(".dotp1").data(dataset).classed("hidden", d => !selectedPoints.includes(d))
                .classed("highlight", d => selectedPoints.includes(d));

            svg.selectAll(".dotp2").classed("hidden", true).classed("highlight", false);
        
            svg.selectAll(".dotp2").data(dataset).classed("hidden", d => !selectedPoints.includes(d))
                .classed("highlight", d => selectedPoints.includes(d));
        }
    }

    function spbrushend(event) {
        // If there is no longer an extent or bounding box then the brush has been removed
        if(!event.selection) {
            // Bring back all hidden .dot elements
            svg.selectAll('.hidden').classed('hidden', false);
            svg.selectAll('.highlight').classed('highlight', false);
            // Return the state of the active brushCell to be undefined
            brushCell = undefined;
        }
    }

    
});