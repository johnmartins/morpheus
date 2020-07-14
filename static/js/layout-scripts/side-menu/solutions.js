'use strict'
const state = require('./../../state')

const Solution = require('./../../morph-matrix/Solution')
const workspace = require('./../../workspace')
const popup = require('./../popup')
const { randomInt } = require('../../utils/random')

let unfinishedSolution = false      // The user has started a new solution that is unsaved
let editingSolution = false         // The user is editing a solution

const ID_PREFIX_SOLUTION_ENTRY = 'sol-li-'

module.exports = {
    setupListeners: () => {
        let btnSolutions = document.getElementById('btn-new-solution')
        btnSolutions.onclick = module.exports.startNewSolution

        let btnRandomize = document.getElementById('btn-generate-random')
        btnRandomize.onclick = module.exports.createRandomSolution

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

        GlobalObserver.on('ds-availability-change', (ds) => {
            refreshConflictIcons()
        })

        GlobalObserver.on('ds-incompatibility-change', (incompatibility) => {
            refreshConflictIcons()
        })

        GlobalObserver.on('tab-change', (tabID) => {
            module.exports.resetUI()
        })

        GlobalObserver.on('solution-change', (solution) => {
            const matrix = workspace.getMatrix()
            matrix.clearAllIncompatibleOverlays()
            for (let incompDsID of  solution.getIncompatibleDsIds()) {
                matrix.renderIncompatibleOverlay(incompDsID)
            }
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

        if (solution.getMappedFunctionsArray().length === 0) {
            // No DS has been mapped to any FR.
            matrix.removeSolution(solution.id)
            return
        }

        // Verify solution name. If unset (or useless) then automatically set a name.
        if (solution.name === null || /^\s+$/.test(solution.name) || solution.name.length === 0){
            let number = Object.keys(matrix.getSolutionMap()).length
            if (String(number).length === 1) number = `00${number}`
            if (String(number).length === 2) number = `0${number}`
            solution.name = `solution ${number}`
        } 

        // Finish solution
        module.exports.addToSolutionList(solution.id)
    },

    saveEditedSolution: () => {
        let solutionID = state.workspaceSelectedSolution
        let listEntry = document.getElementById(ID_PREFIX_SOLUTION_ENTRY+solutionID)
        listEntry.parentElement.removeChild(listEntry)
        editingSolution = false

        module.exports.completeSolution()
    },

    addToSolutionList: (solutionID) => {
        let solList = document.getElementById('menu-solution-list')
        let matrix = workspace.getMatrix()
        let solution = matrix.getSolution(solutionID)

        let solListEntry = document.createElement('li')
        solListEntry.id = ID_PREFIX_SOLUTION_ENTRY+solutionID
        solListEntry.innerHTML = '<span class="solution-list-icon-span"></span><span class="solution-list-name">'+solution.name+'</span>'
        solListEntry.classList.add('solution-list-entry')

        // Setup listeners
        solListEntry.onclick = (evt) => {
            if (evt.target.classList.contains('overlay')) return
            if (editingSolution) return

            console.log('click!')

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
            if (editingSolution) return

            overlay = document.createElement('div')
            createSolutionEntryOverlay(overlay, solution)
            solListEntry.appendChild(overlay)
        }

        solListEntry.onmouseleave = () => {
            if (!overlay) return
            solListEntry.removeChild(overlay)
            overlay = null
        }

        // Place the entry in the correct place alphabetically
        let previousEntry = findListPosition(solution.name, solutionID)
        if (previousEntry) {
            solList.insertBefore(solListEntry, previousEntry)
        } else {
            solList.appendChild(solListEntry) 
        }

        // Check if the solution contains conflicts.
        if (solution.hasConflicts()) {
            addConflictIcon(solutionID)
        }

        GlobalObserver.emit('solution-added', solutionID)
    },

    removeFromSolutionList: (solutionID) => {
        if (editingSolution) {
            popup.error('A solution is currently being edited. Save it first.')
            return
        }
        
        if (unfinishedSolution) {
            popup.error('A solution is currently being created. Save it first.')
            return
        }

        let matrix = workspace.getMatrix()
        let solution = matrix.getSolution(solutionID)
        let solutionName = solution.name

        popup.warning(`Are you sure you want to delete solution "${solutionName}" permanently?`, {
            titleTxt: 'Delete solution',
            callbackCancel: () => {
                return
            },
            callbackContinue: () => {
                GlobalObserver.emit('solution-removed', solutionID)
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
        editingSolution = true
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
        // Render relevant objects in matrix
        matrix.renderSolution(solutionID)
        for (let incompDsID of  solution.getIncompatibleDsIds()) {
            matrix.renderIncompatibleOverlay(incompDsID)
        }

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

        if (editingSolution) {
            module.exports.saveEditedSolution()
        }

        state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_DEFAULT
        button.innerHTML = 'New solution'
        matrix.clearSolutionRender()
        matrix.clearAllIncompatibleOverlays()
        button.onclick = module.exports.startNewSolution
        document.getElementById('solutions-edit-form').classList.remove('open')

        // Clear solution menu selection
        let previousSelection = document.querySelector('.solution-list-entry.selected')
        if (previousSelection) {
            previousSelection.classList.remove('selected')
        }
    },

    createRandomSolution: () => {
        if (editingSolution) {
            popup.error('A solution is currently being edited. Save it first.')
            return
        }
        
        if (unfinishedSolution) {
            popup.error('A solution is currently being created. Save it first.')
            return
        }

        const matrix = workspace.getMatrix()
        const frArray = matrix.functionalRequirements

        if (Object.keys(matrix.dsMap).length < 2) {
            popup.error('You need to create more design solutions before randomizing')
            return
        }

        let randomSolution = new Solution()
        state.workspaceSelectedSolution = randomSolution.id
        
        for (let i = 0; i < frArray.length; i++) {
            const fr = frArray[i]

            if (fr.designSolutions.length === 0) continue

            let dsIndex = randomInt(0, fr.designSolutions.length - 1)
            let randomDs = fr.designSolutions[dsIndex]
            randomSolution.bindFrToDs(fr, randomDs)
        }

        matrix.addSolution(randomSolution)
        module.exports.completeSolution()
        
    }
}

function addConflictIcon (solutionID) {
    let listElement = document.getElementById(ID_PREFIX_SOLUTION_ENTRY+solutionID)
    let listElementIcons = listElement.querySelector('.solution-list-icon-span')

    // Check if it already has such an icon
    if (listElementIcons.querySelector('.conflict-warning')) return

    let conflictIcon = document.createElement('i')
    conflictIcon.classList.add('fas', 'fa-exclamation-triangle', 'warning-icon', 'conflict-warning')
    conflictIcon.title = 'Solution contains disabled or incompatible design solutions'
    listElementIcons.appendChild(conflictIcon)
}

function removeConflictIcon (solutionID) {
    let listElement = document.getElementById(ID_PREFIX_SOLUTION_ENTRY+solutionID)
    let listElementIcons = listElement.querySelector('.solution-list-icon-span')
    let conflictWarning = listElementIcons.querySelector('.conflict-warning')
    if (!conflictWarning) return
    conflictWarning.parentElement.removeChild(conflictWarning)

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

/**
 * Lazy O(n) search method for finding the appropriate place alphabetically in the solution list to insert a solution.
 * Returns the "next element", allowing the use of "insert before" to correctly place the solution. 
 * If this function returns null, then the correct placement is last.
 */
function findListPosition (solutionName, solutionID) {
    const entriesArray = document.getElementById('menu-solution-list').querySelectorAll('.solution-list-entry')

    if (entriesArray.length === 0) return null

    for (let i = 0; i < entriesArray.length; i++) {
        const entry = entriesArray[i]

        if (entry.id === ID_PREFIX_SOLUTION_ENTRY+solutionID) continue

        const compRes = entry.querySelector('.solution-list-name').innerHTML.localeCompare(solutionName)

        if (compRes === -1) continue

        return entry
    }

    return null
}

function refreshConflictIcons () {
    const matrix = workspace.getMatrix()
    // Loop through solutions. Add/remove conflict icons
    for (let solutionID in matrix.solutions) {
        let solution = matrix.solutions[solutionID]
        if (solution.hasConflicts()) {
            addConflictIcon(solution.id)
        } else {
            removeConflictIcon(solution.id)
        }
    }
}