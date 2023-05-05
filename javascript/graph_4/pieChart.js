function strToDom(str) {
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
}

class PieChart extends HTMLElement {
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
            <g class="pathGroup" mask="url(#graphMask${id})">
                
            </g>
            <mask class="maskGroup" id="graphMask${id}">
                <rect fill="white" x="-1.6" y="-1.6" width="3.2" height="3.2"/>
                <circle r="${donut}" fill="black"/>
            </mask>
        </svg>`)
        const pathGroup = svg.querySelector('.pathGroup')
        const maskGroup = svg.querySelector('.maskGroup')
        var kOther = 0

        this.paths = this.data.map((_, k) => {
            const color = colors[k % (colors.length)]
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            path.setAttribute('fill', color)
            pathGroup.appendChild(path)
            path.addEventListener('mouseover', () => this.handlePathHover(k))
            path.addEventListener('mouseout', () => this.handlePathOut(k))
            if (labels[k] === 'Others') {
                kOther = k
            }else {
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
            }
            return path
        })
        this.kOther = kOther
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
            }*/
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
            if (k !== this.kOther) {
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
    }

    getShadow() {
        return this.shadow
    }

    setSVGAttribute(x, y, width, height){
        //console.log(document.querySelector(`#${this.id}`))
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
                .style("pointer-events", "none").style("fill", "red")
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
        }*/
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
customElements.define('pie-chart', PieChart)