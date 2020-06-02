'use strict'

const { ipcMain, dialog } = require('electron')

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
                filters: [
                    { name: 'Images', extensions: data.extensions}
                ]
            })
            res.data = data
            evt.reply('file-dialog-result', res)
        } catch (err) {
            console.error('Caught exception: '+err.message)
            console.error(err.stack)
        }
    })
}