'use strict'

const {IncompatibilityExistsError} = require('./../errors')
const Incompatibility = require('./Incompatibility')

class DesignSolution {
    id = null
    description = null
    position = null
    image = null
    frID = null

    // Delimitation parameters
    disabled = false
    incompatibleWith = {} // Map of incompatible dsIDs. Maps from dsID -> incompatibility.id

    constructor(id, position, frID, {disabled = false, image = null, description = null} = {}) {
        this.id = id
        this.position = position
        this.frID = frID
        this.image = image,
        this.description = description
        this.disabled = disabled
    }

    /**
     * Creates a mirrored incompatibillity delimitation. 
     * @param {DesignSolution} ds 
     */
    setIncompatibleWith(ds, incompatibility) {
        if (this.incompatibleWith[ds.id]) {
            Incompatibility.count -= 1
            throw new IncompatibilityExistsError('Incomp already exists')
        }
        this.incompatibleWith[ds.id] = incompatibility.id
        ds.incompatibleWith[this.id] = incompatibility.id
    }

    removeIncompatibilityWith(ds) {
        delete this.incompatibleWith[ds.id]
        delete ds.incompatibleWith[this.id]
    }

    getIncompatibleDsIDArray() {
        return Object.keys(this.incompatibleWith)
    }

    getIncompatibilityMap () {
        return this.incompatibleWith
    }

    isDisabled() {
        return this.disabled
    }
}

module.exports = DesignSolution