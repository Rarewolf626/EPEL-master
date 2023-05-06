class ComposePieChart extends HTMLElement {
    constructor(datas, allColors, x, y, width, height, widthpx, heightpx) {
        super()
        const style = document.createElement('style');
        style.innerHTML = `
            :host {
                display: block;
                position: relative;
            }
            svg {
                width: 100%;
                height: 100%;
            }
        `
        const compose = document.querySelector('#graph4')
        compose.style.setProperty("width", `${widthpx}px`)
        compose.style.setProperty('height', `${heightpx}px`)
        compose.style.setProperty('--tooltip-bg', 'red')

        this.widthpx = parseFloat(widthpx)
        this.heightpx = parseFloat(heightpx)
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        svg.setAttribute('viewBox',`${x} ${y} ${width} ${height}`)

        //const data = [80,50,80,20,10,10]
        this.datas = datas
        this.allColors = allColors
        const r = this.filterData(datas, allColors, 'Genre_Principal', 'Count', (v) => v.Genre_Secondaire_1==='T' && v.Genre_Secondaire_2==='T')
        const datag1 = r[0]
        const labelsg1 = r[1]
        const colorsg1 = r[2]
        /*console.log(datag1)
        console.log(labelsg1.length)
        console.log(colorsg1.length)*/
        this.datag1 = datag1
        this.labelsg1 = labelsg1
        this.colorsg1 = colorsg1
        const xg1 = width/2 - 2
        const yg1 = height/2 - 2
        this.xg1 = xg1
        this.yg1 = yg1
        const widthG1 = 4
        const heightG1 = 4
        this.widthG1 =widthG1
        this.heightG1 = heightG1
        this.width = width
        this.height = height
        //const labels = ["Jaune", "Vert", "Orange", "Bleu", "Rouge", "Bleu clair"]
        const g1 = new PieChart(this.datag1, this.labelsg1, "g1", this.xg1, this.yg1, this.widthG1, this.heightG1, this.colorsg1)
        this.g1 = g1
        var kg1 = -1
        this.kg1 = kg1
        this.g1.addEventListener("g1", (e) => {
            //console.log(e.detail)
            this.kg1 = e.detail
            this.moveToG2()
        })
        const g2 = null
        this.g2 = g2
        const g3 = null
        this.g3 = g2
        compose.appendChild(style)
        svg.appendChild(this.g1.getShadow())
        const test = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
        test.setAttribute('x', this.width - 1)
        test.setAttribute('y', this.height - 1)
        test.setAttribute('width', 1)
        test.setAttribute('height', 1)
        test.setAttribute('fill', "red")
        test.addEventListener('click', () => {
            if(this.g3 !== null){
                this.g2.handlePathOut(this.kg2)
                this.g2.addListeners()
                this.moveBackToG2()
            }else if(this.g2 !=null){
                this.g1.handlePathOut(this.kg1)
                this.g1.addListeners()
                this.moveBackToG1()
            }
        })
        svg.appendChild(test)
        this.svg = svg
        //svg.appendChild(this.drawLegend())
        //this.drawLegend()
        const legend = new Legend(allColors, 0, 0, '100%', '20%')
        this.svg.appendChild(legend.getSVG())
        compose.appendChild(this.svg)
        //console.log("test")
    }

    moveToG3() {
        const newXG2 = this.width/3
        const newYG2 = this.yg2 - 1
        const newWG2 = 2.5
        const newHG2 = 2.5
        const shiftW = this.widthG2 - newWG2
        const shiftH = this.heightG2 - newHG2
        const shiftX = this.xg2 - newXG2
        const shiftY = this.yg2 - newYG2
        const now = Date.now()
        const duration = 1000
        const draw = () => {
            const t = (Date.now() - now) / duration
            if (t < 1) {
                //this.draw(acceleratorAnimation(t))
                const x = this.xg2 - shiftX*t
                const y = this.yg2 - shiftY*t
                const w = this.widthG2 - shiftW*t
                const h = this.heightG2 - shiftH*t
                this.g2.setSVGAttribute(x, y, w, h)
                window.requestAnimationFrame(draw)
            } else {
                this.g2.setSVGAttribute(newXG2, newYG2, newWG2, newHG2)
                const r = this.filterData(this.datas, this.allColors, 'Genre_Secondaire_2', 'Count', (v) => v.Genre_Principal == this.labelsg1[this.kg1] && v.Genre_Secondaire_1=== this.labelsg2[this.kg2] && v.Genre_Secondaire_2!=='T')
                const datag3 = r[0]
                const labelsg3 = r[1]
                const colorsg3 = r[2]
                this.datag3 = datag3
                this.labelsg3 = labelsg3
                this.colorsg3 = colorsg3
                const xg3 = 2*this.width/3 - 2
                const yg3 = this.height - 4
                this.xg3 = xg3
                this.yg3 = yg3
                const widthG3 = 4
                const heightG3 = 4
                this.widthG3 =widthG3
                this.heightG3 = heightG3
                const g3 = new PieChart(this.datag3, this.labelsg3, "g3", this.xg3, this.yg3, this.widthG3, this.heightG3, this.colorsg3)
                this.g3 = g3
                var kg3 = -1
                this.kg3 = kg3
                this.g3.addEventListener("g3", (e) => {
                    //console.log(e.detail)
                    this.kg3 = e.detail
                    //this.moveToG3()
                })
                this.svg.appendChild(this.g3.getShadow())
                this.g3.connectedCallback()
            }
        }
        this.newXG2 = newXG2
        this.newYG2 = newYG2
        this.newWG2 = newWG2
        this.newHG2 = newHG2

        window.requestAnimationFrame(draw)
    }

    moveBackToG2() {
        const shiftX = this.newXG2 - this.xg2
        const shiftY = this.newYG2 - this.yg2
        const shiftW = this.newWG2 - this.widthG2
        const shiftH = this.newHG2 - this.heightG2

        const now = Date.now()
        const duration = 1000
        const element = document.getElementById("g3");
        element.remove();
        this.g3 = null
        const draw = () => {
            const t = (Date.now() - now) / duration
            if (t < 1) {
                //this.draw(acceleratorAnimation(t))
                const x = this.newXG2 - shiftX*t
                const y = this.newYG2 - shiftY*t
                const w = this.newWG2 - shiftW*t
                const h = this.newHG2 - shiftH*t
                this.g2.setSVGAttribute(x, y, w, h)
                window.requestAnimationFrame(draw)
            } else {
                this.g2.setSVGAttribute(this.xg2, this.yg2, this.widthG2, this.heightG2)
            }
        }
        window.requestAnimationFrame(draw)
    }

    moveToG2() {
        const newXG1 = 0
        const newYG1 = this.height - 2.5
        const newWG1 = 2.5
        const newHG1 = 2.5
        const shiftW = this.widthG1 - newWG1
        const shiftH = this.heightG1 - newHG1
        const shiftX = this.xg1 - newXG1
        const shiftY = this.yg1 - newYG1
        const now = Date.now()
        const duration = 1000
        const draw = () => {
            const t = (Date.now() - now) / duration
            if (t < 1) {
                //this.draw(acceleratorAnimation(t))
                const x = this.xg1 - shiftX*t
                const y = this.yg1 - shiftY*t
                const w = this.widthG1 - shiftW*t
                const h = this.heightG1 - shiftH*t
                this.g1.setSVGAttribute(x, y, w, h)
                window.requestAnimationFrame(draw)
            } else {
                this.g1.setSVGAttribute(newXG1, newYG1, newWG1, newHG1)
                const r = this.filterData(this.datas, this.allColors, 'Genre_Secondaire_1', 'Count', (v) => v.Genre_Principal == this.labelsg1[this.kg1] && v.Genre_Secondaire_1!=='T' && v.Genre_Secondaire_2==='T'/* && parseFloat(v.Count) >= 300*/)
                const datag2 = r[0]
                const labelsg2 = r[1]
                const colorsg2 = r[2]
                this.datag2 = datag2
                this.labelsg2 = labelsg2
                this.colorsg2 = colorsg2
                const xg2 = this.width/2 - 2
                const yg2 = this.height/2 - 2
                this.xg2 = xg2
                this.yg2 = yg2
                const widthG2 = 4
                const heightG2 = 4
                this.widthG2 =widthG2
                this.heightG2 = heightG2
                const g2 = new PieChart(this.datag2, this.labelsg2, "g2", this.xg2, this.yg2, this.widthG2, this.heightG2, this.colorsg2)
                this.g2 = g2
                var kg2 = -1
                this.kg2 = kg2
                this.g2.addEventListener("g2", (e) => {
                    //console.log(e.detail)
                    this.kg2 = e.detail
                    this.moveToG3()
                })
                this.svg.appendChild(this.g2.getShadow())
                this.g2.connectedCallback()
            }
        }
        this.newXG1 = newXG1
        this.newYG1 = newYG1
        this.newWG1 = newWG1
        this.newHG1 = newHG1
        window.requestAnimationFrame(draw)
    }
    moveBackToG1() {
        const shiftX = this.newXG1 - this.xg1
        const shiftY = this.newYG1 - this.yg1
        const shiftW = this.newWG1 - this.widthG1
        const shiftH = this.newHG1 - this.heightG1

        const now = Date.now()
        const duration = 1000
        const element = document.getElementById("g2");
        element.remove();
        this.g2 = null
        const draw = () => {
            const t = (Date.now() - now) / duration
            if (t < 1) {
                //this.draw(acceleratorAnimation(t))
                const x = this.newXG1 - shiftX*t
                const y = this.newYG1 - shiftY*t
                const w = this.newWG1 - shiftW*t
                const h = this.newHG1 - shiftH*t
                this.g1.setSVGAttribute(x, y, w, h)
                window.requestAnimationFrame(draw)
            } else {
                this.g1.setSVGAttribute(this.xg1, this.yg1, this.widthG1, this.heightG1)
            }
        }
        window.requestAnimationFrame(draw)
    }

    filterData(data, allColors, keyLabels, keyValues, callback){
        const test = data.filter(callback);
        var data = []
        var labels = []
        var colors = []
        for (let k = 0; k < test.length; k++){
            data[k] = parseFloat(test[k][keyValues])
            labels[k] = test[k][keyLabels]
            colors[k] = allColors[labels[k]]
        }
        return [data, labels, colors]
    }


    connectedCallback(){
        this.g1.connectedCallback()
    }
}

