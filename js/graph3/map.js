const data_path = "../../data/";
const studio_path = data_path + "studios/";

const map_path = data_path + "graph3_map/";
const geojson_path = map_path + "geojson/";
const flag_path = map_path + "flags/";
const stat_path = map_path + "stats/";
const studio_stat_path = stat_path + "studios/";
const country_stat_path = stat_path + "countries/";

let countryTabTriggerEl = document.querySelector('#country-tab')
let countryTab = new bootstrap.Tab(countryTabTriggerEl)

let studioTabTriggerEl = document.querySelector('#studio-tab')
let studioTab = new bootstrap.Tab(studioTabTriggerEl)

// DEFINE VARIABLES
// Define size of map group
const w = 870;
const h = 450;
// variables for catching min and max zoom factors
const minZoom = 1
const maxZoom = 20 * minZoom
// define X and Y offset for centre of map to be shown in centre of holder
const midX = (w - minZoom * w) / 2;
const midY = (h - minZoom * h) / 2;

// DEFINE FUNCTIONS/OBJECTS
// Define map projection
let projection = d3.geoNaturalEarth1()

// Define map path generator
let path = d3.geoPath()
    .projection(projection)

// Define a color scheme that is based on shades of red, to map to the country num_users
let colorCountries = d3.scaleLinear()
    .range(["#fee5d9", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704", "#7f2704"])
    // .range(["#fee5d9", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"])
    .domain([0, 100]);

// When zooming, update projection with new offset and new scale
function zoomed() {
    let t = d3.event.transform;
    countriesGroup.attr("transform", "translate(" + [t.x, t.y] + ")scale(" + t.k + ")");
}

// Define map zoom behavior
let zoom = d3.zoom()
    .on("zoom", zoomed);


// Function that calculates zoom/pan limits and sets zoom to default value 
function initiateZoom() {
    // set extent of zoom to chosen values
    // set translate extent so that panning can't cause map to move out of viewport
    zoom.scaleExtent([minZoom, maxZoom]).translateExtent([[0, 0], [w, h]]);
    // change zoom transform to min zoom and centre offsets
    svg
        .transition()
        .duration(1000)
        .call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
}

// zoom to show a bounding box, with optional additional padding as percentage of box size
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
    let maxXscale = w / zoomWidth;
    let maxYscale = h / zoomHeight;
    let zoomScale = Math.min(maxXscale, maxYscale);
    // handle some edge cases
    // limit to max zoom (handles tiny countries)
    zoomScale = Math.min(zoomScale, maxZoom);
    // limit to min zoom (handles large countries and countries that span the date line)
    zoomScale = Math.max(zoomScale, minZoom);
    // Find screen pixel equivalent once scaled
    let offsetX = zoomScale * zoomMidX;
    let offsetY = zoomScale * zoomMidY;
    // Find offset to centre, making sure no gap at left or top of holder
    let dleft = Math.min(0, w / 2 - offsetX);
    let dtop = Math.min(0, h / 2 - offsetY);
    // Make sure no gap at bottom or right of holder
    dleft = Math.max(w - w * zoomScale, dleft);
    dtop = Math.max(h - h * zoomScale, dtop);
    // set zoom
    svg.transition()
        .duration(500)
        .call(zoom.transform, d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale));
}

const clientWidth = d3.select("#map-holder").node().clientWidth;
const clientHeight = d3.select("#map-holder").node().clientHeight;

// on window resize
// window.addEventListener("resize", function () {
//     // Resize SVG
//     svg.attr("width", clientWidth).attr("height", clientHeight);
//     initiateZoom();
// });

// Create an SVG
let svg = d3.select("#map-holder")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    // .attr("width", map_width)
    // .attr("height", map_height)
    // .attr("viewBox", "100 100 " + w + " " + h)
    .attr("class", "svg-content")
// .call(zoom)

// d3.select("#info-pane-map")
// .attr("width", w)
// .attr("height", h)

// Create a container in which all zoom-able elements will live
let countriesGroup = svg.append("g").attr("id", "map")

// .call(zoom)  //Bind the zoom behavior

// Load all the json data from data/map asynchronously
// and call the ready function to draw the map
d3.queue()
    .defer(d3.json, geojson_path + "custom50_processed.json")
    // Country stats
    .defer(d3.csv, country_stat_path + "country_num_users.csv")
    .defer(d3.csv, country_stat_path + "country_gender_balance.csv")
    .defer(d3.csv, country_stat_path + "country_users_ages.csv", function (d) {
        return {
            country: d.country,
            birth_year: +d.birth_year,
            num_users: +d.num_users,
        }
    })
    .defer(d3.csv, country_stat_path + "country_num_days_spent_watching_mean.csv")
    .defer(d3.csv, country_stat_path + "country_top_animes_3.csv/0.part")
    .defer(d3.csv, country_stat_path + "country_top_studios.csv/0.part")
    // Animes
    .defer(d3.csv, data_path + "anime_cleaned.csv")
    // Studios
    .defer(d3.csv, studio_path + "studios_mal_clean.csv", function (d) {
        return {
            id: d.id,
            name_en: d.studio_en,
            name_ja: d.studio_ja,
            logo_url: d.logo_url,
        }
    })
    // Studio stats
    .defer(d3.csv, studio_stat_path + "studio_country_num_ratings.csv/0.part")
    .defer(d3.csv, studio_stat_path + "studio_num_animes.csv")
    // Studio-country stats
    .defer(d3.csv, studio_stat_path + "studio_country_top_animes_3.csv/0.part")
    .await(ready);

