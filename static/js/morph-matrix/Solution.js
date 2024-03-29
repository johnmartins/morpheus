'use strict'

const random = require('./../utils/random')

class Solution {
    id = null
    name = null
    frIdToDsIdMap = {} // Maps a FR ID to a DS ID (string->string)
    dsMap = {}
    color = null

    // Identification variables (used to ensure solution uniqueness)
    solutionArray = []
    solutionString = null

    incompatibleMap = {}    // Maps incompatible DSs to the FRs (array) that causes it: DsID -> [FrID, FrID]
    conflicts = []          // Lists DSs that are incompatible with set delimitations

    constructor () {
        this.id = 'sol-'+random.randomString(12)
        this.color = `hsl(191,80%,65%)`
    }

    bindFrToDs (fr, ds, {ignoreDelimitations = false} = {}) {
        // Check if requested DS is disabled. In that case noop.
        if (ds.disabled && ignoreDelimitations === false) {
            console.log('Selected SS is disabled')
            return
        } else if (ds.disabled && ignoreDelimitations === true) {
            this.addConflict(ds.id)
        }

        // Check if requested DS is incompatible. In that case noop.
        if (this.isIncompatible(ds.id) && ignoreDelimitations === false) {
            console.log('Selected SS is incompatible')
            return
        } else if (this.isIncompatible(ds.id) && ignoreDelimitations === true) {
            this.addConflict(ds.id)
        }

        let currentDsID = this.frIdToDsIdMap[fr.id]
        let currentDs = this.dsMap[currentDsID]

        if (currentDsID) {
            console.log('currentDs exists')
            // Check if this indirectly resolves a conflict (due to incompatibilities)
            this._clearIndirectIncompatibilityConflicts(currentDs)

            // Check if this directly resolves a conflict (due to disabled DS)
            if (this.conflicts.includes(currentDsID)) {
                this.removeConflict(currentDsID) // Evaluate first?
            }

            // Check if this resolves incompatibilities
            console.log('Current SS ID is defined.')
            this.clearAssociatedIncompatibilities(currentDsID)
        }
        
        // Add new incompatibilities
        for (let incompDsID of ds.getIncompatibleDsIDArray()) {
            let frArray = this.incompatibleMap[incompDsID]
            if (!frArray) {
                this.incompatibleMap[incompDsID] = []
            }

            this.incompatibleMap[incompDsID].push(ds.frID)
        }

        this.frIdToDsIdMap[fr.id] = ds.id
        this.dsMap[ds.id] = ds

        this.solutionArray[fr.position - 1] = ds.id
        this.solutionString = this.solutionArray.join('')
    }

    unbindFrFromDs (fr) {
        let frID = fr.id
        let dsID = this.frIdToDsIdMap[frID]
        let ds = this.dsMap[dsID]
        console.log(`UNBINDING SF ${frID} from SS ${dsID}`)

        // Remove indirect conflicts
        this._clearIndirectIncompatibilityConflicts(ds)

        // Remove direct conflicts
        if (this.conflicts.includes(dsID)) {
            this.removeConflict(dsID)
        }

        this.clearAssociatedIncompatibilities(dsID)

        delete this.frIdToDsIdMap[frID]
        delete this.dsMap[dsID]
        if (Object.keys(this.frIdToDsIdMap).length === 0) {
            console.error('The solution is empty. Todo: remove solution or warn user.')
        }

        this.solutionArray[fr.position - 1] = null
        this.solutionString = this.solutionArray.join('')
    }

    /**
     * If a design solution is removed from the solution, then that could potentially resolve conflicts
     * that were caused by that design solution being incompatible with other selected design solutions.
     * This function resolves those conflicts, unless the conflicting DSs are disabled, in which case
     * the conflict remains.
     * @param {DesignSolution} ds 
     */
    _clearIndirectIncompatibilityConflicts (ds) {
        for (let incompDsID in ds.getIncompatibilityMap()) {
            let indirectDs = this.dsMap[incompDsID]
            if (indirectDs) {
                // The removed DS is incompatible with a DS that is selected in this solution.
                // Thus, an indirect conflict has been resolved.
                if (!indirectDs.disabled) {
                    this.removeConflict(indirectDs.id)
                }
            }
        }
    }

