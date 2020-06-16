'use strict'
const state = require('./../../state')

const { Solution } = require('./../../morph-matrix/matrix')
const workspace = require('./../../workspace')
const popup = require('./../popup')

let unfinishedSolution = false

const ID_PREFIX_SOLUTION_ENTRY = 'sol-li-'

module.exports = {
    setupListeners: () => {
        let btnSolutions = document.getElementById('btn-new-solution')
        btnSolutions.onclick = module.exports.startNewSolution

        // New import -> Setup solution list
        GlobalObserver.on('matrix-imported', () => {
            let matrix = workspace.getMatrix()
            let solutionIDs = Object.keys(matrix.solutions)
            for (let i = 0; i < solutionIDs.length; i++) {
                let solutionID = solutionIDs[i]
                module.exports.addToSolutionList(solutionID)
            }
        })

        GlobalObserver.on('matrix-created', () => {
            // Clear solution list
            module.exports.clearSolutionList()

            // Reset UI
            module.exports.resetUI()
        })
    },

    startNewSolution: () => {
        let matrix = workspace.getMatrix()
        let button = document.getElementById('btn-new-solution')

        module.exports.resetUI()
        unfinishedSolution = true

        matrix.clearSolutionRender()
        button.innerHTML = 'Save solution'
        state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_SOLUTION
        let solution = new Solution()
        matrix.addSolution(solution)
        state.workspaceSelectedSolution = solution.id

        // Setup new solution form
        document.getElementById('solutions-edit-form').classList.add('open')
        let solNameInput = document.getElementById('solutions-name-input')
        solNameInput.focus()
        solNameInput.value = ''
        document.getElementById('solutions-name-input').onkeyup = getSolutionNameFormCallback(solution, () => {
            module.exports.completeSolution()
        })

        button.onclick = module.exports.completeSolution
    },

    completeSolution: () => {
        let matrix = workspace.getMatrix()
        let solution = matrix.getSolution(state.workspaceSelectedSolution)

        unfinishedSolution = false

        // RESET UI
        module.exports.resetUI()

        if (Object.keys(solution.frToDsMap).length === 0) {
            // No DS has been mapped to any FR.
            matrix.removeSolution(solution.id)
            return
        }

        // Verify solution name. If unset (or useless) then automatically set a name.
        if (solution.name === null || /^\s+$/.test(solution.name) || solution.name.length === 0){
            let number = Object.keys(matrix.getSolutionMap()).length
            solution.name = `solution ${number}`
        } 

        // Finish solution
        module.exports.addToSolutionList(solution.id)
    },

    saveEditedSolution: () => {
        let solutionID = state.workspaceSelectedSolution
        let listEntry = document.getElementById(ID_PREFIX_SOLUTION_ENTRY+solutionID)
        listEntry.parentElement.removeChild(listEntry)

        module.exports.completeSolution()
    },

    addToSolutionList: (solutionID) => {
        let solList = document.getElementById('menu-solution-list')
        let matrix = workspace.getMatrix()
        let solution = matrix.getSolution(solutionID)

        let solListEntry = document.createElement('li')
        solListEntry.id = ID_PREFIX_SOLUTION_ENTRY+solutionID
        solListEntry.innerHTML = solution.name
        solListEntry.classList.add('solution-list-entry')
        solListEntry.onclick = (evt) => {
            if (evt.target.id !== solListEntry.id) return

            console.log('clicked: ' + solution.id)

            if (solListEntry.classList.contains('selected')) { 
                module.exports.resetUI()
                return;
            }

            module.exports.resetUI()

            state.workspaceSelectedSolution = solutionID

            // Clear previous menu selection
            let previousSelection = document.querySelector('.solution-list-entry.selected')
            if (previousSelection) previousSelection.classList.remove('selected')
            
            solListEntry.classList.add('selected')
            matrix.renderSolution(solutionID)
        }

        let overlay = null

        solListEntry.onmouseover = () => {
            if (overlay) return
            overlay = document.createElement('div')

            createSolutionEntryOverlay(overlay, solution)
            
            solListEntry.appendChild(overlay)
        }

        solListEntry.onmouseleave = () => {
            solListEntry.removeChild(overlay)
            overlay = null
        }

        solList.appendChild(solListEntry)
    },

    removeFromSolutionList: (solutionID) => {
        let matrix = workspace.getMatrix()
        let solution = matrix.getSolution(solutionID)
        let solutionName = solution.name

        popup.warning(`Are you sure you want to delete solution "${solutionName}" permanently?`, {
            titleTxt: 'Delete solution',
            callbackCancel: () => {
                return
            },
            callbackContinue: () => {
                matrix.removeSolution(solutionID)
                let listEntry = document.getElementById(ID_PREFIX_SOLUTION_ENTRY+solutionID)
                listEntry.parentElement.removeChild(listEntry)
                matrix.clearSolutionRender()
            }
        })
    },

    editSolution: (solutionID) => {
        console.log("EDIT SOLUTION")
        let matrix = workspace.getMatrix()
        let solution = matrix.getSolution(solutionID)
        let button = document.getElementById('btn-new-solution')
        let solEl = document.getElementById(ID_PREFIX_SOLUTION_ENTRY+solutionID)

        module.exports.resetUI()
        solEl.classList.add('selected')
        
        state.workspaceSelectedSolution = solutionID

        let nameForm = document.getElementById('solutions-name-input')
        nameForm.value = solution.name
        nameForm.onkeyup = getSolutionNameFormCallback(solution, () => {
            module.exports.saveEditedSolution()
        })

        // Setup button
        button.innerHTML = 'Save solution'
        button.onclick = module.exports.saveEditedSolution

        document.getElementById('solutions-edit-form').classList.add('open')
        
        state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_SOLUTION
        matrix.renderSolution(solutionID)

        nameForm.focus()
        
    },

    clearSolutionList: () => {
        let solutionEls = document.querySelectorAll('#menu-solution-list .solution-list-entry')
        for (let i = 0; i < solutionEls.length; i++) {
            let solutionElement = solutionEls[i]
            solutionElement.parentElement.removeChild(solutionElement)
        }
    },

    resetUI: () => {
        let button = document.getElementById('btn-new-solution')
        let matrix = workspace.getMatrix()

        // If there is an unfinished solution, delete it
        if (unfinishedSolution) {
            matrix.removeSolution(state.workspaceSelectedSolution)
            state.workspaceSelectedSolution = null
            unfinishedSolution = false
        }

        state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_DEFAULT
        button.innerHTML = 'New solution'
        matrix.clearSolutionRender()
        button.onclick = module.exports.startNewSolution
        document.getElementById('solutions-edit-form').classList.remove('open')

        // Clear solution menu selection
        let previousSelection = document.querySelector('.solution-list-entry.selected')
        if (previousSelection) {
            previousSelection.classList.remove('selected')
        }
    }
}

function createSolutionEntryOverlay (overlay, solution) {
    overlay.classList.add('overlay')

    let deleteIcon = document.createElement('i')
    deleteIcon.classList.add('fas', 'fa-trash-alt', 'icon')
    deleteIcon.onclick = () => {
        module.exports.removeFromSolutionList(solution.id)
    }

    let editIcon = document.createElement('i')
    editIcon.classList.add('far', 'fa-edit', 'icon')
    editIcon.onclick = () => {
        module.exports.editSolution(solution.id)
    }

    overlay.appendChild(editIcon)
    overlay.appendChild(deleteIcon)
}

function getSolutionNameFormCallback (solution, enterCallback) {
    return function (evt) {
        if (evt.keyCode === 13) {
            // user pressed enter
            enterCallback()
            return
        }
        let val = evt.target.value
        solution.name = val
    }
}