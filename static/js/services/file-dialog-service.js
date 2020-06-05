const { ipcRenderer } = require('electron')
const path = require('path')
const storageService = require('./storage-service')

module.exports = (GlobalObserver) => {

    // Handle file dialog request from other modules
    GlobalObserver.on('open-file-dialog', (data) => {
        ipcRenderer.send('open-file-dialog', data)
    })
    ipcRenderer.on('file-dialog-result', (evt, openFileResult) => {
        if (openFileResult.canceled) return

        if (openFileResult.data.copyToTmp) {
            console.log("copying")
            // copy file to a safe location
            let originalPath = openFileResult.filePaths[0]
            storageService.copyFileToTmp(originalPath).then( (destPath) => {
                GlobalObserver.emit('file-dialog-result', {
                    data: openFileResult.data,
                    path: destPath,
                    fileName: path.basename(destPath),
                    originalPath: originalPath,
                    originalFileName: path.basename(originalPath)
                })
            }).catch((err) => {
                console.error('Failed to copy file.')
            })
        } else {
            console.log("referencing non-copy")
            // Send reference to file
            GlobalObserver.emit('file-dialog-result', {
                data: openFileResult.data,
                path: openFileResult.filePaths[0],
                fileName: path.basename(openFileResult.filePaths[0])
            })
        }

    })

    GlobalObserver.on('save-file-dialog', (data) => {
        ipcRenderer.send('save-file-dialog', data)
    })
    ipcRenderer.on('save-file-result', (evt, saveFileResult) => {
        if (saveFileResult.canceled) return
        GlobalObserver.emit('save-file-result', saveFileResult)
    })
}