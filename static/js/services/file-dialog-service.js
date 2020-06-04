const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')
const random = require('./../utils/random')
const storageService = require('./storage-service')

module.exports = (GlobalObserver) => {

    // Handle file dialog request from other modules
    GlobalObserver.on('open-file-dialog', (data) => {
        ipcRenderer.send('open-file-dialog', data)
    })
    ipcRenderer.on('file-dialog-result', (evt, openFileResult) => {
        if (openFileResult.canceled) return

        let originalPath = openFileResult.filePaths[0]
        // copy file to a safe location
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
    })

    GlobalObserver.on('save-file-dialog', (data) => {
        ipcRenderer.send('save-file-dialog', data)
    })
    ipcRenderer.on('save-file-result', (evt, saveFileResult) => {
        if (saveFileResult.canceled) return
        GlobalObserver.emit('save-file-result', saveFileResult)
    })
}