//Section: Make interactive dots
const dots = document.querySelectorAll('.navdot');
const pages = document.querySelectorAll('.page');
const container = document.querySelector('.container');

dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const index = dot.getAttribute('data-page');
        pages[index].scrollIntoView({ behavior: 'smooth' });
    });
});

// Highlight active dot
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const index = Array.from(pages).indexOf(entry.target);
        if (entry.isIntersecting) {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
        }
    });
}, { threshold: 0.7 });

pages.forEach(page => observer.observe(page));

//Section: BP-3 v1
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
var colorScale = d3.scaleOrdinal(customColors);
// Map for referencing min/max per each attribute
var extentByAttribute = [];
// Object for keeping state of which cell is currently being brushed
var brushCell;

// ****** Add reusable components here ****** //
scatterplot = chartG.append('g').attr('class', 'cell')
    .attr("transform", "translate("+[cellPadding / 2, cellPadding / 2]+")");
        
sp_xAxis = scatterplot.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate('+[cellPadding / 2, 0]+')')
sp_xAxis.append('text')
    .attr('class', 'xaxis-label')
    .attr('transform', 'translate('+[0, 0]+')');

sp_yAxis = scatterplot.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate('+[cellPadding / 2, 0]+')') 
sp_yAxis.append('text')
    .attr('class', 'yaxis-label')
    .attr('transform', 'translate('+[0, 0]+')rotate(270)');

var toolTip1 = d3.tip()
    .attr("class", "d3-tip")
    .offset([-12, 0])
    .html(function(event, d) {
        // Inject html, when creating your html I recommend editing the html within your index.html first
        return "<h5>"+d['Team']+"</h5><table><thead><tr><td>Wins</td><td>Losses</td><td>League</td></tr></thead>"
                        + "<tbody><tr><td>"+d['W']+"</td><td>"+d['L']+"</td><td>"+d['Lg']+"</td></tr></tbody>"
                        + "</table>"
    }); 

var toolTip2 = d3.tip()
    .attr("class", "d3-tip")
    .offset([-12, 0])
    .html(function(event, d) {
        // Inject html, when creating your html I recommend editing the html within your index.html first
        console.log("Tooltip 2!");
        return "<h5>"+d['Team']+"</h5><table><thead><tr><td>Wins</td><td>Losses</td><td>League</td></tr></thead>"
                        + "<tbody><tr><td>"+d['W']+"</td><td>"+d['L']+"</td><td>"+d['Lg']+"</td></tr></tbody>"
                        + "</table>"
    }); 
svg.call(toolTip1);
svg.call(toolTip2);

