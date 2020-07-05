'use strict'

class FunctionalRequirement {
    id = null
    rowID = null
    description = null
    position = null
    designSolutions = []

    constructor (id, rowID, position) {
        this.id = id
        this.position = position
        this.rowID = rowID
    }
}

module.exports = FunctionalRequirement