const base = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
const w = 400;
const h = 600;


const yScale = d3.scaleBand()
    .domain(d3.range(base.length)) 
    .rangeRound([0, h]) 
    .paddingInner(0.00);


let xScale = d3.scaleLinear()
    .domain([0, d3.max(base)])
    .range([0, w]);


const svg1 = d3.select("#plot_desc").append("g").attr("transform", "translate(" + 60 + "," + 30 + ")");

const COLOR_CYCLE_DEFAULT = ['#e41a1c','#377eb8','#4daf4a'];

function colorCycle(colors = COLOR_CYCLE_DEFAULT) {
    const N = colors.length;
    let i = 0;
    return () => {
        const color = colors[i%N]
        i++
        return color
    };
}


svg1.selectAll("rect")
    .data(base)
    .enter()
    .append("rect")
    .attr("x", 0) 
    .attr("y", function (d, i) {
        return yScale(i); 
    })
    .attr("width", function (d) {
        return xScale(d) 
    })
    .attr("height", function (d) {
        return yScale.bandwidth()
    }) 
    .attr("fill", colorCycle());

/*
d3.select("#bu")
    .on("click", function () {
        newData(); 
        updateBar();
    });

function newData() {
    dataset = []; 
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const newNumber = Math.floor(Math.random() * 5 +1); 
            dataset.push(newNumber); 
        }
        dataset.push(0);
        dataset.push(0);
    }
}
*/
function updateBar(dataset) {
    xScale = d3.scaleLinear()
    .domain([0, d3.max(dataset)])
    .range([0, w]);
    const svg2 = d3.select("#plot_desc")
    svg2.selectAll("rect")
        .data(dataset)
        .transition() 
        .duration(2000)
        .attr("width", function (d) {
            return xScale(d);
        })
        .attr("fill", colorCycle());
}
