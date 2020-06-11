'use strict'

const random = require('./../utils/random')

const ID_PREFIX_MASK = 'popup-mask-'
const ID_PREFIX_POSITIONER = 'popup-positioner-'

module.exports = {
    /**
     * Create a popup that implies that an error occured. Contains an OK button only.
     */
    error: (msg) => {
        let { id, mask, window, title, messageElement } = createPopupWindow()
        title.innerHTML = "Error!"
    },

    /**
     * Create a popup to warn of notify the user about something. 
     * Contains a "Cancel" and "Continue button".
     */
    warning: (msg, {callbackCancel, callbackContinue, titleTxt = "Warning"} = {}) => {
        let { id, mask, window, title, messageElement } = createPopupWindow()
        title.innerHTML = titleTxt
        messageElement.innerHTML = msg

        let btnCancel = document.createElement('button')
        btnCancel.classList.add('btn')
        btnCancel.style.marginBottom = 0
        btnCancel.innerHTML = 'Cancel'
        btnCancel.onclick = () => {
            if (callbackCancel) callbackCancel()
            removePopup(id)
        } 

        let btnContinue = document.createElement('button')
        btnContinue.classList.add('btn')
        btnContinue.style.marginBottom = 0
        btnContinue.innerHTML = 'Continue'
        btnContinue.onclick = () => {
            if (callbackContinue) callbackContinue()
            removePopup(id)
        } 

        window.appendChild(btnCancel)
        window.appendChild(btnContinue)
    },

    /**
     * Create an empty popup. Only contains a title.
     */
    empty: ({titleTxt = "Prompt"} = {}) => {
        let { id, mask, window, title, messageElement } = createPopupWindow()

        title.innerHTML = titleTxt
        messageElement.parentElement.removeChild(messageElement)

        return {
            removePopup: () => {removePopup(id)},
            window: window
        }
    }

}

function createPopupWindow () {
    let id = random.randomString(5)

    // The mask blocks the user from clicking on things outside the popup
    let mask = document.createElement('div')
    mask.id = ID_PREFIX_MASK+id
    mask.classList.add('popup-mask')
    document.body.append(mask)

    // The positioner helps placing the popup window in the center of the page
    let positioner = document.createElement('div')
    positioner.id = ID_PREFIX_POSITIONER+id
    positioner.classList.add('popup-positioner')
    document.body.appendChild(positioner)

    // The window contains all the stuff
    let window = document.createElement('div')
    window.classList.add('popup')
    positioner.appendChild(window)

    let title = document.createElement('h4')
    window.appendChild(title)
    let messageElement = document.createElement('span')
    messageElement.classList.add('popup-message')
    window.appendChild(messageElement)

    return { id, mask, window, title, messageElement }
}

function removePopup (id) {
    console.log(`remove popup ${id}`)
    let mask = document.getElementById(ID_PREFIX_MASK+id)
    mask.parentElement.removeChild(mask)

    let positioner = document.getElementById(ID_PREFIX_POSITIONER+id)
    positioner.parentElement.removeChild(positioner)
}
