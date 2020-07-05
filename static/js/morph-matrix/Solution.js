'use strict'

const random = require('./../utils/random')

class Solution {
    id = null
    name = null
    frToDsMap = {} // Maps a FR ID to a DS ID (string->string)
    color = null

    incompatibleMap = {}    // Maps incompatible DSs to the FRs (array) that causes it: DsID -> [FrID, FrID]
    conflicts = []          // Lists DSs that are incompatible with set delimitations

    constructor () {
        this.id = 'sol-'+random.randomString(12)
        let randint = random.randomInt(0,360)
        this.color = `hsl(${randint},80%,65%)`
    }

    bindFrToDs (fr, ds, {ignoreDisabled = false} = {}) {
        // Check if requested DS is disabled. In that case noop.
        if (ds.disabled && ignoreDisabled === false) {
            console.log('Selected DS is disabled')
            return
        }

        if (ds.disabled && ignoreDisabled === true) {
            this.addConflict(ds.id)
        }

        // Check if this resolves a conflict.
        let currentDsID = this.frToDsMap[fr.id]
        if (this.conflicts.includes(currentDsID)) {
            this.removeConflict(currentDsID)
        }

        this.frToDsMap[fr.id] = ds.id
    }

    unbindFrFromDs (frID) {
        let dsID = this.frToDsMap[frID]
        if (this.conflicts.includes(dsID)) {
            this.removeConflict(dsID)
        }

        delete this.frToDsMap[frID]
        if (Object.keys(this.frToDsMap).length === 0) {
            console.error('The solution is empty. Todo: remove solution or warn user.')
        }


    }

    getDsForFr (frID) {
        return this.frToDsMap[frID]
    }

    getMappedFunctionsArray () {
        return Object.keys(this.frToDsMap)
    }

    addIncompatibility (frID, dsID) {
        let conflictArray = this.incompatibleMap[dsID]

        if (!conflictArray) {
            this.incompatibleMap[dsID] = []
            this.incompatibleMap[dsID].push(frID)
        }
    }

    addConflict (dsID) {
        if (this.conflicts.includes(dsID)) return       // TODO: Could potentially slow performance. In that case, change to Set.
        this.conflicts.push (dsID)

        console.log('ADDED CONFLICT - Conflict array: '+this.conflicts)
    }

    removeConflict (dsID) {
        let index = this.conflicts.indexOf(dsID)
        if (0 <= index) {
            this.conflicts.splice(index, 1)
        }

        console.log('REMOVED CONFLICT - Conflict array: '+this.conflicts)
    }

    hasConflicts () {
        return this.conflicts.length > 0 ? true : false
    }
}

module.exports = Solution