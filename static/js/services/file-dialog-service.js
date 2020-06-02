const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')
const random = require('./../utils/random')
const userDataPath = __dirname+'/../../../user-data/' // this is awful and should probably be OS TMP directory

module.exports = (GlobalObserver) => {

    // Handle file dialog request from other modules
    GlobalObserver.on('open-file-dialog', (data) => {
        ipcRenderer.send('open-file-dialog', data)
    })
    ipcRenderer.on('file-dialog-result', (evt, openFileResult) => {
        if (openFileResult.canceled) return

        let originalPath = openFileResult.filePaths[0]
        let fileExtension = path.extname(originalPath)
        let targetFileName = `user-img-${random.randomString(10)}${fileExtension}`
        let targetPath = `${userDataPath}${targetFileName}`
        fs.copyFileSync(originalPath, targetPath)

        GlobalObserver.emit('file-dialog-result', {
            data: openFileResult.data,
            file: targetPath
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