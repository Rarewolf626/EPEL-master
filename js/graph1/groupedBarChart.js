let base = Array(23).fill(["", 0]).map(function (d, i) {
    return d.concat([i]);
});
const w = 500;
const h = 500;
const topIndexes = [0, 5, 10, 15, 20];
const padding = 0;
const tr_duration = 450
const bar_legends_y = 630

let yScale = d3.scaleBand()
    .domain(base.map(function (x) {
        return x[2]
    }))
    .rangeRound([0, h - padding])
    .paddingInner(0.00);


let xScale = d3.scaleLinear()
    .domain([0, 0])
    .range([0, w]);

let tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "15")
    .style("visibility", "hidden")
    .style("color", "black");


const svgGroupedBarPlot = d3.select("#circle_packing_desc").attr("height", "650").attr("width", "630").append("g").attr("transform", "translate(" + 130 + "," + 27 + ")");

let xAxis = null;
let yAxis = null;

let BrowserText = (function () {
    let canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');

    function getWidth(text, fontSize, fontFace) {
        context.font = fontSize + 'px ' + fontFace;
        return context.measureText(text).width;
    }

    return {
        getWidth: getWidth
    };
})();

function drawAxes(nb) {

    xAxis = svgGroupedBarPlot.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + (h) + ")")
        .call(d3.axisBottom(xScale).ticks(6).tickSizeOuter(0)).style("opacity", 0);

    svgGroupedBarPlot.append("text")
        .attr("class", "xAxis_Label")
        .attr("transform", "translate(" + (w / 2) + "," + (h + 40) + ")") // Adjust the position as needed
        .style("text-anchor", "middle")
        .text("proportion of ratings")
        .attr("fill", "black")
        .style("opacity", 0);


    yAxis = svgGroupedBarPlot.append("g")
        .attr("class", "yAxis")
        .call(d3.axisLeft(yScale).tickSizeOuter(0).tickFormat(function (d) {
            return "Top " + ((d - d % 5) / 5 + 1);
        })).style("opacity", 0);

    yAxis.selectAll("text")
        .style("text-anchor", "end")
        .attr("fill", "black");

    if (nb == 2) {
        yAxis.selectAll("text")
            .attr("transform", "translate(-10," + (yScale.bandwidth() / 2) + ")")
            .filter(function (d, i) {
                return !topIndexes.includes(i);
            })
            .remove();
    }
    else if (nb == 3) {
        yAxis.selectAll("text")
            .attr("transform", "translate(-10,0)")
            .filter(function (d, i) {
                return !topIndexes.includes(i - 1);
            })
            .remove();
    }
    else if (nb == 1) {
        yAxis.selectAll("text")
            .attr("transform", "translate(-10,0)")
            .filter(function (d, i) {
                return !topIndexes.includes(i);
            })
            .remove();
    }


    xAxis.selectAll(".tick line")
        .attr("stroke", "black");

    yAxis.selectAll(".tick line")
        .attr("stroke", "#efefef");

    xAxis.selectAll("text")
        .style("fill", "black").style("font-size", "12px");

    yAxis.selectAll("text")
        .style("fill", "black").style("font-size", "15px");

    xAxis.select(".domain")
        .attr("stroke", "black");

    yAxis.select(".domain")
        .attr("stroke", "#efefef");
}

function removeAxes() {
    if (xAxis) {
        xAxis.remove();
        xAxis = null;
    }
    if (yAxis) {
        yAxis.selectAll("text").remove()
        yAxis.remove();
        yAxis = null;
    }
}

function colorCycle(nb) {
    let colors = [];
    if (nb == 1) {
        colors = ["#1b9e77", "#d95f02", "#d95f02", "#d95f02", "#d95f02"]
    }
    else if (nb == 2) {
        colors = ["#1b9e77", "#d95f02", "#377eb8", "#377eb8", "#377eb8"]
    }
    else {
        colors = ["#1b9e77", "#d95f02", "#377eb8", "white", "white"]
    }
    const N = colors.length;
    let i = 0;
    return () => {
        const color = colors[i % N]
        i++
        return color
    };
}

let bar = svgGroupedBarPlot.selectAll("g-bar")
    .data(base)
    .enter()
    .append("g");

