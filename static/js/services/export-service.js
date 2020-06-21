'use strict'

const workspace = require('./../workspace')

module.exports = {

    /**
     * Export the matrix to a CSV file
     */
    exportMatrixToCSV: () => {
        console.log('Exporting matrix to CSV..')

        let matrix = workspace.getMatrix()
    },

    /** 
     * Export the matrix into a PNG image
     */
    exportMatrixToPNG: () => {
        console.log('Exporting matrix to PNG..')

    },

    /**
     * Export ALL solutions to CSV
     */
    exportSolutionsToCSV: () => {
        console.log('Exporting solution to CSV..')

        let matrix = workspace.getMatrix()
    },

    /**
     * Export a solution to a PNG image
     */
    exportSolutionToPNG: (solutionID) => {
        console.log('Exporting solution to PNG..')

        if (!id) throw new Error('exportSolutionToPNG requires a solution ID.')

    }
}