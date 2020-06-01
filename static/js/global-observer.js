'use strict'
const events = require('events')
const { ipcRenderer } = require('electron')

// The Global Observer is available to all other front end parts of the application
const GlobalObserver = new events.EventEmitter()

// Pass global observer to services
require(__dirname + '/../js/services/file-dialog-service')(GlobalObserver)

// Test IPC connectivity
console.log('ping')
ipcRenderer.send('ping')
ipcRenderer.on('pong', () => {
    console.log('pong')
})