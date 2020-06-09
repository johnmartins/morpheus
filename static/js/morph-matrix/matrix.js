'use strict'

const state = require('./../state')
const random = require('./../utils/random')
const storageService = require('./../services/storage-service')

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

class Solution {
    id = null
    name = "Untitled solution"
    frToDsMap = {} // Maps a FR ID to a DS ID (string->string)
    color = null

    constructor () {
        this.id = 'sol-'+random.randomString(12)
        let randint = random.randomInt(0,360)
        this.color = `hsl(${randint},80%,60%)`
    }
}

class MorphMatrix {

    // Object representation of matrix information
    name = "Untitled Morphological Matrix"
    functionalRequirements = []
    solutions = {}

    rowToRequirementMap = {}
    cellToDesignSolutionMap = {}

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
    }

    _waitForFileDialogResult () {
        GlobalObserver.once('file-dialog-result', (res) => {
            if (res.data.type !== 'attach-img') return
            if (!res.data.targetElement) throw new Error('No target element')

            let ds = this.cellToDesignSolutionMap[res.data.targetElement]

            if (!ds) {
                console.error('Target element no longer exists')
                return
            }

            ds.image = res.fileName
            this._addImage('img-'+res.data.targetElement, ds.image)
        })
    }

    _addImage (element, fileName) {
        let img = document.getElementById(element)
        img.src = storageService.getTmpStorageDirectory() + fileName
        img.width = 140
        img.height = 140
    }
    
    _setupTitleElement () {
        this.titleContainerElement = document.createElement('div')
        this.titleElement = document.createElement('h3')
        this.titleElement.classList.add('matrix-title')
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
            titleInput.classList.add('title-form')
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

        this.dsLabelCell = firstRow.insertCell()
        this.dsLabelCell.innerHTML = "Design solutions"
        this.dsLabelCell.align = "center"
        this.dsLabelCell.classList.add('mm-label-cell')
        this.dsLabelCell.colSpan = 1

        let secondRow = this.tbodyElement.insertRow()
        let addRowCell = secondRow.insertCell()
        addRowCell.innerHTML = '<i style="font-weight: bold;" class="far fa-plus-square"></i> FR'
        addRowCell.align = "center"
        addRowCell.style.fontSize = "1rem"
        addRowCell.classList.add('mm-add-cell')
        addRowCell.onclick = () => {
            this.addFunctionalRequirement ()
        }
    }

    _createCellForm (cellElement, placeholder, { defaultValue = null, styleClass = null, onChangeCallback = null } = {}) {
        let cellForm = document.createElement('textarea')
        cellForm.value = defaultValue
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

    /**
     * Get overlay layout for default selection mode
     * @param {*} overlay 
     * @param {*} frCellID 
     * @param {*} frRowID 
     * @param {*} fr 
     */
    _getFRCellDefaultOverlay (overlay, frCellID, frRowID, fr) {

        overlay.classList.add('hover-overlay-icons')
        // Overlay icons
        let moveUpOverlay = document.createElement('i')
        moveUpOverlay.classList.add('fas', 'fa-chevron-up', 'overlay-icon')
        moveUpOverlay.style.marginRight = "4px"

        let moveDownOverlay = document.createElement('i')
        moveDownOverlay.classList.add('fas', 'fa-chevron-down', 'overlay-icon')
        moveDownOverlay.style.marginRight = "4px"

        let deleteOverlay = document.createElement('i')
        deleteOverlay.classList.add('fas', 'fa-trash-alt', 'overlay-icon')

        if (fr.position > 1) overlay.appendChild(moveUpOverlay)
        if (fr.position < this.functionalRequirements.length) overlay.appendChild(moveDownOverlay)
        overlay.appendChild(deleteOverlay)

        moveUpOverlay.onclick = (evt) => {
            let otherRowID = 'row-'+this.functionalRequirements[fr.position - 2].id
            this.switchRowPosition(otherRowID, frRowID)
        }
        
        moveDownOverlay.onclick = (evt) => {
            let otherRowID = 'row-'+this.functionalRequirements[fr.position].id
            this.switchRowPosition(frRowID, otherRowID)
        }

        deleteOverlay.onclick = (evt) => {
            this.deleteFunctionalRequirement(frCellID)
        }
        return overlay
    }
    
    _createFRCellOverlay (frCell) {
        let overlay = null
        let frCellID = frCell.id
        let frRowID = 'row-'+frCellID
        let fr = this.rowToRequirementMap[frRowID]
        
        frCell.onmouseover = (evt) => {
            if (overlay) return
            overlay = document.createElement('div')
            overlay = this._getFRCellDefaultOverlay(overlay, frCellID, frRowID, fr)
            frCell.appendChild(overlay)
        }

        frCell.onmouseleave = (evt) => {
            frCell.removeChild(overlay)
            overlay = null
        }
    }

    _getDSCellSolutionOverlay (overlay, dsID, ds) {
        overlay.classList.add('hover-overlay-cover')
        // box-shadow: inset 0 0 12px white;
        let solution = this.solutions[state.workspaceSelectedSolution]
        overlay.style.boxShadow = `inset 0 0 12px ${solution.color}`
        overlay.onclick = () => {
            this.setSolutionDS(ds)
        }

        return overlay
    }

    _getDSCellDefaultOverlay (overlay, dsID, ds) {
        overlay.classList.add('hover-overlay-icons')

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
                 this._waitForFileDialogResult()
                 GlobalObserver.emit('open-file-dialog', {
                     type: 'attach-img', 
                     copyToTmp: true,
                     targetElement: dsID,
                     filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif']}]
                 })
             } else {
                 storageService.removeFileFromTmp(ds.image, (err) => {
                     if (err) {
                         console.log('Image was not properly deleted from tmp storage')
                         // continue anyway?
                     }
                     let imgElement = document.getElementById('img-'+dsID)
                     imgElement.height = 0
                     ds.image = null
                 })
             }
         }

         deleteOverlay.onclick = () => {
             this.deleteDesignSolution(dsID)
         }

        return overlay
    }


    _createDSCellOverlay (dsCell) {
        let overlay = null
        let dsID = dsCell.id
        let ds = this.cellToDesignSolutionMap[dsID]

        // Setup hover functionality
        dsCell.onmouseover = (evt) => {
            if (overlay) return
            overlay = document.createElement('div')

            // -------------------------
            if (state.workspaceInteractionMode === state.constants.WORKSPACE_INTERACTION_MODE_DEFAULT) {
                overlay = this._getDSCellDefaultOverlay(overlay, dsID, ds)
            } else if (state.workspaceInteractionMode === state.constants.WORKSPACE_INTERACTION_MODE_SOLUTION) {
                overlay = this._getDSCellSolutionOverlay(overlay, dsID, ds)
            }

            dsCell.appendChild(overlay)
        }
        dsCell.onmouseleave = (evt) => {
            dsCell.removeChild(overlay)
            overlay = null
        }
    }

    clearSolutionRender() {
        let solutionRenderOverlays = document.querySelectorAll('.solution-render')
        for (let i = 0; i < solutionRenderOverlays.length; i++) {
            let overlay = solutionRenderOverlays[i]
            overlay.parentElement.removeChild(overlay)
        }
    }

    renderSolution(solutionID) {
        let solution = this.solutions[solutionID]
        let frIDs = Object.keys(solution.frToDsMap)
        for (let i = 0; i < frIDs.length; i++) {
            let frID = frIDs[i]
            let dsID = solution.frToDsMap[frID]

            // Create overlay for selected design solution
            let overlay = document.createElement('div')
            overlay.classList.add('hover-overlay-cover', 'solution-render')
            overlay.style.boxShadow = `inset 0 0 40px ${solution.color}`

            let dsCell = document.getElementById(dsID)
            dsCell.appendChild(overlay)
        }
    }

    setSolutionDS(ds) {
        let currentSolutionID = state.workspaceSelectedSolution
        let solution = this.solutions[currentSolutionID]
        if (!solution) throw new Error('No such solution')

        solution.frToDsMap[ds.frID] = ds.id
        
        this.clearSolutionRender()
        this.renderSolution(currentSolutionID)
    }

    addSolution(solution) {
        this.solutions[solution.id] = solution
    }

    getSolution(solutionID) {
        return this.solutions[solutionID]
    }

    switchRowPosition(rowID1, rowID2) {
        let fr1 = this.rowToRequirementMap[rowID1]
        let fr2 = this.rowToRequirementMap[rowID2]

        // Change fr.position attribute
        let pos1 = fr1.position
        let pos2 = fr2.position
        fr1.position = pos2
        fr2.position = pos1

        // Switch position in this.functionalRequirements array
        this.functionalRequirements[pos1 - 1] = fr2
        this.functionalRequirements[pos2 - 1] = fr1

        // Switch position in DOM
        this.tbodyElement.insertBefore(document.getElementById(rowID2), document.getElementById(rowID1))
    }

    deleteFunctionalRequirement (frID) {
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

    addFunctionalRequirement ({id = null, description = null} = {}) {
        // Parameters
        let cellID = id ? id : "fr-"+random.randomString(8)
        let rowID = "row-"+cellID

        let position = this.tableElement.rows.length - 1

        // Create model representation
        let fr = new FunctionalRequirement(cellID, position)
        fr.description = description
        this.functionalRequirements.push(fr)

        let newRow = this.tbodyElement.insertRow(position)
        newRow.id = rowID

        // Store row -> requirement connection
        this.rowToRequirementMap[newRow.id] = fr

        let newCell = newRow.insertCell()
        newCell.id = cellID
        
        this._createCellForm(newCell, `Functional Requirement ${position}`, {
            onChangeCallback: (value) => fr.description = value,
            defaultValue: description,
            styleClass: 'func-req'
        } )

        this._createFRCellOverlay(newCell)

        // Create a new "Add DS"-cell on this row
        let newAddCell = newRow.insertCell()
        newAddCell.innerHTML = '<i style="font-weight: bold;" class="far fa-plus-square"></i> DS'
        newAddCell.style.fontSize = "1rem"
        newAddCell.align = "center"
        newAddCell.classList.add('mm-add-cell')
        newAddCell.onclick = () => {
            this.addDesignSolution(rowID)
        }
    }

    /**
     * Add a new DS to the morph matrix
     * @param {Number} rowPosition To which row the design solution should be added
     */
    addDesignSolution (rowID, { id = null, description = null, image = null } = {}) {
        let row = document.getElementById(rowID)
        let cellPosition = row.cells.length - 1     // Cell position. 0th position is the FR.

        let dsID = id ? id : "ds-"+random.randomString(8)
        let ds = new DesignSolution(dsID, cellPosition, row.id)
        ds.description = description
        ds.image = image

        this.rowToRequirementMap[row.id].designSolutions.push(ds)

        let newCell = row.insertCell(cellPosition)
        newCell.id = dsID
        newCell.verticalAlign = "top"

        // Map ID for easy object lookup
        this.cellToDesignSolutionMap[dsID] = ds

        // Create form in which a description can be written
        this._createCellForm(newCell, `Design Solution ${cellPosition}`, {
            onChangeCallback: (value) => ds.description = value,
            defaultValue: description,
        })
        // If the user clicks anywhere within the cell, then set focus to the textarea.
        newCell.onclick = (evt) => {
            let cellform = newCell.querySelector('textarea')
            if (state.workspaceInteractionMode !== state.constants.WORKSPACE_INTERACTION_MODE_DEFAULT) return
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

        if (image) this._addImage(imgElement.id, image)
    }

    import(save) {
        // Rebuild matrix from json dump
        console.log(`Imported ${save.name}`)
        this.name = save.name
        this.titleElement.innerHTML = this.name
        
        for (let frN = 0; frN < save.functionalRequirements.length; frN++) {
            let savedFr = save.functionalRequirements[frN]
            this.addFunctionalRequirement({
                id: savedFr.id,
                description: savedFr.description
            })
            for (let dsN = 0; dsN < savedFr.designSolutions.length; dsN++) {
                let savedDs = savedFr.designSolutions[dsN]
                this.addDesignSolution('row-'+savedFr.id, {
                    id: savedDs.id,
                    description: savedDs.description,
                    image: savedDs.image
                })
            }
        }
    }

    /**
     * Returns serialized object
     */
    export() {
        // Grab images and pack them
        return JSON.stringify(this)
    }
}

module.exports = {
    MorphMatrix: MorphMatrix, 
    FunctionalRequirement: FunctionalRequirement, 
    DesignSolution: DesignSolution,
    Solution: Solution
}
