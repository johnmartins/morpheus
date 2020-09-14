'use strict';
// This script is wrapped up in a self executing function to prevent its scope from leaking into all other scripts.
// This is the only script that (besides the global observer) is directly referenced in the HTML. 
// Thus, this is the "root" script, which spawns all other scripts.
(function () {
    const fs = require('fs')
    const path = require('path')

    const workspace = require(path.join(__dirname, '../js/workspace.js'))
    let layoutContainer = document.getElementById('layout-container')

    // Setup matrix layout
    let matrixLayout = fs.readFileSync(path.join(__dirname,'matrix.html'), {encoding: 'utf-8'})
    workspace.setLayoutElementID('layout-workspace')
    workspace.createToolOverlay()
    workspace.appendHtmlContent(matrixLayout)
    workspace.setMatrixContainer('matrix-container')
    workspace.createEmptyMatrix()

    // Setup menu layout
    let menuLayout = fs.readFileSync(path.join(__dirname, 'menu.html'), {encoding: 'utf-8'})
    document.getElementById('layout-menu').innerHTML = menuLayout
    require(path.join(__dirname, '../js/layout-scripts/menu-handler.js'))()

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
            let minWidth = 170 //px
            if (!resizing) return
            let mouseX = evt.clientX
            if (mouseX < minWidth) mouseX = minWidth
            layoutContainer.style.gridTemplateColumns = `${mouseX}px 4px auto`
        }
    }

    // Should be the last thing that runs in the layout builder.
    // Broadcast to nodejs back-end that the client side has finished loading. 
    ipcRenderer.send('client-side-loaded')
}())