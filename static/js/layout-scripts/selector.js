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

        // Insert element in alphabetical order
        let nextOption = this._getNextElement(optionText)
        if (nextOption) {
            this.optionsContainer.insertBefore(el, nextOption)
        } else {
            this.optionsContainer.appendChild(el)
        }
        
        this.valueToElementMap[value] = el

        el.onclick = () => {
            this.setValue(value)
        }
    }

    removeOption (value) {
        // If removed option is selected, select another value or default

        if (this.value === value) {
            console.log('removed selected value')
            this.value = null
            this.currentValueElement.innerHTML = 'Select a solution'
        }

        let el = this.valueToElementMap[value]
        if (el) {
            el.parentElement.removeChild(el)
            delete this.valueToElementMap[value]
        }
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

    clear() {
        const values = Object.keys(this.valueToElementMap)

        for (let i = 0; i < values.length; i++) {
            const val = values[i]
            this.removeOption(val)
        }
    }

    _getNextElement(name) {
        // TODO.. Also fix the bug where if you edit a solution, the before AND after is visible in the selector. Thanks.
        let options = this.optionsContainer.querySelectorAll('.selector-option')

        if (options.length === 0) return null

        for (let i = 0; i < options.length; i++) {
            const option = options[i]

            const compRes = option.innerHTML.localeCompare(name)

            if (compRes === -1) continue
            
            return option
        }

        return null

    }
}

module.exports = Selector