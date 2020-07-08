'use strict'

class DesignSolution {
    id = null
    description = null
    position = null
    image = null
    frID = null

    // Delimitation parameters
    disabled = false
    incompatibleWith = new Set()    // Set of all other DSs that are incompatible with this DS.

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
    setIncompatibleWith(ds) {
        this.incompatibleWith.add(ds.id)
        ds.incompatibleWith.add(this.id)
    }

    getIncompatibleDsIDSet() {
        return this.incompatibleWith
    }
}

module.exports = DesignSolution