
/**
 * 
 * @param {*} rankingData 
 * @param {*} tableId 
 * @param {*} headerA 
 * @param {*} headerB 
 * @param {*} colA 
 * @param {*} colB 
 * @param {*} num_rows 
 * @returns 
 */
function updateRankings(rankingData, tableId, headerA, headerB, colA, colB, num_rows = 10) {
    let rankings = d3.select("#" + tableId);
    rankings.selectAll("*").remove();
    let table = rankings.append("table")
        .classed("center-table", true)

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

    rankings
        .append("h6")
        .text("The most rated studios")
        .attr("class", "text-center")
        .style("margin-top", "0.5em")

    return rankings;
}
