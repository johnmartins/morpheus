'use strict'
const random = require('./../utils/random')

class FunctionalRequirement {
    id = null
    description = null
    position = null
    designSolutions = []

    constructor (id, position) {
        this.id = id
        this.position = position
    }
}

class DesignSolution {
    id = null
    description = null
    position = null
    image = null
    frID = null

    constructor(id, position, frID) {
        this.id = id
        this.position = position
        this.frID = frID
    }
}

class MorphMatrix {

    // Object representation of matrix information
    name = "Untitled Morphological Matrix"
    functionalRequirements = []
    solutions = []

    rowToRequirementMap = {}
    cellToDesignSolutionMap = {}

    // Parameters
    cellWidth = "150px"
    cellHeight = "50px"

    // Important layout vars
    containerID = null
    containerElement = null
    titleContainerElement = null
    titleElement = null
    tableElement = null
    tbodyElement = null
    dsLabelCell = null

    constructor(containerID) {
        this.containerElement = document.getElementById(containerID)
        this.containerID = containerID

        if (!this.containerElement) throw new Error('Failed to find matrix container')
        
        // Create title
        this._setupTitleElement()

        // Create table
        this.tableElement = document.createElement('table')
        this.tbodyElement = document.createElement('tbody')
        this.tableElement.appendChild(this.tbodyElement)
        this.containerElement.appendChild(this.tableElement)

        this._setupTableControls()

        // Setup global event listeners
        this._setupGlobalEventListeners()
    }

    _setupGlobalEventListeners () {
        GlobalObserver.on('file-dialog-result', (res) => {
            console.log(res.file)
            console.log(res.data)
            let ds = this.cellToDesignSolutionMap[res.data.targetElement]
            ds.image = res.file
            
            let cell = document.getElementById(res.data.targetElement)
            let img = document.getElementById('img-'+res.data.targetElement)
            img.src = ds.image
            img.width = 150
            img.height = 150
            cell.appendChild(img)
        })
    }
    
    _setupTitleElement () {
        this.titleContainerElement = document.createElement('div')
        this.titleElement = document.createElement('h3')
        this.titleElement.innerHTML = this.name
        this.titleContainerElement.appendChild(this.titleElement)
        this.containerElement.appendChild(this.titleContainerElement)

        this.titleElement.onmouseover = (evt) => {
            this.titleElement.innerHTML = this.name + ' <i class="far fa-edit"></i>'
        }

        this.titleElement.onmouseleave = (evt) => {
            this.titleElement.innerHTML = this.name 
        }

        this.titleElement.onclick = (evt) => {
            this.titleContainerElement.innerHTML = ""
            let titleInput = document.createElement('input')
            titleInput.type = 'text'
            titleInput.value = this.name
            titleInput.maxLength = 50
            titleInput.classList.add('text-form')
            this.titleContainerElement.appendChild(titleInput)
            titleInput.focus()

            let saveTitleChange = (evt) => {
                this.name = evt.target.value
                this.titleContainerElement.innerHTML = ""
                this.titleContainerElement.appendChild(this.titleElement)
                this.titleElement.innerHTML = this.name
            }

            titleInput.onchange = saveTitleChange
            titleInput.onblur = saveTitleChange
        }
    }

    _setupTableControls () {
        let firstRow = this.tbodyElement.insertRow()
        let rootCell = firstRow.insertCell()
        rootCell.classList.add('mm-label-cell')
        rootCell.innerHTML = "Functional Requirements"
        rootCell.width = this.cellWidth

        this.dsLabelCell = firstRow.insertCell()
        this.dsLabelCell.innerHTML = "Design solutions"
        this.dsLabelCell.align = "center"
        this.dsLabelCell.classList.add('mm-label-cell')
        this.dsLabelCell.colSpan = 1
        this.dsLabelCell.width = this.cellWidth

        let secondRow = this.tbodyElement.insertRow()
        let addRowCell = secondRow.insertCell()
        addRowCell.innerHTML = '<i style="font-weight: bold;" class="far fa-plus-square"></i> FR'
        addRowCell.align = "center"
        addRowCell.style.fontSize = "1rem"
        addRowCell.classList.add('mm-add-cell')
        addRowCell.width = this.cellWidth
        addRowCell.height = this.cellHeight
        addRowCell.onclick = () => {
            this.addFunctionalRequirement ()
        }
    }

