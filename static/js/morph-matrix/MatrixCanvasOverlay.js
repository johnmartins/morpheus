'use strict'

const random = require('./../utils/random')

class CanvasLayer {
    constructor (name) {
        this.name = name
        this.canvasID = 'matrix-canvas-'+random.randomString(5)
        this.canvas = null
        this.ctx = null
    }
}

class MatrixCanvasOverlay {
    constructor () {
        this.canvasID = 'matrix-canvas-'+random.randomString(5)

        this.canvas = null
        this.ctx = null

        // Used matrix properties
        this.matrixTableElement = null
    }

    create (matrixTableElement, layer) {
        this.matrixTableElement = matrixTableElement
        this.destroy()

        this.canvas = document.createElement('canvas')
        this.ctx = this.canvas.getContext('2d')
        this.canvas.id = this.canvasID
        this.canvas.classList.add('matrix-canvas-overlay')

        this.canvas.style.width = matrixTableElement.offsetWidth + 'px'
        this.canvas.style.height = matrixTableElement.offsetHeight + 'px'
        this.canvas.width = matrixTableElement.offsetWidth
        this.canvas.height = matrixTableElement.offsetHeight

        matrixTableElement.appendChild(this.canvas)
    }

    clear () {
        if (!this.canvas) return
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    destroy () {
        if (!this.canvas) return
        this.canvas.parentElement.removeChild(this.canvas)
        this.canvas = null
    }

    rebuildCanvas () {
        if (!this.canvas) return
        this.destroy()
        this.create(this.matrixTableElement)
    }

    createLine (ss1, ss2) {
        let ssCell1 = document.getElementById(ss1.id)
        let ssCell2 = document.getElementById(ss2.id)

        if (!this.canvas) throw new Error('Canvas not yet created.')
        this.ctx.beginPath()

        let parentPos = this.canvas.getBoundingClientRect()
        let d1Pos = ssCell1.getBoundingClientRect()
        let d2Pos = ssCell2.getBoundingClientRect()
        let d1RelativePos = {
            top: d1Pos.top - parentPos.top,
            left: d1Pos.left - parentPos.left
        }
        let d2RelativePos = {
            top: d2Pos.top - parentPos.top,
            left: d2Pos.left - parentPos.left
        }

        let x1 = d1RelativePos.top + ssCell1.offsetHeight/2
        let y1 = d1RelativePos.left + ssCell1.offsetWidth/2
        let x2 = d2RelativePos.top + ssCell2.offsetHeight/2
        let y2 = d2RelativePos.left + ssCell2.offsetWidth/2

        this.ctx.moveTo(y1, x1)
        this.ctx.lineTo(y2, x2)
        this.ctx.lineWidth = 2
        this.ctx.strokeStyle = 'rgba(94,211,237,0.5)'
        this.ctx.stroke()
    }

    isCreated () {
        if (this.canvas) return true
        return false
    }
}

module.exports = MatrixCanvasOverlay