'use strict'

const { ipcMain, dialog, app } = require('electron')

module.exports = (win) => {

    // Test that is run when the renderer starts.
    ipcMain.on('get-version', (evt, arg) => {
        console.log("Client requested software version")
        evt.reply('return-version', app.getVersion())
    })

    ipcMain.on('open-file-dialog', async (evt, data) => {
        try {
            let res = await dialog.showOpenDialog({
                properties: ['openFile'],
                filters: data.filters
            })
            res.data = data
            evt.reply('file-dialog-result', res)
        } catch (err) {
            console.error('Caught exception: '+err.message)
            console.error(err.stack)
        }
    })

    ipcMain.on('save-file-dialog', async (evt, data) => {
        try {
            let res = await dialog.showSaveDialog({
                filters: data.filters
            })
            res.data = data
            evt.reply('save-file-result', res)
        } catch (err) {
            console.error('Caught exception: '+err.message)
            console.error(err.stack)  
        }
    })

    ipcMain.on('exit-confirmed', () => {
        console.log('Graceful shutdown confirmed')
        app.exit(0)
    })

    ipcMain.on('client-side-loaded', () => {
        console.log('The client side had loaded')

        // Parse application arguments
        require('./argument-parser').parseArguments(win)
    })
}