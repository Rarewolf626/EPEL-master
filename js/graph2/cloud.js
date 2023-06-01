let margin = { top: 10, right: 20, bottom: 10, left: 20 },
    width = 620 - margin.left - margin.right,
    height = 280 - margin.top - margin.bottom;

const size = 17
let char = ""
let tags = []
let selected = []

let ac = d3.select(".associatedChar")
    .style("font-size", "25px")
    .attr("text-anchor", "start")
    .style("margin-bottom", "30px")
    .attr("alignment-baseline", "hanging")
    .text("associated character: ")
    .html("<span style='text-decoration: underline;'>closest character</span>" + ": ");

let sc = d3.select(".searchedChar")
    .style("font-size", "25px")
    .attr("text-anchor", "start")
    .style("margin-bottom", "30px")
    .attr("alignment-baseline", "hanging")
    .text("searched character: ")
    .html("<span style='text-decoration: underline;'>searched character</span>" + ": ");


const svgCloud = d3.select("#plot")
    .attr("id", "word-cloud")
    .attr("viewBox", [0, 0, width, height])
    .attr("text-anchor", "middle");

function removeItemOnce(arr, value) {
    let index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

function associatedChar(characters) {

    if (selected.length == 0) {
        ac.html("<span style='text-decoration: underline;'>closest character</span>" + ": ");
    }
    else {
        function calculateSimilarity(tags) {
            const intersection = tags.filter(function (tag) { return selected.includes(tag); });
            const similarity = intersection.length / (tags.length + selected.length - intersection.length);
            return similarity;
        }

        characters.forEach((character) => {
            character.Similarity = calculateSimilarity(character.value);
        });

        const closestCharacter = characters.reduce((prev, current) => (prev.Similarity > current.Similarity ? prev : current));
        ac.html("<span style='text-decoration: underline;'>closest character</span>" + ": " + "<span style='color: #d95f02;'>" + closestCharacter.text + "</span>");
    }
}

d3.json("../data/graph2_cloud/char.json", function (error, json) {
    if (error) throw error;

    let data = json.dfTag;
    let s = d3
        .scaleSqrt()
        .domain([1, d3.max(data.map(function (d) { return d.value; }))])
        .range([1, 40]);

    const fuse = new Fuse(json.dfChar, {
        keys: ['text'],
    });

    let layout = d3.layout.cloud()
        .size([width, height])
        .words(data.map(function (d) { return Object.create(d); }))
        .padding(1)
        .fontSize(function (d) { return s(d.value); })
        .on("word", ({ size, x, y, rotate, text }) => {
            svgCloud.append("text") 
                .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
                .text(text)
                .attr("font-size", size)
                .attr("class", "word")
                .classed("click-only-text", true)
                .classed("word-default", true)
                .style("fill", "#1b9e77")
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut)
                .on("click", handleClick);

               

            function handleMouseOver(d, i) {
                d3.select(this)
                    .classed("word-hovered", true)
                    .transition(`mouseover-${text}`).duration(250).ease(d3.easeLinear)
                    .attr("font-size", size + 2)
                    .attr("font-weight", "bold");
            }

            function handleMouseOut(d, i) {
                d3.select(this)
                    .classed("word-hovered", false)
                    .interrupt(`mouseover-${text}`)
                    .attr("font-size", size).attr("font-weight", "normal");
            }

            function handleClick(d, i) {
                let e = d3.select(this);

                if (selected.includes(e.text())) {
                    selected = removeItemOnce(selected, e.text());
                    if (tags.includes(e.text())) {
                        e.style("fill", "red");
                    }
                    else {
                        e.style("fill", "#1b9e77");
                    }
                }
                else {
                    selected.push(e.text())
                    if (tags.includes(e.text())) {
                        e.style("fill", "#377eb8");
                    }
                    else {
                        e.style("fill", "#d95f02");
                    }
                }

                associatedChar(json.dfChar)
                e.classed("word-selected", !e.classed("word-selected"));

            }
        });
    const searchButton = d3.select("#search-button").on("click", function (event) {

        const tempFuse = fuse.search(d3.select("#search").property("value"))[0].item

        char = tempFuse.text;
        tags = tempFuse.value;
        d3.select(".searchedChar").html("<span style='text-decoration: underline;'>searched character</span>" + ": " + "<span style='color: red;'>" + char + "</span>");
        d3.select("#search").property("value", "");
        d3.selectAll("text.word").style("fill", function () {
            const text = d3.select(this).text();
            if (tags.includes(text)) {
                if (selected.includes(text)) {
                    return "#377eb8";
                }
                else {
                    return "red";
                }
            }
            else {
                if (selected.includes(text)) {
                    return "#d95f02";
                }
                else {
                    return "#1b9e77";
                }
            }
        });
    });
    layout.start();

});
