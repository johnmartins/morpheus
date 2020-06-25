'use strict'

const Selector = require('./../selector')
const workspace = require('./../../workspace')
const exportService = require('./../../services/export-service')

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
            let radioTypeElement = tabExport.querySelector(`[name="export-matrix-format-radio"]:checked`)
            let type = radioTypeElement.value

            if (type ==='png') {
                exportService.exportMatrixToPNG()
            } else if (type === 'csv') {
                exportService.exportMatrixToCSV()
            } else {
                console.error('Unknown type selected')
            }
        }

        btnExportSolutions.onclick = () => {
            let radioTypeElement = tabExport.querySelector(`[name="export-solutions-format-radio"]:checked`)
            let radioTargetElement = tabExport.querySelector(`[name="export-solutions-radio"]:checked`)
            let type = radioTypeElement.value
            let target = radioTargetElement.value
            console.log(target)

            if (type ==='png') {
                if (target === 'all'){ 
                    exportService.exportSolutionsToPNG()
                } else if (target ==='specific') {
                    exportService.exportSolutionToPNG()
                }
                
            } else if (type === 'csv') {
                if (target === 'all'){ 
                    exportService.exportSolutionsToCSV()
                } else if (target ==='specific') {
                    exportService.exportSolutionToCSV()
                }

            } else {
                console.error('Unknown type selected')
            }
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

