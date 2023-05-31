function updateRankings(rankingData, rankingId, headerA, headerB, colA, colB, num_rows = 10) {
    let rankings = d3.select("#" + rankingId);
    rankings.selectAll("*").remove();

    let table = rankings
        .append("table")
    // .attr("caption", "The countries with largest communities")

    let thead_tr = table
        .append("thead")
        .append("tr")
    thead_tr.append("th").text("Ranking")
    thead_tr.append("th").text(headerA)
    thead_tr.append("th").text(headerB)

    let tbody = rankings.append("tbody");
    let rows = tbody.selectAll("tr")
        .data(rankingData.slice(0, num_rows))
        .enter()
        .append("tr");

    rows.append("td")
        .text((d, i) => i + 1);

    rows.append("td")
        .text(d => d[colA]);

    rows.append("td")
        .text(d => formatAsThousands(d[colB]));
}
