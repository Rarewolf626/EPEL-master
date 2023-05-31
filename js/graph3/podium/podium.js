const DEFAULT_ANIME_IMG_URL = "../../data/graph3_map/no_picture_mal.png";

function updatePodium(topAnimesData, animeData, podiumId) {
    let podium = d3.select("#" + podiumId);
    podium.selectAll("*").remove();
    podium.text("")

    if (topAnimesData.length === 0) {
        podium.text("No data available");
        return;
    }

    // Reorder topAnimesData in the podium order, from left to right
    if (topAnimesData.length >= 2) {
        // swap 0 and 1
        let tmp = topAnimesData[0];
        topAnimesData[0] = topAnimesData[1];
        topAnimesData[1] = tmp;
    }

    // Merge animeData and topAnimesData
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

    // Create the podium
    podium.selectAll(".podium-element")
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
            let poster = d3.select(this)
                .append("a")
                .attr("class", "poster")
                .attr("href", mal_link)
                .attr("target", "_blank")
            poster
                .append("img")
                .attr("class", "rounded mx-auto d-block")
                .attr("alt", d.title + " Poster")
                .attr("src", d.image_url)
                .attr("onerror", "this.onerror=null;this.src='../../data/graph3_map/no_picture_mal.png';")
            poster.append("div")
                .attr("class", "go-corner")
                .attr("href", mal_link)
                .attr("target", "_blank")
                .append("div")
                .attr("class", "go-arrow")
                .text("→");

            // Podium step
            let podium_step = d3.select(this)
                .append("div")
                .attr("class", "podium-step")
                .style("height", "0px")
            if (data.length === 1) {
                podium_step = podium_step.classed("gold", true);
            } else {
                podium_step = podium_step
                    .classed("silver", i === 0)
                    .classed("gold", i === 1)
                    .classed("bronze", i === 2)
            }
            // Anime ranking
            podium_step.append("div")
                .attr("class", "ranking");
            d3.selectAll(".ranking")
                .data(function () {
                    return (data.length === 1) ? [1] : [2, 1, 3];
                })
                .text(d => d);

            // Anime number of ratings
            d3.select(this)
                .append("div")
                .attr("class", "num_ratings")
                .text(formatAsThousands(d.num_ratings) + " ratings");
        });

    // Animate the podium: appear from bottom to top
    d3.selectAll(".podium-step")
        .transition()
        .duration(200)
        .style("height", function (d) {
            switch (d3.select(this).attr("class")) {
                case "podium-step gold":
                    return "100px";
                case "podium-step silver":
                    return "75px";
                case "podium-step bronze":
                    return "50px";
            }
        });
}
