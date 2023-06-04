/**
 * 
 * @param {*} topAnimes 
 * @param {*} animeData 
 * @param {*} containerId 
 * @returns 
 */
function updatePodium(topAnimes, animeData, containerId, title="The most rated anime") {
    const container = d3.select(containerId);
    container.selectAll("*").remove();

    let podium = container.append("div")
        .classed("podium", true)
        .style("align-self", "center")

    if (topAnimes.length === 0) return;

    // Reorder topAnimesData in the podium order, from left to right
    if (topAnimes.length >= 2) {
        [topAnimes[0], topAnimes[1]] = [topAnimes[1], topAnimes[0]];
    }

    // Merge animeData and topAnimesData
    const data = topAnimes.map(d => {
        const anime = animeData.find(a => a.anime_id === d.anime_id);
        return {
            anime_id: d.anime_id,
            title: anime ? anime.title : "Unknown (Click on poster)",
            image_url: anime ? anime.image_url : DEFAULT_IMG_URL,
            num_ratings: d.num_ratings
        };
    });

    // Create the podium
    const podiumElements = podium.selectAll(".podium-element")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "podium-element");

    // Link to the anime page on MyAnimeList
    const malLink = d => `https://myanimelist.net/anime/${d.anime_id}/`;

    // Anime title
    podiumElements
        .append("div")
        .attr("class", "title")
        .text(d => d.title);

    // Anime poster
    const poster = podiumElements
        .append("a")
        .attr("class", "poster")
        .attr("href", malLink)
        .attr("target", "_blank");

    poster
        .append("img")
        .on("error", function () {
            d3.select(this)
                .attr("src", DEFAULT_IMG_URL)
                .attr("onerror", null)
        })
        .attr("class", "rounded mx-auto d-block")
        .attr("alt", d => d.title)
        .attr("src", d => d.image_url)

    poster
        .append("div")
        .attr("class", "go-corner")
        .attr("href", malLink)
        .attr("target", "_blank")
        .append("div")
        .attr("class", "go-arrow")
        .text("→");

    // Podium step
    const podiumStep = podiumElements
        .append("div")
        .attr("class", "podium-step")
        .style("height", "0px")
        .classed("gold", (_, i) => (i === 0 && data.length === 1) || i === 1)
        .classed("silver", (_, i) => i === 0 && data.length > 1)
        .classed("bronze", (_, i) => i === 2);

    // Anime ranking
    podiumStep
        .append("div")
        .attr("class", "ranking")
        .text((_, i) => (data.length === 1 ? 1 : [2, 1, 3][i]));

    // Anime number of ratings
    podiumElements
        .append("div")
        .attr("class", "num_ratings")
        .text(d => `${formatAsThousands(d.num_ratings)} ratings`);

    // Animate the podium: appear from bottom to top
    podium.selectAll(".podium-step")
        .transition()
        .duration(500)
        .style("height", function () {
            switch (d3.select(this).attr("class")) {
                case "podium-step gold":
                    return "75px";
                case "podium-step silver":
                    return "50px";
                case "podium-step bronze":
                    return "25px";
            }
        });

    // Title
    container
        .append("h6")
        .text(title)
        .attr("class", "text-center")
        .style("margin-top", "0.5em");
}
