// Function that maps counts to color
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

let countrySelector = d3.select("#countrySelector");
let btn = d3.select("#map-btn");
btn.on("click", function () {
    console.log("yes")
    map_update(true);
})

// Default country
let map_selectedCountry = "Switzerland";

const map_update = (filtered) => {

    const w = 870;
    const h = 450;

    //Number formatting for population values
    let formatAsThousands = d3.format(",");  //e.g. converts 123456 to "123,456"

    let infoPane = d3.select("#infoPane");

    d3.queue()
        .defer(d3.json, "data/map/world.geojson")
        .defer(d3.csv, "data/country_counts.csv", function (data) {
            if (data.COUNTRY == map_selectedCountry) {

            }

            // let numCountries = 0;
            // let numUsers = 0;
            // for (var i = 0; i < data.length; i++) {
            //     numCountries++;
            //     numUsers += parseInt(data[i].counts)
            // }


            // Calculate the same values again but in a cleaner way:
            // x users from y countries
            let numCountries = data.length;
            let numUsers = d3.sum(data, function (d) { return parseInt(d.counts); });
        }).await(ready);
    // x users from y countries
    // infoPane.append("text").attr("id", "numCountries").text("Number of countries: " + numCountries);
    // infoPane.append("br");
    // infoPane.append("text").attr("id", "total").text("Number of otakus: " + formatAsThousands(numUsers));

    function ready(error, data) {
        if (error) throw error;
        console.log(data)

        d3.csv("data/country_counts.csv", function (data) {
            console.log(data)
            countrySelector.selectAll("option")
                .data(data)
                .enter()
                .append("option")
                .attr("value", function (d) {
                    return d["COUNTRY"];
                })
                .text(function (d) {
                    return d["COUNTRY"];
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

        // Define a color scheme that is based on shades of red, to map to the country counts
        let color = d3.scaleLinear()
            .range(["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15"]);

        //Define quantize scale to sort data values into buckets of color
        // var color = d3.scaleQuantize()
        // .range(["rgb(237,248,233)", "rgb(186,228,179)", "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);
        //Colors derived from ColorBrewer, by Cynthia Brewer, and included in
        //https://github.com/d3/d3-scale-chromatic




        //Create SVG element
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
            .scaleExtent([0.5, 4.0])  //This limits how far you can zoom in
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
        d3.csv("data/country_counts.csv", function (data) {

            //Set input domain for color scale
            color.domain([
                d3.min(data, function (d) { return d.counts; }),
                d3.max(data, function (d) { return d.counts; })
            ]);

            //Load in GeoJSON data
            d3.json("data/map/custom.geo.json", function (json) {

                //Merge the ag. data and GeoJSON
                //Loop through once for each ag. data value
                for (var i = 0; i < data.length; i++) {

                    //Grab state name
                    var dataName = data[i].COUNTRY;

                    //Grab data value, and convert from string to float
                    var dataCounts = parseFloat(data[i].counts);

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
                        // Brighten the color on mouseover
                        d3.select(this).style("fill", d => d3.rgb(countToColor(color, d)).brighter(0.8));

                        // Get the country name and count
                        var country = d.properties.admin;
                        var count = d.properties.value;

                        // Diplay the country name and count
                        d3.select("#countryName").text(country);

                        if (count) {
                            // If count exists, display the count
                            d3.select("#numAnimes").text(formatAsThousands(count)).append("i").text(" otakus");
                        } else {
                            // If count does not exist, display "N/A"
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
                    })
                    .on("click", function (d) {
                        // don't stop event propagation
                        d3.event.stopPropagation();

                        console.log(d.properties.admin);
                        console.log(d.properties.value);
                        console.log(d);;
                    });
            });
        });

        // d3.json("data/map/oceans.json", function (json) {

        //     //Bind data and create one path per GeoJSON feature
        //     svg.selectAll("path")
        //         .data(json.features)
        //         .enter()
        //         .append("path")
        //         .attr("d", path)
        //         .style("fill", "steelblue");

        // });
    }
}

map_update(false);

// Subsequently update map whenever year is changed.
const map_changeCountry = () => {
    map_selectedCountry = document.getElementById('countrySelector').value;

    // map_selectedYear = document.getElementById('year').value;
    // map_update();
    // scatter_changeYear();
    // bar_changeYear(map_selectedYear);
    // radar_changeYear(map_selectedYear);
};