'use strict'

const { ipcMain, dialog, app } = require('electron')

module.exports = (win) => {

    // Test that is run when the renderer starts.
    ipcMain.on('ping', (evt, arg) => {
        console.log("Pinged from client")
        evt.reply('pong')
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
}