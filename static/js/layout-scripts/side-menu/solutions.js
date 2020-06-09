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
                matrix.clearSolutionRender()
                module.exports.addToSolutionList(state.workspaceSelectedSolution)

                // Reset relevant state parameters
                state.workspaceSelectedSolution = null
                // Reset menu UI
                document.getElementById('solutions-new-form').classList.remove('open')
                return
            }

            // New solution
            matrix.clearSolutionRender()
            btnSolutions.innerHTML = 'Finish solution'
            state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_SOLUTION
            let solution = new Solution()
            matrix.addSolution(solution)
            state.workspaceSelectedSolution = solution.id

            // Setup new solution form
            document.getElementById('solutions-new-form').classList.add('open')
            let solNameInput = document.getElementById('solutions-name-input')
            solNameInput.focus()
            solNameInput.value = ''
            document.getElementById('solutions-name-input').onkeyup = (evt) => {
                let val = evt.target.value
                solution.name = val
            }
        }
    },

    addToSolutionList: (solutionID) => {
        let solList = document.getElementById('menu-solution-list')
        let matrix = workspace.getMatrix()
        let solution = matrix.getSolution(solutionID)

        let solListEntry = document.createElement('li')
        solListEntry.innerHTML = solution.name
        solListEntry.classList.add('solution-list-entry')
        solListEntry.onclick = () => {
            // Clear previous render
            matrix.clearSolutionRender()
            if (solListEntry.classList.contains('selected')) {
                solListEntry.classList.remove('selected')
                return;
            }

            // Clear previous menu selection
            let previousSelection = document.querySelector('.solution-list-entry.selected')
            if (previousSelection) previousSelection.classList.remove('selected')
            
            solListEntry.classList.add('selected')
            matrix.renderSolution(solutionID)
            
        }

        solList.appendChild(solListEntry)
    },

    removeFromSolutionList: (solutionID) => {
        let matrix = workspace.getMatrix()
    }
}