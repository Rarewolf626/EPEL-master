d3.selectAll("#countryCounter").transition()
    .tween("text", function() {
        let node = this;
        const interpolator = d3.interpolateNumber(0, 204);
        return function(t) {
            d3.select(node).text(Math.round(interpolator(t)).toLocaleString("en-US"))
        };
    }).duration(2000);

d3.selectAll("#animeCounter").transition()
    .tween("text", function() {
        let node = this;
        const interpolator = d3.interpolateNumber(0, 14478);
        return function(t) {
            d3.select(node).text(Math.round(interpolator(t)).toLocaleString("en-US"))
        };
    }).duration(2000);

d3.selectAll("#userCounter").transition()
    .tween("text", function() {
        let node = this;
        const interpolator = d3.interpolateNumber(0, 302673);
        return function(t) {
            d3.select(node).text(Math.round(interpolator(t)).toLocaleString("en-US"))
        };
    }).duration(2000);


