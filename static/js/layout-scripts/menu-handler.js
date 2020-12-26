'use strict'
/**
 * This script handles all navigation events. 
 * A navigation event should load a HTML file and populate the correct container.
 * @author Julian Martinsson
 */
const path = require('path')

// Setup side menus
require(path.join(__dirname, './side-menu/solutions')).init()
require(path.join(__dirname, './side-menu/export')).setupListeners()
require(path.join(__dirname, './side-menu/delimitations')).init()

const state = require('./../state')

let sideMenu = document.getElementById('side-menu-tabs')

let currentTabContent = null

module.exports = () => {
    // Setup default tab
    setTab('tab-delimitations')

    sideMenu.onclick = (evt) => {
        let target = evt.target
        if (!target.classList.contains('tab-element')) return
        if (target.classList.contains('selected')) return

        // Change tab selection
        let currentSelection = sideMenu.querySelector('.selected')
        if (currentSelection) currentSelection.classList.remove('selected')
        target.classList.add('selected')

        // Change content
        let targetTabID = target.getAttribute('target');
        
        setTab(targetTabID)
    }

    function setTab(tabID) {
        if (!tabID) console.error('no target tab id')
        let targetTabContent = document.getElementById(tabID)
        if (!targetTabContent) console.error('no target tab content')
        if (currentTabContent) currentTabContent.style.display = 'none'
        targetTabContent.style.display = 'flex'
        currentTabContent = targetTabContent

        GlobalObserver.emit('tab-change', {
            currentTab: state.tabCurrent,
            nextTab: tabID
        })

        state.setCurrentTab(tabID)
    }
}

