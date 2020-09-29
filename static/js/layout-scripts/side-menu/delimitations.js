'use strict'

const state = require('./../../state')
const workspace = require('./../../workspace')
const List = require('../List')

let unfinishedIncompatibility = false
let incompatibilityDsSelection = null

let incompList = null

const ID_PREFIX_INCOMP_ENTRY = 'incomp-li-'

module.exports = {
    init: () => {

        // Create list of incompatibilities
        incompList = new List('menu-incomp-list-container', {
            elementNameSpace: ID_PREFIX_INCOMP_ENTRY
        })

        let toggleDsBtn = document.getElementById('btn-toggle-ds')
        let newIncompatibilityBtn = document.getElementById('btn-add-incompatibility')

        toggleDsBtn.onclick = () => {
            if (state.equalsWim(state.wim.disable)) {
                toggleDsBtn.classList.remove('selected')
                state.setWim(state.wim.default)
            } else {
                module.exports.resetUI()

                toggleDsBtn.classList.add('selected')
                state.setWim(state.wim.disable)
            } 
        }

        newIncompatibilityBtn.onclick = () => {
            if (state.equalsWim(state.wim.incompatibility)) {
                newIncompatibilityBtn.classList.remove('selected')
                state.setWim(state.wim.default)
                unfinishedIncompatibility = false
            } else {
                module.exports.resetUI()

                unfinishedIncompatibility = true
                newIncompatibilityBtn.classList.add('selected')
                state.setWim(state.wim.incompatibility)
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

    /**
     * Count possible solutions again. Refreshes the counter visually
     */
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

    /**
     * Completely wipes the list of incompatibilities. <br>
     * <strong>Warning:</strong> does not ACTUALLY delete the incompatibilities from the data stucture.
     */
    clearIncompatibilityList() {
        incompList.clear()
    },

    /**
     * Remove a specific incompatibility from the list
     * @param {String} incompatibilityID incompatibility ID
     */
    removeFromList: (incompatibilityID) => {
        incompList.remove(incompatibilityID)
    },

    /**
     * Add incompatibility to the list of icompatibilities
     * @param {Incompatibility} incompatibility
     */
    addIncompatibilityToList: (incompatibility) => {
        const matrix = workspace.getMatrix()

        incompList.add(incompatibility.name, {
            id: incompatibility.id,
            onClick: (alreadySelected) => {
                if (alreadySelected) {
                    module.exports.resetUI()
                    return
                }
    
                module.exports.resetUI()
                
                matrix.renderIncompatibility(incompatibility.id)

            },
            createOverlay: (overlay) => {
                if (unfinishedIncompatibility) return

                let deleteIcon = document.createElement('i')
                deleteIcon.classList.add('fas', 'fa-trash-alt', 'icon')
                deleteIcon.onclick = () => {
                    console.log('Clicked delete icon')
                    workspace.getMatrix().removeIncompatibility(incompatibility.id)
                }
            
                overlay.appendChild(deleteIcon)
                return overlay
            }
        })
    },

    /**
     * Reset interface to default condition
     */
    resetUI: () => {
        let toggleDsBtn = document.getElementById('btn-toggle-ds')
        let newIncompatibilityBtn = document.getElementById('btn-add-incompatibility')

        // Clear selections
        incompList.clearHighlight()
        newIncompatibilityBtn.classList.remove('selected')
        toggleDsBtn.classList.remove('selected')

        unfinishedIncompatibility = false
        incompatibilityDsSelection = null
        state.workspaceSelectedIncompatibleOrigin = null

        workspace.getMatrix().clearAllIncompatibleOverlays()
        state.setWim(state.wim.default)
    }
}