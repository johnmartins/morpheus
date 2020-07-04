'use strict'

module.exports = {
    constants: {
        WORKSPACE_INTERACTION_MODE_DEFAULT: 'wsim-def',         // Default mode. Nothing special
        WORKSPACE_INTERACTION_MODE_SOLUTION: 'wsim-sol',        // Used when setting solutions
        WORKSPACE_INTERACTION_MODE_DISABLE: 'wsim-dis'          // Used when disabling certain design solutions
    },

    workspaceInteractionMode: null,
    workspaceSelectedSolution: null,

    reset: () => {
        module.exports.workspaceInteractionMode = module.exports.constants.WORKSPACE_INTERACTION_MODE_DEFAULT
        module.exports.workspaceSelectedSolution = null
    }

}

module.exports.reset()