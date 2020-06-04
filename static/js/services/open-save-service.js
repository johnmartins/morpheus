'use strict'

const fs = require('fs')
const workspace = require('./../workspace.js')

module.exports = {
    new: () => {
        console.log("NEW")
        workspace.createEmptyMatrix()
    },
    open: () => {
        console.log("OPEN")

        GlobalObserver.once('file-dialog-result', (res) => {
            if (res.data.type !== 'open-file') return
            if (!fs.existsSync(res.path)) {
                console.error('Failed to find file')
                return
            }

            workspace.setWorkingFileLocation(res.originalPath)
            console.log("reading file: "+res.path)
            let content = fs.readFileSync(res.path, {encoding: 'utf8'})
            let json = JSON.parse(content)
            workspace.createMatrixFromObject(json)
        })

        GlobalObserver.emit('open-file-dialog', {
            type: 'open-file', 
            filters: [
                { name: 'Morph-matrix', extensions: ['morph'] },
                { name: 'JSON', extensions: ['json'] }
            ]
        })
    },
    save: () => {
        console.log("SAVE")
        let filePath = workspace.getWorkingFileLocation()

        // File has not previously been saved
        if (!filePath) {
            return module.exports.saveAs()
        }

        saveFile(filePath)

    },
    saveAs: () => {
        console.log("SAVE AS")

        GlobalObserver.once('save-file-result', (res) => {
            saveFile(res.filePath)
            workspace.setWorkingFileLocation(res.filePath)
        })

        GlobalObserver.emit('save-file-dialog', {type: 'save-file', extensions: ['json']})
    },  
}

function saveFile (filePath) {
    console.log(`Save to file ${filePath}`)
    let saveJsonContent = workspace.getMatrixJSON()

    let overwrite = fs.existsSync(filePath)

    if (overwrite) {
        overwriteFile(filePath, saveJsonContent, () => workspace.saveCurrentHash() )
    } else {
        writeContentToFile(filePath, saveJsonContent, () => workspace.saveCurrentHash())
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