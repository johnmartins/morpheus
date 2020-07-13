'use strict'

class SolutionCalculator {
    constructor (matrix) {
        this.matrix = matrix
        this.scopes = []

    }

    /**
     * If there are no incompatibilities then this is the fastest available option. Returns an integer with the amount of possible solutions.
     */
    calculateSkiptIncompatibilities () {
        
        this.calculate()    // TODO: This shouldn't be here. Remove it when done.

        let solCount = 0;

        const frArray = this.matrix.functionalRequirements

        // Loop through ALL functional requirements
        for (let i = 0; i < frArray.length; i++) {
            const fr = frArray[i]
            let dsCount = fr.designSolutions.length

            // Loop through ALL design solutions attached to this FR
            for (let j = 0; j < fr.designSolutions.length; j++) {
                if (fr.designSolutions[j].disabled) {
                    dsCount -= 1
                }
            }

            if (dsCount === 0) continue

            if (solCount === 0) {
                solCount = dsCount
            } else {
                solCount *= dsCount
            }
        }

        return solCount;
    }

    calculate() {

        console.log('TRIGGERED CALCULATION')

        const frArray = this.matrix.functionalRequirements
        let solutionCountNoDelimitations = 0

        for (let fr of frArray) {
            let dsCountInFr = fr.getEnabledDsCount() // Warning! Loops through all DSs in FR
            if (dsCountInFr === 0) continue

            // Update total possibilities without any delimitations
            if (solutionCountNoDelimitations === 0) {
                solutionCountNoDelimitations = dsCountInFr
            } else {
                solutionCountNoDelimitations *= dsCountInFr
            }
        }

        console.log('Number of possible solutions, no incomps: ' + solutionCountNoDelimitations)

        let solutionCount = solutionCountNoDelimitations
        let incompContributionMap = {} // incompID -> ratio (what it leaves after filtering)

        for (let incompID in this.matrix.incompatibilityMap) {
            const incomp = this.matrix.incompatibilityMap[incompID]
            const frID1 = incomp.ds1.frID
            const frID2 = incomp.ds2.frID
            const fr1 = this.matrix.frMap[frID1]
            const fr2 = this.matrix.frMap[frID2]
            const dsCountInFr1 = fr1.getEnabledDsCount() // Warning! Loops through all DSs in FR
            const dsCountInFr2 = fr2.getEnabledDsCount() // Warning! Loops through all DSs in FR

            let contribution = (1 - 1/(dsCountInFr1*dsCountInFr2))
            incompContributionMap[incompID] = contribution

            solutionCount *= contribution

        }

        console.log('Number of possible solutions, with incomps: ' + solutionCount)
    }

    /**
     * Finds a suitible scope for the incompatibility and integrates it.
     * @param {Incompatibility} incompatibility 
     */
    setScope (incompatibility) {

    }

    
}

class Scope {
    constructor () {
        this.coveredFrIDs = new Set()
    }

    checkIfIndependent(...frIDs) {
        for (let frID of frIDs) {
            if (this.coveredFrIDs.has(frID)) return true
        }
    }

    addFrIDs(...frIDs) {
        for (let frID of frIDs) {
            this.coveredFrIDs.add(frID)
        }
    }
}

module.exports = SolutionCalculator