'use strict'

const state = require('./../../state')
const workspace = require('./../../workspace')

module.exports = {
    setupListeners: () => {
        let toggleDsBtn = document.getElementById('btn-toggle-ds')
        let newIncompatibilityBtn = document.getElementById('btn-add-incompatibility')
        let solutionCounter = document.getElementById('delim-solutions-counter')

        toggleDsBtn.onclick = () => {
            if (state.workspaceInteractionMode === state.constants.WORKSPACE_INTERACTION_MODE_DISABLE) {
                toggleDsBtn.classList.remove('selected')
                state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_DEFAULT
            } else {
                toggleDsBtn.classList.add('selected')
                state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_DISABLE
            } 
        }

        newIncompatibilityBtn.onclick = () => {
            console.log('new incompat')
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
    },

    refreshSolutionCounter: () => {
        console.log('triggered')
        let solutionCounter = document.getElementById('delim-solutions-counter')
        const matrix = workspace.getMatrix()
        let solCount = 0;

        const frArray = matrix.functionalRequirements

        for (let i = 0; i < frArray.length; i++) {
            const fr = frArray[i]
            let dsCount = fr.designSolutions.length

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

        solutionCounter.innerHTML = solCount
    },

    resetUI: () => {
        let toggleDsBtn = document.getElementById('btn-toggle-ds')
        
        toggleDsBtn.classList.remove('selected')
        state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_DEFAULT
    }
}