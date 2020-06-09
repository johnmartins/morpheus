'use strict'

module.exports = {
    constants: {
        WORKSPACE_INTERACTION_MODE_DEFAULT: 'wsim-def',
        WORKSPACE_INTERACTION_MODE_SOLUTION: 'wsim-sol'
    },

    workspaceInteractionMode: null,
    workspaceSelectedSolution: null,

    reset: () => {
        module.exports.workspaceInteractionMode = module.exports.constants.WORKSPACE_INTERACTION_MODE_DEFAULT
        module.exports.workspaceSelectedSolution = null
    }

}

module.exports.reset()