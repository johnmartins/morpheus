'use strict'

const crypto = require('crypto')
const storageService = require('./services/storage-service')
const state = require('./state')

// Target layout
let matrixContainerID = null
// The matrix structure that currently is being edited
let currentMatrix = null
// The original file (situated where the user wants it to)
let originalFileLocation = null     // The morph file (or JSON depending on type)
// The temporary file (situated in OS tmp storage). This copy is used to pack into .morph more easily.
let tempFilePosition = null         // The JSON file
// Last saved hash is an md5 hash of the json matrix structure of the last save.
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
        originalFileLocation = path
    },
    getWorkingFileLocation: () => {
        return originalFileLocation
    },
    setTempFileLocation: (path) => {
        tempFilePosition = path
    },
    getTempFileLocation: () => {
        return tempFilePosition
    },
    /**
     * Create a completely empty matrix
     */
    createEmptyMatrix: () => {
        if (isMatrixChanged()) {
            promptUnsavedChanges()
        }
        state.reset()
        document.getElementById(matrixContainerID).innerHTML = ""
        currentMatrix = new MorphMatrix(matrixContainerID)
        module.exports.saveCurrentHash()
        module.exports.setTempFileLocation(storageService.getTmpStorageDirectory() + 'matrix.json')
        module.exports.setWorkingFileLocation(null)
    },
    /**
     * Create a matrix from an existing object. Used to "load" or "open" existing matricies.
     */
    createMatrixFromObject: (json) => {
        if (isMatrixChanged()) {
            promptUnsavedChanges()
        }
        state.reset()
        document.getElementById(matrixContainerID).innerHTML = ""
        currentMatrix = new MorphMatrix(matrixContainerID)
        currentMatrix.import(json)
        module.exports.saveCurrentHash()
        module.exports.setTempFileLocation(storageService.getTmpStorageDirectory() + 'matrix.json')
    },
    /**
     * Returns the matrix in the workspace
     */
    getMatrix: () => {
        return currentMatrix
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