'use strict'
/**
 * This script handles all navigation events. 
 * A navigation event should load a HTML file and populate the correct container.
 * @author Julian Martinsson
 */

 
let sideMenu = document.getElementById('side-menu-tabs')

sideMenu.onclick = (evt) => {
    let target = evt.target
    if (!target.classList.contains('tab-element')) return
    if (target.classList.contains('selected')) return

    // Change tab selection
    let currentSelection = sideMenu.querySelector('.selected')
    if (currentSelection) currentSelection.classList.remove('selected')
    target.classList.add('selected')

    // Change content
    // TODO: ...
}