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
    fr = null

    constructor(id, position) {
        this.id = id
        this.position = position
    }
}

class MorphMatrix {

    // Object representation of matrix information
    name = "Unnamed Morph Matrix"
    functionalRequirements = []
    solutions = []

    rowToRequirementMap = {}

    // Parameters
    cellWidth = "150px"

    // Important layout vars
    containerID = null
    containerElement = null
    tableElement = null
    tbodyElement = null
    dsLabelCell = null

    constructor(containerID) {
        this.containerElement = document.getElementById(containerID)
        this.containerID = containerID

        if (!this.containerElement) throw new Error('Failed to find matrix container')
    
        // Create table
        this.tableElement = document.createElement('table')
        this.tbodyElement = document.createElement('tbody')
        this.tableElement.appendChild(this.tbodyElement)
        this.containerElement.appendChild(this.tableElement)

        this._setupTableControls()
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
        
        this._createCellForm(newCell, `Functional Requirement ${position}`, 'func-req', (value) => {
            fr.description = value
            console.log(fr)
        })

        let newAddCell = newRow.insertCell()
        newAddCell.innerHTML = '<i style="font-weight: bold;" class="far fa-plus-square"></i> DS'
        newAddCell.style.fontSize = "1rem"
        newAddCell.align = "center"
        newAddCell.width = this.cellWidth
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
        let ds = new DesignSolution(dsID, cellPosition)
        ds.fr = this.rowToRequirementMap[row.id]

        let newCell = row.insertCell(cellPosition)
        newCell.width = this.cellWidth

        this._createCellForm(newCell, `Design Solution ${cellPosition}`, null, (value) => {
            ds.description = value
            console.log(ds)
        })
        
        if (this.dsLabelCell.colSpan < row.cells.length - 2) {
            this.dsLabelCell.colSpan = row.cells.length - 2
        }
    }


}


module.exports = MorphMatrix
