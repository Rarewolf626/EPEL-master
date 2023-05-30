


function updatePodium(country, topAnimesData, animeData, podiumId) {
    let podium = d3.select("#" + podiumId);
    podium.selectAll("*").remove();
    podium.text("")

    // Keep at most 3 animes
    topAnimesData = topAnimesData.filter(d => d.country === country).slice(0, 3);
    if (topAnimesData.length === 0) {
        podium.text("No data available");
        return;
    }

    // Reorder topAnimesData to have the elements in the podium order, from left to right
    topAnimesData = [
        topAnimesData[1],
        topAnimesData[0],
        topAnimesData[2]
    ];

    let data = [];
    topAnimesData.forEach(function (d) {
        let anime_id = d.anime_id;
        let anime = animeData.find(d => d.anime_id === anime_id);
        data.push({
            anime_id: anime_id,
            title: anime.title,
            title_japanese: anime.title_japanese,
            image_url: anime.image_url,
            num_ratings: d.num_ratings
        });
    });

    let podium_elements = podium.selectAll(".podium-element")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "podium-element")
        .each(function (d, i) {
            // Link to the anime page on MyAnimeList
            let mal_link = "https://myanimelist.net/anime/" + d.anime_id + "/";

            // Anime title
            d3.select(this)
                .append("div")
                .attr("class", "title")
                .text(d.title);

            // Anime poster
            d3.select(this)
                .append("a")
                .attr("class", "poster")
                .attr("href", mal_link)
                .attr("target", "_blank")
                .append("img")
                .attr("class", "rounded mx-auto d-block")
                .attr("src", d.image_url)
                .attr("alt", d.title + " Poster")
                .append("div")
                .attr("class", "go-corner")
                .attr("href", mal_link)
                .attr("target", "_blank")
                .append("div")
                .attr("class", "go-arrow")
                .text("→");

            // Podium step
            d3.select(this)
                .append("div")
                .attr("class", "podium-step")
                .classed("silver", i === 0)
                .classed("gold", i === 1)
                .classed("bronze", i === 2)
                .append("div")
                .attr("class", "ranking");
            // Anime ranking
            d3.selectAll(".ranking")
                .data([2, 1, 3])
                .text(d => d);

            // Anime number of ratings
            d3.select(this)
                .append("div")
                .attr("class", "num_ratings")
                .text(formatAsThousands(d.num_ratings) + " ratings");
        });

}
