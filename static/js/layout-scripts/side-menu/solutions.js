'use strict'
const state = require('./../../state')

module.exports = {
    setupListeners: () => {
        console.log("seup liseteners!")
        let btnSolutions = document.getElementById('btn-new-solution')
        btnSolutions.onclick = () => {
            state.workspaceInteractionMode = state.constants.WORKSPACE_INTERACTION_MODE_SOLUTION
        }
    }
}