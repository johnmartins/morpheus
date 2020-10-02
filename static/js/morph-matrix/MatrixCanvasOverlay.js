'use strict'

const random = require('./../utils/random')
const DesignSolution = require('./DesignSolution')

class CanvasLayer {
    constructor (matrixTableElement, {defaultColor = 'rgba(94,211,237,0.5)'} = {}) {
        this.canvas = document.createElement('canvas')
        this.ctx = this.canvas.getContext('2d')
        this.canvas.id = 'matrix-canvas-'+random.randomString(5)
        this.canvas.classList.add('matrix-canvas-overlay')
        this.defaultColor = defaultColor

        this.canvas.style.width = matrixTableElement.offsetWidth + 'px'
        this.canvas.style.height = matrixTableElement.offsetHeight + 'px'
        this.canvas.width = matrixTableElement.offsetWidth
        this.canvas.height = matrixTableElement.offsetHeight

        matrixTableElement.appendChild(this.canvas)
    }

    setDefaultColor (color) {
        this.defaultColor = color
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

    createLine (ss1, ss2, {color = this.defaultColor} = {}) {
        let ssCell1 = document.getElementById(ss1.id)
        let ssCell2 = document.getElementById(ss2.id)
        if (!color) color = this.defaultColor

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
        this.ctx.strokeStyle = color
        this.ctx.stroke()
    }
}

class MatrixCanvasOverlay {
    constructor (matrixTableElement) {
        this.layers = {} // name -> canvas layer map

        // Used matrix properties
        this.matrixTableElement = matrixTableElement
    }

    /**
     * Create a new canvas overlay layer
     * @param {String} layer 
     */
    create (layer, {defaultColor = 'rgba(94,211,237,0.5)'} = {}) {
        if (this.layers[layer]) {
            this.destroy(layer)
        }

        let canvasLayer = new CanvasLayer(this.matrixTableElement, 
            {
                defaultColor: defaultColor
            })
        this.layers[layer] = canvasLayer
    }

    /**
     * Clear this layer of information
     * @param {String} layer 
     */
    clear (layer) {
        let cl = this.layers[layer]
        if (!cl) return
        cl.clear()
    }

    /**
     * Completely remove the entire layer
     * @param {String} layer 
     */
    destroy (layer) {
        let cl = this.layers[layer]
        if (!cl) return
        cl.destroy()
    }

    /**
     * Completely destroy the layer, and then create it again.
     * This is useful if the canvas needs to change size.
     * @param {String} layer 
     */
    rebuildCanvas (layer) {
        this.destroy(layer)
        this.create(layer)
    }

    /**
     * Draw a line from one SS to another SS in the matrix
     * @param {String} layer 
     * @param {DesignSolution} ss1 
     * @param {DesignSolution} ss2 
     */
    createLine (layer, ss1, ss2, {color = null} = {}) {
        let cl = this.layers[layer]
        if (!cl) {
            console.error('Attempted to draw a line in uninitialized layer')
            return
        }

        cl.createLine(ss1, ss2, {color: color})
    }

    /**
     * Returns true if the layer has been created.
     * Returns false otherwise.
     * @param {String} layer 
     */
    isCreated (layer) {
        let cl = this.layers[layer]
        if (!cl) return false
        if (!cl.canvas) return false
        return true
    }
}

module.exports = MatrixCanvasOverlay