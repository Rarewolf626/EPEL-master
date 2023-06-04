
/**
 * Update the ranking table contained in the containerId with the rankingData.
 * 
 * @param {*} rankingData Data containing the rows of the table
 * @param {*} containerId Id of the container to append the table to
 * @param {*} headerA Header of the first column
 * @param {*} headerB Header of the second column
 * @param {*} colA Name of the key in rankingData to use for the first column
 * @param {*} colB Name of the key in rankingData to use for the second column
 * @param {*} num_rows Number of rows to display
 */
function updateRankings(rankingData, containerId, headerA, headerB, colA, colB, num_rows = 10) {
    const container = d3.select(containerId);
    container.selectAll("*").remove();

    let table = container.append("table")
        .classed("center-table", true)

    if (rankingData.length === 0) return;

    /* Table header */
    let thead = table.append("thead");
    let thead_tr = thead.append("tr");
    thead_tr.append("th").text("Ranking");
    thead_tr.append("th").text(headerA);
    thead_tr.append("th").text(headerB);

    /* Table body */
    let tbody = table.append("tbody");
    let rows = tbody.selectAll("tr")
        .data(rankingData.slice(0, num_rows))
        .enter()
        .append("tr")
        .classed("gold", (_, i) => i == 0)
        .classed("silver", (_, i) => i == 1)
        .classed("bronze", (_, i) => i == 2);

    // Column 1: ranking
    rows.append("td")
        .text((_, i) => i + 1);
    // Column 2: studio name
    rows.append("td")
        .text(d => d[colA]);
    // Column 3: number of ratings
    rows.append("td")
        .text(d => formatAsThousands(d[colB]));

    container
        .append("h6")
        .text("The most rated studios")
        .attr("class", "text-center")
        .style("margin-top", "0.5em")

}
