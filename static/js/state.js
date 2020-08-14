'use strict'

module.exports = {
    constants: {
        WORKSPACE_INTERACTION_MODE_DEFAULT: 'wsim-def',         // Default mode. Nothing special
        WORKSPACE_INTERACTION_MODE_SOLUTION: 'wsim-sol',        // Used when setting solutions
        WORKSPACE_INTERACTION_MODE_DISABLE: 'wsim-dis',         // Used when disabling certain design solutions
        WORKSPACE_INTERACTION_MODE_INCOMPATIBILITY: 'wsim-inc', // Used when defining incompatible DSs             
    },

    softwareVersion: null,

    workspaceInteractionMode: null,
    workspaceSelectedSolution: null,
    workspaceSelectedIncompatibleOrigin: null,

    /**
     * Resets all state parameters that depends on user interaction
     */
    reset: () => {
        module.exports.workspaceInteractionMode = module.exports.constants.WORKSPACE_INTERACTION_MODE_DEFAULT
        module.exports.workspaceSelectedSolution = null
        module.exports.workspaceSelectedIncompatibleOrigin = null
    }

}

module.exports.reset()