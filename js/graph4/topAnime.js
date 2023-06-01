class TopAnime extends HTMLElement {
    constructor(data, id, /*x, y,*/ width, height, colorSeparation = "black", colorBackGround = "green", colorStar = ["black", "red"], colorText = "red") {
        super()
        const div = document.getElementById("divTopAnime");
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        const heightCoord = 10
        const ratio = div.clientHeight/heightCoord
        const widthpx = parseInt(div.clientWidth/ratio, 10)
        const s = d3.select(svg).attr("id", id).attr('width', width).attr('height', height)
            /*.attr("x", x).attr("y", y)*/.attr('viewBox', `0 0 ${widthpx} ${heightCoord}`)//.attr("preserveAspectRatio","xMinYMax slice")//.attr("overflow", "scroll")
        const rect = s.append("rect").attr('fill', colorBackGround).attr('width', '100%').attr('height', '100%')
            .attr('x', 0).attr('y', 0)
        var percentFontSize = 100
        for (let i =0; i<data.length; i++) {
            if (100/data[i].title.length < percentFontSize) {
                percentFontSize = 100/data[i].title.length
            }
        }
        for (let i = 0; i<data.length; i++) {
            //console.log(data[i])
            const percentHeight = 20
            const item = new AnimeItem([data[i]], 0, i*2, percentHeight, percentFontSize, colorBackGround, colorStar, colorText)
            svg.appendChild(item.getSVG())
            if (i !== 0){ 
            s.append("path").attr("d", `M 0 ${i*2} L ${widthpx}  ${i*2}`).attr('stroke-width', 0.05).attr("stroke", colorSeparation)
            }
        }
        //document.querySelector('#pie-compose').appendChild(svg)
        this.svg = svg
    }
    getSVG() {
        return this.svg
    }
}

class AnimeItem extends HTMLElement {
    constructor(data, x, y, height, percentFontSize, colorBackGround = "green", colorStar = ["black", "red"], colorText = "red") {
        super()
        const top = document.getElementById("divTopAnime");
        const ratio = top.clientHeight*(height/100)/5
        const width = parseInt(top.clientWidth/ratio, 10)
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        /*const ratioi = 324/5
        const widthi = 225/ratio*/
        //const coordWidthImage = widthi/width*100
        const fontSize = 1.2*width*(percentFontSize/100)

        const s = d3.select(svg).attr('width', "100%").attr('height', `${height}%`)
            .attr("x", x).attr("y", y).attr('viewBox', `0 0 ${width} 5`).attr("preserveAspectRatio", "xMidYMid meet")
        //console.log(s)
        const rect = s.append("rect").attr('fill', colorBackGround).attr('width', '100%').attr('height', '100%')
            .attr('x', 0).attr('y', 0)
        const img = s.selectAll("image").data(data).enter().append("image").attr('width', /*`${coordWidthImage}%`*/"25%").attr('height', '100%')
            .attr('x', 0).attr('y', 0).attr('href', d => d.image_url)
        const text = s.selectAll("text").data(data).enter().append("text").text(d => d.title)
            .attr('x', width/**coordWidthImage/100*//4 + 0.5)
            .attr('y', 1)
            .style('font-family', 'sans-serif')
            .style('font-size', fontSize)
            .style("fill", colorText)

        const rating = parseFloat(data[0].score)/2
        //console.log(rating)
        for (let i=0; i<5; i++) {
            var percent = "100%"
            const diff = rating - i - 1
            if (diff < -1) {
                percent = "0%"
            }else if(diff < 0) {
                const p = (diff + 1)*100
                percent = `${p}%`
            }
            const x = width/**coordWidthImage/100*//4 + 0.3*(i+1) + 1*i
            const star = new Star(x, 2, 1, 1, percent, colorStar[0], colorStar[1], 0.2)
            //console.log(star.getSVG())
            svg.appendChild(star.getSVG())
        }
        
        const textRating = s.append("text").text(`(${rating.toFixed(2)})`)
            .attr('x', width/**coordWidthImage/100*//4 + 7)
            .attr('y', 2.8)
            .style('font-family', 'sans-serif')
            .style('font-size', `0.8`)
            .style("fill", colorText)

        //document.querySelector('#pie-compose').appendChild(svg)
        this.svg = svg
    }
    getSVG() {
        return this.svg
    }

}
class Star extends HTMLElement {
    constructor(x, y, width, height, percent, colorFill, colorStroke, strokeWidth) {
        super()
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        const s = d3.select(svg).attr('width', width).attr('height', height)
        .attr("x", x).attr("y", y).attr('viewBox', `0 0 6 6`)

        const pathGroup = s.append("g").attr("class", "starPath").attr("mask", "url(#starMask)")
        const mask = s.append("mask").attr("class", "starMask").attr("id", "starMask")
        mask.append("rect").attr("x", 0).attr("y", 0).attr("width", "100%").attr("height", "100%").attr("fill", "black")
        mask.append("path").attr("d", this.generate()).attr('stroke-width', strokeWidth)
            .attr('stroke', "white").attr("fill", "white")

        pathGroup.append("rect").attr("x", 0).attr("y", 0).attr("width", percent).attr("height", "100%").attr("fill", colorFill)
        pathGroup.append("path").attr("d", this.generate()).attr('stroke-width',strokeWidth)
            .attr('stroke', colorStroke).attr("fill-opacity", 0)
        this.svg = svg
    }
    /**
     * Vertex : A = (3, 0), B = (0, 2), C = (6, 2), D = (1, 6) and E = (5, 6)
     * line a : y = 2 (B to C)
     * line b : y = -3x + 9 (A to D)
     * line c : y = 3x - 9 (A to E)
     * line d : y = -0.8x + 6.8 (C to D)
     * line e : y = 0.8x + 2 (B to E)
     * intersection : 
     *  a and b : F = (7/3, 2)
     *  a and c : G = (11/3, 2)
     *  c and d : H = (79/19, 66/19)
     *  d and e : I = (3, 4.4)
     *  b and e : J = (35/19, 66/19)
     * @returns path of the star
     */
    generate() {
        const a = new Point(3, 0)
        const b = new Point(0, 2)
        const c = new Point(6, 2)
        const d = new Point(1, 6)
        const e = new Point(5, 6)
        const f = new Point(7/3, 2)
        const g = new Point(11/3, 2)
        const h = new Point(79/19, 66/19)
        const i = new Point(3, 4.4)
        const j = new Point(35/19, 66/19)
        return `M ${a.toSvgPath()} L ${f.toSvgPath()} L ${b.toSvgPath()} L ${j.toSvgPath()} L ${d.toSvgPath()} L ${i.toSvgPath()} L ${e.toSvgPath()} L ${h.toSvgPath()} L ${c.toSvgPath()} L ${g.toSvgPath()} L ${a.toSvgPath()}`
    }

    getSVG() {
        return this.svg
    }
}
customElements.define('item-top', AnimeItem)
customElements.define('star-rating', Star)
customElements.define('top-anime', TopAnime)