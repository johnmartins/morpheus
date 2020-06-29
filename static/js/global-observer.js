'use strict'
const events = require('events')

// The Global Observer is available to all other front end parts of the application
const GlobalObserver = new events.EventEmitter()