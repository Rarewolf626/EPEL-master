const data_path = "../../data/";
const map_path = data_path + "graph3_map/";
const geojson_path = map_path + "geojson/";
const stat_path = map_path + "stats/";

const country_num_users_path = stat_path + "country_num_users.csv";
// Function that maps num_users to color
// arguments: a color scale, a data
// returns: a color
countToColor = function (color, d) {
    //Get data value
    var value = d.properties.value;

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

// Display the top 10 countries in terms of num_users (country_num_users.csv); first column = name, second column = num_users
let rankTableBody = d3.select("#rankTable").select("tbody");
d3.csv(country_num_users_path, function (data) {
    let rankedCountries = data.sort(function (a, b) {
        return parseInt(b.num_users) - parseInt(a.num_users);
    }).slice(0, 10);

    for (var i = 0; i < rankedCountries.length; i++) {
        /* Append a new element             
            <tr>
                <td>i</td>
                <td>top10Data[i].country</td>
                <td>top10Data[i].num_users</td>
            </tr>
        */
        let tr = rankTableBody.append("tr")
        tr.append("td").text(i + 1)
        tr.append("td").text(rankedCountries[i].country)
        tr.append("td").text(formatAsThousands(rankedCountries[i].num_users))
    }
});


// Display the total number of countries and the total number of users

// Default country
let map_selectedCountry = "Switzerland";

const map_update = (filtered) => {

    const w = 870;
    const h = 450;

    // Load all the json data from data/map asynchronously
    // and call the ready function to draw the map


    d3.queue()
        .defer(d3.json, geojson_path + "world.geojson")
        .defer(d3.csv, country_num_users_path, function (data) {
            // Change the rows
            // data.forEach(function (d) {
            //     if (d.country == "Czech Republic") {
            //         d.country = "Czechia";
            //     } else if (d.country == "Bahamas") {
            //         d.country = "The Bahamas";
            //     } else if (d.country == "Brunei Darussalam") {
            //         d.country = "Brunei";
            //     } else if (d.country == "Congo") {
            //         d.country = "Republic of the Congo";
            //     } else if (d.country == "Congo DRC") {
            //         d.country = "Democratic Republic of the Congo";
            //     } else if (d.country == "Côte d'Ivoire") {
            //         d.country = "Ivory Coast";
            //     } else if (d.country == "Palestinian Territory") {
            //         d.country = "Palestine";
            //     } else if (d.country == "Russian Federation") {
            //         d.country = "Russia";
            //     } else if (d.country == "Serbia") {
            //         d.country = "Republic of Serbia";
            //     } else if (d.country == "Tanzania") {
            //         d.country = "United Republic of Tanzania";
            //     } else if (d.country == "United States") {
            //         d.country = "United States of America";
            //     }

            //     // Calculate the same values again but in a cleaner way:
            //     // x users from y countries
            //     // let numCountries = data.length;
            //     // let numUsers = d3.sum(data, function (d) { return parseInt(d.num_users); });
            // });
        }).await(ready);
    // x users from y countries
    // infoPane.append("text").attr("id", "numCountries").text("Number of countries: " + numCountries);
    // infoPane.append("br");
    // infoPane.append("text").attr("id", "total").text("Number of otakus: " + formatAsThousands(numUsers));

    function ready(error, data) {
        if (error) throw error;
        console.log(data)
        let countrySelector = d3.select("#countrySelector");

        d3.csv(stat_path + "country_num_users.csv", function (data) {
            console.log(data)
            countrySelector.selectAll("option")
                .data(data)
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
        });


        // When selecting a country, retrieve the data and update the map


        //Define map projection
        let projection = d3.geoNaturalEarth1()

        //Define path generator
        let path = d3.geoPath()
            .projection(projection)

        // Define a color scheme that is based on shades of red, to map to the country num_users
        let color = d3.scaleLinear()
            .range(["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15"]);

        //Define quantize scale to sort data values into buckets of color
        // var color = d3.scaleQuantize()
        // .range(["rgb(237,248,233)", "rgb(186,228,179)", "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);
        //Colors derived from ColorBrewer, by Cynthia Brewer, and included in
        //https://github.com/d3/d3-scale-chromatic

        // Create SVG element
        let svg = d3.select("#map")

        //Define what to do when panning or zooming
        let zooming = function (d) {

            //Log out d3.event.transform, so you can see all the goodies inside
            //console.log(d3.event.transform);

            //New offset array
            var offset = [d3.event.transform.x, d3.event.transform.y];

            //Calculate new scale
            var newScale = d3.event.transform.k * 300;

            //Update projection with new offset and scale
            projection.translate(offset)
                .scale(newScale);

            //Update all paths and circles
            svg.selectAll("path")
                .attr("d", path);
        }

        //Then define the zoom behavior
        let zoom = d3.zoom()
            .scaleExtent([0.5, 12.0])  //This limits how far you can zoom in
            //.translateExtent([[-1000, -1000], [w + 10, h + 10]])  //This limits how far you can pan out
            .on("zoom", zooming);

        //The center of the country, roughly
        var center = projection([-97.0, 39.0]);

        //Create a container in which all zoom-able elements will live
        let map = svg.append("g")
            .attr("id", "mapG")
            .call(zoom)  //Bind the zoom behavior

        //Create a new, invisible background rect to catch zoom events
        map.append("rect")
            .attr("x", 100)
            .attr("y", 0)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("opacity", 0);


        //Load in agriculture data
        d3.csv(country_num_users_path, function (data) {

            //Set input domain for color scale
            color.domain([
                d3.min(data, function (d) { return d.num_users; }),
                d3.max(data, function (d) { return d.num_users; })
            ]);

            //Load in GeoJSON data
            d3.json(geojson_path + "custom.geo.json", function (json) {

                //Merge the ag. data and GeoJSON
                //Loop through once for each ag. data value
                for (var i = 0; i < data.length; i++) {

                    //Grab state name
                    var dataName = data[i].country;

                    //Grab data value, and convert from string to float
                    var dataCounts = parseFloat(data[i].num_users);

                    //Find the corresponding state inside the GeoJSON
                    for (var j = 0; j < json.features.length; j++) {
                        var jsonName = json.features[j].properties.admin;
                        if (dataName == jsonName) {
                            //Copy the data value into the JSON
                            json.features[j].properties.value = dataCounts;
                            //Stop looking through the JSON
                            break;
                        }
                    }
                }

                //Bind data and create one path per GeoJSON feature
                svg.selectAll("path")
                    .data(json.features)
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

                        d3.select("#rankTable").selectAll("*").remove();

                        // Brighten the color on mouseover
                        d3.select(this).style("fill", d => d3.rgb(countToColor(color, d)).brighter(0.8));

                        // Get the country name and count
                        var country = d.properties.admin;
                        var count = d.properties.value;

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
                        d3.csv(stat_path + "country_gender_balance.csv", function (data) {
                            // Get the data corresponding to the country
                            let countryData = data.find(d => d.country == country);
                            if (!countryData) return;

                            // set the dimensions and margins of the graph
                            let width = 300
                            let height = 300
                            let margin = 40

                            // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
                            var radius = Math.min(width, height) / 2 - margin

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
                            var arcGenerator = d3.arc()
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
                        });
                        // If click again, prevent the same pie chart from being appended again IF NO MOUSEOVER IN BETWEEN
                    });
            });
        });
    }
}

map_update(false);