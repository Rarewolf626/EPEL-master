let chartGender = d3.select("#country-gender-balance")
// chart.selectAll("*").remove();

// set the dimensions and margins of the graph
const widthGender = 300
const heightGender = 300
const marginGender = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius = Math.min(widthGender, heightGender) / 2 - marginGender

const labelsGender = ["Female", "Male", "Non-Binary"]

// set the color scale
const colorGenders = d3.scaleOrdinal()
    .domain(labelsGender)
    .range(d3.schemeSet1);

// Shape helper to build arcs
const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)

let svgGender;
function initializeGenderChart() {
    d3.select("#country-gender-balance").selectAll("*").remove();
    svgGender = d3.select("#country-gender-balance")
        .append("svg")
        .attr("width", widthGender)
        .attr("height", heightGender)
        .append("g")
        .attr("transform", "translate(" + widthGender / 2 + "," + heightGender / 2 + ")");
}

let tooltipGender = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden");

/**
 * 
 * @param {*} genderData 
 * @param {*} country 
 * @returns 
 */
function updateGenderChart(genderData, country) {
    let data = genderData.find(d => d.country == country)
    if (!data) {
        initializeGenderChart();
        return;
    }

    let genderBalance = { "Male": data["Male"], "Female": data["Female"], "Non-Binary": data["Non-Binary"] }

    // Compute the position of each group on the pie:
    let pie = d3.pie()
        .value(d => d.value)
        .sort((a, b) => d3.ascending(a.key, b.key)) // group order remains the same in the pie chart
    let data_ready = pie(d3.entries(genderBalance))
        .filter(d => d.value != 0); // Don't show genders with 0 user

    // Map to data
    let u = svgGender.selectAll("path")
        .data(data_ready)


    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    u
        .enter()
        .append('path')
        .on("mouseover", function (d) {
            tooltipGender.style("visibility", "visible");
            tooltipGender.text((d.data.value * 100).toFixed(2) + "%")
        })
        .on("mousemove", function (d) {
            tooltipGender
                .style("top", (d3.event.pageY - 10) + "px")
                .style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function (d) {
            tooltipGender.style("visibility", "hidden");
        })
        .merge(u)
        .transition()
        .duration(500)
        .attr('d', arcGenerator)
        .attr('fill', d => colorGenders(d.data.key))
        .style("opacity", 0.7)

    // Remove the group that is not present anymore
    u.exit().remove()


    // Update the annotation
    var t = svgGender.selectAll("text")
        .data(data_ready)

    t.enter()
        .append("text")
        .merge(t)
        .transition()
        .duration(500)
        .attr("transform", d => "translate(" + arcGenerator.centroid(d) + ")")
        .style("text-anchor", "middle")
        .style("font-size", 69)
        .text(function (d) {
            switch (d.data.key) {
                case "Male": return "♂️";
                case "Female": return "♀️";
            }
        })

    t.exit().remove()

    return svgGender;
}