const data_path = "../../data/";
const map_path = data_path + "graph3_map/";
const geojson_path = map_path + "geojson/";
const stat_path = map_path + "stats/";
const flag_path = map_path + "flags/";

const country_name_map = new Map([
    ["Bahamas", "The Bahamas"],
    ["Brunei Darussalam", "Brunei"],
    ["Cabo Verde", "Cape Verde"],
    ["Congo", "Republic of Congo"],
    ["Congo DRC", "Democratic Republic of the Congo"],
    ["Curacao", "Curaçao"],
    ["Côte d'Ivoire", "Ivory Coast"],
    ["Eswatini", "Swaziland"],
    ["North Macedonia", "Macedonia"],
    ["Palestinian Territory", "Palestine"],
    ["Pitcairn", "Pitcairn Islands"],
    ["Russian Federation", "Russia"],
    ["Serbia", "Republic of Serbia"],
    ["Tanzania", "United Republic of Tanzania"],
    ["US Virgin Islands", "United States Virgin Islands"],
    ["United States", "United States of America"],
    ["Vatican City", "Vatican"],
]);

let countryTabTriggerEl = document.querySelector('#country-tab')
let countryTab = new bootstrap.Tab(countryTabTriggerEl)

let studioTabTriggerEl = document.querySelector('#studio-tab')
let studioTab = new bootstrap.Tab(studioTabTriggerEl)
// var triggerTabList = [].slice.call(document.querySelectorAll('#myTab a'))
// triggerTabList.forEach(function (triggerEl) {
//     var tabTrigger = new bootstrap.Tab(triggerEl)

//     triggerEl.addEventListener('click', function (event) {
//         event.preventDefault()
//         tabTrigger.show()
//     })
// })


// DEFINE VARIABLES
// Define size of map group
const w = 870;
const h = 450;
// variables for catching min and max zoom factors
const minZoom = 1
const maxZoom = 10 * minZoom
// define X and Y offset for centre of map to be shown in centre of holder
const midX = (w - minZoom * w) / 2;
const midY = (h - minZoom * h) / 2;

// DEFINE FUNCTIONS/OBJECTS
// Define map projection
let projection = d3.geoNaturalEarth1()
// .center([0, 15]) // set centre to further North as we are cropping more off bottom of map
// .scale([w / (2 * Math.PI)]) // scale to fit group width
// .translate([w / 2, h / 2]) // ensure centred in group

// Define map path generator
let path = d3.geoPath()
    .projection(projection)

// Define a color scheme that is based on shades of red, to map to the country num_users
let color = d3.scaleLinear()
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

function getTextBox(selection) {
    selection.each(function (d) {
        d.bbox = this.getBBox();
    });
}

