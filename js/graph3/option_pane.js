/**
 * 
 * @param {*} countData 
 */
function createCountrySelector(countData) {
    let countrySelector = d3.select("#country-selector");
    countrySelector.selectAll("option")
        .data(countData)
        .enter()
        .append("option")
        .attr("value", d => d.country)
        .text(d => d.country)
        .exit();
    countrySelector.node().value = "Switzerland";
}
