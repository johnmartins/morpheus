'use strict'

const path = require('path')
const { ipcRenderer, ipcMain } = require('electron')

const popup = require(path.join(__dirname, '/../js/layout-scripts/popup.js'))
const osService = require(path.join(__dirname, '/../js/services/open-save-service.js'))
const workspace = require(path.join(__dirname, '/../js/workspace.js'))

// Test IPC connectivity
console.log('ping')
ipcRenderer.send('ping')
ipcRenderer.on('pong', () => {
    console.log('pong')
})

ipcRenderer.on('menu-event', (evt, menuEvent) => {handleMenuEvent(menuEvent)})

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
        popup.warning('You have unsaved changes. Are you sure you want to exit the application?', {
            callbackCancel: () => {return},
            callbackContinue: () => {
                continueCallback()
            }
        })
    } else {
        continueCallback()
    }
}