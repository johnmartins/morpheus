'use strict'

const state = require('./../../state')
const workspace = require('./../../workspace')
const random = require('../../utils/random')

let unfinishedIncompatibility = false
let incompatibilityDsSelection = null
let incompatibilityListIdSelection = null

const ID_PREFIX_INCOMP_ENTRY = 'incomp-li-'

module.exports = {
    setupListeners: () => {

        let toggleDsBtn = document.getElementById('btn-toggle-ds')
        let newIncompatibilityBtn = document.getElementById('btn-add-incompatibility')

        toggleDsBtn.onclick = () => {
            if (state.workspaceInteractionMode === state.constants.WORKSPACE_INTERACTION_MODE_DISABLE) {
                toggleDsBtn.classList.remove('selected')
                state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_DEFAULT
            } else {
                module.exports.resetUI()

                toggleDsBtn.classList.add('selected')
                state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_DISABLE
            } 
        }

        newIncompatibilityBtn.onclick = () => {
            if (state.workspaceInteractionMode === state.constants.WORKSPACE_INTERACTION_MODE_INCOMPATIBILITY) {
                newIncompatibilityBtn.classList.remove('selected')
                state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_DEFAULT
                unfinishedIncompatibility = false
            } else {
                module.exports.resetUI()

                unfinishedIncompatibility = true
                newIncompatibilityBtn.classList.add('selected')
                state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_INCOMPATIBILITY
            }
        }

        // Listen for global events:
        GlobalObserver.on('ds-added', module.exports.refreshSolutionCounter)
        GlobalObserver.on('ds-removed', module.exports.refreshSolutionCounter)
        GlobalObserver.on('ds-availability-change', module.exports.refreshSolutionCounter)
        GlobalObserver.on('ds-incompatibility-change', (incompatibilityID) => {
            let incompatibility = workspace.getMatrix().getIncompatibility(incompatibilityID)
            module.exports.refreshSolutionCounter()

            // If defined, then add to list. If undefined, then it was deleted.
            if (incompatibility) {
                module.exports.addIncompatibilityToList(incompatibility)
            } else {
                module.exports.removeFromList(incompatibilityID)
            }
        })

        GlobalObserver.on('tab-change', (tabData) => {
            module.exports.refreshSolutionCounter()
            if (tabData.currentTab !== 'tab-delimitations') return
            module.exports.resetUI()
        })

        GlobalObserver.on('incompatibility-selection', (ds) => {
            const matrix = workspace.getMatrix()

            if (!incompatibilityDsSelection) {
                matrix.clearAllIncompatibleOverlays()
                incompatibilityDsSelection = ds
                matrix.renderIncompatibleOverlay(ds.id)
                state.workspaceSelectedIncompatibleOrigin = ds.id

                return
            } 
            
            // Compatibility pair selected.
            if (ds.id === incompatibilityDsSelection.id) {
                // If clicked the same -> Clear selection
                matrix.clearIncompatibleOverlay(ds.id)
                incompatibilityDsSelection = null
                state.workspaceSelectedIncompatibleOrigin = null
                return
            }

            // Cant be incompatible with anything from the same row. That makes no sense.
            if (ds.frID === incompatibilityDsSelection.frID) return 

            matrix.renderIncompatibleOverlay(ds.id)
            matrix.setIncompatible(incompatibilityDsSelection, ds)
            incompatibilityDsSelection = null
            state.workspaceSelectedIncompatibleOrigin = null
            
        })

        GlobalObserver.on('matrix-imported', () => {
            module.exports.refreshSolutionCounter()

            // Existing incompatibilities are implicitly imported by the matrix import function
        })

        GlobalObserver.on('matrix-created', () => {
            module.exports.clearIncompatibilityList()
            module.exports.resetUI()
        })
    },

    refreshSolutionCounter: () => {
        let maxWidth = document.getElementById('gen-max-field').value
        let solutionCounter = document.getElementById('delim-solutions-counter')
        const matrix = workspace.getMatrix()

        try {
            let solCount = matrix.countPossibleSolutions(maxWidth)
            solutionCounter.innerHTML = solCount
        } catch (err) {
            if (err.code === 'NO_DS_IN_MATRIX') {
                solutionCounter.innerHTML = '0'
            } else if (err.code === 'GEN_CAP') {
                solutionCounter.innerHTML = `>${maxWidth}`
            } else {
                solutionCounter.innerHTML = 'Calculation failed'
            }
        }
    },

    clearIncompatibilityList() {
        const incompList = document.getElementById('menu-incompatibilities-list')
        let incompElements = incompList.querySelectorAll('.solution-list-entry')

        for (let element of incompElements) {
            element.parentElement.removeChild(element)
        }
    },

    removeFromList: (incompatibilityID) => {
        let incompList = document.getElementById('menu-incompatibilities-list')
        let targetID = ID_PREFIX_INCOMP_ENTRY + '-' + incompatibilityID
        let targetElement = incompList.querySelector(`#${targetID}`)
        incompList.removeChild(targetElement)
    },

    addIncompatibilityToList: (incompatibility) => {
        console.log('Adding incomp to list: '+incompatibility.name)
        const matrix = workspace.getMatrix()

        let incompList = document.getElementById('menu-incompatibilities-list')
        let listEntry = document.createElement('li')
        listEntry.classList.add('solution-list-entry')
        listEntry.id = ID_PREFIX_INCOMP_ENTRY + '-' + incompatibility.id

        let titleElement = document.createElement('span')
        titleElement.classList.add('solution-list-name')
        titleElement.innerHTML = incompatibility.name

        listEntry.appendChild(titleElement)
        incompList.appendChild(listEntry)

        listEntry.onclick = (evt) => {
            if (evt.target.classList.contains('icon')) return
            if (listEntry.id === incompatibilityListIdSelection) {
                module.exports.resetUI()
                return
            }

            module.exports.resetUI()
            
            matrix.renderIncompatibility(incompatibility.id)
            listEntry.classList.add('selected')
            incompatibilityListIdSelection = listEntry.id
        }

        let overlay = null

        listEntry.onmouseover = () => {
            if (overlay) return
            if (unfinishedIncompatibility) return

            overlay = document.createElement('div')
            createListEntryOverlay(overlay, incompatibility)
            listEntry.appendChild(overlay)
        }

        listEntry.onmouseleave = () => {
            if (!overlay) return
            listEntry.removeChild(overlay)
            overlay = null
        }
    },

    resetUI: () => {
        let toggleDsBtn = document.getElementById('btn-toggle-ds')
        let newIncompatibilityBtn = document.getElementById('btn-add-incompatibility')
        let incompList = document.getElementById('menu-incompatibilities-list')

        // Clear selections
        let selectedIncompElement = incompList.querySelector('.selected')
        if (selectedIncompElement) selectedIncompElement.classList.remove('selected')
        newIncompatibilityBtn.classList.remove('selected')
        toggleDsBtn.classList.remove('selected')

        incompatibilityListIdSelection = null
        unfinishedIncompatibility = false
        incompatibilityDsSelection = null
        state.workspaceSelectedIncompatibleOrigin = null

        workspace.getMatrix().clearAllIncompatibleOverlays()
        state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_DEFAULT
    }
}


function createListEntryOverlay (overlay, incompatibility) {
    overlay.classList.add('overlay')

    let deleteIcon = document.createElement('i')
    deleteIcon.classList.add('fas', 'fa-trash-alt', 'icon')
    deleteIcon.onclick = () => {
        console.log('Clicked delete icon')
        workspace.getMatrix().removeIncompatibility(incompatibility.id)
    }

    overlay.appendChild(deleteIcon)
}