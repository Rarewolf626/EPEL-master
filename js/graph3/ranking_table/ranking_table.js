// function initRankings() {
//     d3.select("#" + rankingId).selectAll("*").remove();
// }

function updateRankings(rankingData, rankingId, headerA, headerB, colA, colB, num_rows = 10) {
    let rankings = d3.select("#" + rankingId);
    rankings.selectAll("*").remove();

    let table = rankings.append("table")

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

    // Column 1: ranking
    rows.append("td")
        .text((_, i) => i + 1);
    // Column 2: studio name
    rows.append("td")
        .text(d => d[colA]);
    // Column 3: number of ratings
    rows.append("td")
        .text(d => formatAsThousands(d[colB]));

    // rows.exit().remove();
}
