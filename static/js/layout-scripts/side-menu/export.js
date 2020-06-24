'use strict'

const Selector = require('./../selector')
const workspace = require('./../../workspace')

const NAME_SOLUTION_EXPORT_TARGET = 'export-solutions-radio'

module.exports = {

    setupListeners: () => {
        let tabExport = document.getElementById('tab-export')
        let btnExportMatrix = document.getElementById('btn-export-matrix')
        let btnExportSolutions = document.getElementById('btn-export-solutions')

        let selector = new Selector()
        document.getElementById('exp-sol-sel-cont').appendChild(selector.getElement())
        selector.hide()

        // Listen for radio input changes
        tabExport.onclick = (evt) => {
            const name = evt.target.name
            if (!name) return
            if (name === NAME_SOLUTION_EXPORT_TARGET) {
                let val = tabExport.querySelector(`[name="${NAME_SOLUTION_EXPORT_TARGET}"]:checked`).value

                if (val === 'specific') {
                    selector.show()
                } else {
                    selector.hide()
                }
            }
        }

        btnExportMatrix.onclick = () => {

        }

        btnExportSolutions.onclick = () => {

        }

        GlobalObserver.on('solution-added', (solID) => {
            let solName = workspace.getMatrix().getSolution(solID).name
            selector.addOption(solName, solID)
            selector.setValue(solID)
        })

        GlobalObserver.on('solution-removed', (solID) => {
            selector.removeOption(solID)
        })
    }
}

