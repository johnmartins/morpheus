'use strict'

const fs = require('fs')
const workspace = require('./../workspace.js')

module.exports = {
    new: () => {
        console.log("NEW")
    },
    open: () => {
        console.log("OPEN")

        const onOpenFileResult = (res) => {
            if (res.data.type !== 'open-file') return
            if (!fs.existsSync(res.file)) {
                console.error('Failed to find file')
                return
            }

            GlobalObserver.removeListener('file-dialog-result', onOpenFileResult)

            console.log("reading file: "+res.file)
            let content = fs.readFileSync(res.file, {encoding: 'utf8'})
            let json = JSON.parse(content)
            workspace.createMatrixFromObject(json)
        }

        GlobalObserver.on('file-dialog-result', onOpenFileResult)
        GlobalObserver.emit('open-file-dialog', {type: 'open-file', extensions: ['json']})
    },
    save: () => {
        console.log("SAVE")
    },
    saveAs: () => {
        console.log("SAVE AS")
    },  
}