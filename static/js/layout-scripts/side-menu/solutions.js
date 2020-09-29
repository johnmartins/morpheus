'use strict'
const state = require('./../../state')

const Solution = require('./../../morph-matrix/Solution')
const workspace = require('./../../workspace')
const popup = require('./../popup')
const SolutionGenerator = require('./../../morph-matrix/SolutionGenerator')
const { randomInt } = require('../../utils/random')

const List = require('./../List')

let solutionList = null

let unfinishedSolution = false      // The user has started a new solution that is unsaved
let editingSolution = false         // The user is editing a solution

const ID_PREFIX_SOLUTION_ENTRY = 'sol-li-'

module.exports = {
    init: () => {

        setupSolutionList()

        let btnSolutions = document.getElementById('btn-new-solution')
        btnSolutions.onclick = module.exports.startNewSolution

        let btnDeleteAllSolutions = document.getElementById('btn-clear-solutions')
        btnDeleteAllSolutions.onclick = module.exports.clearAllSolutions

        let btnRandomize = document.getElementById('btn-generate-random')
        btnRandomize.onclick = module.exports.createRandomSolution

        let btnGenerate = document.getElementById('btn-generate-all')
        btnGenerate.onclick = module.exports.generateAllSolutions

        // Solution generation controls
        let genWarningText = document.getElementById('gen-max-warning-text')
        const showWarningText = (val) => {
            if (val > 500) {
                genWarningText.style.display="inline-block"
            } else {
                genWarningText.style.display="none"
            }
        }
        let rangeMaxGens = document.getElementById('gen-max-range')
        let fieldMaxGens = document.getElementById('gen-max-field')

        showWarningText(rangeMaxGens.value)

        rangeMaxGens.oninput = () => {
            fieldMaxGens.value = rangeMaxGens.value

            showWarningText(rangeMaxGens.value)
        }
        fieldMaxGens.onchange = () => {
            let val = fieldMaxGens.value

            if (val > 2000) val = 2000
            if (val < 10) val = 10

            rangeMaxGens.value = val
            fieldMaxGens.value = val

            showWarningText(val)
        }

        // New import -> Setup solution list
        GlobalObserver.on('matrix-imported', () => {
            listSolutionsFromMatrix()
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

        GlobalObserver.on('ds-incompatibility-change', (incompatibilityID) => {
            refreshConflictIcons()
        })

        GlobalObserver.on('ds-removed', () => {
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
        state.setWim(state.wim.solution)
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

        try {
            matrix.registerSolution(solution)

        } catch (err) {
            if (err.code === 'SOLUTION_EXISTS') {
                console.error('WARNING: SOLUTION IS NOT UNIQUE')

                let duplicateSolution = null

                for (let solID in matrix.getSolutionMap()) {
                    let storedSolution = matrix.getSolutionMap()[solID]

                    if (storedSolution.solutionString === solution.solutionString) {
                        duplicateSolution = storedSolution
                        break
                    }
                }

                popup.error(`The solution is not unique. <strong>"${duplicateSolution.name}"</strong> has the same scheme. This solution will not be added.`)
            } else {
                popup.error('An unidentified error occurred.')
            }

            // Remove solution, but since this is a duplicate we do not want to
            // unregister the solution, since it exists in the other copy.
            matrix.removeSolution(solution.id, true)
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
        solutionList.remove(solutionID)
        editingSolution = false

        module.exports.completeSolution()
    },




    addToSolutionList: (solutionID) => {
        let matrix = workspace.getMatrix()
        let solution = matrix.getSolution(solutionID)

        solutionList.add(solution.name, {
            id: solutionID,
            onClick: (alreadySelected) => {
                if (editingSolution) return

                if (alreadySelected) { 
                    module.exports.resetUI()
                    return;
                }
    
                module.exports.resetUI()

                state.workspaceSelectedSolution = solutionID
                matrix.renderSolution(solutionID)
            },
            createOverlay: (overlay) => {
                if (editingSolution) return
                if (!overlay) return

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
            
                return overlay
            }
        })

        // Check if the solution contains conflicts.
        if (solution.hasConflicts()) {
            addConflictIcon(solutionID)
        }

        GlobalObserver.emit('solution-added', solutionID)
    },

    removeFromSolutionList: (solutionID) => {
        if (checkIfWorkInProgress()) {
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
                module.exports.removeListedSolution(solutionID)
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
        matrix.unregisterSolution(solution) // Remove stores solution string from set
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
        
        state.setWim(state.wim.solution)
        // Render relevant objects in matrix
        matrix.renderSolution(solutionID)
        for (let incompDsID of  solution.getIncompatibleDsIds()) {
            matrix.renderIncompatibleOverlay(incompDsID)
        }

        nameForm.focus()
        
    },

    /**
     * Wipes the list of solutions. But it does not actually delete the solutions.
    */
    clearSolutionList: () => {
        solutionList.clear()
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

        // Reset relevant state variables
        state.setWim(state.wim.default)
        state.workspaceSelectedSolution = null

        button.innerHTML = 'New solution'
        matrix.clearSolutionRender()
        matrix.clearAllIncompatibleOverlays()
        button.onclick = module.exports.startNewSolution
        document.getElementById('solutions-edit-form').classList.remove('open')

        // Clear solution menu selection
        solutionList.clearHighlight()
    },

    createRandomSolution: () => {
        if (checkIfWorkInProgress()) {
            return
        }

        const matrix = workspace.getMatrix()
        const frArray = matrix.functionalRequirements

        if (Object.keys(matrix.dsMap).length < 2) {
            popup.error('You need to create more sub-solutions before randomizing')
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
        
    },

    removeListedSolution: (solutionID) => {
        const matrix = workspace.getMatrix()
        GlobalObserver.emit('solution-removed', solutionID)
        matrix.removeSolution(solutionID)
        solutionList.remove(solutionID)
        matrix.clearSolutionRender()
    },

    generateAllSolutions: () => {
        console.log('Generate ALL solutions request')

        if (checkIfWorkInProgress()) {
            return
        }

        const matrix = workspace.getMatrix()
        let fieldMaxGens = document.getElementById('gen-max-field')

        let generator = new SolutionGenerator(matrix)

        try {
            generator.generateAll({
                limit: fieldMaxGens.value,
                onlyCount: false
            })

            listSolutionsFromMatrix()
        } catch (err) {
            if (err.code === 'NO_DS_IN_MATRIX') {
                popup.error(`No sub-solutions in Matrix.<br><br>Error message: ${err.message}`)
            } else if (err.code === 'GEN_CAP') {
                popup.error(`Generation capacity reached!<br><br>Error message: ${err.message}`)
            } else {
                popup.error('An unidentified error occured when attempting to generate all solutions.')
                console.error(err.message)
                console.error(err.stack)
            }
        }
    },

    /**
     * Deletes all stored solutions permanentally 
     */
    clearAllSolutions: () => {
        console.log('Clear all solutions request')

        if (checkIfWorkInProgress()) {
            return
        }

        popup.warning('Are you sure you want to delete ALL solutions permanently?', {
            titleTxt: 'Delete all solutions',
            callbackContinue: () => {
                const matrix = workspace.getMatrix()
                module.exports.clearSolutionList()
                matrix.removeAllSolutions()
                module.exports.resetUI()

                GlobalObserver.emit('solution-removed-all')
            }
        })

    }
}

function addConflictIcon (solutionID) {
    let iconField = solutionList.getIconField(solutionID)

    // Check if it already has such an icon
    if (iconField.querySelector('.conflict-warning')) return

    let conflictIcon = document.createElement('i')
    conflictIcon.classList.add('fas', 'fa-exclamation-triangle', 'warning-icon', 'conflict-warning')
    conflictIcon.title = 'Solution contains disabled or incompatible sub-solutions'
    iconField.appendChild(conflictIcon)
}

function removeConflictIcon (solutionID) {
    let iconField = solutionList.getIconField(solutionID)
    let conflictWarning = iconField.querySelector('.conflict-warning')
    if (!conflictWarning) return
    conflictWarning.parentElement.removeChild(conflictWarning)
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

function listSolutionsFromMatrix () {
    module.exports.clearSolutionList()

    const matrix = workspace.getMatrix()
    let solutionIDs = Object.keys(matrix.solutions)
    for (let i = 0; i < solutionIDs.length; i++) {
        let solutionID = solutionIDs[i]
        module.exports.addToSolutionList(solutionID)
    }
}

/**
 * Checks if the user currently is editing och creating a new solution. If so, this returns true.
 * If there is no work in progress, then this function returns false
 */
function checkIfWorkInProgress () {
    if (editingSolution) {
        popup.error('A solution is currently being edited. Save it first.')
        return true
    }
    
    if (unfinishedSolution) {
        popup.error('A solution is currently being created. Save it first.')
        return true
    }
}

function setupSolutionList () {
    solutionList = new List('menu-sol-list-container', {
        elementNameSpace: ID_PREFIX_SOLUTION_ENTRY
    })
}