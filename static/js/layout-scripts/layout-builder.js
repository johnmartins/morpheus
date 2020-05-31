const fs = require('fs')

let layoutContainer = document.getElementById('layout-container')

let matrixLayout = fs.readFileSync('static/html/matrix.html', {encoding: 'utf-8'})
document.getElementById('layout-workspace').innerHTML = matrixLayout

let menuLayout = fs.readFileSync('static/html/menu.html', {encoding: 'utf-8'})
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


