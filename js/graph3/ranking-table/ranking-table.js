function initRankings() {
    d3.select("#" + rankingId).selectAll("*").remove();
}

function updateRankings(rankingData, rankingId, headerA, headerB, colA, colB, num_rows = 10) {
    let rankings = d3.select("#" + rankingId);
    rankings.selectAll("*").remove();


    let table = rankings
        .selectAll("table")
        .data([rankingData.slice(0, num_rows)]);


    let tableEnter = table.enter()
        .append("table");

    tableEnter
        .append("caption")
        .text("The favorite studios");

    let thead = tableEnter
        .append("thead");

    let thead_tr = thead
        .append("tr");

    thead_tr.append("th").text("Ranking");
    thead_tr.append("th").text(headerA);
    thead_tr.append("th").text(headerB);

    let tbody = tableEnter
        .append("tbody");

    let rows = tbody
        .selectAll("tr")
        .data(d => d);

    rows.exit().remove();

    let rowsEnter = rows.enter()
        .append("tr")
        .style("opacity", 0);

    rowsEnter.merge(rows)
        .transition()
        .duration(500)
        .style("opacity", 1);

    rowsEnter.append("td")
        .text((d, i) => i + 1);

    rowsEnter.append("td")
        .text(d => d[colA]);

    rowsEnter.append("td")
        .text(d => formatAsThousands(d[colB]));

    table.exit().remove();

}
