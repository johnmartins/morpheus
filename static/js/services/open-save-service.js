'use strict'

const fs = require('fs')
const workspace = require('./../workspace.js')

module.exports = {
    new: () => {
        console.log("NEW")
    },
    open: () => {
        console.log("OPEN")

        GlobalObserver.once('file-dialog-result', (res) => {
            if (res.data.type !== 'open-file') return
            if (!fs.existsSync(res.file)) {
                console.error('Failed to find file')
                return
            }

            console.log("reading file: "+res.file)
            let content = fs.readFileSync(res.file, {encoding: 'utf8'})
            let json = JSON.parse(content)
            workspace.createMatrixFromObject(json)
        })

        GlobalObserver.emit('open-file-dialog', {type: 'open-file', extensions: ['json']})
    },
    save: () => {
        console.log("SAVE")
    },
    saveAs: () => {
        console.log("SAVE AS")

        GlobalObserver.once('save-file-result', (res) => {
            console.log(`Save to file ${res.filePath}`)
            fs.writeFile(res.filePath, workspace.getMatrixJSON(), () => {
                console.log("Saved!")
            })
            
        })

        GlobalObserver.emit('save-file-dialog', {type: 'save-file', extensions: ['json']})
    },  
}