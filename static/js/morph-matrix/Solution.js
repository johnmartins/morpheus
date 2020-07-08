'use strict'

const random = require('./../utils/random')

class Solution {
    id = null
    name = null
    frIdToDsIdMap = {} // Maps a FR ID to a DS ID (string->string)
    dsMap = {}
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

        let currentDsID = this.frIdToDsIdMap[fr.id]

        if (currentDsID) {
            // Check if this resolves a conflict.
            if (this.conflicts.includes(currentDsID)) {
                this.removeConflict(currentDsID)
            }

            // Check if this resolves incompatibilities
            console.log('Currend DS ID is defined.')
            this.clearAssociatedIncompatibilities(currentDsID)
        }
        
        // Add new incompatibilities
        for (let incompDsID of ds.getIncompatibleDsIDSet()) {
            let frArray = this.incompatibleMap[incompDsID]
            if (!frArray) {
                this.incompatibleMap[incompDsID] = []
            }

            this.incompatibleMap[incompDsID].push(ds.frID)
        }

        this.frIdToDsIdMap[fr.id] = ds.id
        this.dsMap[ds.id] = ds
    }

    unbindFrFromDs (frID) {
        let dsID = this.frIdToDsIdMap[frID]
        if (this.conflicts.includes(dsID)) {
            this.removeConflict(dsID)
        }

        this.clearAssociatedIncompatibilities(dsID)

        delete this.frIdToDsIdMap[frID]
        delete this.dsMap[dsID]
        if (Object.keys(this.frIdToDsIdMap).length === 0) {
            console.error('The solution is empty. Todo: remove solution or warn user.')
        }


    }

    getDsForFr (frID) {
        return this.frIdToDsIdMap[frID]
    }

    getMappedFunctionsArray () {
        return Object.keys(this.frIdToDsIdMap)
    }

    addIncompatibility (frID, dsID) {
        let conflictArray = this.incompatibleMap[dsID]

        if (!conflictArray) {
            this.incompatibleMap[dsID] = []
            this.incompatibleMap[dsID].push(frID)
        }
    }

    getIncompatibleDsIds () {
        return Object.keys(this.incompatibleMap)
    }

    clearAssociatedIncompatibilities (dsID) {
        // Check if this resolves any incompatibilities
        let ds = this.dsMap[dsID]
        console.log(`Clearing incomps for ${dsID} with frID = ${ds.frID}`)
        for (let incompDsID of ds.getIncompatibleDsIDSet()) {
            let frArray = this.incompatibleMap[incompDsID]
            if (frArray) {
                let frIndex = frArray.indexOf(ds.frID)
                frArray.splice(frIndex, 1)
                if (frArray.length === 0) {
                    delete this.incompatibleMap[incompDsID]
                }
            }
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