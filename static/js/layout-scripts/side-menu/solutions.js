'use strict'
const state = require('./../../state')

const { Solution } = require('./../../morph-matrix/matrix')
const workspace = require('./../../workspace')

module.exports = {
    setupListeners: () => {
        console.log("setup liseteners!")
        let btnSolutions = document.getElementById('btn-new-solution')

        btnSolutions.onclick = () => {
            let matrix = workspace.getMatrix()

            if (state.workspaceInteractionMode === state.constants.WORKSPACE_INTERACTION_MODE_SOLUTION) {
                // Finish solution
                state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_DEFAULT
                btnSolutions.innerHTML = 'New solution'
                state.workspaceSelectedSolution = null
                matrix.clearSolutionRender()
                return
            }

            // New solution
            btnSolutions.innerHTML = 'Finish solution'
            state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_SOLUTION
            let solution = new Solution()
            matrix.addSolution(solution)
            state.workspaceSelectedSolution = solution.id
        }
    }
}