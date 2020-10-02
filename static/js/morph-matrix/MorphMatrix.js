'use strict'

/**
 * This file contains the four most important data structures to this software. Namely,
 * the 4 things that make up a morph matrix: The matrix itself, the requirements (FRs), 
 * the design solutions (DSs), and of course the solutions (or "concepts").
 * @author Julian Martinsson
 */

const state = require('../state')
const random = require('../utils/random')
const {SolutionExistsError} = require('./../errors')
const storageService = require('../services/storage-service')
const fileDiagService = require('../services/file-dialog-service')

// Morph Matrix classes
const FunctionalRequirement = require('./FunctionalRequirement')
const DesignSolution = require('./DesignSolution')
const Solution = require('./Solution')
const Incompatibility = require('./Incompatibility')

// Supporting classes
const MatrixCanvasOverlay = require('./MatrixCanvasOverlay')
const SolutionGenerator = require('./SolutionGenerator')

/**
 * A morphological matrix structure. Contains Functional Requirements, 
 * Design Solutions and Solutions. After instanciation it is possible to import
 * a previously stored JSON structure using MorphMatrix.import(json). 
 * You can also export the JSON structure using MorphMatrix.export().
 */
class MorphMatrix {

    // Object representation of matrix information
    name = "Untitled Morphological Matrix"
    functionalRequirements = []
    solutions = {}          // Solution ID -> Solution
    solutionStringSet = new Set() // Used to ensure solution uniqueness

    frMap = {}              // FunctionalRequirement ID -> FunctionalRequirement
    dsMap = {}              // DesignSolution ID -> DesignSolution
    incompatibilityMap = {} // Incompatibility ID -> Incompatibility

    // Important layout vars
    containerID = null
    containerElement = null
    titleContainerElement = null
    titleElement = null
    tableElement = null
    tbodyElement = null
    dsLabelCell = null
    canvasOverlay = new MatrixCanvasOverlay()

    constructor(containerID) {
        this.containerElement = document.getElementById(containerID)
        this.containerID = containerID
        
        if (!this.containerElement) throw new Error('Failed to find matrix container')
        
        // Create title
        this._setupTitleElement()

        // Create table
        this.tableElement = document.createElement('table')
        this.tableElement.style.position = 'relative'
        this.tbodyElement = document.createElement('tbody')
        this.tableElement.appendChild(this.tbodyElement)
        this.containerElement.appendChild(this.tableElement)

        this._setupTableControls()

        GlobalObserver.emit('matrix-created', this)
    }

