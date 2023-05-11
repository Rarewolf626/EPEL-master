const data_path = "../../data/";
const map_path = data_path + "graph3_map/";
const geojson_path = map_path + "geojson/";
const stat_path = map_path + "stats/";

const div = d3.select("#graph3");
console.log(div)

// Create a map such that the key is "Czech Republic" and the value is "Czechia", etc.
const country_name_map = new Map([
    ["Czech Republic", "Czechia"],
    ["Bahamas", "The Bahamas"],
    ["Brunei Darussalam", "Brunei"],
    ["Congo", "Republic of the Congo"],
    ["Congo DRC", "Democratic Republic of the Congo"],
    ["Côte d'Ivoire", "Ivory Coast"],
    ["Palestinian Territory", "Palestine"],
    ["Russian Federation", "Russia"],
    ["Serbia", "Republic of Serbia"],
    ["Tanzania", "United Republic of Tanzania"],
    ["United States", "United States of America"]
]);


// Function that maps num_users to color
// arguments: a color scale, a data
// returns: a color
countToColor = function (color, d) {
    //Get data value
    let value = d.properties.value;

    if (value) {
        //If value exists…
        return color(value);
    } else {
        //If value is undefined…
        return "#ccc";
    }
}

//Number formatting for population values
let formatAsThousands = d3.format(",");  //e.g. converts 123456 to "123,456"

let btn = d3.select("#map-btn");
btn.on("click", function () {
    console.log("yes")
    map_update(true);
})

let infoPane = d3.select("#infoPane");


// Display the total number of countries and the total number of users

// Default country
let map_selectedCountry = "Switzerland";

/**
 * 
 * @param {*} countData 
 */
function createCountrySelector(countData) {
    let countrySelector = d3.select("#countrySelector");
    countrySelector.selectAll("option")
        .data(countData)
        .enter()
        .append("option")
        .attr("value", function (d) {
            return d["country"];
        })
        .text(function (d) {
            return d["country"];
        }) // Display the text in bold
        .exit();
    countrySelector.node().value = "Switzerland";
}

/**
 * 
 * @param {*} countData 
 */
function createCountryRankings(countData) {
    let rankTableBody = d3.select("#rankTable").select("tbody");

    let rankedCountries = countData.sort(function (a, b) {
        return parseInt(b.num_users) - parseInt(a.num_users);
    }).slice(0, 10);

    for (let i = 0; i < rankedCountries.length; i++) {
        /* Append a new element             
            <tr>
                <td>i+1</td>
                <td>top10Data[i].country</td>
                <td>top10Data[i].num_users</td>
            </tr>
        */
        let tr = rankTableBody.append("tr")
        tr.append("td").text(i + 1)
        tr.append("td").text(rankedCountries[i].country)
        tr.append("td").text(formatAsThousands(rankedCountries[i].num_users))
    }
}


const map_width = 870;
const map_height = 450;

