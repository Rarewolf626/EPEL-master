async function draw(el) {
    // Data
    const dataset = await d3.json("data.json");

    // Dimensions
    let dimensions = {
        width: 800,
        height: 400,
        margins: 50,
    };

    dimensions.containerWidth = dimensions.width - dimensions.margins * 2;
    dimensions.containerHeight = dimensions.height - dimensions.margins * 2;

    binPadding = 2;

    // Draw Image
    const svg = d3
        .select(el)
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

    const container = svg
        .append("g")
        .classed("container", true)
        .attr(
            "transform",
            `translate(${dimensions.margins}, ${dimensions.margins})`
        );

    // Element Groups
    const labelsGroup = container.append("g").classed("bar-labels", true);

    const xAxisGroup = container
        .append("g")
        .classed("axis", true)
        .style("transform", `translateY(${dimensions.containerHeight}px)`);

    const barsGroup = container.append("g").classed("bars", true);

    // Histogram Function
    // elements that rely on data go here
    function histogram(metric) {
        // Accessors
        const xAccessor = (d) => d.currently[metric];
        const yAccessor = (d) => d.length;

        // Scales
        const xScale = d3
            .scaleLinear()
            .domain(d3.extent(dataset, xAccessor))
            .range([0, dimensions.containerWidth])
            .nice();

        const bin = d3
            .bin()
            .domain(xScale.domain()) // data domain
            .value(xAccessor) // data values
            .thresholds(10); // number of buckets

        const binnedDataset = bin(dataset);
        console.log(binnedDataset);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(binnedDataset, yAccessor)])
            .range([dimensions.containerHeight, 0])
            .nice();

        // Transitions
        let transitionDuration = 1000;
        const exitTransition = d3.transition().duration(transitionDuration);
        const updateTransition = exitTransition
            .transition()
            .duration(transitionDuration);

        // Draw Bars
        barsGroup
            .selectAll("rect")
            .data(binnedDataset)
            .join(
                (enter) =>
                    enter
                        .append("rect")
                        .attr(
                            "width",
                            (d) => d3.max([0, xScale(d.x1) - xScale(d.x0)]) - binPadding
                        )
                        .attr("height", 0)
                        .attr("x", (d) => xScale(d.x0))
                        .attr("y", dimensions.containerHeight)
                        .attr("fill", "#b8de6f"),
                (update) => update,
                (exit) =>
                    exit
                        .attr("fill", "#f39233")
                        .transition(exitTransition)
                        .attr("y", dimensions.containerHeight)
                        .attr("height", 0)
                        .remove()
            )
            .transition(updateTransition)
            //.attr('width', ((dimensions.containerWidth / binnedDataset.length) - binPadding))
            .attr(
                "width",
                (d) => d3.max([0, xScale(d.x1) - xScale(d.x0)]) - binPadding
            )
            .attr("height", (d) => dimensions.containerHeight - yScale(yAccessor(d)))
            .attr("x", (d) => xScale(d.x0))
            .attr("y", (d) => yScale(yAccessor(d)))
            .attr("fill", "#01c5c4");

        // Bar Labels
        labelsGroup
            .selectAll("text")
            .data(binnedDataset)
            .join(
                (enter) =>
                    enter
                        .append("text")
                        // add half the size of the bar to center the text
                        .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
                        .attr("y", dimensions.containerHeight - 10)
                        .text(yAccessor),
                (update) => update,
                (exit) =>
                    exit
                        .transition(exitTransition)
                        .attr("y", dimensions.containerHeight)
                        .attr("height", -10)
                        .remove()
            )
            .transition(updateTransition)
            // add half the size of the bar to center the text
            .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
            .attr("y", (d) => yScale(yAccessor(d)) - 10)
            .text(yAccessor);

        // Draw Axis
        const xAxis = d3.axisBottom(xScale);

        xAxisGroup.transition().call(xAxis);
    }

    // Select Handler
    d3.select("#metric").on("change", function (e) {
        e.preventDefault();

        histogram(this.value);
    });

    // default metric
    histogram("humidity");
}

draw("#chart");