/*function strToDom(str) {
    return document.createRange().createContextualFragment(str).firstChild
}

function acceleratorAnimation(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
    //return x
}

class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    toSvgPath () {
        return `${this.x} ${this.y}`
    }

    static fromAngle(angle, scale=1) {
        return new Point(Math.cos(angle)*scale, Math.sin(angle)*scale)
    }
}*/

/*class PieChart extends HTMLElement {
    constructor(data, labels, id, x, y, width, height, colors = ['#FAAA32', '#3EFA7D', '#FA6A25', '#0C94FA', '#FA1F19', '#0CFAE2', '#AB6D23'], donut = '0.02', proportion = '0.8', scaleSelect = '0.8', scaleAngle = '1.1', gap = '0.015') {
        super()
        const shadow = this.attachShadow({mode : 'open'})
        this.shadow = shadow
        this.proportion = parseFloat(proportion)
        this.scaleSelect = parseFloat(scaleSelect)
        this.scaleAngle = parseFloat(scaleAngle)
        this.data = data
        this.id = id
        const svg = strToDom(`<svg id=${id} style="overflow: visible;" viewBox="-1.6 -1.6 3.2 3.2" x="${x}" y="${y}" width="${width}" height="${height}">
            <g class="pathGroup" mask="url(#graphMask)">
                
            </g>
            <mask class="maskGroup" id="graphMask">
                <rect fill="white" x="-1.6" y="-1.6" width="3.2" height="3.2"/>
                <circle r="${donut}" fill="black"/>
            </mask>
        </svg>`)
        const pathGroup = svg.querySelector('.pathGroup')
        const maskGroup = svg.querySelector('.maskGroup')

        this.paths = this.data.map((_, k) => {
            const color = colors[k % (colors.length)]
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            path.setAttribute('fill', color)
            pathGroup.appendChild(path)
            path.addEventListener('mouseover', () => this.handlePathHover(k))
            path.addEventListener('mouseout', () => this.handlePathOut(k))
            path.addEventListener('click', () => {
                const event = new CustomEvent(id, {
                    detail: k,
                    bubbles: true,
                    cancelable: true,
                    composed: false,
                  });
                  this.removeListeners()
                  this.dispatchEvent(event)
            })
            return path
        })
        this.restartPaths = this.paths
        this.lines = this.data.map(() => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            line.setAttribute('stroke', '#000')
            line.setAttribute('stroke-width', gap)
            line.setAttribute('x1', 0)
            line.setAttribute('y1', 0)
            maskGroup.appendChild(line)
            return line
        })
        this.restartLines = this.lines
        this.labels = labels

        const style = document.createElement('style');
        style.innerHTML = `
            :host {
                display: block;
                position: relative;
            }
            /*#test {
                width: 100%;
                height: 100%;
            }//////////////
            path {
                cursor: pointer;
                transition: opacity .3s;
            }
            path:hover {
                opacity: 0.5;
            }
        `
        this.shadow.appendChild(style)
        this.shadow.appendChild(svg)
    }

    removeListeners(){
        for (let k = 0; k < this.paths.length; k++){
            const clone = this.paths[k].cloneNode(true)
            this.paths[k].parentNode.replaceChild(clone, this.paths[k])
            this.paths[k] = clone
        }
    }

    addListeners(){
        for (let k = 0; k < this.paths.length; k++) {
            this.paths[k].addEventListener('mouseover', () => this.handlePathHover(k))
            this.paths[k].addEventListener('mouseout', () => this.handlePathOut(k))
            this.paths[k].addEventListener('click', () => {
                const event = new CustomEvent(this.id, {
                    detail: k,
                    bubbles: true,
                    cancelable: true,
                    composed: false,
                  });
                  this.removeListeners()
                  this.dispatchEvent(event)
            })
        }
    }

    getShadow() {
        return this.shadow
    }

    setSVGAttribute(x, y, width, height){
        console.log(document.querySelector(`#${this.id}`))
        const svg = document.querySelector(`#${this.id}`)
        svg.setAttribute("x", x)
        svg.setAttribute("y", y)
        svg.setAttribute("width", width)
        svg.setAttribute("height", height)
    }

    connectedCallback () {
        const s = d3.select(`#${this.id}`)
        this.labels = this.labels.map((l) => {
            const label = s.append('text').text(l)
                .style("font-size", "0.12").style("font-weight", "0.2")
                .style("transform", "translate(-50%, -50%)").style("background-color", "var(--tooltip-bg, #FFF)")
                .style("opacity", "0").style("transition", "opacity .3s")
            return label
        })
        this.restartLabels = this.labels


        const now = Date.now()
        const duration = 1000
        const draw = () => {
            const t = (Date.now() - now) / duration
            if (t < 1) {
                this.draw(acceleratorAnimation(t))
                window.requestAnimationFrame(draw)
            } else {
                this.draw(1)
            }
        }
        window.requestAnimationFrame(draw)
    }

    draw(progress = 1){
        const total = this.data.reduce((acc, v) => acc + v, 0)
        let angle = 0
        let start = new Point(1,0)
        for (let k = 0; k < this.data.length; k++){
            const ratio = (this.data[k] / total) * progress
            if (progress === 1) {
                this.positionLabel(this.labels[k], angle + ratio * Math.PI, this.proportion)
            }
            angle += ratio * 2 * Math.PI
            const largeFlag = ratio > .5 ? '1' : '0'
            const end = Point.fromAngle(angle)
            this.paths[k].setAttribute('d', `M 0 0 L ${start.toSvgPath()} A 1 1 0 ${largeFlag} 1 ${end.toSvgPath()} L 0 0`)
            this.lines[k].setAttribute('x2', end.x)
            this.lines[k].setAttribute('y2', end.y)
            start = end
        }
    }

    handlePathHover (k) {
        this.labels[k].classed('is-active', true)
        this.labels[k].style("opacity", "1")
        this.drawOpen(k)
    }

    handlePathOut (k) {
        this.labels[k].classed('is-active', false)
        this.labels[k].style("opacity", "0")
        this.draw()
    }

    drawOpen(index, progress=1) {
        const total = this.data.reduce((acc, v) => acc + v, 0)
        let angle = 0
        let start = index === 0 ? Point.fromAngle(0, this.scaleAngle) : new Point(1,0)
        let angles = []
        let sum = 0
        for (let k = 0; k<this.data.length; k++) {
            if (k!= index) {
                const ratio = (this.data[k] / total) * progress* this.scaleSelect
                angles[k] = ratio * 2 * Math.PI
                sum += angles[k]
            }
        }
        const diff = Math.PI * 2 - sum
        /*if (diff >=Math.PI / 2) {
            this.draw()
            return
        }/////////////
        angles[index] = diff
        for (let k = 0; k < this.data.length; k++){
                if (progress === 1) {
                    this.positionLabel(this.labels[k], angle + angles[k]/2, this.proportion)
                }
                angle += angles[k]
                const largeFlag = angles/(2*Math.PI) > .5 ? '1' : '0'
                const scale = k === index ? this.scaleAngle : 1
                const end = Point.fromAngle(angle, scale)
                this.paths[k].setAttribute('d', `M 0 0 L ${start.toSvgPath()} A 1 1 0 ${largeFlag} 1 ${end.toSvgPath()} L 0 0`)
                this.lines[k].setAttribute('x2', end.x)
                this.lines[k].setAttribute('y2', end.y)
                if (k === index -1){
                    start = Point.fromAngle(angle, this.scaleAngle)
                }else if(k === index){
                    start = Point.fromAngle(angle)
                }else {
                    start = end 
                }
        }
    }

    positionLabel (label, angle, proportion) {
        if (!label || !angle) {
            return
        }
        const point = Point.fromAngle(angle)
        label.attr('y', `${(point.y * proportion *  0.35 + 0.5) * 100}%`)
        label.attr('x', `${(point.x * proportion * 0.35 + 0.5) * 100}%`)
    }
}
customElements.define('pie-chart', PieChart)*/
customElements.define('pie-compose', ComposePieChart)