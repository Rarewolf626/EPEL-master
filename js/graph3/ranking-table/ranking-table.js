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
    for (let i = 0; i < num_rows; i++) {
        let tr = tbody.append("tr")
        tr.append("td").text(i + 1)
        tr.append("td").text(rankingData[i][colA])
        tr.append("td").text(formatAsThousands(rankingData[i][colB]))
    }
}
