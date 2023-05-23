function createCountrySelector(userData, geojsonData, genderData, ageData, daysData) {
    let countrySelector = d3.select("#country-selector");
    countrySelector.selectAll("option")
        .data(userData)
        .enter()
        .append("option")
        .attr("value", function (d) {
            return d.country;
        })
        .text(function (d) {
            let country = geojsonData.features.find(f => f.properties.name == d.country)
            if (!country) {
                console.log("Country not found");
                return;
            }
            let iso = country.properties.iso_a2;
            return getFlagEmoji(iso) + " " + d.country;
        })
        .exit();
    countrySelector.node().value = "Switzerland";

    countrySelector.on("change", function () {
        let engName = this.value;
        console.log(engName)
        let country = geojsonData.features.find(d => d.properties.name == engName);
        if (!country) {
            console.log("Country not found");
            return;
        }
        boxZoom(path.bounds(country), path.centroid(country), 20);
        showCountryInfo(country, genderData, ageData, daysData)
    })
}
