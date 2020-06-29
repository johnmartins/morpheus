'use strict'

const { ipcRenderer } = require('electron')
const path = require('path')
const storageService = require('./storage-service')

module.exports = {

    // replaces open-file-dialog
    newOpenFileDialog: (data) => {
        return new Promise((resolve, reject) => {
            try {
                ipcRenderer.send('open-file-dialog', data)
                ipcRenderer.once('file-dialog-result', (evt, openFileResult) => {
                    if (openFileResult.canceled) {
                        resolve(null)
                        return
                    }

                    // If the new file should be copied
                    if (openFileResult.data.copyToTmp) {
                        console.log('copying..')

                        // Copy file to a safe location
                        let originalPath = openFileResult.filePaths[0]
                        storageService.copyFileToTmp(originalPath).then( (destPath) => {
                            resolve({
                                data: openFileResult.data,
                                path: destPath,
                                fileName: path.basename(destPath),
                                originalPath: originalPath,
                                originalFileName: path.basename(originalPath)
                            })
                        })
                        return
                    }

                    // If we want to reference the selected location
                    console.log("referencing non-copy")

                    // Send reference to file
                    resolve({
                        data: openFileResult.data,
                        path: openFileResult.filePaths[0],
                        fileName: path.basename(openFileResult.filePaths[0])
                    })
                    return
                })

            } catch (err) {
                reject(err)
                return
            }
        })
    },

    // Replaces save-file-dialog
    newSaveFileDialog: (data) => {
        return new Promise((resolve, reject) => {
            try {
                ipcRenderer.send('save-file-dialog', data)
                ipcRenderer.once('save-file-result', (evt, saveFileResult) => {
                    if (saveFileResult.canceled) {
                        resolve(null)
                        return
                    }
                    resolve(saveFileResult)
                    return
                })
            } catch (err) {
                reject(err)
                return
            }
        })
    }
}