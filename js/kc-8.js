const kc8_svg = d3.select("#p5")
const margin = { top: 75, right: 50, bottom: 300, left: 50 };
var svgWidth = +kc8_svg.attr('width') - margin.left - margin.right;
var svgHeight = +kc8_svg.attr('height') - margin.top - margin.bottom;

const kc8_colorScale = d3.scaleLinear()
    .domain([40,110])
    .range(["darkred", "green"]);

kc8_bars = kc8_svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("./data/team_data.csv").then(data => {
    const yScale = d3.scaleLinear()
        .domain([0, 41])
        .range([0, svgHeight-15]);

    // Add y-axis
    kc8_bars.append("g")
        .attr("class", "kc8-yaxis")
        .attr("transform", `translate(-5, 0)`)
        .call(d3.axisLeft(yScale));
    
    function updateChart(
        key,
    ) {
        data.forEach(d => d.value = +d['PA']/+d['GP']);
        const top8 = data.filter(d => +d['Playoff'] >= key).sort((a, b) => b.value - a.value).slice(0, 12);
        // scales
        console.log(top8);
        const xScale = d3.scaleBand()
            .domain(top8.map(d => d['Team']))
            .range([0, svgWidth])
            .padding(0.2);

        kc8_bars.selectAll(".bar").remove();
        kc8_updated = kc8_bars.selectAll(".bar").data(top8);
        
        const xAxis = d3.axisTop(xScale);

        kc8_updated.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d['Team']))
            .attr("y", 0)
            .attr("width", xScale.bandwidth())
            .attr("height", d => yScale(d.value))
            .attr("fill", d => {
                const value = d['W'];
                return value != null ? kc8_colorScale(value) : "#000000";
            });
        kc8_updated.exit().remove();
        kc8_bars.select(".kc8_axis").remove();
        // Add x-axis at the top
        kc8_bars.append("g")
            .attr("class", "kc8_axis")
            .attr("transform", `translate(0, 0)`)
            .call(xAxis);
        
        kc8_bars.selectAll(".image").remove();
        kc8_bars.selectAll(".image")
            .data(top8)
            .enter()
            .append("image")
            .attr("class", "image")
            .attr("x", d => xScale(d['Team']) + xScale.bandwidth() / 2 - 25) // Center the image
            .attr("y", -55) // Position above the x-axis
            .attr("width", 50)
            .attr("height", 50)
            .attr("xlink:href", d => {
                // Check if the image file matches the name
                const imageName = `${d['Team']}.png`; 
                return `./images/team_logos/${imageName}`;
            })
            .on("error", function () {
                // Remove the image if not found
                console.log("ERROR submitting " + top8)
                d3.select(this).remove();
            });

        kc8_bars.selectAll(".kc8_pg").remove();
        kc8_bars.selectAll(".kc8_pg")
            .data(top8)
            .enter()
            .append("text")
            .attr("class", "kc8_pg")
            .attr("x", d => xScale(d['Team']) + xScale.bandwidth() / 2)
            .attr("y", svgHeight - 15) // Position below the bars
            .attr("text-anchor", "middle")
            .text(d => d['PA']);
    };

    
    
    d3.select("#kc8Selector").on("change", function() {
        const Key = this.value;
        updateChart(+Key);
    });

    updateChart('0');
});