bar.append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", function (d, i) {
        return yScale(i);
    })
    .attr("width", function (d) {
        return xScale(d[1]);
    })
    .attr("height", function (d) {
        return yScale.bandwidth();
    })
    .attr("fill", colorCycle())
    .on("mouseover", function (d) {
        tooltip.text(d[0]); 
        if (BrowserText.getWidth(d[0], 14, 'Arial') > xScale(d[1])) {
            tooltip.style("visibility", "visible");
        }
    })
    .on("mousemove", function (d) { tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px"); })
    .on("mouseout", function (d) { tooltip.style("visibility", "hidden"); });

bar.append("text")
    .attr("class", "bar_labels")
    .attr("opacity", "70%")
    .attr("dy", "1.2em")
    .attr("text-anchor", "left")
    .text(function (d) { return d[0]; })
    .style("fill", "white")
    .attr("x", 20)
    .attr("y", function (d, i) {
        return yScale(i) - yScale.bandwidth()/6;
    }).style("opacity", 0);

function drawBarLegends(nb, colorsText) {
    let legendCycle = colorCycle(nb);
    svgGroupedBarPlot.append("circle").attr("class", "bar_color_circle").attr("cx", 0).attr("cy", bar_legends_y).style("opacity", 0); 
    svgGroupedBarPlot.append("text").attr("class", "bar_color_text").attr("x", 20).attr("y", bar_legends_y).text("Global").style("opacity", 0); 
    let dX = BrowserText.getWidth("Global", 15, 'Arial') + 50 + 20;

    if (nb > 1) {
        svgGroupedBarPlot.append("circle").attr("class", "bar_color_circle").attr("cx", dX).attr("cy", bar_legends_y).style("opacity", 0); 
        svgGroupedBarPlot.append("text").attr("class", "bar_color_text").attr("x", dX + 20).attr("y", bar_legends_y).text(colorsText[1]).style("opacity", 0); 
        dX += BrowserText.getWidth(colorsText[1], 15, 'Arial') + 50 + 20;
    }

    if (nb > 2) {
        svgGroupedBarPlot.append("circle").attr("class", "bar_color_circle").attr("cx", dX).attr("cy", bar_legends_y).style("opacity", 0); 
        svgGroupedBarPlot.append("text").attr("class", "bar_color_text").attr("x", dX + 20).attr("y", bar_legends_y).text(colorsText[2]).style("opacity", 0); 
    }

    svgGroupedBarPlot.selectAll("circle.bar_color_circle").style("fill", legendCycle).attr("opacity", "90%").attr("r", 6)
    svgGroupedBarPlot.selectAll("text.bar_color_text").style("font-size", "15px").attr("alignment-baseline", "middle").style("fill", "black")
}

function removeBarLegends() {
    svgGroupedBarPlot.selectAll("circle.bar_color_circle").remove();
    svgGroupedBarPlot.selectAll("text.bar_color_text").remove();
}


function updateBar(dataset, nb, colorsText) {

    svgGroupedBarPlot.select("g.xAxis").transition().duration(tr_duration).style("opacity", 0);
    svgGroupedBarPlot.select("g.yAxis").transition().duration(tr_duration).style("opacity", 0); 
    svgGroupedBarPlot.selectAll("text.bar_labels").transition().duration(tr_duration).style("opacity", 0); 
    svgGroupedBarPlot.selectAll("circle.bar_color_circle").transition().duration(tr_duration).style("opacity", 0); 
    svgGroupedBarPlot.selectAll("text.bar_color_text").transition().duration(tr_duration).style("opacity", 0); 
    svgGroupedBarPlot.select("text.xAxis_Label").transition().duration(tr_duration).style("opacity", 0);
    dataset.pop();
    dataset.pop();

    xScale = d3.scaleLinear()
        .domain([0, d3.max(dataset.map(x => x[1]))])
        .range([0, w]);

    yScale = d3.scaleBand()
        .domain(dataset.map(x => x[2]))
        .rangeRound([0, h - padding])
        .paddingInner(0.00);

    let isTransitionEnded = false


    d3.selectAll("rect.bar").data(dataset)
        .transition()
        .duration(2000)
        .attr("width", function (d) {
            return xScale(d[1]);
        }).on("end", function() {
            if (!isTransitionEnded){
                removeAxes();
                removeBarLegends()
                if (nb != 0) {
                    drawAxes(nb);
                    drawBarLegends(nb, colorsText);
                }
                d3.selectAll("text.bar_labels")
                    .data(dataset)
                    .attr("font-family", "sans-serif")
                    .style("font-size", "14px")
                    .text(function (d) {
                        if (BrowserText.getWidth(d[0], 14, '"sans-serif"') + 20> xScale(d[1]) & d[0] != "") {
                            return "";
                        }
                        return d[0];
                    }).transition().duration(tr_duration).style("opacity", 1);

                svgGroupedBarPlot.select("g.xAxis").transition().duration(tr_duration).style("opacity", 1); 
                svgGroupedBarPlot.select("g.yAxis").transition().duration(tr_duration).style("opacity", 1); 
                svgGroupedBarPlot.selectAll("circle.bar_color_circle").transition().duration(tr_duration).style("opacity", 1); 
                svgGroupedBarPlot.selectAll("text.bar_color_text").transition().duration(tr_duration).style("opacity", 1); 
                
                if(nb !=0) {
                    svgGroupedBarPlot.select("text.xAxis_Label").transition().duration(tr_duration).style("opacity", 1);
                }
                isTransitionEnded = true;
            }
        })
        .attr("fill", colorCycle(nb));

}
