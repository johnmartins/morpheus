'use strict'

module.exports = {
    wim: {
        default: {
            // Default mode. Nothing special
            code: 'wsim-def',
            name: 'Default',
            desc: 'Default tool. Enables manipulating the morphological matrix structure. You can add and remove both SS and SF. Hover over a matrix cell to see the different options.'
        },         
        solution: {
            // Used when setting solutions
            code: 'wsim-sol',
            name: 'Solution Edit',
            desc: 'Solution edit mode. Enables editing a solution structure by selecting sub-solutions in the matrix. Each sub-function should have exactly one sub-solution selected.'
        } ,        
        disable: {
            // Used when disabling certain design solutions
            code: 'wsim-dis',
            name: 'Toggle SS',
            desc: 'Toggle sub-solution mode. Click on sub solutions to toggle their availability. Disabled SS can not be used in solutions.'
        } ,         
        incompatibility: {
            // Used when defining incompatible DSs 
            code: 'wsim-inc',
            name: 'Incompatibility selection',
            desc: 'Mark two sub-solutions as incompatible by clicking them. A pair of incompatible SS can not be used in the same solution.'
        },
    },

    softwareVersion: null,

    workspaceInteractionMode: null,
    workspaceSelectedSolution: null,
    workspaceSelectedIncompatibleOrigin: null,

    /**
     * Resets all state parameters that depends on user interaction
     */
    reset: () => {
        module.exports.setWim(module.exports.wim.default)
        module.exports.workspaceSelectedSolution = null
        module.exports.workspaceSelectedIncompatibleOrigin = null
    },

    /**
     * Checks if the current workspace interaction mode matches the variable. Returns true or false.
     */
    equalsWim: (mode) => {
        if (module.exports.workspaceInteractionMode === null) return false
        if (module.exports.workspaceInteractionMode.code === mode.code) {
            return true
        }
        return false
    }, 

    setWim: (mode) => {
        if (module.exports.equalsWim(mode)) return

        module.exports.workspaceInteractionMode = mode
        GlobalObserver.emit('wim-change', mode)
    }

}