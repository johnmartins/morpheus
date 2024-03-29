'use strict'

const path = require('path')
const { ipcRenderer, ipcMain } = require('electron')

const popup = require(path.join(__dirname, '/../js/layout-scripts/popup.js'))
const osService = require(path.join(__dirname, '/../js/services/open-save-service.js'))
const workspace = require(path.join(__dirname, '/../js/workspace.js'))
const state = require(path.join(__dirname, '/../js/state.js'))

// Test IPC connectivity
ipcRenderer.send('get-version')
ipcRenderer.on('return-version', (evt, version) => {
    console.log('Morpheus version: ' + version)
    state.softwareVersion = version
})

ipcRenderer.on('menu-event', (evt, menuEvent) => {handleMenuEvent(menuEvent)})

ipcRenderer.on('force-load-file', (evt, file) => {
    osService.open(file)
})

function handleMenuEvent(menuEvent) {
    let type = menuEvent.type

    if (type === 'save') osService.save()
    if (type === 'save-as') osService.saveAs()

    if (type === 'new') askUserIfUnsaved(() => {osService.new()}) 
    if (type === 'open') askUserIfUnsaved(() => {osService.open()}) 
    if (type === 'exit') askUserIfUnsaved(() => {ipcRenderer.send('exit-confirmed')})
}

function askUserIfUnsaved (continueCallback) {
    if (workspace.checkUnsavedChanges()) {
        popup.warning('You have unsaved changes. If you continue your changes will be lost.', {
            callbackCancel: () => {return},
            callbackContinue: () => {
                continueCallback()
            }
        })
    } else {
        continueCallback()
    }
}