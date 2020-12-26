'use strict'

module.exports = {
    wim: {
        default: {
            // Default mode. Nothing special
            code: 'wsim-def',
            name: 'Default',
            desc: 'Default tool. \
            Enables manipulating the morphological matrix structure. <br><br> \
            You can add and remove both sub-solutions (SS) and sub-functions (SF). \
            You can also move SF up and down and also add pictures to any SS. \
            Hover over a matrix cell to see the different options.'
        },         
        solution: {
            // Used when setting solutions
            code: 'wsim-sol',
            name: 'Solution Edit',
            desc: 'Solution edit mode. \
            Enables editing a solution structure by selecting sub-solutions in the matrix.<br><br> \
            Each sub-function should have exactly one sub-solution selected.'
        } ,        
        disable: {
            // Used when disabling certain design solutions
            code: 'wsim-dis',
            name: 'Toggle SS',
            desc: 'Toggle sub-solution mode. \
            Enables you to enable or disable sub-solutions (SS). <br><br>\
            Click on a SS to toggle its availability. \
            Disabled SS can not be used in solutions, and will not be automatically picked \
            when generating all possible solutions.'
        } ,         
        incompatibility: {
            // Used when defining incompatible DSs 
            code: 'wsim-inc',
            name: 'Incompatibility selection',
            desc: 'Incompatibility selection mode. \
            Renders two sub-solutions as incompatible, meaning they can not \
            be part of the same solution. <br><br>\
            Mark two sub-solutions as incompatible by clicking them. \
            A pair of incompatible SS can not be used in the same solution. \
            The sub-solutions can not be on the same row. \
            Clicking on a selected sub-solution again will deselect it, \
            allowing you to select another one. <br><br>\
            Once you have selected two sub-solutions on different rows the \
            incompatibility will be added to the list of incompatibilities, \
            which can be seen under the "delimitations"-tab.'
        },
    },

    softwareVersion: null,

    workspaceInteractionMode: null,
    workspaceSelectedSolution: null,
    workspaceSelectedIncompatibleOrigin: null,

    tabCurrent: null,

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
    },

    setCurrentTab: (tabID) => {
        module.exports.tabCurrent = tabID
    }
}
