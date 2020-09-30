'use strict'

const random = require('./../utils/random')

const ID_PREFIX_MASK = 'popup-mask-'
const ID_PREFIX_POSITIONER = 'popup-positioner-'

module.exports = {
    /**
     * Create a popup that implies that an error occured. Contains an OK button only.
     */
    error: (msg, {callbackContinue, titleTxt} = {}) => {
        let { id, window, title, messageElement, buttonContainer } = createPopupWindow()
        title.innerHTML = titleTxt ? titleTxt : "Error"
        messageElement.innerHTML = msg ? msg : 'An unexpected exception occured. Please, restart the application.'

        let btnContinue = document.createElement('button')
        btnContinue.classList.add('btn')
        btnContinue.innerHTML = 'Continue'
        btnContinue.onclick = () => {
            if (callbackContinue) callbackContinue()
            removePopup(id)
        }

        document.onkeypress = (evt) => {
            if (evt.code !== 'Enter') return      // If NOT enter
            if (callbackContinue) callbackContinue()
            removePopup(id)
        }   

        buttonContainer.appendChild(btnContinue)
    },

    /**
     * Create a popup to warn of notify the user about something. 
     * Contains a "Cancel" and "Continue button".
     */
    warning: (msg, {callbackCancel, callbackContinue, titleTxt = "Warning"} = {}) => {
        let { id, dialogWindow, title, messageElement, buttonContainer } = createPopupWindow()
        title.innerHTML = titleTxt
        messageElement.innerHTML = msg

        let btnCancel = document.createElement('button')
        btnCancel.classList.add('btn')
        btnCancel.innerHTML = 'Cancel'
        btnCancel.onclick = () => {
            if (callbackCancel) callbackCancel()
            removePopup(id)
        } 

        let btnContinue = document.createElement('button')
        btnContinue.classList.add('btn')
        btnContinue.innerHTML = 'Continue'
        btnContinue.onclick = () => {
            if (callbackContinue) callbackContinue()
            removePopup(id)
        } 

        document.onkeypress = (evt) => {
            if (evt.code !== 'Enter') return      // If NOT enter
            if (callbackContinue) callbackContinue()
            removePopup(id)
        }   

        buttonContainer.appendChild(btnCancel)
        buttonContainer.appendChild(btnContinue)
    },

    notify: (msg, {callbackContinue, titleTxt = "Prompt"} = {}) => {
        let { id, dialogWindow, title, messageElement, buttonContainer } = createPopupWindow()

        title.innerHTML = titleTxt ? titleTxt : 'Notification'
        messageElement.innerHTML = msg

        let btnContinue = document.createElement('button')
        btnContinue.classList.add('btn')
        btnContinue.innerHTML = 'OK'
        btnContinue.onclick = () => {
            if (callbackContinue) callbackContinue()
            removePopup(id)
        } 

        document.onkeypress = (evt) => {
            if (evt.code !== 'Enter') return      // If NOT enter
            if (callbackContinue) callbackContinue()
            removePopup(id)
        }        

        buttonContainer.appendChild(btnContinue)
    },

    /**
     * Create an empty popup. Only contains a title.
     */
    empty: ({titleTxt = "Prompt"} = {}) => {
        let { id, mask, dialogWindow, title, messageElement } = createPopupWindow()

        title.innerHTML = titleTxt
        messageElement.parentElement.removeChild(messageElement)

        return {
            removePopup: () => {removePopup(id)},
            window: window
        }
    }
}

function createPopupWindow () {
    // Ensure that the user cant interact with anything behind the popup using keypress
    if (document.activeElement) document.activeElement.blur()

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

    // The dialogWindow contains all the stuff
    let dialogWindow = document.createElement('div')
    dialogWindow.classList.add('popup')
    positioner.appendChild(dialogWindow)

    let title = document.createElement('h4')
    dialogWindow.appendChild(title)
    let messageElement = document.createElement('span')
    messageElement.classList.add('popup-message', 'text-selectable')
    dialogWindow.appendChild(messageElement)

    let buttonContainer = document.createElement('div')
    buttonContainer.classList.add('popup-btn-container')
    dialogWindow.appendChild(buttonContainer)

    return { id, mask, dialogWindow, title, messageElement, buttonContainer }
}

function removePopup (id) {
    console.log(`remove popup ${id}`)

    // Remove document keypress listener
    document.onkeypress = null

    let mask = document.getElementById(ID_PREFIX_MASK+id)
    mask.parentElement.removeChild(mask)

    let positioner = document.getElementById(ID_PREFIX_POSITIONER+id)
    positioner.parentElement.removeChild(positioner)
}
