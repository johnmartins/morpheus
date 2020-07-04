'use strict'

const state = require('./../../state')

module.exports = {
    setupListeners: () => {
        let toggleDsBtn = document.getElementById('btn-toggle-ds')
        let newIncompatibilityBtn = document.getElementById('btn-add-incompatibility')


        toggleDsBtn.onclick = () => {
            console.log('toggle away')
            if (state.workspaceInteractionMode === state.constants.WORKSPACE_INTERACTION_MODE_DISABLE) {
                state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_DEFAULT
            } else {
                state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_DISABLE
            }
            
        }

        newIncompatibilityBtn.onclick = () => {
            console.log('new incompat')
        }
    }
}