// DEFINE VARIABLES
// Define size of map group
// Full world map is 2:1 ratio
// Using 12:5 because we will crop top and bottom of map
const w = 3000;
const h = 1250;
// variables for catching min and max zoom factors
let minZoom;
let maxZoom;

// DEFINE FUNCTIONS/OBJECTS
// Define map projection
let projection = d3.geoEquirectangular()
    .center([0, 15]) // set centre to further North as we are cropping more off bottom of map
    .scale(w / (2 * Math.PI)) // scale to fit group width
    .translate([w / 2, h / 2]); // ensure centred in group

// Define map path
let path = d3.geoPath()
    .projection(projection);

// Create function to apply zoom to countriesGroup
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
    // Define a "minzoom" whereby the "Countries" is as small possible without leaving white space at top/bottom or sides
    minZoom = Math.max(svg.node().getBoundingClientRect().width / w, svg.node().getBoundingClientRect().height / h);
    // set max zoom to a suitable factor of this value
    maxZoom = 20 * minZoom;
    // set extent of zoom to chosen values
    // set translate extent so that panning can't cause map to move out of viewport
    zoom.scaleExtent([minZoom, maxZoom]).translateExtent([[0, 0], [w, h]]);
    // define X and Y offset for centre of map to be shown in centre of holder
    let midX = (svg.node().getBoundingClientRect().width - minZoom * w) / 2;
    let midY = (svg.node().getBoundingClientRect().height - minZoom * h) / 2;
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
    let maxXscale = svg.node().getBoundingClientRect().width / zoomWidth;
    let maxYscale = svg.node().getBoundingClientRect().height / zoomHeight;
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
    let dleft = Math.min(0, svg.node().getBoundingClientRect().width / 2 - offsetX);
    let dtop = Math.min(0, svg.node().getBoundingClientRect().height / 2 - offsetY);
    // Make sure no gap at bottom or right of holder
    dleft = Math.max(svg.node().getBoundingClientRect().width - w * zoomScale, dleft);
    dtop = Math.max(svg.node().getBoundingClientRect().height - h * zoomScale, dtop);
    // set zoom
    svg.transition()
        .duration(500)
        .call(zoom.transform, d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale));
}

// on window resize
window.addEventListener("resize", function () {
    // Resize SVG
    svg.attr("width", document.getElementById("map-holder").clientWidth)
        .attr("height", document.getElementById("map-holder").clientHeight);
    initiateZoom();
});

// create an SVG
let svg = d3.select("#map-holder")
    .append("svg")
    // set to the same size as the "map-holder" div
    .attr("width", document.getElementById("map-holder").clientWidth)
    .attr("height", document.getElementById("map-holder").clientHeight)
    // add zoom functionality
    .call(zoom);

// Bind data and create one path per GeoJSON feature
let countriesGroup = svg.append("g").attr("id", "map");

// get map data
d3.json("https://raw.githubusercontent.com/andybarefoot/andybarefoot-www/master/maps/mapdata/custom50.json", function (error, json) {
    if (error) throw error;

    // // Bind data and create one path per GeoJSON feature
    // let countriesGroup = svg.append("g").attr("id", "map");

    // add a background rectangle
    countriesGroup.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w)
        .attr("height", h);

    // draw a path for each feature/country
    let countries = countriesGroup.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", function (d) {
            return "country" + d.properties.iso_a3;
        })
        .attr("class", "country")
        .on("mouseover", function (d) {
            d3.select("#countryLabel" + d.properties.iso_a3).style("display", "block");
        })
        .on("mouseout", function (d) {
            d3.select("#countryLabel" + d.properties.iso_a3).style("display", "none");
        })
        .on("click", function (d) {
            d3.selectAll(".country").classed("country-on", false);
            d3.select(this).classed("country-on", true);
            boxZoom(path.bounds(d), path.centroid(d), 20);
        });

    // Add a label group to each feature/country. This will contain the country name and a background rectangle
    let countryLabels = countriesGroup.selectAll("g")
        .data(json.features)
        .enter()
        .append("g")
        .attr("class", "countryLabel")
        .attr("id", function (d) {
            return "countryLabel" + d.properties.iso_a3;
        })
        .attr("transform", function (d) {
            return (
                "translate(" + path.centroid(d)[0] + "," + path.centroid(d)[1] + ")"
            );
        })
        // add mouseover functionality to the label
        .on("mouseover", function (d) {
            d3.select(this).style("display", "block");
        })
        .on("mouseout", function (d) {
            d3.select(this).style("display", "none");
        })
        // add an on click function to zoom into clicked country
        .on("click", function (d) {
            d3.selectAll(".country").classed("country-on", false);
            d3.select("#country" + d.properties.iso_a3).classed("country-on", true);
            boxZoom(path.bounds(d), path.centroid(d), 20);
        });

    // add the text to the label group showing country name
    countryLabels
        .append("text")
        .attr("class", "countryName")
        .style("text-anchor", "middle")
        .attr("dx", 0)
        .attr("dy", 0)
        .text(function (d) {
            return d.properties.name;
        })
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
});

// kick off the demo
initiateZoom();