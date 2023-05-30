class Legend extends HTMLElement {
    constructor(allColors, x, y, width, height, colorText="red", widthCoord = 8*13) {
        super()
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        const a = 8 * 13
        svg.setAttribute('viewBox', `0 0 ${a} 5`)
        svg.setAttribute('x', x)
        svg.setAttribute('y', y)
        svg.setAttribute('width', width)
        svg.setAttribute('height', height)
        svg.setAttribute("id", "legendCompose")
        const labelHeight = (13 * height)
        /*const legend = /*d3.select(document.createElement("g"))d3.select(this.svg)
            //.attr('transform', `translate(${radius * 2 + 20},0)`);
        console.log(d3.select(this.svg))*/
        const legend = d3.select(svg)

        
        //console.log(data)
        legend
            .selectAll('rect')
            .data(allColors)
            .enter()
            .append('rect')
            .attr('x', d => d.index >= 13? (d.index >= 26? 8*(d.index - 26) : 8*(d.index -13)) : (8*d.index))
            .attr('y', d => d.index>=13?(d.index >= 26? 4:2) : 0)
            .attr('width', 1)
            .attr('height', 1)
            .attr('fill', d => d.color)
            .attr('stroke', 'grey')
            .style('stroke-width', '0.015')
            .on("click", (d) => {
                const event = new CustomEvent("click-legend", {
                    detail: d.genre,
                    bubbles: true,
                    cancelable: true,
                    composed: false,
                });
                this.dispatchEvent(event)
            })
            .on("dblclick", (d) => {
                const event = new CustomEvent("dblclick-legend", {
                    detail: d.genre,
                    bubbles: true,
                    cancelable: true,
                    composed: false,
                });
                this.dispatchEvent(event)
            })

        legend
            .selectAll('text')
            .data(allColors)
            .enter()
            .append('text')
            .text(d => d.genre)
            .attr('x', d => d.index >= 13? (d.index >= 26? 8*(d.index - 26) + 0.1 : 8*(d.index -13)) + 1.1 : (8*d.index) + 1.1)
            .attr('y', d => d.index>=13?(d.index >= 26? 4 + 0.9:2 + 0.9) : 0 + 0.9)
            .style('font-family', 'sans-serif')
            .style('font-size', `1.09`)
            .style("fill", colorText)
            .on("click", (d) => {
                const event = new CustomEvent("click-legend", {
                    detail: d.genre,
                    bubbles: true,
                    cancelable: true,
                    composed: false,
                });
                this.dispatchEvent(event)
            })
            .on("dblclick", (d) => {
                const event = new CustomEvent("dblclick-legend", {
                    detail: d.genre,
                    bubbles: true,
                    cancelable: true,
                    composed: false,
                });
                this.dispatchEvent(event)
            })
            .attr("onselectstart", 'return false')
            .attr("onmousedown", 'return false')

        //console.log(legend)
        this.svg = svg
        /*const test = document.querySelector('#pie-compose')
        test.appendChild(svg)*/
    }

    getSVG() {
        return this.svg
    }
}
customElements.define('pie-legend', Legend)