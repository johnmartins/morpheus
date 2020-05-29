'use strict'
const events = require('events')
const { ipcRenderer } = require('electron')

// The Global Observer is available to all other front end parts of the application
const GlobalObserver = new events.EventEmitter()

console.log('ping')
ipcRenderer.send('ping')
ipcRenderer.on('pong', () => {
    console.log('pong')
})