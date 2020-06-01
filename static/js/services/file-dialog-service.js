const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')
const random = require('./../utils/random')
const userDataPath = __dirname+'/../../../user-data/' // this is awful

module.exports = (GlobalObserver) => {

    // Handle file dialog request from other modules
    GlobalObserver.on('open-file-dialog', (settings) => {
        ipcRenderer.send('open-file-dialog', settings)
    })
    ipcRenderer.on('file-dialog-result', (evt, openFileResult) => {
        if (openFileResult.canceled) return

        let originalPath = openFileResult.filePaths[0]
        let fileExtension = path.extname(originalPath)
        let targetFileName = `user-img-${random.randomString(8)}${fileExtension}`
        let targetPath = `${userDataPath}${targetFileName}`
        fs.copyFileSync(originalPath, targetPath)

        GlobalObserver.emit('file-dialog-result', {
            evenID: 'asdasd',
            file: targetPath
        })
    })
}