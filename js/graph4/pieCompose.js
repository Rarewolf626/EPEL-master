class ComposePieChart extends HTMLElement {
    constructor(datas, allColors, dataAnime, widthpx, heightpx, colorBackGround="black", colorText="white", colorBackGroundTop="white", colorTextTop="black", colorSeparationTop="black", colorStarTop=["red", "black"], colorArrowBack="red", colorStrokeBackArrow="white", /*colorTextBackArrow = "black",*/ colorBackGroundOthers = "red", colorTextOthers = "black", colorCloseOthers = "black") {
        super()
        this.colorText = colorText
        this.colorTextTop = colorTextTop
        this.colorBackGroundTop = colorBackGroundTop
        this.colorSeparationTop = colorSeparationTop
        this.colorStarTop = colorStarTop
        this.colorCloseOthers = colorCloseOthers
        //this.colorArrow = colorArrow
        this.colorArrowBack = colorArrowBack
        this.colorBackGroundOthers = colorBackGroundOthers
        this.colorTextOthers = colorTextOthers
        this.dataAnime = dataAnime
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
        const graph = document.querySelector('#graph-pieChart')
        graph.setAttribute("class", "row no-gutters")
        graph.style.setProperty("width", `100%`)
        graph.style.setProperty('height', `100vh`)
        graph.style.setProperty('--tooltip-bg', 'red')
        graph.style.setProperty('background-color', colorBackGround)
        const divTop = d3.select(graph).append("div").attr("id", "divTop").style("width", '100%').style("height", '15%')
        this.divTop = divTop
        const divLeft = d3.select(graph).append("div").attr("id", "divLeft").attr("class", "col-9 no-gutters").style("height", "85%")
        const divRight = d3.select(graph).append("div").attr("id", "divRight").attr("class", "col no-gutters").style("height", "85%")

        const ratio = divLeft.node().clientHeight/12
		const width = parseInt(divLeft.node().clientWidth/ratio, 10)
        const height = 12
        const composeSVG = divLeft.append("svg").attr("viewBox", `0 0 ${width} 12`).attr('id', 'pc')
        
        //const data = [80,50,80,20,10,10]
        this.datas = datas
        this.allColors = allColors
        const r = this.filterData(datas, allColors, 'Genre_Principal', 'Count', (v) => v.Genre_Secondaire_1==='T' && v.Genre_Secondaire_2==='T' && v.inOthers === '0')
        const datag1 = r[0]
        const labelsg1 = r[1]
        const colorsg1 = r[2]
        const o = this.filterData(datas, allColors, 'Genre_Principal', 'Count', (v) => v.Genre_Secondaire_1==='none' && v.Genre_Secondaire_2==='none' && v.inOthers === '1')
        this.dataOthers = o[0]
        this.labelsOthers = o[1]
        this.colorsOthers = o[2]
        /*console.log(datag1)
        console.log(labelsg1.length)
        console.log(colorsg1.length)*/
        this.datag1 = datag1
        this.labelsg1 = labelsg1
        this.colorsg1 = colorsg1
        const xg1 = /*width/2 - 2*/40
        const yg1 = /*height/2 - 2*/30
        this.xg1 = xg1
        this.yg1 = yg1
        const widthG1 = /*4*/50
        const heightG1 = /*4*/50
        this.widthG1 =widthG1
        this.heightG1 = heightG1
        this.width = width
        this.height = height
        
        const text = composeSVG.append("text").text("Proportion of genres in ALL anime")
        .style("font-size", "0.4").style("font-weight", "0.2")
        //.style("background-color", "var(--tooltip-bg, #FFF)")
        .attr("opacity", "1").attr("fill-opacity", "1").style("pointer-events", "none").style("fill", colorText)
        .attr("x", `${this.xg1+10}%`).attr("y", `${this.yg1+6}%`).attr("id", "titleGenre1")
        //const labels = ["Jaune", "Vert", "Orange", "Bleu", "Rouge", "Bleu clair"]
        const g1 = new PieChart(this.datag1, [...this.labelsg1], "g1", `${this.xg1}%`, `${this.yg1}%`, `${this.widthG1}%`, `${this.heightG1}%`, this.colorsg1, colorText)
        this.g1 = g1
        var kg1 = -1
        this.kg1 = kg1
        this.g1.addEventListener("g1", (e) => {
            //console.log(e.detail)
            this.kg1 = e.detail
            this.moveToG2()
        })
        this.g1.addEventListener("clickOthers-g1", (e) => {
            this.showOther = e.detail
            if (this.showOther) {
                this.showOthers()
            }else {
                const el = document.getElementById("others")
                el.remove()
                const elLegend  = document.getElementById("legendCompose");
                elLegend.remove();
                this.createLegend(this.currentCallback)
                this.gOthers = null
                //divTop.node().appendChild(this.currentLegend)*/
            }
        })
        const g2 = null
        this.g2 = g2
        const g3 = null
        this.g3 = g2
        const top = null
        this.top = top
        this.currentG = this.g1
        this.currentId = "g1"

        graph.appendChild(style)
        composeSVG.node().appendChild(this.g1.getShadow())
        //svg.appendChild(this.drawLegend())
        //this.drawLegend()
        //console.log(allColors)
        var colorsPerGenre = []
        //console.log(Object.keys(this.allColors))
        const keys = Object.keys(allColors)
        for (let k =0; k<keys.length; k++){
            colorsPerGenre[k] = {'index' : k, 'genre' : keys[k], 'color' : allColors[keys[k]]}
        }
        //console.log(colorsPerGenre)
        this.colorsPerGenre = colorsPerGenre
        /*var colors = colorsPerGenre.filter((d) => labelsg1.includes(d.genre))
        for (let i = 0; i<colors.length; i++) {
            colors[i].index = i
        }
        /*console.log()
        console.log(labelsg1)*/
        /*const legend = new Legend(colors, 0, 0, '100%', '100%', colorText)
        legend.addEventListener("click-legend", (e) => {
            console.log(this.labelsg1)
            this.clickOnLegend(e.detail)
        })
        legend.addEventListener("dblclick-legend", (e) => {
            this.dblclickOnLegend(e.detail)
        })
        divTop.node().appendChild(legend.getSVG())*/
        this.currentCallback = (d) => this.labelsg1.includes(d.genre)
        this.createLegend(this.currentCallback)
        //this.divTop.node().appendChild(legend.getSVG())
        //console.log("test")
        this.divTitle = divRight.append("div").style("position", "absolute").style("width", "100%").style("height", "4%")
        const divTopAnime = divRight.append("div").attr("id", "divTopAnime").style("position", "relative").style("width", "100%").style("height", "80%").style("top", "4%")//.style("overflow", "auto")
        this.divTopAnime = divTopAnime
        const divBackArrow = divRight.append("div").style("position", "relative").style("width", "100%")
            .style("height", "10%").style("top", "5%")
        //const testSVG = divBackArrow.append("svg").attr("width", "100%").attr("height", "100%")
        //const testPoint = new Point("50%", "50%")
        const backArrowSVG = divBackArrow.append("svg").attr("width", "100%").attr("height", "100%").attr("viewBox","0 0 100 100").attr("preserveAspectRatio","none")
        const backArrowPoints = [new Point(85, 25), new Point(53.33, 25), new Point(53.33, 5), new Point(20, 50), new Point(53.33, 95), new Point(53.33, 75), new Point(85, 75)]
        const backArrowPath = this.generateArrow(backArrowPoints)
        //const backArrowSVG = backArrowSVGcompose.append("svg").attr("x", "10").attr("y", "20").attr("width", "40").attr("height", "40").attr("viewBox","0 0 16 16").attr("preserveAspectRatio","xMinyMid")//.style("position", "absolute").style("left", "20%")
        /*<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-return-left" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z"/>
</svg>*/
        //const backArrow = backArrowSVG.append("path").attr("d", "M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z").attr("stroke-width", "0.15").attr("stroke", colorStrokeBackArrow).attr("fill", colorArrowBack)
        const backArrow = backArrowSVG.append("path").attr("d", backArrowPath).attr("fill", colorArrowBack).attr("stroke", colorStrokeBackArrow).attr("stroke-width", "1.2")
        //const backArrow = divBackArrow.append("i").attr("class", 'fas fa-reply').style("color", colorArrowBack).style("position", "absolute").style("width", "100%").style("height", "100%")
        backArrow.on('click', () => {
            if (this.showOther) {
                this.showOther = false
                const el = document.getElementById("others")
                el.remove()
                const elLegend  = document.getElementById("legendCompose");
                elLegend.remove();
                this.createLegend(this.currentCallback)
                this.gOthers = null
                //divTop.node().appendChild(this.currentLegend)*/
                this.currentG.handlePathOut()
                this.currentG.removeListeners()
                this.currentG.addListeners()
            }else if(this.top !== null) {
                this.g3.handlePathOut()
                this.g3.addListeners()
                this.moveBackToG3()
            }else if(this.g3 !== null){
                this.g2.handlePathOut()
                this.g2.addListeners()
                this.moveBackToG2()
            }else if(this.g2 !=null){
                this.g1.handlePathOut()
                this.g1.addListeners()
                this.moveBackToG1()
            }
        })
        /*backArrowSVG.append('text').text("Back")
            .style("font-size", 25)
            .attr("opacity", "1").attr("fill-opacity", "1").style("pointer-events", "none").style("fill", colorTextBackArrow)
            .attr("x", `30.33%`).attr("y", `55%`).attr("id", "back")*/
        /*const test = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
        test.setAttribute('x', this.width - 1)
        test.setAttribute('y', this.height - 1)
        test.setAttribute('width', 1)
        test.setAttribute('height', 1)
        test.setAttribute('fill', "red")*/

        /*const test = testSVG.append("rect").attr("width", "100%").attr("height", "100%").attr("fill", colorArrowBack)
        test.on('click', () => {
            if(this.top !== null) {
                this.g3.handlePathOut(this.kg3)
                this.g3.addListeners()
                this.moveBackToG3()
            }else if(this.g3 !== null){
                this.g2.handlePathOut(this.kg2)
                this.g2.addListeners()
                this.moveBackToG2()
            }else if(this.g2 !=null){
                this.g1.handlePathOut(this.kg1)
                this.g1.addListeners()
                this.moveBackToG1()
            }
        })*/
        //svg.appendChild(test)
        this.widthpx = parseFloat(widthpx)
        this.heightpx = parseFloat(heightpx)

        //compose.appendChild(this.svg)
        this.composeSVG = composeSVG.node()
        this.composeSVGD3 = composeSVG
    }

    createLegend(callback) {
        var colors = this.colorsPerGenre.filter(callback)
        for (let i = 0; i<colors.length; i++) {
            colors[i].index = i
        }
        /*console.log()
        console.log(labelsg1)*/
        const legend = new Legend(colors, 0, 0, '100%', '100%', this.colorText)
        legend.addEventListener("click-legend", (e) => {
            //console.log(this.labelsg1)
            this.clickOnLegend(e.detail)
        })
        legend.addEventListener("dblclick-legend", (e) => {
            this.dblclickOnLegend(e.detail)
        })
        this.divTop.node().appendChild(legend.getSVG())
    }

    viewOthers() {
        if (this.showOther) {
            this.showOthers()
            this.currentG.removeListeners()
            this.currentG.addOtherListener("click", () => {
                        const event2 = new CustomEvent(`clickOthers-${this.currentId}`, {
                            detail: false,
                            bubbles: true,
                            cancelable: true,
                            composed: false,
                        });
                        this.currentG.removeListeners()
                        this.currentG.addListeners()
                        this.currentG.dispatchEvent(event2)
                    })
        }else {
            const el = document.getElementById("others")
            el.remove()
            const elLegend  = document.getElementById("legendCompose");
            elLegend.remove();
            this.createLegend(this.currentCallback)
            this.gOthers = null
            this.currentG.handlePathOut()
            this.currentG.removeListeners()
            this.currentG.addListeners()
        }
    }

    showOthers() {
        //const divLegend = this.divTopAnime.append("div").style("width", "100%").style("height", "25%")
        const elLegend  = document.getElementById("legendCompose");
        elLegend.remove();
        this.createLegend((d) => this.currentCallback(d) || this.labelsOthers.includes(d.genre))
        //divLegend.node().appendChild(legend.getSVG())
        const svg = this.divTopAnime.append("svg").attr("width", "100%").attr("height", "100%").attr("id", "others")
        svg.append("rect").attr("width", "100%").attr("height", "100%").attr("fill", this.colorBackGroundOthers)
        svg.append("text").text("Proportion of genre in Others").attr("font-size", "23").attr("fill", this.colorTextOthers).attr("x", "15%").attr("y", "15%")
        const gOthers = new PieChart(this.dataOthers, [...this.labelsOthers], "gOthers", `12%`, `15%`, `80%`, `70%`, this.colorsOthers, this.colorText)
        svg.node().appendChild(gOthers.getShadow())
        gOthers.connectedCallback()
        this.gOthers = gOthers
        /*<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
        </svg>*/
        const close = svg.append("svg").attr("x", "92%").attr("y",  "0").attr("width", "32").attr("height", "32").attr("viewBox", "0 0 16 16")
        /*close.on("click", () => {
            this.showOther = false
            const el = document.getElementById("others")
            el.remove()
            const elLegend  = document.getElementById("legendCompose");
            elLegend.remove();
            this.createLegend(this.currentCallback)
            this.gOthers = null
            
            this.currentG.handlePathOut()
            this.currentG.removeListeners()
            this.currentG.addListeners()
        })*/
        const closePath = close.append("path").attr("d", "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z").attr("fill", this.colorCloseOthers)
        closePath.on("click", () => {
            this.showOther = false
            const el = document.getElementById("others")
            el.remove()
            const elLegend  = document.getElementById("legendCompose");
            elLegend.remove();
            this.createLegend(this.currentCallback)
            this.gOthers = null
            this.currentG.handlePathOut()
            this.currentG.removeListeners()
            this.currentG.addListeners()
        })
    }

    generateArrow(points) {
        let path = `M ${points[0].toSvgPath()}`
        for (let k=1; k<points.length; k++) {
            path = `${path} L ${points[k].toSvgPath()}`
        }
        return `${path} L ${points[0].toSvgPath()}`
    }

    clickOnLegend(genre) {
        if(this.showOther) {
            const k = this.labelsOthers.indexOf(genre, 0)
            if (k !== -1) {
                this.gOthers.handlePathHover(k)
            }
        }else if (this.top === null){
            if(this.g3 !== null) {
                const k = this.labelsg3.indexOf(genre, 0)
                if(k !==-1){
                    this.g3.handlePathHover(k)
                }
            }else if(this.g2 !== null) {
                const k = this.labelsg2.indexOf(genre, 0)
                if(k !==-1){
                    this.g2.handlePathHover(k)
                }
            }else if(this.g1 !== null) {
                const k = this.labelsg1.indexOf(genre, 0)
                if(k !==-1){
                    this.g1.handlePathHover(k)
                }
            }
        }
    }

    dblclickOnLegend(genre) {
        if (this.top === null){
            if(this.g3 !== null) {
                if (genre !== 'Others') {
                    if (this.showOther !== true){
                        const k = this.labelsg3.indexOf(genre, 0)
                        if(k !==-1){
                            this.kg3 = k
                            this.g3.removeListeners()
                            this.moveToTop()
                        }
                    }
                }else {
                    this.showOther = !this.showOther
                    this.viewOthers()
                }
            }else if(this.g2 !== null) {
                if (genre !== 'Others') {
                    if (this.showOther !== true){
                        const k = this.labelsg2.indexOf(genre, 0)
                        if(k !==-1){
                            this.kg2 = k
                            this.g2.removeListeners()
                            this.moveToG3()
                        }
                    }
                }else {
                    this.showOther = !this.showOther
                    this.viewOthers()
                }
            }else if(this.g1 !== null) {
                if (genre !== 'Others') {
                    if (this.showOther !== true){
                        const k = this.labelsg1.indexOf(genre, 0)
                        if(k !==-1){
                            this.kg1 = k
                            this.g1.removeListeners()
                            this.moveToG2()
                        }
                    }
                }else {
                    this.showOther = !this.showOther
                    this.viewOthers()
                }
            }
        }
    }

    /*generatesArrowPath(points, x_rotate) {
        return `M ${points[0].toSvgPath()} A 5 5 ${x_rotate} 1 1 ${points[1].toSvgPath()} L ${points[2].toSvgPath()} L ${points[3].toSvgPath()} L ${points[4].toSvgPath()} L ${points[5].toSvgPath()} A 5 5 ${x_rotate} 1 1 ${points[6].toSvgPath()} A 5 5 ${x_rotate} 1 1 ${points[0].toSvgPath()}`
    }*/

    moveToTop() {
        const newXG3 = 50
        const newYG3 = 65
        const newWG3 = 35
        const newHG3 = 35
        const shiftW = this.widthG3 - newWG3
        const shiftH = this.heightG3 - newHG3
        const shiftX = this.xg3 - newXG3
        const shiftY = this.yg3 - newYG3
        const now = Date.now()
        const duration = 1000
        const elementTitle = document.getElementById("titleGenre3")
        elementTitle.remove()
        const r = this.dataAnime.filter((v) => v[this.labelsg1[this.kg1]] === '1' && v[this.labelsg2[this.kg2]] === '1' && v[this.labelsg3[this.kg3]] === '1')
        const nb = r.length >=5 ? 5 : r.length
        const text = this.divTitle.append("text").text(`Top ${nb} of ${this.labelsg1[this.kg1]}, ${this.labelsg2[this.kg2]} and ${this.labelsg3[this.kg3]} anime`)
                    .style("font-size", "0.4").style("font-weight", "0.2")
                    //.style("background-color", "var(--tooltip-bg, #FFF)")
                    .style("opacity", "0").style("fill-opacity", "0").style("pointer-events", "none").style("color", this.colorText)//.style("fill", this.colorText)
                    .attr("x", 0).attr("y", 0).attr("id", "titleTopGenre")
                    const top10 = r.slice(0, 5)
        this.divTitle.style("opacity", "1")
        const x = '74%'
        const y = '15%'
        const width = "100%"
        const height = "100%"
        this.top = new TopAnime(top10, "topG", width, height, this.colorSeparationTop, this.colorBackGroundTop, this.colorStarTop, this.colorTextTop)
        const draw = () => {
            const t = (Date.now() - now) / duration
            if (t < 1) {
                const x = this.xg3 - shiftX*t
                const y = this.yg3 - shiftY*t
                const w = this.widthG3 - shiftW*t
                const h = this.heightG3 - shiftH*t
                if (this.g3 !== null){
                    this.g3.setSVGAttribute(`${x}%`, `${y}%`, `${w}%`, `${h}%`)
                    text.style("opacity", t).style("fill-opacity", t)
                }
                window.requestAnimationFrame(draw)
            } else {
                if (this.g3 !== null){
                    this.g3.setSVGAttribute(`${newXG3}%`, `${newYG3}%`, `${newWG3}%`, `${newHG3}%`)
                    text.style("opacity", "1").style("fill-opacity", "1")
                }
                
                //console.log(r)
                if(this.top !== null) {
                    this.divTopAnime.node().appendChild(this.top.getSVG())
                }
            }
        }
        this.newXG3 = newXG3
        this.newYG3 = newYG3
        this.newWG3 = newWG3
        this.newHG3 = newHG3

        window.requestAnimationFrame(draw)
    }

    moveBackToG3() {
        const shiftX = this.newXG3 - this.xg3
        const shiftY = this.newYG3 - this.yg3
        const shiftW = this.newWG3 - this.widthG3
        const shiftH = this.newHG3 - this.heightG3

        const now = Date.now()
        const duration = 1000
        const element = document.getElementById("topG");
        if (element !== null) {
            element.remove()
        }
        //element.remove();
        const elementTitle = document.getElementById("titleTopGenre")
        if (elementTitle !== null) {
            elementTitle.remove()
        }
        const o = this.filterData(this.datas, this.allColors, 'Genre_Secondaire_2', 'Count', (v) => v.Genre_Principal == this.labelsg1[this.kg1] && v.Genre_Secondaire_1===this.labelsg2[this.kg2] && v.Genre_Secondaire_2!=='none' && v.inOthers === '1')
        this.dataOthers = o[0]
        this.labelsOthers = o[1]
        this.colorsOthers = o[2]
        this.top = null
        this.currentG = this.g3
        this.currentId = "g3"
        const text = this.composeSVGD3.append("text").text(`Proportion of genres in ${this.labelsg1[this.kg1]} and ${this.labelsg2[this.kg2]} anime`)
                    .style("font-size", "0.3").style("font-weight", "0.2")
                    //.style("background-color", "var(--tooltip-bg, #FFF)")
                    .attr("opacity", "0").attr("fill-opacity", "0").style("pointer-events", "none").style("fill", this.colorText)
                    .attr("x", `${this.xg3 + 10}%`).attr("y", `${this.yg3 + 6}%`).attr("id", "titleGenre3")
        const draw = () => {
            const t = (Date.now() - now) / duration
            if (t < 1) {
                const x = this.newXG3 - shiftX*t
                const y = this.newYG3 - shiftY*t
                const w = this.newWG3 - shiftW*t
                const h = this.newHG3 - shiftH*t
                if (this.g3 !== null){
                    this.g3.setSVGAttribute(`${x}%`, `${y}%`, `${w}%`, `${h}%`)
                    text.attr("opacity", t).attr("fill-opacity", t)
                }
                window.requestAnimationFrame(draw)
            } else {
                if (this.g3 !== null){
                    this.g3.setSVGAttribute(`${this.xg3}%`, `${this.yg3}%`, `${this.widthG3}%`, `${this.heightG3}%`)
                    text.attr("opacity", "1").attr("fill-opacity", "1")
                }
            }
        }
        window.requestAnimationFrame(draw)
    }

    moveToG3() {
        const newXG2 = 30
        const newYG2 = 0
        const newWG2 = 35
        const newHG2 = 35
        const shiftW = this.widthG2 - newWG2
        const shiftH = this.heightG2 - newHG2
        const shiftX = this.xg2 - newXG2
        const shiftY = this.yg2 - newYG2
        const now = Date.now()
        const duration = 1000
        const elementTitle = document.getElementById("titleGenre2")
        elementTitle.remove()
        const xg3 = 55
        const yg3 = 50
        this.xg3 = xg3
        this.yg3 = yg3
        const widthG3 = 50
        const heightG3 = 50
        this.widthG3 =widthG3
        this.heightG3 = heightG3
        const text = this.composeSVGD3.append("text").text(`Proportion of genres in ${this.labelsg1[this.kg1]} and ${this.labelsg2[this.kg2]} anime`)
                    .style("font-size", "0.3").style("font-weight", "0.2")
                    //.style("background-color", "var(--tooltip-bg, #FFF)")
                    .attr("opacity", "0").attr("fill-opacity", "0").style("pointer-events", "none").style("fill", this.colorText)
                    .attr("x", `${this.xg3 + 10}%`).attr("y", `${this.yg3 + 6}%`).attr("id", "titleGenre3")

        const r = this.filterData(this.datas, this.allColors, 'Genre_Secondaire_2', 'Count', (v) => v.Genre_Principal == this.labelsg1[this.kg1] && v.Genre_Secondaire_1=== this.labelsg2[this.kg2] && v.Genre_Secondaire_2!=='T' && v.inOthers === '0')
        const datag3 = r[0]
        const labelsg3 = r[1]
        const colorsg3 = r[2]
        const o = this.filterData(this.datas, this.allColors, 'Genre_Secondaire_2', 'Count', (v) => v.Genre_Principal == this.labelsg1[this.kg1] && v.Genre_Secondaire_1===this.labelsg2[this.kg2] && v.Genre_Secondaire_2!=='none' && v.inOthers === '1')
        this.dataOthers = o[0]
        this.labelsOthers = o[1]
        this.colorsOthers = o[2]
        this.datag3 = datag3
        this.labelsg3 = labelsg3
        this.colorsg3 = colorsg3
        const g3 = new PieChart(this.datag3, [...this.labelsg3], "g3", `${this.xg3}%`, `${this.yg3}%`, `${this.widthG3}%`, `${this.heightG3}%`, this.colorsg3, this.colorText)
        this.g3 = g3
        var kg3 = -1
        this.kg3 = kg3
        this.g3.addEventListener("g3", (e) => {
            this.kg3 = e.detail
            this.moveToTop()
        })
        this.g3.addEventListener("clickOthers-g3", (e) => {
            this.showOther = e.detail
            if (this.showOther) {
                this.showOthers()
            }else {
                const el = document.getElementById("others")
                el.remove()
                const elLegend  = document.getElementById("legendCompose");
                elLegend.remove();
                this.gOthers = null
                this.createLegend(this.currentCallback)
            }
        })
        this.currentG = this.g3
        this.currentId = "g3"
        const draw = () => {
            const t = (Date.now() - now) / duration
            if (t < 1) {
                const x = this.xg2 - shiftX*t
                const y = this.yg2 - shiftY*t
                const w = this.widthG2 - shiftW*t
                const h = this.heightG2 - shiftH*t
                if (this.g2 !== null){
                    this.g2.setSVGAttribute(`${x}%`, `${y}%`, `${w}%`, `${h}%`)
                    text.attr("opacity", t).attr("fill-opacity", t)
                }
                window.requestAnimationFrame(draw)
            } else {
                if (this.g2 !== null){
                    this.g2.setSVGAttribute(`${newXG2}%`, `${newYG2}%`, `${newWG2}%`, `${newHG2}%`)
                    text.attr("opacity", "1").attr("fill-opacity", "1")
                }
                if(this.g3 !== null) {
                    this.composeSVG.appendChild(this.g3.getShadow())
                    this.g3.connectedCallback()
                    const element = document.getElementById("legendCompose");
                    element.remove();
                /*var colors = this.colorsPerGenre.filter((d) => this.labelsg1.includes(d.genre) || this.labelsg2.includes(d.genre) || this.labelsg3.includes(d.genre))
                for (let i = 0; i<colors.length; i++) {
                    colors[i].index = i
                }
                const legend = new Legend(colors, 0, 0, '100%', '100%', this.colorText)
                legend.addEventListener("click-legend", (e) => {
                    this.clickOnLegend(e.detail)
                })
                legend.addEventListener("dblclick-legend", (e) => {
                    this.dblclickOnLegend(e.detail)
                })
                this.divTop.node().appendChild(legend.getSVG())*/
                    this.currentCallback = (d) => this.labelsg1.includes(d.genre) || this.labelsg2.includes(d.genre) || this.labelsg3.includes(d.genre)
                    this.createLegend(this.currentCallback)
                //this.divTop.node().appendChild(legend.getSVG())
                //this.currentLegend = this.createLegend((d) => this.labelsg1.includes(d.genre) || this.labelsg2.includes(d.genre) || this.labelsg3.includes(d.genre))
                }
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
        if (element !== null) {
            element.remove()
        }
        //element.remove();
        this.g3 = null
        this.currentG = this.g2
        this.currentId = "g2"
        const elementlegend = document.getElementById("legendCompose");
        elementlegend.remove();
        const elementTitle = document.getElementById("titleGenre3")
        if (elementTitle !== null) {
            elementTitle.remove()
        }
        //elementTitle.remove()
        const o = this.filterData(this.datas, this.allColors, 'Genre_Secondaire_1', 'Count', (v) => v.Genre_Principal == this.labelsg1[this.kg1] && v.Genre_Secondaire_1!=='none' && v.Genre_Secondaire_2==='none' && v.inOthers === '1')
        this.dataOthers = o[0]
        this.labelsOthers = o[1]
        this.colorsOthers = o[2]
        /*var colors = this.colorsPerGenre.filter((d) => this.labelsg1.includes(d.genre) || this.labelsg2.includes(d.genre))
        for (let i = 0; i<colors.length; i++) {
            colors[i].index = i
        }
        const legend = new Legend(colors, 0, 0, '100%', '100%', this.colorText)
        legend.addEventListener("click-legend", (e) => {
            this.clickOnLegend(e.detail)
        })
        legend.addEventListener("dblclick-legend", (e) => {
            this.dblclickOnLegend(e.detail)
        })
        this.divTop.node().appendChild(legend.getSVG())*/
        this.currentCallback = (d) => this.labelsg1.includes(d.genre) || this.labelsg2.includes(d.genre)
        this.createLegend(this.currentCallback)
        //this.divTop.node().appendChild(legend.getSVG())
        //this.currentLegend = this.createLegend((d) => this.labelsg1.includes(d.genre) || this.labelsg2.includes(d.genre))
        const text = this.composeSVGD3.append("text").text(`Proportion of genres in ${this.labelsg1[this.kg1]} anime`)
                    .style("font-size", "0.4").style("font-weight", "0.2")
                    //.style("background-color", "var(--tooltip-bg, #FFF)")
                    .attr("opacity", "0").attr("fill-opacity", "0").style("pointer-events", "none").style("fill", this.colorText)
                    .attr("x", `${this.xg2 + 10}%`).attr("y", `${this.yg2 + 6}%`).attr("id", "titleGenre2")
        const draw = () => {
            const t = (Date.now() - now) / duration
            if (t < 1) {
                const x = this.newXG2 - shiftX*t
                const y = this.newYG2 - shiftY*t
                const w = this.newWG2 - shiftW*t
                const h = this.newHG2 - shiftH*t
                if (this.g2 !== null){
                    this.g2.setSVGAttribute(`${x}%`, `${y}%`, `${w}%`, `${h}%`)
                    text.attr("opacity", t).attr("fill-opacity", t)
                }
                window.requestAnimationFrame(draw)
            } else {
                if (this.g2 !== null){
                    this.g2.setSVGAttribute(`${this.xg2}%`, `${this.yg2}%`, `${this.widthG2}%`, `${this.heightG2}%`)
                    text.attr("opacity", "1").attr("fill-opacity", "1")
                }
            }
        }
        window.requestAnimationFrame(draw)
    }

    moveToG2() {
        const newXG1 = 0
        const newYG1 = 65
        const newWG1 = 35
        const newHG1 = 35
        const shiftW = this.widthG1 - newWG1
        const shiftH = this.heightG1 - newHG1
        const shiftX = this.xg1 - newXG1
        const shiftY = this.yg1 - newYG1
        const now = Date.now()
        const duration = 1000
        const elementTitle = document.getElementById("titleGenre1")
        elementTitle.remove()
        const xg2 = 50
        const yg2 = 5
        this.xg2 = xg2
        this.yg2 = yg2
        const widthG2 = 50
        const heightG2 = 50
        this.widthG2 =widthG2
        this.heightG2 = heightG2
        const text = this.composeSVGD3.append("text").text(`Proportion of genres in ${this.labelsg1[this.kg1]} anime`)
                    .style("font-size", "0.4").style("font-weight", "0.2")
                    //.style("background-color", "var(--tooltip-bg, #FFF)")
                    .attr("opacity", "0").attr("fill-opacity", "0").style("pointer-events", "none").style("fill", this.colorText)
                    .attr("x", `${this.xg2 + 10}%`).attr("y", `${this.yg2 + 6}%`).attr("id", "titleGenre2")
                    const r = this.filterData(this.datas, this.allColors, 'Genre_Secondaire_1', 'Count', (v) => v.Genre_Principal == this.labelsg1[this.kg1] && v.Genre_Secondaire_1!=='T' && v.Genre_Secondaire_2==='T' && v.inOthers === '0'/* && parseFloat(v.Count) >= 300*/)
        const datag2 = r[0]
        const labelsg2 = r[1]
        const colorsg2 = r[2]
        const o = this.filterData(this.datas, this.allColors, 'Genre_Secondaire_1', 'Count', (v) => v.Genre_Principal == this.labelsg1[this.kg1] && v.Genre_Secondaire_1!=='none' && v.Genre_Secondaire_2==='none' && v.inOthers === '1')
        this.dataOthers = o[0]
        this.labelsOthers = o[1]
        this.colorsOthers = o[2]
        this.datag2 = datag2
        this.labelsg2 = labelsg2
        this.colorsg2 = colorsg2
        const g2 = new PieChart(this.datag2, [...this.labelsg2], "g2", `${this.xg2}%`, `${this.yg2}%`, `${this.widthG2}%`, `${this.heightG2}%`, this.colorsg2, this.colorText)
        this.g2 = g2
        var kg2 = -1
        this.kg2 = kg2
        this.g2.addEventListener("g2", (e) => {
            this.kg2 = e.detail
            this.moveToG3()
        })
        this.g2.addEventListener("clickOthers-g2", (e) => {
            this.showOther = e.detail
            if (this.showOther) {
                this.showOthers()
            }else {
                const el = document.getElementById("others")
                el.remove()
                const elLegend  = document.getElementById("legendCompose");
                elLegend.remove();
                this.gOthers = null
                this.createLegend(this.currentCallback)
            }
        })
        this.currentG = this.g2
        this.currentId = "g2"
        const draw = () => {
            const t = (Date.now() - now) / duration
            if (t < 1) {
                const x = this.xg1 - shiftX*t
                const y = this.yg1 - shiftY*t
                const w = this.widthG1 - shiftW*t
                const h = this.heightG1 - shiftH*t
                if (this.g1 !== null){
                    this.g1.setSVGAttribute(`${x}%`, `${y}%`, `${w}%`, `${h}%`)
                    text.attr("opacity", t).attr("fill-opacity", t)
                }
                window.requestAnimationFrame(draw)
            } else {
                if (this.g1 !== null){
                    this.g1.setSVGAttribute(`${newXG1}%`, `${newYG1}%`, `${newWG1}%`, `${newHG1}%`)
                    text.attr("opacity", "1").attr("fill-opacity", "1")
                }
                if(this.g2 !== null) {
                    this.composeSVG.appendChild(this.g2.getShadow())
                    this.g2.connectedCallback()
                    const elementlegend = document.getElementById("legendCompose");
                    elementlegend.remove();
                /*var colors = this.colorsPerGenre.filter((d) => this.labelsg1.includes(d.genre) || this.labelsg2.includes(d.genre))
                for (let i = 0; i<colors.length; i++) {
                    colors[i].index = i
                }
                const legend = new Legend(colors, 0, 0, '100%', '100%', this.colorText)
                legend.addEventListener("click-legend", (e) => {
                    this.clickOnLegend(e.detail)
                })
                legend.addEventListener("dblclick-legend", (e) => {
                    this.dblclickOnLegend(e.detail)
                })
                this.divTop.node().appendChild(legend.getSVG())*/
                    this.currentCallback = (d) => this.labelsg1.includes(d.genre) || this.labelsg2.includes(d.genre)
                    this.createLegend(this.currentCallback)
                //this.divTop.node().appendChild(legend.getSVG())
                //this.currentLegend = this.createLegend((d) => this.labelsg1.includes(d.genre) || this.labelsg2.includes(d.genre))
                }
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
        if (element !== null) {
            element.remove()
        }
        //element.remove();
        this.g2 = null
        this.currentG = this.g1
        this.currentId = "g1"
        const elementlegend = document.getElementById("legendCompose");
        elementlegend.remove();
        const elementTitle = document.getElementById("titleGenre2")
        if (elementTitle !== null) {
            elementTitle.remove()
        }
        //elementTitle.remove()
        const o = this.filterData(this.datas, this.allColors, 'Genre_Principal', 'Count', (v) => v.Genre_Secondaire_1==='none' && v.Genre_Secondaire_2==='none' && v.inOthers === '1')
        this.dataOthers = o[0]
        this.labelsOthers = o[1]
        this.colorsOthers = o[2]
        /*var colors = this.colorsPerGenre.filter((d) => this.labelsg1.includes(d.genre))
        for (let i = 0; i<colors.length; i++) {
            colors[i].index = i
        }
        const legend = new Legend(colors, 0, 0, '100%', '100%', this.colorText)
        legend.addEventListener("click-legend", (e) => {
            this.clickOnLegend(e.detail)
        })
        legend.addEventListener("dblclick-legend", (e) => {
            this.dblclickOnLegend(e.detail)
        })
        this.divTop.node().appendChild(legend.getSVG())*/
        this.currentCallback = (d) => this.labelsg1.includes(d.genre)
        this.createLegend(this.currentCallback)
        //this.divTop.node().appendChild(legend.getSVG())
        //this.currentLegend = this.createLegend((d) => labelsg1.includes(d.genre))
        const text = this.composeSVGD3.append("text").text(`Proportion of genres in ALL anime`)
                    .style("font-size", "0.4").style("font-weight", "0.2")
                    //.style("background-color", "var(--tooltip-bg, #FFF)")
                    .attr("opacity", "0").attr("fill-opacity", "0").style("pointer-events", "none").style("fill", this.colorText)
                    .attr("x", `${this.xg1 + 10}%`).attr("y", `${this.yg1 + 6}%`).attr("id", "titleGenre1")
        const draw = () => {
            const t = (Date.now() - now) / duration
            if (t < 1) {
                const x = this.newXG1 - shiftX*t
                const y = this.newYG1 - shiftY*t
                const w = this.newWG1 - shiftW*t
                const h = this.newHG1 - shiftH*t
                if (this.g1 !== null){
                    this.g1.setSVGAttribute(`${x}%`, `${y}%`, `${w}%`, `${h}%`)
                    text.attr("opacity", t).attr("fill-opacity", t)
                }
                window.requestAnimationFrame(draw)
            } else {
                if (this.g1 !== null){
                    this.g1.setSVGAttribute(`${this.xg1}%`, `${this.yg1}%`, `${this.widthG1}%`, `${this.heightG1}%`)
                    text.attr("opacity", "1").attr("fill-opacity", "1")
                }
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
customElements.define('pie-compose', ComposePieChart)
d3.csv("data/graph4_pie_chart/data.csv", function (error1, d) {
    if (error1) throw error1;


    //format data if required...
    //draw chart
    d3.csv("data/graph4_pie_chart/dataColors.csv", function (error2, c) {
        if (error2) throw error2;
        d3.csv("data/graph4_pie_chart/dataAnime.csv", function(error3, a){
            if (error3) throw error3;
            const ratio = window.innerHeight/12
            const width = parseInt(window.innerWidth/ratio, 10)
            const colorBackGround="white"
            const colorText="black"
            const colorBackGroundTop="#efefef"
            const colorTextTop="black"
            const colorSeparationTop="black"
            const colorStarTop=["red", "black"]
            const colorArrowBack="red"
            const colorStrokeBackArrow="black"
            const colorBackGroundOthers = "#efefef"
            const colorTextOthers = "black"
            const colorCloseOthers = "black"
            const compose = new ComposePieChart(d, c[0], a, /*0, 0, width, 12,*/ '100%', '100%', colorBackGround, colorText,
                colorBackGroundTop, colorTextTop, colorSeparationTop, colorStarTop, colorArrowBack, colorStrokeBackArrow,
                colorBackGroundOthers, colorTextOthers, colorCloseOthers)
            compose.connectedCallback()
        /*const ratio = window.innerHeight/12
        const width = parseInt(window.innerWidth/ratio, 10)
        const compose = new ComposePieChart(d, c[0], 0, 0, width, 12, '100%', '100%')
        compose.connectedCallback()
        window.addEventListener('resize', function() {
            // viewport and full window dimensions will change
            
            const ratio = window.innerHeight/12
            const width = parseInt(window.innerWidth/ratio, 10)
            const pc = document.getElementById("pc")
            pc.remove()
            const compose = new ComposePieChart(d, c[0], 0, 0, width, 12, '100%', '100%')
            compose.connectedCallback()
        });
        //const compose = new Legend(c[0], 0, 0, '100%', '100%')*/
        });
    });
});  