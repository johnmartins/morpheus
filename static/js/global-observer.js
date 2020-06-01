'use strict'
const events = require('events')
const { ipcRenderer } = require('electron')

// The Global Observer is available to all other front end parts of the application
const GlobalObserver = new events.EventEmitter()

// Handle file dialog request from other modules
GlobalObserver.on('open-file-dialog', (settings) => {
    ipcRenderer.send('open-file-dialog', settings)
})
ipcRenderer.on('file-dialog-result', (evt, openFileResult) => {
    console.log(openFileResult.filePaths[0])
})

console.log('ping')
ipcRenderer.send('ping')
ipcRenderer.on('pong', () => {
    console.log('pong')
})