    _handleFileDialogResult (res) {
        if (!res) return
        if (res.data.type !== 'attach-img') return
        if (!res.data.targetElement) throw new Error('No target element')

        let ds = this.dsMap[res.data.targetElement]

        if (!ds) {
            console.error('Target element no longer exists')
            return
        }

        ds.image = res.fileName
        this._addImage('img-'+res.data.targetElement, ds.image)
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
                if (evt.code === 'Enter') {
                    saveTitleChange(evt)
                }
            }
        }
    }

    _setupTableControls () {
        let firstRow = this.tbodyElement.insertRow()
        let rootCell = firstRow.insertCell()
        rootCell.classList.add('mm-label-cell')
        rootCell.innerHTML = "Sub-Functions"

        this.dsLabelCell = firstRow.insertCell()
        this.dsLabelCell.innerHTML = "Sub-Solutions"
        this.dsLabelCell.align = "center"
        this.dsLabelCell.classList.add('mm-label-cell')
        this.dsLabelCell.colSpan = 1

        let secondRow = this.tbodyElement.insertRow()
        let addRowCell = secondRow.insertCell()
        addRowCell.innerHTML = '<i style="font-weight: bold;" class="far fa-plus-square"></i> SF'
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
        cellForm.maxLength = 80
        cellForm.wrap = "soft"

        cellForm.style.marginBottom = '4px'

        // Method for automatically adjusting the height of the form
        const adjustRows = function (startRows) {
            cellForm.rows = startRows
            if (cellForm.scrollHeight > cellForm.clientHeight) {
                adjustRows(startRows + 1)
            }
        }

        cellForm.onkeypress = (evt) => {
            if (evt.code === 'Enter') {
                // If user presses enter
                cellForm.blur()
                return false
            } 
        }
        cellForm.onkeyup = (evt) => {
            // Adjust rows temporarily
            if (cellForm.scrollHeight > cellForm.clientHeight) {
                cellForm.rows += 1
            }
        }
        cellForm.onchange = (evt) => {
            if (onChangeCallback) onChangeCallback(evt.target.value)
            // When the user is done editing, set appropriate row height
            adjustRows(2)   // Start adjusting rows. 2 rows minimum.
        }

        cellElement.appendChild(cellForm)

        // If the textarea already has a default value then the text area needs
        // to be adjusted to fit that default value.
        if (defaultValue) {
            adjustRows(2)
        }

        cellForm.focus()
    }

    /**
     * Get overlay layout for default selection mode
     * @param {*} overlay 
     * @param {*} frCellID 
     * @param {*} frRowID 
     * @param {*} fr 
     */
    _getFRCellDefaultOverlay (overlay, fr) {

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
            let otherID = this.functionalRequirements[fr.position - 2].id
            this.switchRowPosition(otherID, fr.id)
        }
        
        moveDownOverlay.onclick = (evt) => {
            let otherID = this.functionalRequirements[fr.position].id
            this.switchRowPosition(fr.id, otherID)
        }

        deleteOverlay.onclick = (evt) => {
            this.deleteFunctionalRequirement(fr.id)
        }
        return overlay
    }
    
    _createFRCellOverlay (fr, frCell) {
        let overlay = null
        let frCellID = frCell.id
        let frRowID = fr.rowID
        
        frCell.onmouseover = (evt) => {
            if (overlay) return
            overlay = document.createElement('div')
            
            if (state.equalsWim(state.wim.default)) {
                overlay = this._getFRCellDefaultOverlay(overlay, fr)
            } else {
                overlay = null
            }

            if (!overlay) return // Skip of no relevant overlay

            frCell.appendChild(overlay)
        }

        frCell.onmouseleave = (evt) => {
            if (!overlay) return
            frCell.removeChild(overlay)
            overlay = null
        }
    }

    _getDSCellSolutionOverlay (overlay, dsID, ds) {
        overlay.classList.add('hover-overlay-cover')
        let solution = this.solutions[state.workspaceSelectedSolution]
        overlay.style.boxShadow = `inset 0 0 14px ${solution.color}`
        overlay.style.border = `1px solid ${solution.color}`
        overlay.onclick = () => {
            this.toggleSolutionDS(ds)
        }

        return overlay
    }

    _getDSCellDisableOverlay (overlay, dsID, ds) {
        if (ds.disabled === true) return null
        overlay.classList.add('hover-overlay-disabled')
        overlay.innerHTML = '<i class="fas fa-ban"></i>'

        overlay.onclick = () => {
            this.setDsDisabled(dsID, true)
        }

        return overlay
    }

    _getDSCellIncompatibleOverlay (overlay, dsID, ds) {
        if (state.workspaceSelectedIncompatibleOrigin === ds.id) {
            // If this is the selected origin of an incompatibility 
            // then dont create a new hover overlay
            return
        }

        overlay.classList.add('hover-overlay-incompatible')
        overlay.innerHTML = '<i class="fas fa-times"></i>'
        overlay.onclick = () => {
            GlobalObserver.emit('incompatibility-selection', ds)
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
                 
                 fileDiagService.newOpenFileDialog({
                    type: 'attach-img', 
                    copyToTmp: true,
                    targetElement: dsID,
                    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif']}]
                }).then((res) => {
                    this._handleFileDialogResult(res)
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
        let ds = this.dsMap[dsID]

        // Setup hover functionality
        dsCell.onmouseover = (evt) => {
            if (overlay) return
            overlay = document.createElement('div')

            if (state.equalsWim(state.wim.default)) {
                overlay = this._getDSCellDefaultOverlay(overlay, dsID, ds)
            } else if (state.equalsWim(state.wim.solution)) {
                overlay = this._getDSCellSolutionOverlay(overlay, dsID, ds)
            } else if (state.equalsWim(state.wim.disable)) {
                overlay = this._getDSCellDisableOverlay(overlay, dsID, ds)
            } else if (state.equalsWim(state.wim.incompatibility)) {
                overlay = this._getDSCellIncompatibleOverlay(overlay, dsID, ds)
            } else {
                overlay = null
            }

            if (!overlay) return        // No overlay? Screw it.
            dsCell.appendChild(overlay)
        }
        dsCell.onmouseleave = (evt) => {
            if (!overlay) return
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
        this.canvasOverlay.clear()
    }

    renderSolution(solutionID) {
        if (!this.canvasOverlay.isCreated()) {
            this.canvasOverlay.create(this.tableElement, 'solution')
        }

        let solution = this.solutions[solutionID]
        console.log(solution)
        let frIDs = solution.getMappedFunctionsArray()

        // Put together FR array
        let frArray = []
        for (let i = 0; i < frIDs.length; i++) {
            frArray.push(this.frMap[frIDs[i]])
        }

        frArray.sort( (a, b) => {
            if (a.position < b.position) return 1
            if (a.position > b.position) return -1
            return 0
        })

        for (let i = 0; i < frArray.length; i++) {
            let frID = frArray[i].id
            let dsID = solution.getDsForFr(frID)

            // Create overlay for selected design solution
            let overlay = document.createElement('div')
            overlay.classList.add('hover-overlay-cover', 'solution-render')
            overlay.style.boxShadow = `inset 0 0 15px ${solution.color}`
            overlay.style.border = `1px solid ${solution.color}`

            let dsCell = document.getElementById(dsID)
            dsCell.appendChild(overlay)

            if (i+1 < frArray.length) {
                const ss1 = this.dsMap[solution.getDsForFr(frArray[i].id)]
                const ss2 = this.dsMap[solution.getDsForFr(frArray[i+1].id)]
                this.canvasOverlay.createLine(ss1, ss2)
            }
        }
    }

    toggleSolutionDS(ds) {
        let currentSolutionID = state.workspaceSelectedSolution
        let solution = this.solutions[currentSolutionID]
        if (!solution) throw new Error('No such solution')
        
        let currentDsID = solution.getDsForFr(ds.frID)
        if (currentDsID === ds.id) {
            let fr = this.frMap[ds.frID]
            // toggle off
            solution.unbindFrFromDs(fr)
        } else {
            // toggle on
            const fr = this.frMap[ds.frID]
            solution.bindFrToDs(fr, ds)
        }
        
        this.clearSolutionRender()
        this.renderSolution(currentSolutionID)
        GlobalObserver.emit('solution-change', solution)
    }

    addSolution(solution) {
        try {
            this.registerSolution(solution)
            this.solutions[solution.id] = solution
        } catch (err) {
            throw err
        }    
    }

    /**
     * Ensures that a solution is unique. If it is, then it is stored in the solution set
     */
    registerSolution(solution) {
        if (solution.solutionString === null) return
        const exists = this.solutionStringSet.has(solution.solutionString)
        if (exists) {
            throw new SolutionExistsError('Solution was not added since it already exists.')
        }
        this.solutionStringSet.add(solution.solutionString)
    }

    unregisterSolution(solution) {
        this.solutionStringSet.delete(solution.solutionString)
    }

    getSolution(solutionID) {
        return this.solutions[solutionID]
    }

    removeSolution(solutionID, skipUnregister) {
        let solution = this.solutions[solutionID]
        if (skipUnregister !== true) {
            this.unregisterSolution(solution)
        }
        delete this.solutions[solutionID]
    }

    removeAllSolutions () {
        this.solutions = {}
        this.solutionStringSet = new Set()
    }

    getSolutionMap() {
        return this.solutions;
    }

    /**
     * Two adjacent SF rows switch places in the table.
     * @param {String} frID1 ID of first functional requirement
     * @param {String} frID2 ID of second functional requirement
     */
    switchRowPosition(frID1, frID2) {
        let fr1 = this.frMap[frID1]
        let fr2 = this.frMap[frID2]

        // Change fr.position attribute
        let pos1 = fr1.position
        let pos2 = fr2.position
        fr1.position = pos2
        fr2.position = pos1

        // Switch position in this.functionalRequirements array
        this.functionalRequirements[pos1 - 1] = fr2
        this.functionalRequirements[pos2 - 1] = fr1

        // Switch position in DOM
        this.tbodyElement.insertBefore(document.getElementById(fr2.rowID), document.getElementById(fr1.rowID))
        
        // IF a solution is selected, rerender it after manipulating DOM
        if (state.workspaceSelectedSolution) {
            this.clearSolutionRender()
            this.renderSolution(state.workspaceSelectedSolution)
        }
    }

    deleteFunctionalRequirement (frID) {
        let fr = this.frMap[frID]
        let frRowID = fr.rowID

        // Delete design solutions existing for this FR
        for (let i = fr.designSolutions.length-1; i >= 0; i--) {
            this.deleteDesignSolution(fr.designSolutions[i].id)
        }

        // Delete solution references
        let solutionIDs = Object.keys(this.solutions)
        for (let i = 0; i < solutionIDs.length; i++) {
            let solution = this.solutions[solutionIDs[i]]
            solution.removeFrMapping(fr, true)
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
        if (deleteIndex === -1) throw new Error('Failed to delete SF.')
        this.functionalRequirements.splice(deleteIndex, 1)

        // Delete DOM element
        let frRow = document.getElementById(frRowID)
        let frCell = document.getElementById(frID)
        frRow.removeChild(frCell)
        this.tbodyElement.removeChild(frRow)

        // Delete map reference
        delete this.frMap[frRowID]

        // The matrix changes in size. Thus, a new canvas is required.
        this.canvasOverlay.rebuildCanvas()

        // IF a solution is selected, rerender it after manipulating DOM
        if (state.workspaceSelectedSolution) {
            this.clearSolutionRender()
            this.renderSolution(state.workspaceSelectedSolution)
        }
    }

    deleteDesignSolution (dsID) {
        let ds = this.dsMap[dsID]
        let frID = ds.frID
        let fr = this.frMap[frID]

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
        if (deleteIndex === -1) throw new Error('Failed to delete SS.')
        fr.designSolutions.splice(deleteIndex, 1)

        // Delete DOM element
        let dsElement = document.getElementById(dsID)
        let frRow = document.getElementById(fr.rowID)
        frRow.removeChild(dsElement)

        // Delete map reference
        delete this.dsMap[dsID]

        // Delete solution references
        let solutionIDs = Object.keys(this.solutions)
        for (let i = 0; i < solutionIDs.length; i++) {
            let solution = this.solutions[solutionIDs[i]]
            if (solution.getDsForFr(frID) === dsID) {
                solution.unbindFrFromDs(fr)
            }
        }

        // Delete incompabilities that reference this DS
        let incompatibilityIDs = Object.keys(this.incompatibilityMap)
        for (let i = 0; i < incompatibilityIDs.length; i++) {
            let incompatibility = this.incompatibilityMap[incompatibilityIDs[i]]
            if (incompatibility.ds1.id === dsID || incompatibility.ds2.id === dsID) {
                this.removeIncompatibility(incompatibility.id)
            }
        }

        // The matrix changes in size. Thus, a new canvas is required.
        this.canvasOverlay.rebuildCanvas()

        // IF a solution is selected, rerender it after manipulating DOM
        if (state.workspaceSelectedSolution) {
            this.clearSolutionRender()
            this.renderSolution(state.workspaceSelectedSolution)
        }

        GlobalObserver.emit('ds-removed')
    }

    setDsDisabled (dsID, disabled) {
        let ds = this.dsMap[dsID]
        if (!ds) return
        if (ds.disabled === disabled) return

        ds.disabled = disabled

        // Handle overlay
        const dsCell = document.getElementById(dsID)

        if (disabled) {
            // Add overlay
            this.renderDisabledDsOverlay(dsCell)
        } else {
            // Remove overlay
            this.clearDisabledDsOverlay(dsCell)
        }

        // Update solution conflicts
        for (let solutionID in this.solutions) {
            let solution = this.solutions[solutionID]
            if (solution.getDsForFr(ds.frID) === ds.id) {
                // This solution contains the affected DS
                if (solution.evaluateDsConflict(ds.id)) {
                    solution.removeConflict(ds.id)
                } else {
                    solution.addConflict(ds.id)
                }
            }
        }

        GlobalObserver.emit('ds-availability-change', ds)
    }

    setIncompatible (ds1, ds2, {incompID = null, incompName = null} = {}) {
        try {
            let incompatibility = new Incompatibility(ds1, ds2, {
                id: incompID,
                name: incompName
            })
            this.incompatibilityMap[incompatibility.id] = incompatibility
            
            // Add conflicts to existing solutions that use both of these DS 
            for (let solutionID in this.solutions) {
                const solution = this.solutions[solutionID]
                if (solution.containsDS(ds1.id)) {
                    solution.addIncompatibility(ds1, ds2)
                }
                if (solution.containsDS(ds2.id)) {
                    solution.addIncompatibility(ds2, ds1)
                }
            }
            
            GlobalObserver.emit('ds-incompatibility-change', incompatibility.id)
        } catch (err) {
            if (err.code === 'INCOMP_EXISTS') {
                console.log('Requested incompatibility already exists')
            } else {
                throw err
            }
        }
    }

    /**
     * Removes all matrix references to specified incompatibility
     * @param {String} incompatibilityID 
     */
    removeIncompatibility (incompatibilityID) {
        let incompatibility = this.incompatibilityMap[incompatibilityID]
        if (!incompatibility) {
            console.error('Failed to delete incompatibility. No incomp with ID = '+incompatibilityID)
            return
        }
        
        let ds1 = incompatibility.ds1
        let ds2 = incompatibility.ds2
        ds1.removeIncompatibilityWith(ds2) // Implicitly mirrors action onto ds2
        delete this.incompatibilityMap[incompatibilityID]

        // Loop through solutions and remove references
        for (let solID in this.solutions) {
            let solution = this.solutions[solID]
            solution.removeIncompatibility(ds1, ds2)
        }

        GlobalObserver.emit('ds-incompatibility-change', incompatibilityID)
    }

    addFunctionalRequirement ({id = null, description = null} = {}) {
        // Parameters
        let cellID = id ? id : "fr-"+random.randomString(8)
        let rowID = "row-"+cellID

        let position = this.tableElement.rows.length - 1

        // Create model representation
        let fr = new FunctionalRequirement(cellID, rowID, position)
        fr.description = description
        fr.id = cellID
        this.functionalRequirements.push(fr)

        let newRow = this.tbodyElement.insertRow(position)
        newRow.id = rowID

        // Store row -> requirement connection
        this.frMap[fr.id] = fr

        let newCell = newRow.insertCell()
        newCell.id = cellID
        
        this._createCellForm(newCell, `Sub-Function ${position}`, {
            onChangeCallback: (value) => fr.description = value,
            defaultValue: description,
            styleClass: 'func-req'
        } )

        this._createFRCellOverlay(fr, newCell)

        // Create a new "Add DS"-cell on this row
        let newAddCell = newRow.insertCell()
        newAddCell.innerHTML = '<i style="font-weight: bold;" class="far fa-plus-square"></i> SS'
        newAddCell.style.fontSize = "1rem"
        newAddCell.align = "center"
        newAddCell.classList.add('mm-add-cell')
        newAddCell.onclick = () => {
            this.addDesignSolution(fr)
        }

        // Automatically scroll to the bottom of the page
        let workspaceElement = document.querySelector("#layout-workspace")
        workspaceElement.scrollTo(0, workspaceElement.scrollHeight)

        // The matrix changes in size. Thus, a new canvas is required.
        this.canvasOverlay.rebuildCanvas()

        // IF a solution is selected, rerender it after manipulating DOM
        if (state.workspaceSelectedSolution) {
            this.clearSolutionRender()
            this.renderSolution(state.workspaceSelectedSolution)
        }
    }

    /**
     * Add a new DS to the morph matrix
     * @param {Number} rowPosition To which row the design solution should be added
     */
    addDesignSolution (fr, newDs) {
        let row = document.getElementById(fr.rowID)
        let cellPosition = row.cells.length - 1     // Cell position. 0th position is the FR.

        let ds = null

        if (newDs) {
            ds = newDs
        } else {
            let dsID = "ds-"+random.randomString(8)
            ds = new DesignSolution(dsID, cellPosition, fr.id)
        }

        this.frMap[fr.id].designSolutions.push(ds)

        let newCell = row.insertCell(cellPosition)
        newCell.id = ds.id
        newCell.verticalAlign = "top"
        
        let containerDiv = document.createElement('div')
        containerDiv.style.display = 'flex'
        containerDiv.style.flexDirection = 'column'
        containerDiv.style.justifyContent = 'space-between'
        containerDiv.style.height = '100%'
        newCell.appendChild(containerDiv)
        
        // Map ID for easy object lookup
        this.dsMap[ds.id] = ds

        // Render disabled overlay if disabled
        if (ds.disabled) {
            this.renderDisabledDsOverlay(newCell)
        }

        // Create form in which a description can be written
        this._createCellForm(containerDiv, `Sub-Solution ${cellPosition}`, {
            onChangeCallback: (value) => ds.description = value,
            defaultValue: ds.description,
        })
        // If the user clicks anywhere within the cell, then set focus to the textarea.
        newCell.onclick = (evt) => {
            let cellform = newCell.querySelector('textarea')
            if (!state.equalsWim(state.wim.default)) return
            if (cellform) cellform.focus()
        }

        // Create initially empty image field
        let imgElement = document.createElement('img')
        imgElement.id = 'img-'+ds.id
        containerDiv.appendChild(imgElement)
        
        if (this.dsLabelCell.colSpan < row.cells.length - 2) {
            this.dsLabelCell.colSpan = row.cells.length - 2
        }

        this._createDSCellOverlay(newCell)

        if (ds.image) this._addImage(imgElement.id, ds.image)

        // Scroll right
        let workspaceElement = document.querySelector("#layout-workspace")
        let val = workspaceElement.offsetWidth + workspaceElement.scrollLeft
        if (this.tableElement.offsetLeft + newCell.offsetLeft > val) {  // add offsetLeft of table because table has position set to relative.
            workspaceElement.scrollLeft += newCell.offsetWidth
        }

        // The matrix changes in size. Thus, a new canvas is required.
        this.canvasOverlay.rebuildCanvas()

        // IF a solution is selected, rerender it after manipulating DOM
        if (state.workspaceSelectedSolution) {
            this.clearSolutionRender()
            this.renderSolution(state.workspaceSelectedSolution)
        }

        GlobalObserver.emit('ds-added')
    }

    getContainerElement() {
        return this.containerElement
    }

    import(save) {
        // Rebuild matrix from json dump
        console.log(`Importing "${save.name}"..`)
        this.name = save.name
        this.titleElement.innerHTML = this.name
        
        console.log('Imported title')

        // Import FR -> DS mapping and structure
        for (let frN = 0; frN < save.functionalRequirements.length; frN++) {
            let savedFr = save.functionalRequirements[frN]
            this.addFunctionalRequirement({
                id: savedFr.id,
                rowID: savedFr.rowID,
                description: savedFr.description
            })
            for (let dsN = 0; dsN < savedFr.designSolutions.length; dsN++) {
                let savedDs = savedFr.designSolutions[dsN]

                let ds = new DesignSolution(savedDs.id, savedDs.position, savedDs.frID, {
                    disabled: savedDs.disabled,
                    image: savedDs.image,
                    description: savedDs.description,
                })
                this.addDesignSolution(savedFr, ds)
            }
        }

        console.log('Imported SF and SS structure')

        // Import incompatibilities
        this.incompatibilityMap = save.incompatibilityMap
        let count = 0
        for (let savedIncompID in save.incompatibilityMap) {
            let savedIncomp = save.incompatibilityMap[savedIncompID]
            const incompDs1ID = savedIncomp.ds1.id
            const incompDs2ID = savedIncomp.ds2.id
            const incompDs1 = this.dsMap[incompDs1ID]
            const incompDs2 = this.dsMap[incompDs2ID]
            this.setIncompatible(incompDs1, incompDs2, {
                incompID: savedIncomp.id,
                incompName: savedIncomp.name
            })
            count += 1
        }
        Incompatibility.count = count

        console.log('Imported incompatibilities')

        for (const solutionID in save.solutions) {
            const savedSolution = save.solutions[solutionID]
            let solution = new Solution()
            solution.name = savedSolution.name
            solution.id = savedSolution.id
            solution.color = savedSolution.color

            // Set FR -> DS mapping
            for (const frID in savedSolution.frIdToDsIdMap) {
                const ds = this.dsMap[savedSolution.frIdToDsIdMap[frID]]
                const fr = this.frMap[frID]
                solution.bindFrToDs(fr, ds, {
                    ignoreDelimitations: true
                })
            }   

            this.addSolution(solution)
        }

        console.log('Imported solutions')

        GlobalObserver.emit('matrix-imported', save)
    }

    /**
     * Returns serialized object
     */
    export() {
        return JSON.stringify(this, (key, value) => {
            // JSON can't handle "Set" datastructures. Thus, they must be converted into arrays.
            if (typeof value === 'object' && value instanceof Set) {
                return [...value];
            }
            return value;
        })
    }

    /**
     * Render all incompatible DSs for a specific solution
     * @param {String} solutionID 
     */
    renderAllSolutionIncompatibilities(solutionID) {
        const solution = this.solutions[solutionID]
        const dsIdArray = solution.getIncompatibleDsIds()

        for (let dsID of dsIdArray) {
            this.renderIncompatibleOverlay(dsID)
        }
    }

    /**
     * Renders one compatibility (two SS-cells)
     * @param {String} incompID 
     */
    renderIncompatibility (incompID) {
        let incomp = this.incompatibilityMap[incompID]

        this.renderIncompatibleOverlay(incomp.ds1.id)
        this.renderIncompatibleOverlay(incomp.ds2.id)
    }

    /**
     * Renders the incompatibility overlay over one SS-cell
     * @param {String} dsID 
     */
    renderIncompatibleOverlay (dsID) {
        const ds = this.dsMap[dsID]

        let dsCell = document.getElementById(dsID)
        let overlay = document.createElement('div')

        overlay.classList.add('overlay-incompatible')
        if (!ds.isDisabled()) {
            overlay.innerHTML = '<i class="fas fa-times"></i>'
        }
        overlay.title = 'Incompatible'
        overlay.onclick = () => {
            if (state.equalsWim(state.wim.default)) {
                console.log('Show incomps')

            } else if (state.equalsWim(state.wim.incompatibility)) {

                if (state.workspaceSelectedIncompatibleOrigin !== dsID) {
                    // This is not the origin of an incompability
                    return
                }
                GlobalObserver.emit('incompatibility-selection', this.dsMap[dsID])
            } 
        }
        dsCell.appendChild(overlay)
    }

    clearIncompatibleOverlay (dsID) {
        let dsCell = document.getElementById(dsID)
        let overlay = dsCell.querySelector('.overlay-incompatible')
        dsCell.removeChild(overlay)
    }

    clearAllIncompatibleOverlays () {
        let overlays = this.containerElement.querySelectorAll('.overlay-incompatible')

        for (let i = 0; i < overlays.length; i++) {
            let overlay = overlays[i]
            overlay.parentElement.removeChild(overlay)
        }
    }

    renderDisabledDsOverlay(dsCell) {
        let overlay = document.createElement('div')
        overlay.classList.add('overlay-disabled')
        overlay.innerHTML = '<i class="fas fa-ban"></i>'
        overlay.onclick = () => {
            if (!state.equalsWim(state.wim.disable)) return
            this.setDsDisabled(dsCell.id, false)
        }
        dsCell.appendChild(overlay)
    }

    clearDisabledDsOverlay(dsCell) {
        let overlay = dsCell.querySelector('.overlay-disabled')
        dsCell.removeChild(overlay)
    }

    /**
     * Returns the size of the design space. Takes delimitations into account.
     * Throws if the number is too big
     */
    countPossibleSolutions(maxWidth) {
        const solGen = new SolutionGenerator(this)
        let count = solGen.generateAll({limit: maxWidth, onlyCount: true})
        return count
    }

    getIncompatibility(incompatibilityID) {
        return this.incompatibilityMap[incompatibilityID]
    }

    getFunctionalRequirement(frID) {
        return this.frMap[frID]
    }

}

module.exports = MorphMatrix
