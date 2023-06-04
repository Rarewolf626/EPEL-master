/**
 * Fills in missing years in the age distribution data
 * Example: [2000, 2002, 2003] -> [2000, 2001, 2002, 2003]
 * 
 * @param {*} years The years in the data
 * @returns  The years in the data, with missing years filled in
 */
function fillMissingYears(years) {
  let filledYears = [];
  let firstYear = years[0];
  let lastYear = years[years.length - 1];

  for (let year = firstYear; year <= lastYear; year++) {
    filledYears.push(year);
  }

  return filledYears;
}

// Add the tooltip container
const tooltipAge = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("visibility", "hidden")
  .style("background-color", "white")
  .style("padding", "0.5em")
  .style("font-family", "Arial");

function handleMouseOver(d) {
  // Show the tooltip when hovering over a rectangle
  tooltipAge.style("visibility", "visible");
}

function handleMouseMove(d) {
  // Update the position of the tooltip to follow the mouse pointer
  tooltipAge.style("left", d3.event.pageX + "px")
    .style("top", d3.event.pageY + "px")
    .html(`${d.birth_year}: ${d.num_users} otaku${d.num_users > 1 ? "s" : ""}`); // Display the number related to the rectangle
}

function handleMouseOut(d) {
  // Hide the tooltip when moving the mouse away from the rectangle
  tooltipAge.style("visibility", "hidden");
}

/**
 * Creates a histogram of the age distribution of users in a country
 * 
 * @param {*} ageData 
 * @param {*} country 
 */
function updateAgeChart(ageData, country) {
  const container = d3.select("#country-age-distribution")
  container.selectAll("*").remove();

  // set the dimensions and margins of the graph
  let margin = { top: 20, right: 30, bottom: 30, left: 40 },
    width = 400 - margin.left - margin.right,
    height = 230 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  let svg = container.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let data = ageData.filter(d => d.country == country)
  if (data.length == 0) return;

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

  let xLabel = "Birth year →"
  d3.select("#x-axis-group")
    .append("text")
    .attr("x", width)
    .attr("y", margin.bottom)
    .attr("fill", "currentColor")
    .attr("text-anchor", "end")
    .text(xLabel)

  // Append the bar rectangles to the SVG element
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
      handleMouseOver(d)
    })
    .on("mousemove", function (d) {
      handleMouseMove(d)
    })
    .on("mouseout", function (d) {
      d3.select(this).style("fill", "#69b3a2") // Back to normal color
      handleMouseOut(d)
    });

  // Animation
  svg.selectAll("rect")
    .transition()
    .duration(800)
    .attr("height", function (d) { return height - yScale(d.num_users); })
    .attr("y", function (d) { return yScale(d.num_users); });

  container
    .append("h6")
    .text("Age distribution")
    .attr("class", "text-center")
    .style("margin-top", "0.5em")
};