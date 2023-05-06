

let svg = d3.select("#plot");

let diameter = +svg.attr("width") ;

let g = svg.append("g").attr("transform", "translate(" + diameter /2 + "," + diameter / 2 + ")");

let pack = d3.pack()
    .size([diameter, diameter])
    .padding(1.5)


const nb_ratings_per_year = data = {"2006" : 6656,
"2007" : 485419,
"2008" : 1845826,
"2009" : 3027156,
"2010" : 3094369,
"2011" : 3132426,
"2012" : 3826551,
"2013" : 4585220,
"2014" : 4873577,
"2015":  5235096,
"2016" : 5578943,
"2017" : 5214298,
"2018" : 2320709};

const total = Object.keys(nb_ratings_per_year).map(function(key){return nb_ratings_per_year[key]}).reduce((partialSum, a) => partialSum + a, 0);

d3.json("data/graph1_circles/circles.json",function (error, root) {
    let country1 = ""
    let country2 = ""
    let top1 = []
    let top2 = []
    root = d3.hierarchy(root)
        .sum(function (d) { return d.size })
        .sort(function (a, b) { return b.value - a.value; });

    let focus = root,
        nodes = pack(root).descendants(),
        view;

    let tooltip = d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("visibility", "hidden");

    let circle = g.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("r",0)
        .attr("class", function (d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root" })
        .style("fill", function (d) { return  d.parent ? d.children ? "#D0D0D0" : "white" : "#404040" })
        .on("click", function (d) {
            if (!d.children) {
                if(focus == d.parent) {
                    if (country2 == "" && country1 != d.data.name){
                        country2 = d.data.name;
                        top2 = d.data.titles
                        console.log(d.data.titles)
                        d3.select(this).style("fill", "red");
                        console.log("yo")
                    }
                    else if(country1 == "" && country2 != d.data.name) {
                        country1 = d.data.name;
                        top1 = d.data.titles
                        console.log(d.data.titles)
                        d3.select(this).style("fill", "red");
                    }
                    else if(country1 == d.data.name) {
                        country1 = ""
                        top1 = []
                        d3.select(this).style("fill","white");
                    }
                    else if(country2 == d.data.name) {
                        country2 = ""
                        top2 = []
                        d3.select(this).style("fill", "white");
                    }
                    let dataset = []
                    for(let i = 0 ; i< 5 ; i++) {
                        dataset.push(d.parent.data.top[i][1]);
                        if(country2 == "" && country1 == "") {
                            dataset.push(0);
                            dataset.push(0);
                        }
                        else if(country2 != "" && country1 != "") {
                            dataset.push(top2[i][1])
                            dataset.push(top1[i][1])
                        }
                        else if (country2 == "") {
                            dataset.push(top1[i][1])
                            dataset.push(0);
                        }
                        else if (country1 == "") {
                            dataset.push(top2[i][1])
                            dataset.push(0);
                        }
                        dataset.push(0);
                        dataset.push(0);
                    }
                    updateBar(dataset);
     
                }
                else {
                    let dataset = []
                    for(let i = 0 ; i< 5 ; i++) {
                        dataset.push(d.parent.data.top[i][1]);
                        dataset.push(0);
                        dataset.push(0);
                        dataset.push(0);
                        dataset.push(0);
                    }
                    updateBar(dataset);
                }
                d3.select("#year").text(d.parent.data.name)
                d3.select("#nb_ratings").text("percentage : " + (nb_ratings_per_year[d.parent.data.name]*100/total).toFixed(2) + "%")
                console.log(country1 + "/" + country2)
                zoom(d.parent,false);
                d3.event.stopPropagation();

            } else if (focus != d) {
                d3.select("#year").text(d.data.name)
                d3.select("#nb_ratings").text("percentage : " + (nb_ratings_per_year[d.data.name]*100/total).toFixed(2) + "%")
                zoom(d);
                d3.event.stopPropagation();
            }

        })
        .on("mouseover", function(d){ if (focus != root && !d.children) tooltip.style("visibility", "visible"); tooltip.text(d.data.name)})
        .on("mousemove", function(d){ tooltip.style("top",(d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
        .on("mouseout", function (d){ tooltip.style("visibility", "hidden");});



    let headline = g.selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .style("display", function (d) { return d.parent === root ? "inline" : "none"; })
        .text(function (d) { return d.data.name; });

    let node = g.selectAll("circle,text")


    svg.on("click", function () { zoom(root); });

    zoomTo([root.x, root.y, root.r * 2]);

    function zoom(d,isParent = true, top = []) {
        let focus0 = focus; focus = d;
        let transition = d3.transition()
            .duration(600)
            .tween("zoom", function (d) {

                let i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                return function (t) { zoomTo(i(t)); };
            });
        transition.selectAll(".label")
            .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
            .style("fill-opacity", function (d) { return d.parent === focus ? 1 : 0; })
            .on("start", function (d) { if (d.parent === root) this.style.display = "inline";})
            .on("end", function (d) { if (d.parent !== focus) this.style.display = "none"; });
        if(isParent) {
            country1 = ""; 
            country2 = "";
            top1 = []
            top2 = []
            let dataset = []
            for(let i = 0 ; i< 5 ; i++) {
                dataset.push(0);
                dataset.push(0);
                dataset.push(0);
                dataset.push(0);
                dataset.push(0);
            }
            updateBar(dataset);
            circle.style("fill", function (d) { return  d.parent ? d.children ? "#D0D0D0" : "white" : "#404040" }); 
        }

    }

    function zoomTo(v) {
        let k = diameter / v[2]; view = v;
        node.attr("transform", function (d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
        circle.attr("r", function (d) {
        if (isNaN(d.r * k)) {
           return 0;
        }
        return d.r * k; });
    }
});