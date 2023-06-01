let svgCircle = d3.select("#circle_packing");
let colWidth = document.querySelector('.leftside').clientWidth;
let diameter = colWidth - 200;
let circleDx = colWidth/2
let circleDy = colWidth/2 - 50

let gCircle = svgCircle.append("g").attr("class","gCircle").attr("transform", "translate(" + circleDx + "," + circleDy + ")");

let pack = d3.pack()
    .size([diameter, diameter])
    .padding(1.5)


const nb_ratings_per_year = {"2006" : 6656,
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

const years = Object.keys(nb_ratings_per_year);
const ratings = Object.values(nb_ratings_per_year)
const ratingDifferences = {};
    
for (let i = 1; i < years.length; i++) {
    const currentYear = years[i];
    const previousYear = years[i - 1];
    const difference = nb_ratings_per_year[currentYear] - nb_ratings_per_year[previousYear];
    ratingDifferences[currentYear] = difference;
}

d3.select("#nb_ratings_per_year").text("From 2006 to 2018,");
d3.select("#ratings_gain").text("a total of " + ratings.reduce((partialSum, a) => partialSum + a, 0).toLocaleString("en-US") + " ratings were given");

const total = Object.keys(nb_ratings_per_year).map(function(key){return nb_ratings_per_year[key]}).reduce((partialSum, a) => partialSum + a, 0);

d3.json("data/graph1_circles/circles.json",function (error, root) {
    let country1 = ""
    let country2 = ""
    let top1 = []
    let top2 = []
    let year = ""

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
                    .style("visibility", "hidden")
                    //.style("color", "white");

    let circle = gCircle.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("opacity", "80%")
        .attr("r",0)
        .attr("class", function (d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root" })
        .style("fill", function (d) { return  d.parent ? d.children ? "#404040" : "#D0D0D0" :   "white" })
        .on("click", function (d) {
            if (!d.children) {

                update_year(d.parent);

                if(focus == d.parent) {
                    if (country2 == "" && country1 != d.data.name){
                        country2 = d.data.name;
                        top2 = d.data.titles
                        d3.select(this).style("fill", "black");
                        gCircle.selectAll(".headline").style("display", function (d) { return (d.data.name == country2 ||  d.data.name == country1) && year == d.parent.data.name ? "inline" : "none"; });
                        gCircle.selectAll(".headline").style("fill", function (d) { return (d.data.name == country2 ||  d.data.name == country1) && year == d.parent.data.name ? "white" : "black"; });
                        tooltip.style("visibility", "hidden");
                        update_tops(d)
                    }
                    else if(country1 == "" && country2 != d.data.name) {
                        country1 = d.data.name;
                        top1 = d.data.titles
                        d3.select(this).style("fill", "black");
                        gCircle.selectAll(".headline").style("display", function (d) { return (d.data.name == country1 || d.data.name == country2) && year == d.parent.data.name ? "inline" : "none"; });
                        gCircle.selectAll(".headline").style("fill", function (d) { return (d.data.name == country1 || d.data.name == country2) && year == d.parent.data.name ? "white" : "black"; });
                        tooltip.style("visibility", "hidden");
                        update_tops(d);
                    }
                    else if(country1 == d.data.name) {
                        country1 = ""
                        top1 = []
                        d3.select(this).style("fill","#D0D0D0");
                        gCircle.selectAll(".headline").style("display", function (d) { return d.data.name == country2 && year == d.parent.data.name ? "inline" : "none" });
                        gCircle.selectAll(".headline").style("fill", function (d) { return d.data.name == country2 && year == d.parent.data.name ? "white" : "black" });
                        tooltip.style("visibility", "visible");
                        update_tops(d)
                    }
                    else if(country2 == d.data.name) {
                        country2 = ""
                        top2 = []
                        d3.select(this).style("fill", "#D0D0D0");
                        gCircle.selectAll(".headline").style("display", function (d) { return d.data.name == country1 && year == d.parent.data.name ? "inline" : "none" });
                        gCircle.selectAll(".headline").style("fill", function (d) { return d.data.name == country1 && year == d.parent.data.name ? "white" : "black" });
                        tooltip.style("visibility", "visible");
                        update_tops(d)
                    }
                   
                    
     
                }
                else {
                    zoom(d.parent,false);
                    reset_tops()
                    let dataset = []
                    for(let i = 0 ; i< 5 ; i++) {
                        dataset.push(d.parent.data.top[i]);
                        for(let j = 0 ; j < 4; j++) {
                            dataset.push(["",0]);
                        }
                    }
                    circle.style("fill", function (d) { return  d.parent ? d.children ? "##7f2704" : "#D0D0D0" :   "white"}); 
                    dataset =  dataset.map(function(d,i){
                        return d.concat([i])
                    })
                    updateBar(dataset,1,[year]);
                }

                d3.event.stopPropagation();

            } else if (focus != d && d!=root) {

                zoom(d);
                circle.style("fill", function (d) { return  d.parent ? d.children ? "##7f2704" : "#D0D0D0" :   "white"}); 
                update_year(d);
                d3.event.stopPropagation();
                reset_tops();

                let dataset = []

                for(let i = 0 ; i< 5 ; i++) {
                    dataset.push(d.data.top[i]);
                    for(let j = 0 ; j < 4; j++) {
                        dataset.push(["",0]);
                    }
                }
                dataset = dataset.map(function(d,i){
                        return d.concat([i])
                })
                updateBar(dataset,1,[year]);
            }


        })
        .on("mouseover", function(d){ if (focus != root && !d.children && d.data.name != country1 && d.data.name != country2) tooltip.style("visibility", "visible"); tooltip.text(d.data.name)})
        .on("mousemove", function(d){ tooltip.style("top",(d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
        .on("mouseout", function (d){ tooltip.style("visibility", "hidden");});



    gCircle.selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("class", "headline")
        .style("fill", "black")
        .style("display", function (d) { return d.parent === root ? "inline" : "none"; })
        .text(function (d) { return d.data.name; });

    let node = gCircle.selectAll("circle,text.headline")


    svgCircle.on("click", function () { zoom(root); });

    zoomTo([root.x, root.y, root.r * 2]);

    function zoom(d,isParent = true) {
        let focus0 = focus; focus = d;
        let transition = d3.transition()
            .duration(600)
            .tween("zoom", function (d) {

                let i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                return function (t) { zoomTo(i(t)); };
            });
        transition.selectAll(".headline")
            .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
            .style("fill-opacity", function (d) { return d.parent === focus ? 1 : 0; })
            .on("start", function (d) { if (d.parent === root) this.style.display = "inline";})
            .on("end", function (d) { if (d.parent !== focus) this.style.display = "none"; });
    
        if(isParent) {
            
            reset_tops();
            const dataset = Array(25).fill(["",0]).map(function(d,i){
                return d.concat([i])
            })
            year = []
            updateBar(dataset,0,year);
            circle.style("fill", function (d) { return  d.parent ? d.children ? "##7f2704" : "#D0D0D0" :   "white" }); 
            d3.select("#year").text("Information");
            d3.select("#nb_ratings_per_year").text("From 2006 to 2018,");
            d3.select("#ratings_gain").text("a total of " + ratings.reduce((partialSum, a) => partialSum + a, 0).toLocaleString("en-US") + " ratings were given");

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

    function reset_tops(){
        country1 = ""; 
        country2 = "";
        top1 = []
        top2 = []
    }
    
    function update_tops(d){
        let dataset = []
        let nb = 0
        let colorsTextTemp = [year]
        for(let i = 0 ; i< 5 ; i++) {
            dataset.push(d.parent.data.top[i]);
            if(country2 == "" && country1 == "") {
                dataset.push(["",0]);
                dataset.push(["",0]);
                nb = 1
            }
            else if(country2 != "" && country1 != "") {
                dataset.push(top2[i])
                dataset.push(top1[i])
                colorsTextTemp.push(country2);
                colorsTextTemp.push(country1);
                nb = 3
            }
            else if (country2 == "") {
                dataset.push(top1[i])
                dataset.push(["",0]);
                colorsTextTemp.push(country1);
                nb = 2
            }
            else if (country1 == "") {
                dataset.push(top2[i])
                dataset.push(["",0]);
                colorsTextTemp.push(country2);
                nb = 2
            }
            dataset.push(["",0]);
            dataset.push(["",0]);
        }
        dataset =  dataset.map(function(d,i){
            return d.concat([i])
        })
        updateBar(dataset,nb,colorsTextTemp);
    }
    
    function update_year(d){
        if(d.data.name in ratingDifferences) {
            if(ratingDifferences[d.data.name] >= 0) {
                d3.select("#nb_ratings_per_year").text((nb_ratings_per_year[d.data.name]*100/total).toFixed(2) + "% of the ratings were given during this year");
                d3.select("#ratings_gain").text("(+"+(ratingDifferences[d.data.name]*100/total).toFixed(2)+ "% compared to the previous year)");
            } 
            else {
                d3.select("#nb_ratings_per_year").text((nb_ratings_per_year[d.data.name]*100/total).toFixed(2) + "% of the ratings were given during this year");
                d3.select("#ratings_gain").text("("+(ratingDifferences[d.data.name]*100/total).toFixed(2)+ "% compared to the previous year)");
            }
        }
        else {
            d3.select("#nb_ratings_per_year").text((nb_ratings_per_year[d.data.name]*100/total).toFixed(2) + "% of the ratings were given during this year");
            d3.select("#ratings_gain").text("")

        }
        d3.select("#year").text(d.data.name)
        year = d.data.name
    }
});
