class Legend extends HTMLElement {
    constructor(allColors, x, y, width, height) {
        super()
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        const a = 8 * 13
        svg.setAttribute('viewBox', `0 0 ${a} 5`)
        svg.setAttribute('x', x)
        svg.setAttribute('y', y)
        svg.setAttribute('width', width)
        svg.setAttribute('height', height)
        const labelHeight = (13 * height)
        /*const legend = /*d3.select(document.createElement("g"))d3.select(this.svg)
            //.attr('transform', `translate(${radius * 2 + 20},0)`);
        console.log(d3.select(this.svg))*/
        const legend = d3.select(svg)

        var data = []
        //console.log(Object.keys(this.allColors))
        const keys = Object.keys(allColors)
        for (let k =0; k<keys.length; k++){
            data[k] = {'index' : k, 'genre' : keys[k], 'color' : allColors[keys[k]]}
        }
        //console.log(data)
        legend
            .selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', d => d.index >= 13? (d.index >= 26? 8*(d.index - 26) : 8*(d.index -13)) : (8*d.index))
            .attr('y', d => d.index>=13?(d.index >= 26? 4:2) : 0)
            .attr('width', 1)
            .attr('height', 1)
            .attr('fill', d => d.color)
            .attr('stroke', 'grey')
            .style('stroke-width', '0.015');

        legend
            .selectAll('text')
            .data(data)
            .enter()
            .append('text')
            .text(d => d.genre)
            .attr('x', d => d.index >= 13? (d.index >= 26? 8*(d.index - 26) + 0.1 : 8*(d.index -13)) + 1.1 : (8*d.index) + 1.1)
            .attr('y', d => d.index>=13?(d.index >= 26? 4 + 0.9:2 + 0.9) : 0 + 0.9)
            .style('font-family', 'sans-serif')
            .style('font-size', `1.09`)
            .style("fill", "red")

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