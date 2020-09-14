'use strict'

const fs = require('fs')

module.exports = {
    parseArguments: (win) => {
        console.log('Parsing application arguments..')

        for (let arg of process.argv) {
            let isMorphFilePath = /\.morph$/

            if (isMorphFilePath.test(arg)) {
                win.webContents.send('force-load-file', arg)
            }
        }        

    }
}