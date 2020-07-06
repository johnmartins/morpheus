'use strict'

class DesignSolution {
    id = null
    description = null
    position = null
    image = null
    frID = null

    // Delimitation parameters
    disabled = false
    incompatibleWith = new Set()

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
}

module.exports = DesignSolution