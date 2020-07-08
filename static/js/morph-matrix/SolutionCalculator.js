'use strict'

class SolutionCalculator {
    constructor (matrix) {
        this.matrix = matrix
    }

    /**
     * If there are no incompatibilities then this is the fastest available option. Returns an integer with the amount of possible solutions.
     */
    calculateSkiptIncompatibilities () {
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
}

class Scope {
    constructor () {

    }
}

module.exports = SolutionCalculator