const map_update = (filtered) => {
    // Load all the json data from data/map asynchronously
    // and call the ready function to draw the map

    d3.queue()
        .defer(d3.json, geojson_path + "custom.geo.json")
        .defer(d3.csv, stat_path + "country_num_users.csv", function (d) {
            return {
                country: country_name_map.get(d.country) || d.country,
                num_users: +d.num_users
            }
        })
        .defer(d3.csv, stat_path + "country_gender_balance.csv")
        .await(ready);

    function ready(error, geojsonData, countData, genderData) {
        if (error) throw error;

        console.log(geojsonData)
        console.log(countData)

        // General information
        const numCountries = countData.length;
        const numUsers = d3.sum(countData, function (d) {
            return d.num_users;
        });

        // infoPane.append("text").attr("id", "numCountries").text("Number of countries: " + numCountries);
        // infoPane.append("br");
        // infoPane.append("text").attr("id", "total").text("Number of otakus: " + formatAsThousands(numUsers));


        // Country selector
        createCountrySelector(countData);

        // Country rankings
        createCountryRankings(countData);

        /* Draw the map */

        //Define map projection
        let projection = d3.geoNaturalEarth1()

        //Define path generator
        let path = d3.geoPath()
            .projection(projection)

        // Define a color scheme that is based on shades of red, to map to the country num_users
        let color = d3.scaleLinear()
            .range(["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15"])
            .domain([0, 100]);

        // Create SVG element
        let svg = d3.select("#map")

        //Define what to do when panning or zooming
        let dragging = function (d) {

            //Log out d3.event.transform, so you can see all the goodies inside
            //console.log(d3.event.transform);

            //Get the current (pre-dragging) translation offset
            let offset = projection.translate();

            //Augment the offset, following the mouse movement
            offset[0] += d3.event.dx;
            offset[1] += d3.event.dy;

            //Update projection with new offset and scale
            projection.translate(offset)

            //Update all paths
            svg.selectAll("path")
                .attr("d", path);
        }


        //Define what to do when panning or zooming
        let zooming = function (d) {

            //Log out d3.event.transform, so you can see all the goodies inside
            //console.log(d3.event.transform);

            //New offset array
            var offset = [d3.event.transform.x, d3.event.transform.y];

            //Calculate new scale
            var newScale = d3.event.transform.k * 2000;

            //Update projection with new offset and scale
            projection.translate(offset)
                .scale(newScale);

            //Update all paths and circles
            svg.selectAll("path")
                .attr("d", path);
        }

        //Then define the zoom behavior
        let drag = d3.drag()
            // .scaleExtent([0.5, 12.0])  //This limits how far you can zoom in
            //.translateExtent([[-1000, -1000], [w + 10, h + 10]])  //This limits how far you can pan out
            .on("drag", dragging);

        let zoom = d3.zoom()
            .scaleExtent([0.5, 12.0])  //This limits how far you can zoom in
            .translateExtent([[-1000, -1000], [w + 10, h + 10]])  //This limits how far you can pan out
            .on("zoom", zooming);

        //The center of the country, roughly
        let center = projection([-97.0, 39.0]);

        //Create a container in which all zoom-able elements will live
        let map = svg.append("g")
            .attr("id", "map_group")
            .call(drag)  //Bind the drag behavior
        // .call(zoom)  //Bind the zoom behavior

        //Create a new, invisible background rect to catch zoom events
        map.append("rect")
            .attr("x", 100)
            .attr("y", 0)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("opacity", 0);

        //Merge the ag. data and GeoJSON
        //Loop through once for each ag. data value
        for (let i = 0; i < countData.length; i++) {

            //Grab state name
            let countryCSV = countData[i].country;

            //Grab data value, and convert to float
            let numUsers = parseFloat(countData[i].num_users);

            //Find the corresponding state inside the GeoJSON
            for (let j = 0; j < geojsonData.features.length; j++) {
                let countryJSON = geojsonData.features[j].properties.admin;
                if (countryCSV == countryJSON) {
                    //Copy the data value into the JSON
                    geojsonData.features[j].properties.value = numUsers;
                    //Stop looking through the JSON
                    break;
                }
            }
        }

        //Bind data and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(geojsonData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("stroke-width", "0.05px")
            .attr("stroke", "black")
            .filter(function (d) {
                if (filtered && d.properties.value < 1000) {
                    d.properties.value = 0;
                }
                return true;
            })
            .style("fill", function (d) {
                return countToColor(color, d)
            })
            .on("mouseover", function (d) {

                //d3.select("#rankTable").selectAll("*").remove();

                // Brighten the color on mouseover
                d3.select(this).style("fill", d => d3.rgb(countToColor(color, d)).brighter(0.8));

                // Get the country name and count
                let country = d.properties.admin;
                let count = d.properties.value;

                // Diplay the country name and count
                d3.select("#countryName").text(country);

                if (count) {
                    d3.select("#numAnimes").text(formatAsThousands(count)).append("i").text(" otakus");
                } else {
                    d3.select("#numAnimes").text("No otakus here :(");
                }
                // Display the tooltip
                d3.select("#tooltip").classed("hidden", false);


            })
            .on("mouseout", function (d) {
                d3.select(this).style("fill", d => countToColor(color, d));
                // empty #countryName and #numAnimes if country does not exist
                d3.select("#countryName").text("");
                d3.select("#numAnimes").text("");

                // Delete everything under div with id genderPieChart
                d3.select("#genderPieChart").selectAll("*").remove();

            })
            .on("click", function (d) {
                // don't stop event propagation
                d3.event.stopPropagation();

                // Get the country name and count
                let country = d.properties.admin;
                let count = d.properties.value;

                // Display the gender balance pie chart
                // Get the data corresponding to the country
                let countryData = genderData.find(d => d.country == country);
                if (!countryData) return;

                // set the dimensions and margins of the graph
                let width = 300
                let height = 300
                let margin = 40

                // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
                let radius = Math.min(width, height) / 2 - margin

                // Create a pie chart with countryData["Male"], countryData["Female"], countryData["Non-Binary"]
                let svg = d3.select("#genderPieChart")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                let genderBalance = { "Male": countryData["Male"], "Female": countryData["Female"], "Non-Binary": countryData["Non-Binary"] }

                // set the color scale
                let color = d3.scaleOrdinal().domain(genderBalance).range(d3.schemeDark2);

                // Compute the position of each group on the pie:
                let pie = d3.pie()
                    .value(function (d) { return d.value; })
                let data_ready = pie(d3.entries(genderBalance));

                // shape helper to build arcs:
                let arcGenerator = d3.arc()
                    .innerRadius(0)
                    .outerRadius(radius)

                // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
                svg
                    .selectAll('whatever')
                    .data(data_ready)
                    .enter()
                    .append('path')
                    .transition()
                    .duration(1000)
                    .attr('d', arcGenerator)
                    .attr('fill', function (d) { return (color(d.data.key)) })
                    .attr("stroke", "black")
                    .style("stroke-width", "2px")
                    .style("opacity", 0.7)

                // Now add the annotation. Use the centroid method to get the best coordinates
                svg
                    .selectAll('whatever')
                    .data(data_ready)
                    .enter()
                    .append('text')
                    .text(function (d) { return d.data.key })
                    .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
                    .style("text-anchor", "middle")
                    .style("font-size", 17)
                    .append('text')
                    .text(function (d) { return d.data.value })
                    .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
                    .style("text-anchor", "middle")
                    .style("font-size", 10)
                    .style("font-weight", "bold")
                // If click again, prevent the same pie chart from being appended again IF NO MOUSEOVER IN BETWEEN
            });
        // createZoomButtons();
    }

    //Create zoom buttons
    let createZoomButtons = function () {

        //Create the clickable groups

        //Zoom in button
        let zoomIn = svg.append("g")
            .attr("class", "map_zoom")	//All share the 'zoom' class
            .attr("id", "in")		//The ID will tell us which direction to head
            .attr("transform", "translate(" + (map_width - 110) + "," + (map_height - 70) + ")");

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
            .attr("transform", "translate(" + (map_width - 70) + "," + (map_height - 70) + ")");

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
}

map_update(false);