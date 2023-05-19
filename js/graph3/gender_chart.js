function createGenderChart(genderData, countryName) {
    let svg = d3.select("#country-gender-pie-chart")
    svg.selectAll("*").remove();

    let title = d3.select("#country-gender-pie-chart-title")
    title.selectAll("*").remove();

    let countryIndex = genderData.findIndex(d => d.country == countryName);
    if (countryIndex == -1) return;
    let countryData = genderData[countryIndex]

    // set the dimensions and margins of the graph
    let width = 300
    let height = 300
    let margin = 40

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    let radius = Math.min(width, height) / 2 - margin

    svg = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    let genderBalance = { "Male": countryData["Male"], "Female": countryData["Female"], "Non-Binary": countryData["NonBinary"] }

    // set the color scale
    let color = d3.scaleOrdinal().domain(genderBalance).range(d3.schemeDark2);

    // Compute the position of each group on the pie:
    let pie = d3.pie()
        .value(function (d) { return d.value; })
    // Don't show genders with 0 user
    let data_ready = pie(d3.entries(genderBalance)).filter(d => d.value != 0);

    // Shape helper to build arcs
    let arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)

    // let tooltip = d3.select("body")
    //     .append("div")
    //     .style("position", "absolute")
    //     .style("z-index", "10")
    //     .style("visibility", "hidden");

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
        .selectAll('whatever')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', function (d) { return (color(d.data.key)) })
        .style("opacity", 0.7)
    // .on("mouseover", function (d) {
    //     tooltip.style("visibility", "visible");
    //     let percent = (d.data.value * 100);
    //     tooltip.text(Math.round(percent * 10) / 10 + "%")
    // })
    // .on("mousemove", function (d) { tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px"); })
    // .on("mouseout", function (d) { tooltip.style("visibility", "hidden"); });


    // Now add the annotation. Use the centroid method to get the best coordinates
    svg
        .selectAll('whatever')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function (d) { return d.data.key })
        .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
        .style("text-anchor", "middle")
        .style("font-size", 17)
        .append('text')
        .text(function (d) { return d.data.value })
        .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
        .style("text-anchor", "middle")
        .style("font-size", 10)
        .style("font-weight", "bold")
    // If click again, prevent the same pie chart from being appended again IF NO MOUSEOVER IN BETWEEN


    title.append("text").text("(ranked #" + (countryIndex + 1) + ")")

    return svg;
}