    /**
     * Remove all references to a specific FunctionalRequirement from this Solution.
     * @param {*} fr FunctionalRequirement
     * @param {*} siftSolutionArray Removes solutionArray element entierly. Required if the FR was deleted from the matrix.
     */
    removeFrMapping (fr, siftSolutionArray) {
        let frID = fr.id
        let mappedDsID = this.frIdToDsIdMap[frID]
        if (mappedDsID) delete this.dsMap[mappedDsID]
        delete this.frIdToDsIdMap[frID]

        if (siftSolutionArray) {
            this.solutionArray.splice(fr.position - 1, 1)
            this.solutionString = this.solutionArray.join('')
        }
    }

    getDsForFr (frID) {
        return this.frIdToDsIdMap[frID]
    }

    getMappedFunctionsArray () {
        return Object.keys(this.frIdToDsIdMap)
    }

    /**
     * Adds a ONE WAY incompatibility where ds1 is the root cause, and ds2 is the resulting incompatibility.
     * Thus, ds2 is the only DS that will show up as "incompatible" when editing the solution.
     * @param {DesignSolution} ds1 
     * @param {DesignSolution} ds2 
     */
    addIncompatibility (ds1, ds2) {
        let frArray = this.incompatibleMap[ds2.id]
        if (!frArray) {
            this.incompatibleMap[ds2.id] = []
        }
        this.incompatibleMap[ds2.id].push(ds1.frID)

        if (this.dsMap[ds2.id]) {
            this.addConflict(ds2.id)
        }
    }

    removeIncompatibility (ds1, ds2) {
        console.log('Deleting incomp from solution')

        if (!this.incompatibleMap[ds1.id] && !this.incompatibleMap[ds2.id])         {
            console.error('No such incompatibility was found.')
            return
        }

        if (this.incompatibleMap[ds1.id]) {
            delete this.incompatibleMap[ds1.id]

            if (!ds1.isDisabled()) {
                this.removeConflict(ds1.id)
            }
        } 
        
        if (this.incompatibleMap[ds2.id]) {
            delete this.incompatibleMap[ds2.id]

            if (!ds2.isDisabled()) {
                this.removeConflict(ds2.id)
            }
        }  
    }

    getIncompatibleDsIds () {
        return Object.keys(this.incompatibleMap)
    }

    clearAssociatedIncompatibilities (dsID) {
        // Check if this resolves any incompatibilities
        console.log('CLEAR ASSOCIATED INCOMPS')
        let ds = this.dsMap[dsID]
        console.log(`Clearing incomps for ${dsID} with frID = ${ds.frID}`)
        for (let incompDsID of ds.getIncompatibleDsIDArray()) {
            let frArray = this.incompatibleMap[incompDsID]
            if (frArray) {
                let frIndex = frArray.indexOf(ds.frID)
                frArray.splice(frIndex, 1)
                console.log('Spliced one')
                if (frArray.length === 0) {
                    console.log('fr array is now empty. Deleting..')
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
    }

    hasConflicts () {
        return this.conflicts.length > 0 ? true : false
    }

    isIncompatible (dsID) {
        let incompFrArray = this.incompatibleMap[dsID]

        if (!incompFrArray) return false
        if (incompFrArray.length === 0) return false
        // This DS has selected design solutions that are incompatible.

        return true
    }

    /**
     * Returns false if this DS is in conflict with the solution for any reason
     * Returns true if this DS can be used in the solution without issues
     * @param {String} dsID 
     */
    evaluateDsConflict (dsID) {
        const ds = this.dsMap[dsID]
        const isDisabled = ds.disabled
        if (isDisabled) return false
        const incompatibleRow = this.incompatibleMap[dsID]
        if (incompatibleRow) return false
        return true
    }

    containsDS (dsID) {
        if (this.dsMap[dsID]) return true
        return false
    }

    
}

module.exports = Solution