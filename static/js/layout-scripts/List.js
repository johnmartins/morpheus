'use strict'

const random = require('./../utils/random')

class List {

    constructor (containerID, {elementNameSpace = random.randomString(5)} = {}) {
        this.elementNameSpace = elementNameSpace
        this.container = document.getElementById(containerID)
        this.listRoot = document.createElement('ul')
        this.listRoot.classList.add('solution-list')
        this.listRoot.tabIndex = 0
        this.container.appendChild(this.listRoot)

        this.listRoot.onkeydown = (evt) => {

            evt.preventDefault()

            let nextSelection = null

            if (evt.code === 'ArrowUp') {
                nextSelection = this.getSelectedElement().previousSibling
            } else if (evt.code === 'ArrowDown') {
                nextSelection = this.getSelectedElement().nextSibling
            }

            if (!nextSelection) return
            
            nextSelection.scrollIntoView({
                block: 'nearest'
            })

            let targetID = nextSelection.id.substring(this.elementNameSpace.length)
            this.select(targetID)
        }
    }

    add (entryText, {id, onClick, createOverlay} = {}) {
        let listEntry = document.createElement('li')
        listEntry.id = this.elementNameSpace + id
        listEntry.innerHTML = '<span class="solution-list-icon-span"></span><span class="solution-list-name">'+entryText+'</span>'
        listEntry.classList.add('solution-list-entry')

        // Setup listeners
        listEntry.onclick = (evt) => {
            if (evt.target.classList.contains('overlay')) return

            if (!onClick) {
                console.error('List Entry does not have a registered click handler')
                return
            }

            const alreadySelected = listEntry.classList.contains('selected')
            onClick(alreadySelected)
            if (!alreadySelected) {
                listEntry.classList.add('selected')
            }   
        }

        let overlay = null

        listEntry.onmouseover = () => {
            if (overlay) return
            overlay = document.createElement('div')
            overlay.classList.add('overlay')
            overlay = createOverlay(overlay)
            if (!overlay) return
            listEntry.appendChild(overlay)
        }

        listEntry.onmouseleave = () => {
            if (!overlay) return
            listEntry.removeChild(overlay)
            overlay = null
        }

        // Place the entry in the list alphabetically
        let previousEntry = this._findPrevious(entryText, id)
        if (previousEntry) {
            this.listRoot.insertBefore(listEntry, previousEntry)
        } else {
            this.listRoot.appendChild(listEntry)
        }
    }

    /**
     * Programmatically select an element
     * @param {String} id 
     */
    select (id) {
        if (!id) return

        let clickEvent = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
        })

        // Click on element programmatically
        const el = document.getElementById(this.elementNameSpace+id)
        if (!el) return

        el.dispatchEvent(clickEvent)
    }

    /**
     * Remove element from list
     * @param {String} id 
     */
    remove (id) {
        let listEntry = document.getElementById(this.elementNameSpace + id)
        listEntry.parentElement.removeChild(listEntry)
    }

    /**
     * Completely clears the list of elements
     */
    clear () {
        this.listRoot.innerHTML = ''
    }

    /**
     * Lazy O(n) search method for finding the appropriate place alphabetically in the list
     * Returns the element (that should be) placed 
     * before this element in the list.
     * @param {String} entryText    Text of inserted element
     * @param {String} id           ID of inserted element
     */
    _findPrevious (entryText, id) {
        const entriesArray = this.listRoot.querySelectorAll('.solution-list-entry')

        if (entriesArray.length === 0) return null

        for (let i = 0; i < entriesArray.length; i++) {
            const entry = entriesArray[i]
            if (entry.id === id) continue
            const compRes = entry.querySelector('.solution-list-name').innerHTML.localeCompare(entryText)
            if (compRes === -1) continue
            return entry
        }
    
        return null
    }

    getSelectedElement () {
        return this.listRoot.querySelector('.solution-list-entry.selected')
    }

    clearHighlight () {
        let selected = this.getSelectedElement()
        if (!selected) return
        selected.classList.remove('selected')
    }

    getIconField (id) {
        let listElement = document.getElementById(this.elementNameSpace+id)
        return listElement.querySelector('.solution-list-icon-span')
    }

}

module.exports = List