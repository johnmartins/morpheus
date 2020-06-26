'use strict'

const html2canvas = require('html2canvas')
const fs = require('fs')

const workspace = require('./../workspace')
const fileDiagService = require('./file-dialog-service')
const popup = require('./../layout-scripts/popup')

module.exports = {

    /**
     * Export the matrix to a CSV file
     */
    exportMatrixToCSV: () => {
        console.log('Exporting matrix to CSV..')

        fileDiagService.newSaveFileDialog({
            filters: [ 
                {name: 'CSV', extensions: ['csv']}
            ]
        }).then((res) => {
            console.log(res)

            if (res.canceled) return

            // Export FR and DS arrays to CSV
            let csv = ''
            let matrix = workspace.getMatrix()
            
            const frArray = matrix.functionalRequirements
            for (let i = 0; i < frArray.length; i++) {
                const fr = frArray[i]
                csv += fr.description

                const dsArray = fr.designSolutions
                for (let j = 0; j < dsArray.length; j++) {
                    const ds = dsArray[j]
                    csv += ';\t' + ds.description
                }

                csv += '\n'
            }

            // Write to file (should be done using a stream in the final version)
            console.log(csv)
            fs.writeFileSync(res.filePath, csv)

            popup.notify(`Export to CSV successful. <br>${res.filePath}`, {
                titleTxt: 'Export done'
            })
        }).catch((err) => {
            popup.error('Failed to export solutions to CSV. Reason: ' + err.message)
        })
    },

    /** 
     * Export the matrix into a PNG image
     */
    exportMatrixToPNG: () => {
        console.log('Exporting matrix to PNG..')
        let matrix = workspace.getMatrix()

        html2canvas(matrix.getContainerElement(), {
            backgroundColor: 'black',
            ignoreElements: (element) => {
                if (element.classList.contains('mm-add-cell')) return true
                return false
            }
        }).then(canvas => {
            let img = canvas.toDataURL('image/png')
            document.write(`<img src="${img}">`)
        })
    },

    exportSolutionToCSV: (solutionID) => {
        console.log('Exporting solution to CSV..')

        try {
            if (!solutionID) throw new Error('No solution ID specified')

            fileDiagService.newSaveFileDialog({
                filters: [ 
                    {name: 'CSV', extensions: ['csv']}
                ]
            }).then((res) => {

                const matrix = workspace.getMatrix()
                const solution =  matrix.solutions[solutionID]
                const frArray = matrix.functionalRequirements
                const dsMap = matrix.cellToDesignSolutionMap

                if (!solution) throw new Error('Solution does not exist')

                let csv = 'Functional requirement;\tDesign solution\n'

                for (let i = 0; i < frArray.length; i++) {
                    const fr = frArray[i]
                    const frID = 'row-'+fr.id

                    csv += fr.description + ';\t'

                    console.log(frID)
                    console.log(solution.frToDsMap)
                
                    const dsID = solution.frToDsMap[frID]
                    if (dsID) {
                        const ds = dsMap[dsID]
                        csv += ds.description ? ds.description : ''
                    } else {
                        csv += ''
                    }

                    csv += '\n'
                }

                fs.writeFileSync(res.filePath, csv)
                popup.notify(`Export to CSV successful. <br>${res.filePath}`, {
                    titleTxt: 'Export done'
                })

            }).catch((err) => {
                throw err
            })
        } catch (err) {
            popup.error(err.message)
        }
    },

    /**
     * Export ALL solutions to CSV. 
     */
    exportSolutionsToCSV: () => {
        console.log('Exporting solutions to CSV..')

        fileDiagService.newSaveFileDialog({
            filters: [ 
                {name: 'CSV', extensions: ['csv']}
            ]
        }).then((res) => {
            if (res.canceled) return
            const matrix = workspace.getMatrix()
            const frArray = matrix.functionalRequirements

            let csv = 'Functional Requirement;\t'

            // Create header
            for (const solutionID in matrix.solutions) {
                csv += matrix.solutions[solutionID].name + ';\t'
            }

            csv += '\n'

            for (let i = 0; i < frArray.length; i++) {
                const fr = frArray[i]

                let j = 0
                for (const solutionID in matrix.solutions) {
                    const solution = matrix.solutions[solutionID]
                    if (j === 0) {
                        // Write row header
                        csv += fr.description + ';\t'
                    }

                    let mappedDsID = solution.frToDsMap['row-'+fr.id]
                    
                    // If this solution has mapped this FR to a DS
                    if (mappedDsID) {
                        let ds = matrix.cellToDesignSolutionMap[mappedDsID]
                        csv += ds.description + ';\t'
                    } else {
                        csv += ';\t'
                    }
                    j++
                }

                csv += '\n'
            }
            fs.writeFileSync(res.filePath, csv)

            popup.notify(`Export to CSV successful. <br>${res.filePath}`, {
                titleTxt: 'Export done'
            })
        }).catch((err) => {
            popup.error('Failed to export solutions to CSV. Reason: ' + err.message)
        })
    },

    /**
     * Export a solution to a PNG image
     */
    exportSolutionToPNG: (solutionID) => {
        console.log('Exporting solution to PNG..')

        if (!solutionID) throw new Error('exportSolutionToPNG requires a solution ID.')
    },

    exportSolutionsToPNG: () => {
        console.log('Exporting solutions to PNG..')
    }


}