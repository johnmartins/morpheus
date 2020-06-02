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
            titleInput.spellcheck = false
            titleInput.value = this.name
            titleInput.maxLength = 50
            titleInput.classList.add('text-form')
            this.titleContainerElement.appendChild(titleInput)
            titleInput.focus()

            let saveTitleChange = (evt) => {
                // Ensure that the new name is more than whitespace
                let value = evt.target.value
                if (/\S/.test(value)) {
                    this.name = value
                }
                
                this.titleContainerElement.innerHTML = ""
                this.titleContainerElement.appendChild(this.titleElement)
                this.titleElement.innerHTML = this.name
            }

            titleInput.onchange = saveTitleChange
            titleInput.onblur = saveTitleChange
            titleInput.onkeypress = (evt) => {
                // User pressed enter
                if (evt.keyCode === 13) {
                    saveTitleChange(evt)
                }
            }
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
        cellForm.spellcheck = false
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

    _createFRCellOverlay (frCell) {
        let overlay = null
        let frID = frCell.id
        let fr = this.rowToRequirementMap['row-'+frID]
        
        frCell.onmouseover = (evt) => {
            if (overlay) return
            overlay = document.createElement('div')
            overlay.classList.add('hover-overlay')

            // Add delete icon
            let deleteOverlay = document.createElement('i')
            deleteOverlay.classList.add('fas', 'fa-trash-alt', 'overlay-icon')

            overlay.appendChild(deleteOverlay)

            deleteOverlay.onclick = (evt) => {
                this.deleteFunctionalRequirement(frID)
            }

            frCell.appendChild(overlay)
        }

        frCell.onmouseleave = (evt) => {
            frCell.removeChild(overlay)
            overlay = null
        }
    }

    _createDSCellOverlay (dsCell) {
        let overlay = null
        let dsID = dsCell.id
        let ds = this.cellToDesignSolutionMap[dsID]

        // Setup hover functionality
        dsCell.onmouseover = (evt) => {
            if (overlay) return
            overlay = document.createElement('div')
            overlay.classList.add('hover-overlay')

            // Add image icon
            let imgOverlay = document.createElement('span')
            imgOverlay.style.fontSize = '0.8rem'
            imgOverlay.classList.add('fa-stack', 'fa-1x', 'overlay-icon')
            
            let imgOverlayLayer1 = document.createElement('i')
            imgOverlayLayer1.classList.add('fas', 'fa-camera', 'fa-stack-1x')
            let imgOverlayLayer2 = document.createElement('i')
            imgOverlayLayer2.classList.add('fas', 'fa-ban', 'fa-stack-2x', 'text-red')

            imgOverlay.appendChild(imgOverlayLayer1)
            imgOverlay.appendChild(imgOverlayLayer2)

            // If this cell has no image, hide red cross icon
            if (!ds.image){
                imgOverlayLayer2.style.color = 'transparent'
                imgOverlayLayer1.style.fontSize = '1rem'
            } 

            // Remove cell icon
            let deleteOverlay = document.createElement('i')
            deleteOverlay.classList.add('fas', 'fa-trash-alt', 'overlay-icon')
            
            overlay.appendChild(imgOverlay)
            overlay.appendChild(deleteOverlay)

            imgOverlay.onclick = () => {
                if (!ds.image){
                    GlobalObserver.emit('open-file-dialog', {targetElement: dsID})
                } else {
                    let imgElement = document.getElementById('img-'+dsID)
                    imgElement.height = 0
                    ds.image = null
                }
            }

            deleteOverlay.onclick = () => {
                this.deleteDesignSolution(dsID)
            }

            dsCell.appendChild(overlay)
        }
        dsCell.onmouseleave = (evt) => {
            dsCell.removeChild(overlay)
            overlay = null
        }
    }

    deleteFunctionalRequirement (frID) {
        console.log("delete FR "+frID)
        let frRowID = 'row-'+frID
        let fr = this.rowToRequirementMap[frRowID]

        // Delete design solutions existing for this FR
        for (let i = fr.designSolutions.length-1; i >= 0; i--) {
            this.deleteDesignSolution(fr.designSolutions[i].id)
        }

        // Delete FR object
        let deleteIndex = -1
        for (let i = 0; i < this.functionalRequirements.length; i++) {
            let selectedFr = this.functionalRequirements[i]
            console.log(this.functionalRequirements[i].id)
            if (this.functionalRequirements[i].id === frID) {
                deleteIndex = i
            }
            if (deleteIndex !== -1) {
                selectedFr.position -= 1
            }
        }
        if (deleteIndex === -1) throw new Error('Failed to delete FR.')
        this.functionalRequirements.splice(deleteIndex, 1)

        // Delete DOM element
        let frRow = document.getElementById(frRowID)
        let frCell = document.getElementById(frID)
        frRow.removeChild(frCell)
        this.tbodyElement.removeChild(frRow)

        // Delete map reference
        delete this.rowToRequirementMap[frRowID]
    }

    deleteDesignSolution (dsID) {
        console.log("delete DS "+dsID)
        let ds = this.cellToDesignSolutionMap[dsID]
        let frID = ds.frID
        let fr = this.rowToRequirementMap[frID]

        // Delete reference from functional requirement
        let deleteIndex = -1
        for (let i = 0; i < fr.designSolutions.length; i++) {
            let selectedDS = fr.designSolutions[i]
            if (ds.id === selectedDS.id) {
                deleteIndex = i
            }
            if (deleteIndex !== -1) {
                ds.position -= 1
            }
        }
        if (deleteIndex === -1) throw new Error('Failed to delete DS.')
        fr.designSolutions.splice(deleteIndex, 1)

        // Delete DOM element
        let dsElement = document.getElementById(dsID)
        let frRow = document.getElementById(frID)
        frRow.removeChild(dsElement)

        // TODO: Fix other DS elements?
        // Delete map reference
        delete this.cellToDesignSolutionMap[dsID]
    }

    addFunctionalRequirement () {
        // Parameters
        let cellID = "fr-"+random.randomString(8)
        let rowID = "row-"+cellID

        let position = this.tableElement.rows.length - 1

        // Create model representation
        let fr = new FunctionalRequirement(cellID, position)
        this.functionalRequirements.push(fr)

        let newRow = this.tbodyElement.insertRow(position)
        newRow.id = rowID

        // Store row -> requirement connection
        this.rowToRequirementMap[newRow.id] = fr

        let newCell = newRow.insertCell()
        newCell.id = cellID
        newCell.width = this.cellWidth
        newCell.height = this.cellHeight
        
        this._createCellForm(newCell, `Functional Requirement ${position}`, 'func-req', (value) => {
            fr.description = value
            console.log(fr)
        })

        this._createFRCellOverlay(newCell)

        // Create a new "Add DS"-cell on this row
        let newAddCell = newRow.insertCell()
        newAddCell.innerHTML = '<i style="font-weight: bold;" class="far fa-plus-square"></i> DS'
        newAddCell.style.fontSize = "1rem"
        newAddCell.align = "center"
        newAddCell.width = this.cellWidth
        newAddCell.height = this.cellHeight
        newAddCell.classList.add('mm-add-cell')
        newAddCell.onclick = () => {
            this.addDesignSolution(rowID)
        }

    }

    /**
     * Add a new DS to the morph matrix
     * @param {Number} rowPosition To which row the design solution should be added
     */
    addDesignSolution (rowID) {
        let row = document.getElementById(rowID)
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
        // If the user clicks anywhere within the cell, then set focus to the textarea.
        newCell.onclick = (evt) => {
            let cellform = newCell.querySelector('textarea')
            if (cellform) cellform.focus()
        }

        // Create initially empty image field
        let imgElement = document.createElement('img')
        imgElement.id = 'img-'+dsID
        newCell.appendChild(imgElement)
        
        if (this.dsLabelCell.colSpan < row.cells.length - 2) {
            this.dsLabelCell.colSpan = row.cells.length - 2
        }

        this._createDSCellOverlay(newCell)
    }

    import(json) {
        let saveObject = JSON.parse(json)
        console.log(saveObject)
    }

    /**
     * Returns serialized object
     */
    export() {
        return JSON.stringify(this)
    }
}


module.exports = MorphMatrix
