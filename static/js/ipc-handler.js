'use strict'

const { ipcRenderer } = require('electron')
const osService = require(__dirname + '/../js/services/open-save-service.js')

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
    if (type === 'open') osService.open()
    if (type === 'save-as') osService.saveAs()
    if (type === 'new') osService.new()
}