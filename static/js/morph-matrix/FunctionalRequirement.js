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

    getDisabledDsCount () {
        // TODO: This is slow and could be updated as DSs are enabled/disabled.
        let i = 0
        for (let ds of this.designSolutions) {
            i = ds.isDisabled() ? i + 1 : i
        }
        return i
    }

    getEnabledDsCount () {
        // TODO: This is slow and could be updated as DSs are enabled/disabled.
        let i = 0
        for (let ds of this.designSolutions) {
            i = ds.isDisabled() ? i : i + 1
        }
        return i
    }
}

module.exports = FunctionalRequirement