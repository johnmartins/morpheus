'use strict'

class MorphMatrix {
    // Important layout vars
    containerID = null
    containerElement = null
    tableElement = null
    tbodyElement = null
    dsLabelCell = null

    // User defined vars
    frCount = 0

    constructor(containerID) {
        this.containerElement = document.getElementById(containerID)
        this.containerID = containerID

        if (!this.containerElement) throw new Error('Failed to find matrix container')
    
        // Create table
        this.tableElement = document.createElement('table')
        this.tbodyElement = document.createElement('tbody')
        this.tableElement.appendChild(this.tbodyElement)
        this.containerElement.appendChild(this.tableElement)

        this.setupTableControls()
    }

    setupTableControls () {
        let firstRow = this.tbodyElement.insertRow()
        let rootCell = firstRow.insertCell()
        rootCell.classList.add('mm-label-cell')
        rootCell.innerHTML = "Functional Requirements"

        this.dsLabelCell = firstRow.insertCell()
        this.dsLabelCell.innerHTML = "Design solutions"
        this.dsLabelCell.align = "center"
        this.dsLabelCell.classList.add('mm-label-cell')
        this.dsLabelCell.colSpan = 1

        let secondRow = this.tbodyElement.insertRow()
        let addRowCell = secondRow.insertCell()
        addRowCell.innerHTML = "Add FR"
        addRowCell.classList.add('mm-add-cell')
        addRowCell.onclick = () => {
            this.addFunctionalRequirement ()
        }
    }

    addFunctionalRequirement () {
        this.frCount += 1
        let position = this.tableElement.rows.length - 1
        let newRow = this.tbodyElement.insertRow(position)
        let newCell = newRow.insertCell()
        newCell.innerHTML = `FR ${position}`

        let newAddCell = newRow.insertCell()
        newAddCell.innerHTML = 'Add DS'
        newAddCell.classList.add('mm-add-cell')
        newAddCell.onclick = () => {
            this.addDesignSolution(position)
        }

        console.log("ADD FR")
    }

    addDesignSolution (position) {
        let row = this.tableElement.rows[position]
        let cellPosition = row.cells.length - 1

        let newCell = row.insertCell(cellPosition)
        newCell.innerHTML = `DS ${cellPosition}`
        
        if (this.dsLabelCell.colSpan < row.cells.length - 2) {
            this.dsLabelCell.colSpan = row.cells.length - 2
        }
        
        console.log("ADD DS")
    }
}

module.exports = MorphMatrix