// Function that calculates zoom/pan limits and sets zoom to default value 
function initiateZoom() {
    // set extent of zoom to chosen values
    // set translate extent so that panning can't cause map to move out of viewport
    zoom.scaleExtent([minZoom, maxZoom]).translateExtent([[0, 0], [w, h]]);
    // change zoom transform to min zoom and centre offsets
    svg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
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
window.addEventListener("resize", function () {
    // Resize SVG
    svg.attr("width", clientWidth).attr("height", clientHeight);
    initiateZoom();
});

// Create an SVG
let svg = d3.select("#map-holder")
    .append("svg")
    .attr("width", clientWidth)
    .attr("height", clientHeight)
    // .attr("width", map_width)
    // .attr("height", map_height)
    .attr("viewBox", "100 0 " + w + " " + h)
    .attr("class", "svg-content")
// .call(zoom)


// Create a container in which all zoom-able elements will live
let countriesGroup = svg.append("g").attr("id", "map")
// .call(zoom)  //Bind the zoom behavior

// Load all the json data from data/map asynchronously
// and call the ready function to draw the map

d3.queue()
    .defer(d3.json, geojson_path + "custom50_processed.json")
    .defer(d3.csv, stat_path + "country_num_users.csv", function (d) {
        return {
            country: country_name_map.get(d.country) || d.country,
            country_aff: country_name_map.get(d.country_aff) || d.country_aff,
            num_users: +d.num_users
        }
    })
    .defer(d3.csv, stat_path + "country_gender_balance.csv", function (d) {
        return {
            country: country_name_map.get(d.country) || d.country,
            country_aff: country_name_map.get(d.country_aff) || d.country_aff,
            Female: +d.Female,
            Male: +d.Male,
            NonBinary: +d["Non-Binary"]
        }
    })
    .defer(d3.csv, stat_path + "country_users_ages.csv", function (d) {
        return {
            country: country_name_map.get(d.country) || d.country,
            country_aff: country_name_map.get(d.country_aff) || d.country_aff,
            birth_year: +d.birth_year,
            num_users: +d.num_users
        }
    })
    .defer(d3.csv, stat_path + "country_num_days_spent_watching_mean.csv", function (d) {
        return {
            country: country_name_map.get(d.country) || d.country,
            country_aff: country_name_map.get(d.country_aff) || d.country_aff,
            num_users: +d.num_users,
            num_days_spent_watching_mean: +d.num_days_spent_watching_mean
        }
    })
    .await(ready);

/**
 * 
 * @param {*} error 
 * @param {*} geojsonData 
 * @param {*} userData 
 * @param {*} genderData 
 * @param {*} ageData 
 * @param {*} daysData 
 */
function ready(error, geojsonData, userData, genderData, ageData, daysData) {
    if (error) throw error;

    /* General information */
    const totalCountries = userData.length;
    const totalUsers = d3.sum(userData, d => d.num_users);
    d3.select("#map-catchphrase")
        .text("A very diverse community: Over " + formatAsThousands(totalUsers) + " otakus in " + totalCountries + " countries.");
    // Same as above, but split the making of the text into different parts

    /* Draw the map */
    // 
    for (let i = 0; i < geojsonData.features.length; i++) {
        let countryJSON = geojsonData.features[i].properties.admin;
        for (let j = 0; j < userData.length; j++) {
            let countryCSV = userData[j].country;
            let numUsers = userData[j].num_users;
            if (countryCSV == countryJSON) {
                geojsonData.features[i].properties.value = numUsers;
                geojsonData.features[i].properties.color = color(numUsers);
                break;
            }
        }
        geojsonData.features[i].properties.color = geojsonData.features[i].properties.color || "#ccc";
        geojsonData.features[i].properties.flag_path = flag_path + geojsonData.features[i].properties.iso_a2 + ".svg";
    }

    // Create an invisible background rectangle to catch zoom events
    countriesGroup.append("rect")
        .attr("x", 100)
        .attr("y", 0)
        .attr("width", w) // 100%
        .attr("height", h) // 100%
        .attr("opacity", 0);

    // Bind data and create one path per GeoJSON feature
    let countries = countriesGroup.selectAll("path")
        .data(geojsonData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", d => "country" + d.properties.iso_a2_eh)
        .attr("class", "country")
        .style("fill", d => d.properties.color)
        .on("mouseover", function (d) {
            // Brighten the color on mouseover
            d3.select(this).style("fill", d => d3.rgb(d.properties.color).brighter(0.8));
            d3.select("#countryLabel" + d.properties.iso_a2_eh).style("display", "block");
        })
        .on("mouseout", function (d) {
            d3.select(this).style("fill", d => d.properties.color);
            d3.select("#countryLabel" + d.properties.iso_a2_eh).style("display", "none");
        })
        .on("click", function (d) {
            // Make the click event "overrdie" the mouseover event


            d3.selectAll(".country").classed("country-on", false);
            d3.select(this).classed("country-on", true);
            console.log(d)
            // focus on the country
            // focusOnCountry(d);
            boxZoom(path.bounds(d), path.centroid(d), 20);

            // show info pane
            showCountryInfo(d, genderData, ageData, daysData)

        });

    // Add country labels
    // createCountryLabels(geojsonData);

    // createZoomButtons();


    /* Country selector */
    createCountrySelector(userData, geojsonData, genderData, ageData, daysData);

    /* Country rankings */
    createCountryRankings(userData);


}
// kick off the demo
initiateZoom();

let btn = d3.select("#graph3").append("button").text("Reset")
btn.on("click", function () {
    svg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
})


function createCountryLabels(geojsonData) {
    // Add a label group to each feature/country. This will contain the country name and a background rectangle
    let countryLabels = countriesGroup.selectAll("g")
        .data(geojsonData.features)
        .enter()
        .append("g")
        .attr("class", "countryLabel")
        .attr("id", function (d) {
            return "countryLabel" + d.properties.iso_a2_eh;
        })
        .attr("transform", function (d) {
            return "translate(" + path.centroid(d)[0] + "," + path.centroid(d)[1] + ")"
        })
        // add mouseover functionality to the label
        .on("mouseover", function (d) {
            d3.select(this).style("display", "block");
        })
        .on("mouseout", function (d) {
            d3.select(this).style("display", "none");
        })
    // add an on click function to zoom into clicked country
    // .on("click", function (d) {
    //     d3.selectAll(".country").classed("country-on", false);
    //     d3.select("#country" + d.properties.iso_a2_eh).classed("country-on", true);
    //     boxZoom(path.bounds(d), path.centroid(d), 20);
    // });

    // add the text to the label group showing country name
    countryLabels
        .append("text")
        .attr("class", "countryName")
        .style("text-anchor", "middle")
        .attr("dx", 0)
        .attr("dy", 0)
        .text(d => d.properties.name)
        .call(getTextBox);

    // add a background rectangle the same size as the text
    countryLabels
        .insert("rect", "text")
        .attr("class", "countryLabelBg")
        .attr("transform", function (d) {
            return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";
        })
        .attr("width", function (d) {
            return d.bbox.width + 4;
        })
        .attr("height", function (d) {
            return d.bbox.height;
        });

    return countryLabels
}


function focusOnCountry(d) {
    let x, y, k;
    let centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    countriesGroup.transition()
        .duration(500)
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
}



//Create zoom buttons
function createZoomButtons() {

    //Create the clickable groups

    //Zoom in button
    let zoomIn = svg.append("g")
        .attr("class", "map_zoom")	//All share the 'zoom' class
        .attr("id", "in")		//The ID will tell us which direction to head
        .attr("transform", "translate(" + (w - 110) + "," + (h - 70) + ")");

    zoomIn.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 30)
        .attr("height", 30);

    zoomIn.append("text")
        .attr("x", 15)
        .attr("y", 20)
        .text("+");

    //Zoom out button
    let zoomOut = svg.append("g")
        .attr("class", "map_zoom")
        .attr("id", "out")
        .attr("transform", "translate(" + (w - 70) + "," + (h - 70) + ")");

    zoomOut.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 30)
        .attr("height", 30);

    zoomOut.append("text")
        .attr("x", 15)
        .attr("y", 20)
        .html("&ndash;");

    //Zooming interaction

    d3.selectAll(".map_zoom")
        .on("click", function () {

            //Set how much to scale on each click
            let scaleFactor;

            //Which way are we headed?
            let direction = d3.select(this).attr("id");

            //Modify the k scale value, depending on the direction
            switch (direction) {
                case "in":
                    scaleFactor = 1.5;
                    break;
                case "out":
                    scaleFactor = 0.75;
                    break;
                default:
                    break;
            }

            //This triggers a zoom event, scaling by 'scaleFactor'
            map.transition()
                .call(zoom.scaleBy, scaleFactor);

        });
};