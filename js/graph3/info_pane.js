// ============================================= Studio =============================================
/**
 * 
 * @param {*} studio 
 * @param {*} studioData 
 * @param {*} studioNumAnimes 
 * @param {*} animeData 
 * @param {*} studioTopAnimes 
 * @param {*} studioCountries 
 */
function showStudioInfo(studio, studioData, studioNumAnimes, animeData, studioTopAnimes, studioCountries) {
    // Switch to the studio tab
    studioTab.show()

    country_names = studioCountries.filter(d => d.studio == studio).map(d => d.country)
    let num_countries = country_names.length

    studioData = studioData.find(d => d.studio_en == studio)

    // Studio name (english and japanese)
    let name = d3.select("#studio-name")
    name.selectAll("*").remove();
    name = name.append("h2")
    name.append("a")
        .attr("href", "https://myanimelist.net/anime/producer/" + studioData.id)
        .attr("target", "_blank")
        .text(studioData.studio_en)
        .attr("style", "color: black; text-decoration: none;")
        .attr("onmouseover", "this.style.color='orange'")
        .attr("onmouseout", "this.style.color='black'")
    if (studioData.studio_ja != "") {
        name.append("span")
            .text(" (" + studioData.studio_ja + ")")
            .style("font-size", "0.75em");
    }

    // Studio logo
    let logo = d3.select("#studio-logo")
    logo.selectAll("*").remove();
    logo.append("img")
        .attr("src", studioData.logo_url)
        .on("error", function () {
            d3.select(this)
                .attr("src", "../" + DEFAULT_IMG_URL)
                .attr("onerror", null)
        })
        .attr("class", "rounded mx-auto d-block")
        .attr("alt", studioData.studio_en)
        .attr("title", studioData.studio_en)


    let num_animes = studioNumAnimes.find(d => d.studio == studio).num_animes

    let num_info = d3.select("#studio-num-animes-num-countries")
    num_info.selectAll("*").remove();
    num_info.append("h5")
        .text(num_animes + " anime" + (num_animes > 1 ? "s" : "") + ", watched in " + num_countries + " countries")
        .attr("class", "d-block text-center")
}

/**
 * 
 * @param {*} studio 
 * @param {*} country 
 * @param {*} studioCountryTopAnimes 
 * @param {*} animeData 
 */
function showStudioCountryInfo(studio, country, studioCountryTopAnimes, animeData) {
    studioCountryTopAnimes = studioCountryTopAnimes.filter(d => d.studio == studio && d.country == country)

    let info = d3.select("#studio-country-info")
    info.selectAll("*").remove();

    info.append("span")
        .attr("class", "border-top")

    info.append("h4")
        .text(`The favorite animes of this studio in ${country} are`)

    // Top 3 animes from this studio in this country
    updatePodium(studioCountryTopAnimes, animeData, "studio-country-top-animes")
}

// ============================================= Country =============================================
/**
 * 
 * @param {*} d 
 * @param {*} countryTopAnimes 
 * @param {*} animeData 
 * @param {*} topStudios 
 * @param {*} genderData 
 * @param {*} ageData 
 * @param {*} daysData 
 * @returns 
 */
function showCountryInfo(d, countryTopAnimes, animeData, topStudios, genderData, ageData, daysData) {
    // Switch to the country tab
    countryTab.show()

    let engName = d.properties.admin;
    let japName = d.properties.name_ja

    /* Country general information */
    // Country name (english and japanese)
    d3.select("#countryName")
        .text(engName)
        .append("span")
        .text(" (" + japName + ")")
        .style("font-size", "0.75em");

    // Country's number of users
    let numUsers = d.properties.value;
    d3.select("#numUsers").text(numUsers ? formatAsThousands(numUsers) + " otakus (ranked #" + d.properties.countRank + ")" : "No otakus here :(");

    // Country flag
    updateFlag(d);

    /* Country stats */
    // Top 3 animes
    countryTopAnimes = countryTopAnimes.filter(d => d.country === engName).slice(0, 3);
    updatePodium(countryTopAnimes, animeData, "country-top-animes")

    // Top studios
    topStudios = topStudios.filter(d => d.country === engName)
    rankings = updateRankings(topStudios, "country-top-studios", "Studio", "Ratings", "studio", "num_ratings", num_rows=5)

    // .attr("onclick", d => "studioSelector.value='" + d.studio) //+ "'; updateStudioInfo();")
    // d3.select("#country-top-studios").selectAll("td:nth-child(2)").attr("class", "studio")


    // Gender balance
    genderBalance = updateGenderChart(genderData, engName);

    // Age distribution
    ageDistrib = updateAgeChart(ageData, engName);
    // Resize the width and height of the chart
    // ageDistrib.attr("width", "100%")

    // Mean number of days spent watching anime
    // Find the corresponding country in the daysData
    let countryDays = daysData.find(d => d.country == engName);
    if (!countryDays) {
        d3.select("#country-num-days").text("No data available");
        return;
    }
    let numDays = countryDays.num_days_spent_watching_mean
    let numDaysFormat = formatAsDays(numDays)
    let numDaysRank = countryDays.rank
    d3.select("#country-num-days").text("On average, an otaku has spent " + numDaysFormat + " watching animes (ranked #" + numDaysRank + ")");
}

/**
 * 
 * @param {*} countryFeature 
 */
function updateFlag(countryFeature) {
    let flag = d3.select("#country-flag")
    flag.selectAll("*").remove();
    flag = flag.append("img")
        .attr("src", countryFeature.properties.flag_path)
        .attr("class", "rounded mx-auto d-block")
        .attr("alt", countryFeature.properties.admin)
        .attr("title", countryFeature.properties.admin)
        // If no picture, display the default picture of MAL instead (e.g., https://myanimelist.net/anime/producer/253)
        .on("error", function () {
            d3.select(this)
                .attr("src", "../" + DEFAULT_IMG_URL)
                .attr("onerror", null)
        });
}