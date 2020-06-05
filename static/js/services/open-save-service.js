'use strict'

const fs = require('fs')
const workspace = require('./../workspace.js')
const storageService = require('./storage-service')

module.exports = {
    new: () => {
        workspace.createEmptyMatrix()
    },
    open: () => {
        GlobalObserver.once('file-dialog-result', (res) => {
            if (res.data.type !== 'open-file') return
            if (!fs.existsSync(res.path)) {
                console.error('Failed to find file')
                return
            }

            workspace.setWorkingFileLocation(res.path)
            storageService.unzipInTmpStorage(res.path, () => {
                let content = fs.readFileSync(storageService.getTmpStorageDirectory() + 'matrix.json', {encoding: 'utf8'})
                let json = JSON.parse(content)
                workspace.createMatrixFromObject(json)
            })
        })

        GlobalObserver.emit('open-file-dialog', {
            type: 'open-file', 
            filters: [
                { name: 'Morph-matrix', extensions: ['morph'] }            ]
        })
    },
    save: () => {
        // File has not previously been saved
        if (!workspace.getWorkingFileLocation()) {
            return module.exports.saveAs()
        }
        saveFile()
    },
    saveAs: () => {
        GlobalObserver.once('save-file-result', (res) => {
            workspace.setWorkingFileLocation(res.filePath)
            saveFile()
        })

        GlobalObserver.emit('save-file-dialog', {
            type: 'save-file', 
            filters: [ 
                {name: 'Morph-matrix', extensions: ['morph']}
            ]
        })
    },  
}

function saveFile () {
    //storageService.getTmpStorageDirectory()
    let tmpFilePath = workspace.getTempFileLocation()
    console.log(`Save to file ${tmpFilePath}`)
    let saveJsonContent = workspace.getMatrixJSON()

    // write JSON to file in tmp dir
    // zip
    // copy zip to final location

    let overwrite = fs.existsSync(workspace.getTempFileLocation())

    let onJsonSavedCallback = () => {
        workspace.saveCurrentHash()

        // Wrap all content up into a neat zip-file
        storageService.zipTmpStorageDir( (output) => {
            console.log(output)
            // Copy zip file to final non-tmp destionation
            fs.copyFile(output, workspace.getWorkingFileLocation(), fs.constants.COPYFILE_FICLONE, (err) => {
                if (err) throw err
                console.log("Done copying to true destination")
            })
        })    
    }

    // Write content to tmp json file
    if (overwrite) {
        overwriteFile(tmpFilePath, saveJsonContent, onJsonSavedCallback )
    } else {
        writeContentToFile(tmpFilePath, saveJsonContent, onJsonSavedCallback)
    }
}

function overwriteFile (filePath, content, callback) {
    fs.access(filePath, fs.constants.W_OK, err => {
        if (err) {
            console.error('Save failed. Could not access file.')
            return
        } 
        console.log("File can be written to.")
        writeContentToFile(filePath, content, callback)
    })
}

function writeContentToFile (filePath, content, callback) {
    fs.writeFile(filePath, content, {flag: 'w'}, (err) => {
        if (err) {
            console.error(err.message)
            console.error(err.stack)
            return
        }
        console.log("Saved!")
        callback()
    })
}