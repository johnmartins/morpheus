'use strict'

const html2canvas = require('html2canvas')
const fs = require('fs')

const workspace = require('./../workspace')
const fileDiagService = require('./file-dialog-service')

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

        if (!solutionID) throw new Error('exportSolutionToPNG requires a solution ID.')
    },

    /**
     * Export ALL solutions to CSV
     */
    exportSolutionsToCSV: () => {
        console.log('Exporting solutions to CSV..')

        let matrix = workspace.getMatrix()
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