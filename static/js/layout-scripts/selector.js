'use strict'

const random = require('./../utils/random')

class Selector {
    constructor({placeholder = null} = {}) {
        this.value = null
        this.valueToElementMap = {}

        this.wrapper = document.createElement('div')
        this.wrapper.classList.add('selector-wrapper')

        this.selector = document.createElement('div')
        this.selector.classList.add('selector')
        this.wrapper.appendChild(this.selector)

        this.trigger = document.createElement('div')
        this.trigger.classList.add('selector-trigger')

        this.currentValueElement = document.createElement('span')
        this.currentValueElement.classList.add('selector-value')
        this.currentValueElement.innerHTML = placeholder ? placeholder : 'Select..'
        this.trigger.appendChild(this.currentValueElement)

        this.arrow = document.createElement('span')
        this.arrow.classList.add('selector-arrow')
        this.arrow.innerHTML = '<i style="font-size: 0.9rem;" class="fas fa-chevron-down"></i>'
        this.trigger.appendChild(this.arrow)

        this.optionsContainer = document.createElement('div')
        this.optionsContainer.classList.add('selector-options')
        this.selector.appendChild(this.optionsContainer)

        this.selector.appendChild(this.trigger)

        // Solution selector
        this.selector.onclick = () => {
            let open = this.selector.classList.contains('open')
            if (open) {
                this.selector.classList.remove('open')
            } else {
                this.selector.classList.add('open')
            }
        }
    }

    getElement(){
        return this.wrapper
    }

    addOption (optionText, value) {
        let el = document.createElement('span')
        el.classList.add('selector-option')
        el.innerHTML = optionText
        this.optionsContainer.appendChild(el)

        this.valueToElementMap[value] = el

        el.onclick = () => {
            this.setValue(value)
        }
    }

    removeOption (value) {
        // If removed option is selected, select another value or default
        console.log('this value: '+this.value)
        console.log('value: '+value)

        if (this.value === value) {
            console.log('removed selected value')
            this.value = null
            this.currentValueElement.innerHTML = 'Select a solution'
        }

        let el = this.valueToElementMap[value]
        el.parentElement.removeChild(el)
    }

    setValue (value) {
        let valEl = this.valueToElementMap[value]
        if (!valEl) {
            console.error('No such value represented in selector')
            return
        }

        // Clear previous selection
        let prevSelected = this.optionsContainer.querySelector('.selected')
        if (prevSelected) prevSelected.classList.remove('selected')

        // Update GUI
        this.currentValueElement.innerHTML = valEl.innerHTML
        valEl.classList.add('selected')

        // Update stored value
        this.value = value
        console.log('current value: '+this.value)
    }

    getValue () {
        return this.value
    }

    hide() {
        this.wrapper.style.display = 'none'
    }

    show() {
        this.wrapper.style.display = 'block'
    }
}

module.exports = Selector