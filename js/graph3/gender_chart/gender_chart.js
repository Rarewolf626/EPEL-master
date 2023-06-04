// set the dimensions and margins of the graph
const GENDER_WIDTH = 200,
    GENDER_HEIGHT = 200,
    GENDER_MARGIN = 10,
    GENDER_RADIUS = Math.min(GENDER_WIDTH, GENDER_HEIGHT) / 2 - GENDER_MARGIN

const GENDER_LABELS = ["Female", "Male", "Non-Binary"]

// set the color scale
const GENDER_COLORS = d3.scaleOrdinal()
    .domain(GENDER_LABELS)
    .range(d3.schemeSet1);

// Shape helper to build arcs
const ARC_GENERATOR = d3.arc()
    .innerRadius(0)
    .outerRadius(GENDER_RADIUS)

let tooltipGender = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden");


let containerGender = d3.select("#country-gender-balance");
let svgGender = containerGender
    .append("svg")
    .attr("width", GENDER_WIDTH)
    .attr("height", GENDER_HEIGHT)
    .append("g")
    .attr("transform", "translate(" + GENDER_WIDTH / 2 + "," + GENDER_HEIGHT / 2 + ")");


/**
 * Update the gender chart
 * 
 * @param {*} genderData Data containing the gender balance for each country
 * @param {*} country Country to display
 */
function updateGenderChart(genderData, country) {
    containerGender.selectAll("h6").remove();

    let data = genderData.find(d => d.country == country)
    if (!data) return;

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
        .attr('d', ARC_GENERATOR)
        .attr('fill', d => GENDER_COLORS(d.data.key))
        .style("opacity", 0.7)

    // Remove the group that is not present anymore
    u.exit().remove()


    // Update the annotation
    let t = svgGender.selectAll("text")
        .data(data_ready)

    t.enter()
        .append("text")
        .merge(t)
        .transition()
        .duration(500)
        .attr("transform", d => "translate(" + ARC_GENERATOR.centroid(d) + ")")
        .style("text-anchor", "middle")
        .style("font-size", 69)
        .text(function (d) {
            switch (d.data.key) {
                case "Male": return "♂️";
                case "Female": return "♀️";
            }
        })

    t.exit().remove()

    containerGender.append("h6")
        .text("Gender balance")
        .attr("class", "text-center")
        .style("margin-top", "0.5em")
}