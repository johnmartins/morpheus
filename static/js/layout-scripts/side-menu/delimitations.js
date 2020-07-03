'use strict'

const state = require('./../../state')

module.exports = {
    setupListeners: () => {
        let toggleDsBtn = document.getElementById('btn-toggle-ds')
        let newIncompatibilityBtn = document.getElementById('btn-add-incompatibility')


        toggleDsBtn.onclick = () => {
            console.log('toggle away')
        }

        newIncompatibilityBtn.onclick = () => {
            console.log('new incompat')
        }
    }
}