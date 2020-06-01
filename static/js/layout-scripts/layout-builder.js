const fs = require('fs')
const MorphMatrix = require('../js/morph-matrix/matrix')
const path = require('path')

let layoutContainer = document.getElementById('layout-container')

// Setup matrix layout
let matrixLayout = fs.readFileSync(path.join(__dirname,'matrix.html'), {encoding: 'utf-8'})
document.getElementById('layout-workspace').innerHTML = matrixLayout
const morphMartix = new MorphMatrix('matrix-container')

// Setup menu layout
let menuLayout = fs.readFileSync(path.join(__dirname, 'menu.html'), {encoding: 'utf-8'})
document.getElementById('layout-menu').innerHTML = menuLayout

// Handle resizeable borders
let resizing = false

document.body.onmouseup = () => {
    resizing = false
    document.body.onmousemove = null;
}

let menuResizeBorder = document.getElementById('menu-resize-border')
menuResizeBorder.onmousedown = () => {
    resizing = true
    document.body.onmousemove = (evt) => {
        minWidth = 170 //px
        if (!resizing) return
        let mouseX = evt.clientX
        if (mouseX < minWidth) mouseX = minWidth
        layoutContainer.style.gridTemplateColumns = `${mouseX}px 4px auto`
    }
}