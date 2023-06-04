// ============================================= Studio =============================================
/**
 * Show the information about the currently selected studio.
 * 
 * @param {*} studio Name of the studio
 * @param {*} studioData Studios dataset
 * @param {*} studioNumAnimes Number of animes produced by each studio
 * @param {*} animeData Animes dataset
 * @param {*} studioTopAnimes Most rated animes of each studio
 * @param {*} studioNumCountries Country names where each studio is popular
 */
function showStudioInfo(studio, studioData, studioNumAnimes, studioNumCountries) {
    // Switch to the studio tab
    studioTab.show()

    d3.select("#studio-country-info").selectAll("*").remove();

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
            .text(` (${studioData.studio_ja})`)
            .style("font-size", "0.75em");
    }

    // Studio logo
    let logo = d3.select("#studio-logo")
    logo.selectAll("*").remove();
    logo.append("img")
        .attr("src", studioData.logo_url)
        .on("error", function () {
            d3.select(this)
                .attr("src", DEFAULT_IMG_URL)
                .attr("onerror", null)
        })
        .attr("class", "rounded mx-auto d-block")
        .attr("alt", studioData.studio_en)
        .attr("title", studioData.studio_en)


    let numAnimes = studioNumAnimes.find(d => d.studio == studio).num_animes
    studioNumCountries = studioNumCountries.find(d => d.studio == studio)

    let numInfo = d3.select("#studio-num-animes-num-countries")
    numInfo.selectAll("*").remove();
    numInfo.append("h5")
        .html(`
        <span class="counter" id="studio-num-animes-ctr"></span>
        <span> anime${numAnimes > 1 ? "s" : ""}, watched in </span>
        <span class="counter" id="studio-num-countries-ctr"></span>
        <span> countries (ranked #${studioNumCountries.rank})</span>
        `)
        .attr("class", "d-block text-center")
        .attr("style", "margin-top: 0.5em;")

    animateCounter("#studio-num-animes-ctr", numAnimes, 1000)
    animateCounter("#studio-num-countries-ctr", studioNumCountries.num_countries, 1000)
}

/**
 * Show the information about the currently selected country for the currently selected studio.
 * 
 * @param {*} studio Name of the studio
 * @param {*} country Name of the country
 * @param {*} studioCountryTopAnimes The most rated animes of this studio in this country
 * @param {*} animeData Animes dataset
 */
function showStudioCountryInfo(studio, country, studioCountryTopAnimes, animeData) {
    studioCountryTopAnimes = studioCountryTopAnimes.filter(d => d.studio == studio && d.country == country)
    let isDataAvailable = studioCountryTopAnimes.length > 0

    let info = d3.select("#studio-country-info")
    info.selectAll("*").remove();

    info.append("span")
        .attr("class", "border-top")

    info.append("h5")
        .style("margin-top", "0.5em")
        .attr("class", "text-center")
        .text(isDataAvailable ?
            `The favorite animes from this studio in ${country} are` :
            "No data available for this country")

    if (!isDataAvailable) return;
    
    // Top 3 animes from this studio in this country
    info.append("div")
        .attr("class", "col-9 podium")
        .attr("id", "podium-studio-country-top-animes")
        .style("align-self", "center")

    updatePodium(studioCountryTopAnimes, animeData, "#podium-studio-country-top-animes", title = "")
}

// ============================================= Country Tab =============================================


/**
 *  Show the information about the currently selected country.
 * 
 * @param {*} countryFeature GeoJSON feature of the country
 * @param {*} countryTopAnimes Most rated animes in each country
 * @param {*} animeData Animes dataset
 * @param {*} topStudios Top studios in each country
 * @param {*} genderData Gender balance of each country
 * @param {*} ageData Age distribution of each country
 * @param {*} daysData Mean number of days spent watching anime in each country
 */
function showCountryInfo(countryFeature, countryTopAnimes, animeData, topStudios, genderData, ageData, daysData) {
    // Switch to the country tab
    countryTab.show()

    let engName = countryFeature.properties.admin;
    let japName = countryFeature.properties.name_ja

    /* Country general information */
    // Country name (english and japanese)
    let colLeft = d3.select("#country-name-num-users")
    colLeft.selectAll("*").remove();

    let countryName = colLeft.append("h2")
        .text(engName)
    if (japName != "") {
        countryName
            .append("span")
            .text(` (${japName})`)
            .style("font-size", "0.75em");
    }

    // Country flag
    updateFlag(countryFeature);


    // Country's number of users
    let numUsers = countryFeature.properties.value;
    let numUsersText = colLeft.append("h4")
    if (!numUsers) {
        numUsersText.text(engName == "Japan" ? "The country of the rising sun :D" : "No otakus here :(")
        setCountryState("country-undefined")
        return;
    }
    setCountryState("country-defined")
    numUsersText.html(
        `<span class="counter" id="country-num-users-ctr"></span> otaku${numUsers > 1 ? "s" : ""} (ranked #${countryFeature.properties.countRank})`
    )
    animateCounter("#country-num-users-ctr", numUsers)


    /* Country stats (first row) */
    // Top 3 animes
    countryTopAnimes = countryTopAnimes.filter(d => d.country === engName).slice(0, 3);
    updatePodium(countryTopAnimes, animeData, "#country-top-animes")

    // Top studios
    topStudios = topStudios.filter(d => d.country === engName)
    updateRankings(topStudios, "#country-top-studios", "Studio", "Ratings", "studio", "num_ratings", num_rows = 10)

    /* Country stats (second row) */
    // Gender balance
    updateGenderChart(genderData, engName);

    // Age distribution
    updateAgeChart(ageData, engName);

    /* Mean number of days spent watching anime (third row) */
    updateMeanDays(daysData, engName);

}

/**
 * Update the flag of the country.
 * 
 * @param {*} countryFeature  GeoJSON feature of the country
 */
function updateFlag(countryFeature) {
    const countryFlag = d3.select("#country-flag")
    countryFlag.selectAll("*").remove();

    countryFlag.append("img")
        .attr("src", countryFeature.properties.flag_path)
        .attr("class", "rounded")
        .attr("alt", countryFeature.properties.admin)
        .attr("title", countryFeature.properties.admin)
        .on("error", function () {
            d3.select(this)
                .attr("src", DEFAULT_IMG_URL)
                .attr("onerror", null)
        });
}

/**
 * Update the number of days spent watching anime in the country.
 * 
 * @param {*} daysData  Data about the number of days spent watching anime in each country
 * @param {*} country  Country name
 */
function updateMeanDays(daysData, country) {
    const countryNumDays = d3.select("#country-num-days")
    countryNumDays.selectAll("*").remove();

    let countryDays = daysData.find(d => d.country == country);
    if (!countryDays) return;

    let formatResults = formatAsDays(countryDays.num_days_spent_watching_mean)
    let [numDays, numHours, numMinutes] = formatResults;

    countryNumDays.html(`
    <span>On average, an otaku has spent</span><br>
    <span class="counter" id="country-days-ctr"></span>
    <span> days, </span>
    <span class="counter" id="country-hours-ctr"></span>
    <span> hours and </span>
    <span class="counter" id="country-minutes-ctr"></span>
    <span> minutes watching animes (ranked #${countryDays.rank})</span>
  `);

    animateCounter("#country-days-ctr", numDays)
    animateCounter("#country-hours-ctr", numHours)
    animateCounter("#country-minutes-ctr", numMinutes)
}
