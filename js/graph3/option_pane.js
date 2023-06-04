// ============================================= Studio =============================================
/**
 * Creates a dropdown menu to select a studio.
 * 
 * @param {*} studioData Studio data
 * @returns The dropdown menu
 */
function createStudioSelector(studioData) {
    const studioSelector = d3.select("#studio-selector");

    studioSelector.selectAll("option")
        .data(studioData)
        .enter()
        .append("option")
        .attr("value", d => d.studio)
        .text(d => d.studio)

    return studioSelector;
}


// ============================================= Country =============================================
/**
 * Creates a dropdown menu to select a country.
 * 
 * @param {*} geojsonData GeoJSON data
 * @returns The dropdown menu
 */
function createCountrySelector(geojsonData) {
    const countrySelector = d3.select("#country-selector");

    // Sort the data by alphabetically by the name of the sovereignt country
    data = geojsonData.features
        .map(d => {
            return {
                admin: d.properties.admin,
                sovereignt: d.properties.sovereignt,
                iso_a2: d.properties.iso_a2
            }
        })
        .sort((a, b) => a.sovereignt.localeCompare(b.sovereignt));

    // For each sovereignt, put the entry whose admin==sovereignt first
    let sovereignt = "";
    let sovereigntIndex = 0;
    for (let i = 0; i < data.length; i++) {
        if (data[i].sovereignt != sovereignt) {
            sovereignt = data[i].sovereignt;
            sovereigntIndex = i;
        }
        if (data[i].admin == sovereignt) {
            let temp = data[i];
            data[i] = data[sovereigntIndex];
            data[sovereigntIndex] = temp;
            sovereigntIndex++;
        }
    }

    // Set of the countries which are the sovereignt of another country
    let sovereigntSet = new Set(data.filter(d => d.admin != d.sovereignt).map(d => d.sovereignt));

    // Add first the countries which do not have a sovereignt country
    countrySelector.selectAll("option")
        .data(data.filter(d => !sovereigntSet.has(d.sovereignt)))
        .enter()
        .append("option")
        .attr("value", d => d.admin)
        .text(d => getFlagEmoji(d.iso_a2) + " " + d.admin)
        .attr("label", d => getFlagEmoji(d.iso_a2) + " " + d.admin)

    // Add the countries which have a sovereignt country, and group them in an optgroup
    let optgroups = countrySelector.selectAll("optgroup")
        .data(data.filter(d => sovereigntSet.has(d.admin)))
        .enter()
        .append("optgroup")
        .attr("label", d => getFlagEmoji(d.iso_a2) + " " + d.admin);
    // Put the sovereignt country first
    optgroups.append("option")
        .attr("value", d => d.admin)
        .text(d => getFlagEmoji(d.iso_a2) + " " + d.admin);
    // The territories
    optgroups.each(function (d) {
        let optgroup = d3.select(this);
        let territories = data.filter(item => item.sovereignt === d.admin);
        optgroup.selectAll("option")
            .data(territories)
            .enter()
            .append("option")
            .attr("value", d => d.admin)
            .text(d => d.admin);
    });

    // Move the optgroups to their correct positions (alphabetical order) in the selector
    countrySelector.selectAll("optgroup").nodes()
        .forEach(optgroup => {
            let optgroupData = d3.select(optgroup).data()[0];
            // Finds the index of the first node whose admin is greater than the optgroup's admin
            let index = Array.from(countrySelector.node().childNodes).findIndex(node => {
                if (node.label === undefined) return false;
                let nodeData = d3.select(node).data()[0];
                return nodeData.admin.localeCompare(optgroupData.admin) > 0;
            });
            // Inserts the optgroup before the node found above
            countrySelector.node().insertBefore(optgroup, countrySelector.node().childNodes[index]);
        });

    return countrySelector;
}
