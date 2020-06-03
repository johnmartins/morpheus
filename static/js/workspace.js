'use strict'

let crypto = require('crypto')

let matrixContainerID = null
let currentMatrix = null
let originalFilePosition = null
let lastSavedHash = null

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
        module.exports.saveCurrentHash()
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
        module.exports.saveCurrentHash()
    },
    /**
     * Get the matrix as a JSON string. Used when saving the matrix to a file.
     */
    getMatrixJSON: () => {
        return currentMatrix.export()
    },

    /**
     * Saves a hashed value of the matrix which may be used to detect changes to the matrix.
     */
    saveCurrentHash: () => {
        lastSavedHash = hash (module.exports.getMatrixJSON())
    }
}

function promptUnsavedChanges () {
    console.log("There are unsaved changes!")
}

function isMatrixChanged () {
    if (!currentMatrix) return false
    let currentHash = hash(module.exports.getMatrixJSON())
    if (lastSavedHash === currentHash) return false
    return true
}

function hash (data) {
    return crypto.createHash('md5').update(data).digest("hex");
}