// Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
// Its opacity is set to 0: we don't see it by default.
let tooltip = d3.select("#country-age-distribution")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "black")
  .style("color", "white")
  .style("border-radius", "5px")
  .style("padding", "10px")

// A function that change this tooltip when the user hover a point.
// Its opacity is set to 1: we can now see it. Plus it sets the text and position of tooltip depending on the datapoint (d)
let showTooltip = function (d) {
  tooltip
    .transition()
    .duration(100)
    .style("opacity", 1)
  tooltip
    .html("Birth year: " + d.birth_year + " (" + d.num_users + " users)")
    .style("left", (d3.mouse(this)[0] + 20) + "px")
    .style("top", (d3.mouse(this)[1]) + "px")
}
let moveTooltip = function (d) {
  tooltip
    .style("left", (d3.mouse(this)[0] + 20) + "px")
    .style("top", (d3.mouse(this)[1]) + "px")
}
// A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
let hideTooltip = function (d) {
  tooltip
    .transition()
    .duration(100)
    .style("opacity", 0)
}


/**
 * 
 * @param {*} years 
 * @returns 
 */
function fillMissingYears(years) {
  const filledYears = [];
  const firstYear = years[0];
  const lastYear = years[years.length - 1];

  for (let year = firstYear; year <= lastYear; year++) {
    filledYears.push(year);
  }

  return filledYears;
}


/**
 * Creates a histogram of the age distribution of users in a country
 * @param {*} ageData 
 * @param {*} countryName 
 * @returns 
 */
function updateAgeChart(ageData, countryName) {
  let svg = d3.select("#country-age-histogram")
  svg.selectAll("*").remove();

  let data = ageData.filter(d => d.country == countryName)
  if (data.length == 0) {
    // d3.select("#country-age-distribution").append("paragraph").text("No data available for this country")
    return;
  }

  // set the dimensions and margins of the graph
  let margin = { top: 20, right: 30, bottom: 30, left: 40 },
    width = 460 - margin.left - margin.right,
    height = 280 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  svg = svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // X axis: scale and draw
  let years = data.map(d => d.birth_year)
  let xScale = d3.scaleBand()
    .range([0, width])
    .domain(fillMissingYears(years))
    .padding(0.1)
  const xStep = 5
  let xDomain = xScale.domain()
  if (years[years.length - 1] - years[0] > 2 * xStep) // show every 5 years if there are more than 10 years
    xDomain = xDomain.filter(d => d % xStep == 0)
  let xAxis = d3.axisBottom(xScale)
    .tickValues(xDomain)

  let xLabel = "Birth year →"
  svg.append("g")
    .attr("id", "x-axis-group")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "middle")

  // Y axis: scale and draw:
  let yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.num_users)])
    .range([height, 0]);
  let yAxis = d3.axisLeft(yScale)

  let yDomain = yScale.domain()
  if (yDomain[1] < 10) {
    yDomain = d3.range(0, yDomain[1] + 1, 1)
    yAxis.tickValues(yDomain).tickFormat(d3.format("d"))
  }

  let yLabel = "↑ Number of users"
  svg.append("g")
    .attr("id", "y-axis-group")
    .call(yAxis)
    .call(g => g.append("text")
      .attr("x", -margin.left)
      .attr("y", -margin.top / 2)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .text(yLabel))
  // Change the y tick step minimum to 1


  d3.select("#x-axis-group")
    .append("text")
    .attr("x", width)
    .attr("y", margin.bottom)
    .attr("fill", "currentColor")
    .attr("text-anchor", "end")
    .text(xLabel)

  // append the bar rectangles to the svg element
  svg.selectAll("mybar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function (d) { return xScale(d.birth_year); })
    .attr("width", xScale.bandwidth())
    .attr("height", function (d) { return height - yScale(0); })
    .attr("y", function (d) { return yScale(0); })
    .style("fill", "#69b3a2")
    .on("mouseover", function (d) {
      d3.select(this).style("fill", "#4e8a7c") // Brigthen the bar
      // showTooltip(d)
    })
    .on("mousemove", moveTooltip)
    .on("mouseleave", function (d) {
      d3.select(this).style("fill", "#69b3a2") // Back to normal color
      // hideTooltip(d)
    })

  // Animation
  svg.selectAll("rect")
    .transition()
    .duration(800)
    .attr("height", function (d) { return height - yScale(d.num_users); })
    .attr("y", function (d) { return yScale(d.num_users); })
  // .delay(function (d, i) { return 0.1 * d.num_users })

  return svg
};