let country_focus = false
let studio_focus = false
let countries;
let studio_country_names = [];
let countrySelector;
let studioSelector

function ready(error,
    geojsonData, userData, genderData, ageData, daysData, topAnimesData, topStudioData,
    animeData,
    studioData,
    studioCountriesData, studioNumAnimesData,
    studioCountryTopAnimeData,
) {
    if (error) throw error;

    /* General information */
    const totalCountries = userData.length;
    const totalUsers = d3.sum(userData, d => d.num_users);
    d3.select("#map-catchphrase")
        .text("A very diverse community: Over " + formatAsThousands(totalUsers) + " otakus in " + totalCountries + " countries.");
    // Same as above, but split the making of the text into different parts

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
        geojsonData.features[i].properties.flag_path = flag_path + geojsonData.features[i].properties.iso_a2 + ".svg";
    }

    /* Country selector */
    countrySelector = createCountrySelector(geojsonData);
    countrySelector.on("change", function () {
        let countryFeature = geojsonData.features.find(d => d.properties.admin == this.value);
        if (!countryFeature) { // e.g. "Select a country..." is selected
            resetMap();
            return;
        }
        onCountryFocus(countryFeature, topAnimesData, animeData, topStudioData, genderData, ageData, daysData);
    })

    /* Studio selector */
    studioSelector = createStudioSelector(studioNumAnimesData);
    studioSelector.on("change", function () {
        let studio = this.value;

        onStudioFocus(studio, studioData, studioNumAnimesData, animeData, studioCountryTopAnimeData, studioCountriesData)
    })

    /* Draw the map */
    // Create an invisible background rectangle to catch zoom events
    countriesGroup.append("rect")
        // .attr("x", 100)
        // .attr("y", 100)
        .attr("width", w) // 100%
        .attr("height", h) // 100%
        .attr("opacity", 0);

    // Bind data and create one path per GeoJSON feature
    countries = countriesGroup.selectAll("path")
        .data(geojsonData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", function (d) {
            return "country" + d.properties.iso_a2
        })
        .attr("class", "country")
        .style("fill", d => d.properties.color)
        .on("mouseover", function (d) {
            if (studio_focus == false) {
                // Color in blue on mouseover
                d3.select(this).style("fill", "#2c7bb6");
            } else {
                // Color in light blue on mouseover
                d3.select(this).style("fill", "#a6cee3");
            }

            // Set the value of the country selector to be the country name
            countrySelector.property("value", d.properties.admin);
        })
        .on("mouseout", function (d) {
            if (studio_focus == false) {
                d3.select(this).style("fill", d => d.properties.color);
            } else {
                d3.select(this).style("fill", d => studio_country_names.includes(d.properties.admin) ? "#0000ff" : "#ccc")
            }
        })
        .on("click", function (d) {
            if (studio_focus == false) {
                onCountryFocus(d, topAnimesData, animeData, topStudioData, genderData, ageData, daysData)
            } else {
                // I selected a country while in studio focus mode
                onStudioCountryFocus()
            }
        });

    // createZoomButtons();
}


function onCountryFocus(countryFeature, topAnimesData, animeData, topStudios, genderData, ageData, daysData) {
    country_focus = true
    studio_focus = false
    studio_country_names = []
    studioSelector.property("value", "Select a studio...");

    let countryPath = d3.select("#" + "country" + countryFeature.properties.iso_a2);
    // d3.select(countryPath).style("fill", "orange");

    // Zoom on the country
    boxZoom(path.bounds(countryFeature), path.centroid(countryFeature), 20);

    // Show info pane
    showCountryInfo(countryFeature, topAnimesData, animeData, topStudios, genderData, ageData, daysData)
    // Select all the second th of the table and add a "a" that wen clicked, sets the studio selector to the corresponding studio 
    d3.select("#country-top-studios")
        .selectAll("td:nth-child(2) a")
        .attr("onclick", d => "studioSelector.property(\"value\", \"" + d.studio + "\"); updateStudioInfo();")
}


function onStudioFocus(studio, studioData, studioNumAnimesData, animeData, studioTopAnimeData, studioCountriesData) {
    country_focus = false
    studio_focus = true

    countrySelector.property("value", "Select a country...");
    studio_country_names = studioCountriesData.filter(d => d.studio == studio).map(d => d.country);
    if (studio_country_names.length == 0) { // e.g. "Select a studio..." is selected
        resetMap();
        return;
    }
    // Color all countries who have at least one anime from the selected studio in blue, the rest in gray
    countries.style("fill", d => studio_country_names.includes(d.properties.admin) ? "#0000ff" : "#ccc")

    initiateZoom();

    // Show info pane
    showStudioInfo(studio, studioData, studioNumAnimesData, animeData, studioTopAnimeData, studioCountriesData)
}

function onStudioCountryFocus() {
}

function resetMap() {
    country_focus = false
    studio_focus = false

    initiateZoom();

    // color the countries according to the number of users
    countries.style("fill", d => d.properties.color)

    countrySelector.property("value", "Select a country...");
    studioSelector.property("value", "Select a studio...");

}

let btn = d3.select("#map-reset-btn")
btn.on("click", function () {
    resetMap();
})

function initMap() {
    initiateZoom()
    initializeGenderChart()
}
initMap();