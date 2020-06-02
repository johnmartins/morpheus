'use strict'

let matrixContainerID = null
let currentMatrix = null

const { MorphMatrix } = require ('./morph-matrix/matrix')

module.exports = {
    setMatrixContainer: (elementID) => {
        matrixContainerID = elementID
    },
    createEmptyMatrix: () => {
        if (isMatrixChanged()) {
            // TODO: ...
        }

        document.getElementById(matrixContainerID).innerHTML = ""
        currentMatrix = new MorphMatrix(matrixContainerID)
    },
    createMatrixFromObject: (json) => {
        if (isMatrixChanged()) {
            // TODO: ...
        }

        document.getElementById(matrixContainerID).innerHTML = ""
        currentMatrix = new MorphMatrix(matrixContainerID)
        currentMatrix.import(json)
    }
}

function isMatrixChanged () {
    // TODO: Implement check
    return false
}