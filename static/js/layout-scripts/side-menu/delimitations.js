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
        const matrix = workspace.getMatrix()

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
        GlobalObserver.on('ds-incompatibility-change', (incompatibility) => {
            module.exports.refreshSolutionCounter()

            module.exports.addIncompatibilityToList(incompatibility)

        })

        GlobalObserver.on('tab-change', (tabData) => {
            if (tabData.currentTab !== 'tab-delimitations') return
            module.exports.resetUI()
        })

        GlobalObserver.on('incompatibility-selection', (ds) => {

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
    },

    refreshSolutionCounter: () => {
        console.log('triggered')
        let solutionCounter = document.getElementById('delim-solutions-counter')
        const matrix = workspace.getMatrix()
        let solCount = matrix.countPossibleSolutions()

        solutionCounter.innerHTML = solCount
    },

    addIncompatibilityToList: (incompatibility) => {
        const matrix = workspace.getMatrix()

        let incompList = document.getElementById('menu-incompatibilities-list')
        let listEntry = document.createElement('li')
        listEntry.classList.add('solution-list-entry')
        listEntry.id = ID_PREFIX_INCOMP_ENTRY + '-' + random.randomString(6)

        let titleElement = document.createElement('span')
        titleElement.classList.add('solution-list-name')
        titleElement.innerHTML = incompatibility.name

        listEntry.appendChild(titleElement)
        incompList.appendChild(listEntry)

        listEntry.onclick = (evt) => {
            if (listEntry.id === incompatibilityListIdSelection) {
                module.exports.resetUI()
                return
            }

            module.exports.resetUI()
            
            matrix.renderIncompatibility(incompatibility.id)
            listEntry.classList.add('selected')
            incompatibilityListIdSelection = listEntry.id
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