    _createCellForm (cellElement, placeholder, styleClass, onChangeCallback) {
        let cellForm = document.createElement('textarea')
        cellForm.placeholder = placeholder
        cellForm.classList.add('cell-form')
        if (styleClass) cellForm.classList.add(styleClass)
        cellForm.rows = 2
        cellForm.maxLength = 40
        cellForm.wrap = "soft"
        cellForm.onkeypress = (evt) => {
            if (evt.keyCode === 13) {
                // If user presses enter
                cellForm.blur()
                return false
            } 
        }
        cellForm.onchange = (evt) => {
            if (onChangeCallback) onChangeCallback(evt.target.value)
        }

        cellElement.appendChild(cellForm)
        cellForm.focus()
    }

    addFunctionalRequirement () {
        // Parameters
        let rowID = "fr-"+random.randomString(8)

        let position = this.tableElement.rows.length - 1

        // Create model representation
        let fr = new FunctionalRequirement(rowID, position)

        let newRow = this.tbodyElement.insertRow(position)
        newRow.id = rowID

        // Store row -> requirement connection
        this.rowToRequirementMap[newRow.id] = fr

        let newCell = newRow.insertCell()
        newCell.width = this.cellWidth
        newCell.height = this.cellHeight
        
        this._createCellForm(newCell, `Functional Requirement ${position}`, 'func-req', (value) => {
            fr.description = value
            console.log(fr)
        })

        let newAddCell = newRow.insertCell()
        newAddCell.innerHTML = '<i style="font-weight: bold;" class="far fa-plus-square"></i> DS'
        newAddCell.style.fontSize = "1rem"
        newAddCell.align = "center"
        newAddCell.width = this.cellWidth
        newAddCell.height = this.cellHeight
        newAddCell.classList.add('mm-add-cell')
        newAddCell.onclick = () => {
            this.addDesignSolution(position)
        }
    }

    /**
     * Add a new DS to the morph matrix
     * @param {Number} rowPosition To which row the design solution should be added
     */
    addDesignSolution (rowPosition) {
        let row = this.tableElement.rows[rowPosition]
        let cellPosition = row.cells.length - 1     // Cell position. 0th position is the FR.

        let dsID = "ds-"+random.randomString(8)
        let ds = new DesignSolution(dsID, cellPosition, row.id)
        this.rowToRequirementMap[row.id].designSolutions.push(ds)

        let newCell = row.insertCell(cellPosition)
        newCell.id = dsID
        newCell.width = this.cellWidth
        newCell.height = this.cellHeight
        newCell.verticalAlign = "top"

        // Map ID for easy object lookup
        this.cellToDesignSolutionMap[dsID] = ds

        // Create form in which a description can be written
        this._createCellForm(newCell, `Design Solution ${cellPosition}`, null, (value) => {
            ds.description = value
            console.log(ds)
        })

        // Create initially empty image field
        let imgElement = document.createElement('img')
        imgElement.id = 'img-'+dsID
        newCell.appendChild(imgElement)
        
        if (this.dsLabelCell.colSpan < row.cells.length - 2) {
            this.dsLabelCell.colSpan = row.cells.length - 2
        }

        let overlay = null

        // Setup hover functionality
        newCell.onmouseover = (evt) => {
            if (overlay) return
            overlay = document.createElement('div')
            overlay.classList.add('hover-overlay')
            overlay.innerHTML = '<i class="fas fa-camera"></i>'
            newCell.appendChild(overlay)

            overlay.onclick = () => {
                GlobalObserver.emit('open-file-dialog', {targetElement: dsID})
            }
        }
        newCell.onmouseleave = (evt) => {
            newCell.removeChild(overlay)
            overlay = null
        }
    }

    import(json) {
        JSON.parse(json)
    }

    /**
     * Returns serialized object
     */
    export() {
        return JSON.stringify(this)
    }
}


module.exports = MorphMatrix
