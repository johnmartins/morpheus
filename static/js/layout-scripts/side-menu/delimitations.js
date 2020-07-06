'use strict'

const state = require('./../../state')
const workspace = require('./../../workspace')

let unfinishedIncompatibility = false
let incompatibilitySelection = null

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
        GlobalObserver.on('ds-incompatibility-change', module.exports.refreshSolutionCounter)

        GlobalObserver.on('tab-change', (tabData) => {
            if (tabData.currentTab !== 'tab-delimitations') return
            module.exports.resetUI()
        })

        GlobalObserver.on('incompatibility-selection', (ds) => {
            if (!incompatibilitySelection) {
                incompatibilitySelection = ds
                matrix.renderIncompatibleOverlay(document.getElementById(ds.id))
            } else {
                // Compatibility pair selected.
                if (ds.id === incompatibilitySelection.id) {
                    // If clicked the same -> Clear selection
                    matrix.clearIncompatibleOverlay(document.getElementById(ds.id))
                    incompatibilitySelection = null
                    return
                }

                // Cant be incompatible with anything from the same row. That makes no sense.
                if (ds.frID === incompatibilitySelection.frID) return 

                matrix.renderIncompatibleOverlay(document.getElementById(ds.id))
                matrix.setIncompatible(incompatibilitySelection, ds)
                incompatibilitySelection = null
            }
        })
    },

    refreshSolutionCounter: () => {
        console.log('triggered')
        let solutionCounter = document.getElementById('delim-solutions-counter')
        const matrix = workspace.getMatrix()
        let solCount = matrix.countPossibleSolutions()

        solutionCounter.innerHTML = solCount
    },

    resetUI: () => {
        let toggleDsBtn = document.getElementById('btn-toggle-ds')
        let newIncompatibilityBtn = document.getElementById('btn-add-incompatibility')
        
        newIncompatibilityBtn.classList.remove('selected')
        toggleDsBtn.classList.remove('selected')

        unfinishedIncompatibility = false
        incompatibilitySelection = null

        workspace.getMatrix().clearAllIncompatibleOverlays()
        state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_DEFAULT
    }
}