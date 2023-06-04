
const DATA_PATH = "data/";

const STUDIO_PATH = DATA_PATH + "studios/",
    MAP_PATH = DATA_PATH + "graph3_map/";

const GEOJSON_PATH = MAP_PATH + "geojson/",
    FLAG_PATH = MAP_PATH + "flags/",
    STAT_PATH = MAP_PATH + "stats/";

const STUDIO_STAT_PATH = STAT_PATH + "studios/",
    COUNTRY_STAT_PATH = STAT_PATH + "countries/";

// Dimensions of map group
const MAP_WIDTH = 870,
    MAP_HEIGHT = 450;
// Min and Max zoom factors
const MIN_ZOOM = 1,
    MAX_ZOOM = 20 * MIN_ZOOM
// X and Y offsets for center of map to be shown in center of holder
const MID_X = (MAP_WIDTH - MIN_ZOOM * MAP_WIDTH) / 2,
    MID_Y = (MAP_HEIGHT - MIN_ZOOM * MAP_HEIGHT) / 2;

// Map projection
let projection = d3.geoNaturalEarth1()

// Map path generator
let path = d3.geoPath()
    .projection(projection)

// Color scheme for countries, based on the number of users
let colorCountries = d3.scaleLinear()
    .range(["#fee5d9", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704", "#7f2704"])
    .domain([0, 100]);

// Map zoom behavior
let zoom = d3.zoom()
    .on("zoom", () => {
        let t = d3.event.transform;
        countriesGroup.attr("transform", "translate(" + [t.x, t.y] + ")scale(" + t.k + ")");
    });

// Map SVG
let mapSvg = d3.select("#map-holder")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("class", "svg-content")

// Container in which all zoom-able elements will live
let countriesGroup = mapSvg.append("g")
    .attr("id", "map")
// All paths
let countries;

const CLIENT_WIDTH = d3.select("#map-holder").node().clientWidth,
    CLIENT_HEIGHT = d3.select("#map-holder").node().clientHeight;

/**
 * Initiate the zoom: calculate zoom/pan limits and set zoom to default value.
 */
function initZoom() {
    // set extent of zoom to chosen values
    // set translate extent so that panning can't cause map to move out of viewport
    zoom.scaleExtent([MIN_ZOOM, MAX_ZOOM])
        .translateExtent([[0, 0], [MAP_WIDTH, MAP_HEIGHT]]);
    // change zoom transform to min zoom and centre offsets
    mapSvg.transition()
        .duration(1000)
        .call(zoom.transform, d3.zoomIdentity.translate(MID_X, MID_Y).scale(MIN_ZOOM));
}



/**
 * Zoom to show a bounding box, with optional additional padding as percentage of box size.
 * 
 * @param {*} box  [[left, bottom], [right, top]] in map units
 * @param {*} centroid  [longitude, latitude] of box in map units
 * @param {*} paddingPerc  padding as percentage of box size
 */
function boxZoom(box, centroid, paddingPerc) {
    let minXY = box[0];
    let maxXY = box[1];
    // find size of map area defined
    let zoomWidth = Math.abs(minXY[0] - maxXY[0]);
    let zoomHeight = Math.abs(minXY[1] - maxXY[1]);
    // find midpoint of map area defined
    let zoomMidX = centroid[0];
    let zoomMidY = centroid[1];
    // increase map area to include padding
    zoomWidth = zoomWidth * (1 + paddingPerc / 100);
    zoomHeight = zoomHeight * (1 + paddingPerc / 100);
    // find scale required for area to fill svg
    let maxXscale = MAP_WIDTH / zoomWidth;
    let maxYscale = MAP_HEIGHT / zoomHeight;
    let zoomScale = Math.min(maxXscale, maxYscale);
    // handle some edge cases
    // limit to max zoom (handles tiny countries)
    zoomScale = Math.min(zoomScale, MAX_ZOOM);
    // limit to min zoom (handles large countries and countries that span the date line)
    zoomScale = Math.max(zoomScale, MIN_ZOOM);
    // Find screen pixel equivalent once scaled
    let offsetX = zoomScale * zoomMidX;
    let offsetY = zoomScale * zoomMidY;
    // Find offset to centre, making sure no gap at left or top of holder
    let dleft = Math.min(0, MAP_WIDTH / 2 - offsetX);
    let dtop = Math.min(0, MAP_HEIGHT / 2 - offsetY);
    // Make sure no gap at bottom or right of holder
    dleft = Math.max(MAP_WIDTH - MAP_WIDTH * zoomScale, dleft);
    dtop = Math.max(MAP_HEIGHT - MAP_HEIGHT * zoomScale, dtop);
    // set zoom
    mapSvg.transition()
        .duration(500)
        .call(zoom.transform, d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale));
}


let countryFocus = false
let studioFocus = false

let studioCountryNames = [];

let countrySelector;
let studioSelector;
const COUNTRY_SELECTOR_DEFAULT_OPTION = "Select a country...",
    STUDIO_SELECTOR_DEFAULT_OPTION = "Select a studio..."

let countryTabTriggerEl = document.querySelector('#country-tab')
let countryTab = new bootstrap.Tab(countryTabTriggerEl)

let studioTabTriggerEl = document.querySelector('#studio-tab')
let studioTab = new bootstrap.Tab(studioTabTriggerEl)


let countryState = "country-undefined"
let countryPanel = d3.select("#country")
let countryDefDivs = countryPanel.selectAll(".country-defined")
let countryUndefDivs = countryPanel.selectAll(".country-undefined")

let studioState = "studio-undefined"
let studioPanel = d3.select("#studio")
let studioDefDivs = studioPanel.selectAll(".studio-defined")
let studioUndefDivs = studioPanel.selectAll(".studio-undefined")

/**
 * Set the state of the country panel.
 * 
 * @param {*} state country-defined or "country-undefined
 */
function setCountryState(state) {
    if (state === "country-defined") {
        countryDefDivs.style("display", "block");
        countryDefDivs.style("visibility", "visible")
        countryUndefDivs.style("display", "none");
        countryUndefDivs.style("visibility", "hidden")

    } else if (state === "country-undefined") {
        countryDefDivs.style("display", "none");
        countryDefDivs.style("visibility", "hidden")
        // e.g. a country that has no otakus
        if (countryFocus) {
            d3.selectAll("#country-info").style("display", "block");
            d3.selectAll("#country-info").style("visibility", "visible");
        } else {
            countryUndefDivs.style("display", "block");
            countryUndefDivs.style("visibility", "visible")
        }
    }
    countryState = state;
}

/**
 * Set the state of the studio panel.
 * 
 * @param {*} state studio-defined or studio-undefined
 */
function setStudioState(state) {
    if (state === "studio-defined") {
        studioDefDivs.style("display", "block");
        studioDefDivs.style("visibility", "visible")
        studioUndefDivs.style("display", "none");
        studioUndefDivs.style("visibility", "hidden")

    } else if (state === "studio-undefined") {
        studioDefDivs.style("display", "none");
        studioDefDivs.style("visibility", "hidden")
        studioUndefDivs.style("display", "block");
        studioUndefDivs.style("visibility", "visible")
    }
    studioState = state;
}


// Load all the json data from data/map asynchronously and call the ready function to draw the map
d3.queue()
    // Countries
    .defer(d3.json, GEOJSON_PATH + "custom50_processed.json")
    .defer(d3.csv, COUNTRY_STAT_PATH + "country_num_users.csv")
    .defer(d3.csv, COUNTRY_STAT_PATH + "country_gender_balance.csv")
    .defer(d3.csv, COUNTRY_STAT_PATH + "country_users_ages.csv", function (d) {
        return {
            country: d.country,
            birth_year: +d.birth_year,
            num_users: +d.num_users,
        }
    })
    .defer(d3.csv, COUNTRY_STAT_PATH + "country_num_days_spent_watching_mean.csv")
    .defer(d3.csv, COUNTRY_STAT_PATH + "country_top_animes_3.csv/0.part")
    .defer(d3.csv, COUNTRY_STAT_PATH + "country_top_studios.csv/0.part")
    // Anime
    .defer(d3.csv, DATA_PATH + "anime_cleaned.csv")
    // Studios
    .defer(d3.csv, STUDIO_PATH + "studios_mal_clean.csv")
    .defer(d3.csv, STUDIO_STAT_PATH + "studio_country_num_ratings.csv/0.part")
    .defer(d3.csv, STUDIO_STAT_PATH + "studio_num_countries.csv/0.part")
    .defer(d3.csv, STUDIO_STAT_PATH + "studio_num_animes.csv")
    .defer(d3.csv, STUDIO_STAT_PATH + "studio_country_top_animes_3.csv/0.part")
    .await(ready);

/**
 * Draw the map and all the other elements.
 * 
 * @param {*} error  Error message
 * @param {*} geojsonData  Geojson data
 * @param {*} userData  Country-Number of users
 * @param {*} genderData Country-Gender balance
 * @param {*} ageData Country-Age distribution
 * @param {*} daysData Country-Mean number of days spent watching anime
 * @param {*} countryTopAnimes Country-Top 3 animes (most rated)
 * @param {*} countryTopStudios Country-Top studios (most rated)
 * @param {*} animeData Anime
 * @param {*} studioData Studio
 * @param {*} studioCountries Studio-Country-Number of ratings
 * @param {*} studioNumCountries Studio-Number of countries
 * @param {*} studioNumAnimes Studio-Number of animes
 * @param {*} studioCountryTopAnimes Studio-Country-Top 3 animes (most rated)
 */
function ready(error,
    geojsonData, userData, genderData, ageData, daysData, countryTopAnimes, countryTopStudios,
    animeData,
    studioData, studioCountries, studioNumCountries, studioNumAnimes, studioCountryTopAnimes,
) {
    if (error) throw error;

    // Prepare the data for the choropleth map
    for (let i = 0; i < geojsonData.features.length; i++) {
        let countryJSON = geojsonData.features[i].properties.admin;
        for (let j = 0; j < userData.length; j++) {
            let countryCSV = userData[j].country;
            let numUsers = userData[j].num_users;
            let rank = userData[j].rank;
            if (countryCSV == countryJSON) {
                geojsonData.features[i].properties.value = numUsers;
                geojsonData.features[i].properties.color = colorCountries(numUsers);
                geojsonData.features[i].properties.countRank = rank;
                break;
            }
        }
        geojsonData.features[i].properties.color = geojsonData.features[i].properties.color || "#ccc";
        geojsonData.features[i].properties.flag_path = FLAG_PATH + geojsonData.features[i].properties.iso_a2 + ".svg";
    }

    // Country selector
    countrySelector = createCountrySelector(geojsonData);
    countrySelector.on("change", function () {
        let countryFeature = geojsonData.features.find(d => d.properties.admin == this.value);
        if (!countryFeature) { // e.g. "Select a country..." is selected
            resetMap();
            return;
        }
        onCountryFocus(countryFeature, countryTopAnimes, animeData, countryTopStudios, genderData, ageData, daysData);
    })

    // Studio selector
    studioSelector = createStudioSelector(studioNumAnimes);
    studioSelector.on("change", function () {
        let studio = this.value;
        if (studio == STUDIO_SELECTOR_DEFAULT_OPTION) {
            resetMap();
            return;
        }
        onStudioFocus(studio, studioData, studioNumAnimes, studioCountries, studioNumCountries)
    })

    /* Draw the map */
    // Create an invisible background rectangle to catch zoom events
    countriesGroup.append("rect")
        .attr("width", MAP_WIDTH)
        .attr("height", MAP_HEIGHT)
        .attr("opacity", 0);

    // Bind data and create one path per GeoJSON feature
    countries = countriesGroup.selectAll("path")
        .data(geojsonData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", d => "country" + d.properties.iso_a2)
        .attr("class", "country")
        .style("fill", d => d.properties.color)
        .on("mouseover", function (d) {
            d3.select(this).style("fill", "#2c7bb6"); // Blue
            // Set the value of the country selector to be the country name
            countrySelector.property("value", d.properties.admin);
        })
        .on("mouseout", function (d) {
            // Reset the default color of the country
            if (studioFocus == false) {
                d3.select(this).style("fill", d => d.properties.color);
            } else {
                d3.select(this).style("fill", d => studioCountryNames.includes(d.properties.admin) ? "#0000ff" : "#ccc")
            }
        })
        .on("click", function (d) {
            if (studioFocus == false) {
                onCountryFocus(d, countryTopAnimes, animeData, countryTopStudios, genderData, ageData, daysData)
            } else {
                onStudioCountryFocus(d, animeData, studioCountryTopAnimes)
            }
        });

}

/**
 * Describes what happens on country focus mode (when a country is clicked or selected from the dropdown menu)
 * 
 * @param {*} countryFeature GeoJSON feature of the country
 * @param {*} countryTopAnimes Country-Top 3 animes (most rated)
 * @param {*} animeData Anime data
 * @param {*} countryTopStudios Country-Top studios (most rated)
 * @param {*} genderData Country-Gender balance
 * @param {*} ageData Country-Age distribution
 * @param {*} daysData Country-Mean number of days spent watching anime
 */
function onCountryFocus(countryFeature, countryTopAnimes, animeData, countryTopStudios, genderData, ageData, daysData) {
    countryFocus = true
    studioFocus = false
    studioSelector.property("value", "Select a studio...");

    studioCountryNames = []

    setStudioState("studio-undefined")
    // Color the countries according to the number of users
    countries.style("fill", d => d.properties.color);
    // Color the selected country in blue
    d3.select("#country" + countryFeature.properties.iso_a2)
        .style("fill", "#2c7bb6")
        .on("mouseover", null)
        .on("mouseout", null)

    // Zoom on the country
    boxZoom(path.bounds(countryFeature), path.centroid(countryFeature), 20);

    // Show info pane
    showCountryInfo(countryFeature, countryTopAnimes, animeData, countryTopStudios, genderData, ageData, daysData)
}


/**
 * Describes what happens on studio focus mode (when a studio is selected in the studio selector)
 * 
 * @param {*} studio The selected studio
 * @param {*} studioData Studio data
 * @param {*} studioNumAnimes Studio-Number of animes
 * @param {*} studioCountries Studio-Countries
 * @param {*} studioNumCountries Studio-Number of countries
 */
function onStudioFocus(studio, studioData, studioNumAnimes, studioCountries, studioNumCountries) {
    countryFocus = false
    studioFocus = true
    countrySelector.property("value", COUNTRY_SELECTOR_DEFAULT_OPTION);

    // Dezoom
    initZoom();

    studioCountries = studioCountries.filter(d => d.studio == studio);
    studioCountryNames = studioCountries.map(d => d.country);
    if (studioCountryNames.length == 0) {
        resetMap();
        return;
    }

    setCountryState("country-undefined")
    setStudioState("studio-defined")

    // Color all countries who have at least one anime from the selected studio in blue, the rest in gray
    countries.style("fill", d => studioCountryNames.includes(d.properties.admin) ? "#0000ff" : "#ccc")

    // Show info pane
    showStudioInfo(studio, studioData, studioNumAnimes, studioNumCountries)
}


/**
 * Describes what happens when a country is clicked on studio focus mode.
 *  
 * @param {*} countryFeature  GeoJSON feature of the country
 * @param {*} animeData  Anime data
 * @param {*} studioCountryTopAnimes Top animes of the selected studio for each country
 */
function onStudioCountryFocus(countryFeature, animeData, studioCountryTopAnimes) {
    let studio = studioSelector.property("value")
    let country = countryFeature.properties.admin

    // Color all countries who have at least one anime from the selected studio in blue, the rest in gray
    countries.style("fill", d => studioCountryNames.includes(d.properties.admin) ? "#0000ff" : "#ccc")
    // Color the selected country in blue
    
    d3.select("#country" + countryFeature.properties.iso_a2)
        .style("fill", "#2c7bb6")
        .on("mouseover", null)
        .on("mouseout", null)

    showStudioCountryInfo(studio, country, studioCountryTopAnimes, animeData)
}


/**
 * Initialize the map.
 */
function initMap() {
    initZoom()
}

/**
 * Reset the map to its initial state.
 */
function resetMap() {
    countryTab.show()

    countryFocus = false
    studioFocus = false

    countrySelector.property("value", COUNTRY_SELECTOR_DEFAULT_OPTION);
    studioSelector.property("value", STUDIO_SELECTOR_DEFAULT_OPTION);

    setCountryState("country-undefined")
    setStudioState("studio-undefined")

    // Dezoom
    initZoom();

    // Color the countries according to the number of users
    countries.style("fill", d => d.properties.color)
}

// Reset button
let resetBtn = d3.select("#map-reset-btn")
    .on("click", resetMap)

initMap();