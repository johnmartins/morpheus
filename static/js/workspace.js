'use strict'

let matrixContainerID = null
let currentMatrix = null
let originalFilePosition = null
let lastSavedHash = ''

const { MorphMatrix } = require ('./morph-matrix/matrix')

module.exports = {
    /**
     * Set DOM element in which the matrix should be displayed
     */
    setMatrixContainer: (elementID) => {
        matrixContainerID = elementID
    },
    /**
     * If an existing file is opened, then a soft reference to that file is saved here.
     */
    setWorkingFileLocation: (path) => {
        originalFilePosition = path
    },
    /**
     * Create a completely empty matrix
     */
    createEmptyMatrix: () => {
        if (isMatrixChanged()) {
            promptUnsavedChanges()
        }

        document.getElementById(matrixContainerID).innerHTML = ""
        currentMatrix = new MorphMatrix(matrixContainerID)
    },
    /**
     * Create a matrix from an existing object. Used to "load" or "open" existing matricies.
     */
    createMatrixFromObject: (json) => {
        if (isMatrixChanged()) {
            promptUnsavedChanges()
        }

        document.getElementById(matrixContainerID).innerHTML = ""
        currentMatrix = new MorphMatrix(matrixContainerID)
        currentMatrix.import(json)
    },
    /**
     * Get the matrix as a JSON string. Used when saving the matrix to a file.
     */
    getMatrixJSON: () => {
        return currentMatrix.export()
    }
}

function promptUnsavedChanges () {

}

function isMatrixChanged () {
    let currentHash = ''
    if (lastSavedHash === currentHash) return false
    return true
}