d3.csv('data/team_data.csv').then(function(dataset) {
    teams = dataset;
    playoff_teams = ['ATL', 'BAL', 'HOU', 'MIN', 'TBR', 'TEX', 'TOR', 'LAD', 'MIL', 'PHI', 'MIA', 'ARI'];
    
    filtered_teams = teams.filter(d => playoff_teams.includes(d['Team']));
    yScale.domain([0.3, 1]);
    xScale.domain([0, 3]);
    console.log(filtered_teams);
    sp_xAxis.call(d3.axisBottom(xScale).ticks(0).tickSize(cellHeight, 0, 0))
    d3.selectAll(".xaxis-label").text("2023 Teams");
        
    sp_yAxis.call(d3.axisLeft(yScale).ticks(6).tickSize(-(cellWidth - cellPadding), 0, 0))
    d3.selectAll(".yaxis-label").text("W/L %");

    const spbrush = d3.brushY()
        .extent([[0, 0], [cellWidth - cellPadding, cellHeight - cellPadding]])
        .on("start", spbrushstart)
        .on("brush", spbrushmove)
        .on("end", spbrushend);

    scatterplot.append("g")
            .attr("class", "brush")
            .attr('transform', 'translate('+[cellPadding / 2, cellPadding / 2]+')')
            .call(spbrush);
    
    var circles1 = scatterplot.selectAll("circle")
        .data(dataset).enter()
        .append("circle")
        .attr('class', 'dotp1')
        .attr("cx", d => xScale(0.9 + Math.random() * 0.2))
        .attr("cy", d => yScale(+d['WL%']))
        .attr("r", 5)
        .attr("fill", d => {
            const value = d['Playoff'];
            return value != null ? colorScale(value) : "#000000";
        });

    var circles2 = scatterplot.selectAll(".dotp2").data(filtered_teams);
    circles2.enter()
        .append("circle")
        .attr('class', 'dotp2')
        .attr("cx", d => xScale(1.90 + Math.random() * 0.2))
        .attr("cy", d => yScale(+d['WL%']))
        .attr("r", 5)
        .attr("fill", d => {
            const value = d['Playoff'];
            return value != null ? colorScale(value) : "#000000";
        });
    
    circles1.on('mouseover', toolTip1.show)
        .on('mouseout', toolTip1.hide);
    circles2.on('mouseover', toolTip2.show)
        .on('mouseout', toolTip2.hide);

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

            //selectedPoints2 = filtered_teams.filter(function(d){
            //    return e[0][0] <= xScale(2) && xScale(2) <= e[1][0]
            //        && e[0][1] <= yScale(d['WL%']) && yScale(d['WL%']) <= e[1][1];
            //});

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
    

/*
    var cellEnter = chartG.selectAll('.cell')
    .data(cells)
    .enter()
    .append('g')
    .attr('class', 'cell')
    .attr("transform", function(d) {
        // Start from the far right for columns to get a better looking chart
        var tx = (N - d.col - 1) * cellWidth + cellPadding / 2;
        var ty = d.row * cellHeight + cellPadding / 2;
        return "translate("+[tx, ty]+")";
     });
     
    cellEnter.append('g')
        .attr('class', 'brush')
        .call(brush);

    cellEnter.each(function(cell){
        cell.init(this);
        cell.update(this, dataset);
    });

    svg.call(toolTip);
});

function brushstart(event, cell) {
    // cell is the SplomCell object

    // Check if this g element is different than the previous brush
    if(brushCell !== this) {

        // Clear the old brush
        brush.move(d3.select(brushCell), null);

        // Update the global scales for the subsequent brushmove events
        xScale.domain(extentByAttribute[cell.x]);
        yScale.domain(extentByAttribute[cell.y]);

        // Save the state of this g element as having an active brush
        brushCell = this;
    }
}

function brushmove(event, cell) {
    // cell is the SplomCell object

    // Get the extent or bounding box of the brush event, this is a 2x2 array
    var e = event.selection;
    if(e) {

        // Select all .dot circles, and add the "hidden" class if the data for that circle
        // lies outside of the brush-filter applied for this SplomCells x and y attributes
        svg.selectAll(".dot")
            .classed("hidden", function(d){
                return e[0][0] > xScale(d[cell.x]) || xScale(d[cell.x]) > e[1][0]
                    || e[0][1] > yScale(d[cell.y]) || yScale(d[cell.y]) > e[1][1];
            })
    }
}

function brushend(event) {
    // If there is no longer an extent or bounding box then the brush has been removed
    if(!event.selection) {
        // Bring back all hidden .dot elements
        svg.selectAll('.hidden').classed('hidden', false);
        // Return the state of the active brushCell to be undefined
        brushCell = undefined;
    }
}

function dataPreprocessor(row) {
    return {
        'name': row['CerealName'],
        'calories': +row['Calories'],
        'protein (g)': +row['Protein_g'],
        'fat': +row['Fat'],
        'sodium': +row['Sodium'],
        'dietary fiber': +row['DietaryFiber'],
        'carbs': +row['Carbs'],
        'sugars': +row['Sugars'],
        'display shelf': +row['DisplayShelf']
    };
}*/