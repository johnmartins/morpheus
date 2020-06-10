'use strict'

module.exports = {
    error: (msg) => {
        let { mask, window, title, messageElement } = createPopupWindow()
        title.innerHTML = "Error!"
    },

    warning: (msg, {callbackCancel, callbackContinue, titleTxt = "Warning"} = {}) => {
        let { mask, window, title, messageElement } = createPopupWindow()
        title.innerHTML = titleTxt
        messageElement.innerHTML = msg

        let btnCancel = document.createElement('button')
        btnCancel.classList.add('btn')
        btnCancel.style.marginBottom = 0
        btnCancel.innerHTML = 'Cancel'
        btnCancel.onclick = () => {
            if (callbackCancel) callbackCancel()
            removePopup()
        } 

        let btnContinue = document.createElement('button')
        btnContinue.classList.add('btn')
        btnContinue.style.marginBottom = 0
        btnContinue.innerHTML = 'Continue'
        btnContinue.onclick = () => {
            if (callbackContinue) callbackContinue()
            removePopup()
        } 

        window.appendChild(btnCancel)
        window.appendChild(btnContinue)
    },

}

function createPopupWindow () {
    // The mask blocks the user from clicking on things outside the popup
    let mask = document.createElement('div')
    mask.id = 'popup-mask'
    mask.classList.add('popup-mask')
    document.body.append(mask)

    // The positioner helps placing the popup window in the center of the page
    let positioner = document.createElement('div')
    positioner.id = 'popup-positioner'
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

    return { mask, window, title, messageElement }
}

function removePopup () {
    let mask = document.getElementById('popup-mask')
    mask.parentElement.removeChild(mask)

    let positioner = document.getElementById('popup-positioner')
    positioner.parentElement.removeChild(positioner)
}
