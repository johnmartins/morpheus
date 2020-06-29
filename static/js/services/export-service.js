'use strict'

const fs = require('fs')
const html2canvas = require('html2canvas')

const workspace = require('./../workspace')
const fileDiagService = require('./file-dialog-service')
const popup = require('./../layout-scripts/popup')
const SolutionRenderer = require('./../morph-matrix/solution-renderer')

module.exports = {

    /**
     * Export the matrix to a CSV file
     */
    exportMatrixToCSV: () => {
        console.log('Exporting matrix to CSV..')

        fileDiagService.newSaveFileDialog({
            filters: [ 
                {name: 'CSV', extensions: ['csv']}
            ]
        }).then((res) => {
            console.log(res)

            if (res.canceled) return

            // Export FR and DS arrays to CSV
            let csv = ''
            let matrix = workspace.getMatrix()
            
            const frArray = matrix.functionalRequirements
            for (let i = 0; i < frArray.length; i++) {
                const fr = frArray[i]
                csv += fr.description

                const dsArray = fr.designSolutions
                for (let j = 0; j < dsArray.length; j++) {
                    const ds = dsArray[j]
                    csv += ';\t' + ds.description
                }

                csv += '\n'
            }

            // Write to file (should be done using a stream in the final version)
            console.log(csv)
            fs.writeFileSync(res.filePath, csv)

            popup.notify(`Export to CSV successful. <br>${res.filePath}`, {
                titleTxt: 'Export done'
            })
        }).catch((err) => {
            popup.error('Failed to export solutions to CSV. Reason: ' + err.message)
        })
    },

    /** 
     * Export the matrix into a PNG image
     */
    exportMatrixToPNG: () => {
        console.log('Exporting matrix to PNG..')

        try {

            fileDiagService.newSaveFileDialog({
                filters: [ 
                    {name: 'Image', extensions: ['png']}
                ]
            }).then((res) => {

                let matrix = workspace.getMatrix()
                let matrixContainer = matrix.getContainerElement()
                
                let x = matrixContainer.scrollWidth
                let y = matrixContainer.scrollHeight
                console.log(`${x}, ${y}`)
        
                // Set workspace to "visible" to avoid cropping in the image
                workspace.getLayout().style.overflow = 'visible'

                prepareMatrixForCapture(matrixContainer)
        
                html2canvas(matrix.getContainerElement(), {
                    backgroundColor: 'black',
                    ignoreElements: (element) => {
                        if (element.classList.contains('mm-add-cell')) return true
                        return false
                    }
                }).then(canvas => {
                    let img = canvas.toDataURL('image/png')
                    const base64Data = img.replace(/^data:image\/png;base64,/, "")
                    fs.writeFileSync(res.filePath, base64Data, {encoding: 'base64'})
        
                    workspace.getLayout().style.overflow = 'auto'

                    resetMatrixLayout(matrixContainer)
                    popup.notify(`Export to PNG successful. <br>${res.filePath}`, {
                        titleTxt: 'Export done'
                    })
                })

            }).catch((err) => {
                throw new ('Error! Failed to save workspace PNG')
            })



        } catch (err) {
            popup.error('Failed to export matrix to PNG. Reason: ' + err.message)
        }
        

    },

    exportSolutionToCSV: (solutionID) => {
        console.log('Exporting solution to CSV..')

        try {
            if (!solutionID) throw new Error('No solution ID specified')

            fileDiagService.newSaveFileDialog({
                filters: [ 
                    {name: 'CSV', extensions: ['csv']}
                ]
            }).then((res) => {

                const matrix = workspace.getMatrix()
                const solution =  matrix.solutions[solutionID]
                const frArray = matrix.functionalRequirements
                const dsMap = matrix.cellToDesignSolutionMap

                if (!solution) throw new Error('Solution does not exist')

                let csv = 'Functional requirement;\tDesign solution\n'

                for (let i = 0; i < frArray.length; i++) {
                    const fr = frArray[i]
                    const frID = 'row-'+fr.id

                    csv += fr.description + ';\t'

                    console.log(frID)
                    console.log(solution.frToDsMap)
                
                    const dsID = solution.frToDsMap[frID]
                    if (dsID) {
                        const ds = dsMap[dsID]
                        csv += ds.description ? ds.description : ''
                    } else {
                        csv += ''
                    }

                    csv += '\n'
                }

                fs.writeFileSync(res.filePath, csv)
                popup.notify(`Export to CSV successful. <br>${res.filePath}`, {
                    titleTxt: 'Export done'
                })

            }).catch((err) => {
                throw err
            })
        } catch (err) {
            popup.error(err.message)
        }
    },

    /**
     * Export ALL solutions to CSV. 
     */
    exportSolutionsToCSV: () => {
        console.log('Exporting solutions to CSV..')

        fileDiagService.newSaveFileDialog({
            filters: [ 
                {name: 'CSV', extensions: ['csv']}
            ]
        }).then((res) => {
            if (res.canceled) return
            const matrix = workspace.getMatrix()
            const frArray = matrix.functionalRequirements

            let csv = 'Functional Requirement;\t'

            // Create header
            for (const solutionID in matrix.solutions) {
                csv += matrix.solutions[solutionID].name + ';\t'
            }

            csv += '\n'

            for (let i = 0; i < frArray.length; i++) {
                const fr = frArray[i]

                let j = 0
                for (const solutionID in matrix.solutions) {
                    const solution = matrix.solutions[solutionID]
                    if (j === 0) {
                        // Write row header
                        csv += fr.description + ';\t'
                    }

                    let mappedDsID = solution.frToDsMap['row-'+fr.id]
                    
                    // If this solution has mapped this FR to a DS
                    if (mappedDsID) {
                        let ds = matrix.cellToDesignSolutionMap[mappedDsID]
                        csv += ds.description + ';\t'
                    } else {
                        csv += ';\t'
                    }
                    j++
                }

                csv += '\n'
            }
            fs.writeFileSync(res.filePath, csv)

            popup.notify(`Export to CSV successful. <br>${res.filePath}`, {
                titleTxt: 'Export done'
            })
        }).catch((err) => {
            popup.error('Failed to export solutions to CSV. Reason: ' + err.message)
        })
    },

    /**
     * Export a solution to a PNG image
     */
    exportSolutionToPNG: (solutionID) => {
        console.log('Exporting solution to PNG..')
        
        try {
            if (!solutionID) throw new Error('exportSolutionToPNG requires a solution ID.')

            fileDiagService.newSaveFileDialog({
                filters: [ 
                    {name: 'Image', extensions: ['png']}
                ]
            }).then((res) => {

                const matrix = workspace.getMatrix()
                matrix.getContainerElement().style.display = 'none'       // Hide the matrix
        
                const solution = matrix.solutions[solutionID]
                if (!solution) throw new Error(`No solution with ID ${solutionID} found`)
        
                let solutionArray = [solution]
                let frArray = matrix.functionalRequirements
        
                let renderer = new SolutionRenderer(workspace.getLayout(), solutionArray, frArray, matrix.cellToDesignSolutionMap)
                let renderedElement = renderer.render()

                // Set workspace to "visible" to avoid cropping in the image
                workspace.getLayout().style.overflow = 'visible'

                html2canvas(renderedElement, {
                    backgroundColor: 'black'
                }).then(canvas => {
                    let img = canvas.toDataURL('image/png')
                    const base64Data = img.replace(/^data:image\/png;base64,/, "")
                    fs.writeFileSync(res.filePath, base64Data, {encoding: 'base64'})
        
                    workspace.getLayout().removeChild(renderedElement)      // Remove render from DOM
                    workspace.getLayout().style.overflow = 'auto'
                    matrix.getContainerElement().style.display = 'block'      // Show the matrix

                    popup.notify(`Export to PNG successful. <br>${res.filePath}`, {
                        titleTxt: 'Export done'
                    })
                })
            })

        } catch (err) {
            popup.error('Failed to export solutions to PNG. Reason: ' + err.message)  
        }
    },

    exportSolutionsToPNG: () => {
        console.log('Exporting solutions to PNG..')

        try {
            fileDiagService.newSaveFileDialog({
                filters: [ 
                    {name: 'Image', extensions: ['png']}
                ]
            }).then((res) => {
                const matrix = workspace.getMatrix()
                matrix.getContainerElement().style.display = 'none'       // Hide the matrix
        
                let solutionArray = []
                let frArray = matrix.functionalRequirements
        
                for (let solutionID in matrix.solutions) {
                    solutionArray.push(matrix.solutions[solutionID])
                }
        
                let renderer = new SolutionRenderer(workspace.getLayout(), solutionArray, frArray, matrix.cellToDesignSolutionMap)
                let renderedElement = renderer.render()

                // Set workspace to "visible" to avoid cropping in the image
                workspace.getLayout().style.overflow = 'visible'

                html2canvas(renderedElement, {
                    backgroundColor: 'black'
                }).then(canvas => {
                    let img = canvas.toDataURL('image/png')
                    const base64Data = img.replace(/^data:image\/png;base64,/, "")
                    fs.writeFileSync(res.filePath, base64Data, {encoding: 'base64'})
        
                    workspace.getLayout().removeChild(renderedElement)      // Remove render from DOM
                    workspace.getLayout().style.overflow = 'auto'
                    matrix.getContainerElement().style.display = 'block'      // Show the matrix

                    popup.notify(`Export to PNG successful. <br>${res.filePath}`, {
                        titleTxt: 'Export done'
                    })
                })
            })

        } catch (err) {
            popup.error('Failed to export solutions to PNG. Reason: ' + err.message)  
        }
    }
}


function prepareMatrixForCapture (container) {
    console.log('This is where the magic happens')

    // Replace all text areas with divs containing the same content
    let textareas = container.querySelectorAll('textarea')

    for (let i = 0; i < textareas.length; i++) {

        let textarea = textareas[i]
        textarea.style.display = 'none'

        let replacement = document.createElement('div')
        replacement.innerHTML = textarea.value
        replacement.style.height = '2rem'
        replacement.style.fontSize = '0.8rem'
        replacement.classList.add('houdini')

        // The good ol' switcharoo
        textarea.parentElement.insertBefore(replacement, textarea)
    }

    // Change the font family
    container.style.fontFamily = 'monospace'

    // Hide all overlays
    let overlays = container.querySelectorAll('.hover-overlay-icons')

    for (let i = 0; i < overlays.length; i++) {
        console.log('it happens')
        let overlay = overlays[i]
        overlay.style.display = 'none'
    }
}

function resetMatrixLayout (container) {
    let replacements = container.querySelectorAll('.houdini')
    let textareas = container.querySelectorAll('textarea')

    for (let i = 0; i < replacements.length; i++) {
        let replacement = replacements[i]
        let textarea = textareas[i]

        textarea.style.display = 'block'
        replacement.parentElement.removeChild(replacement)
    }

    // Change the font family back
    container.style.fontFamily = 'inherit'

    // Enable all overlays
    let overlays = container.querySelectorAll('.hover-overlay-icons')

    for (let i = 0; i < overlays.length; i++) {
        let overlay = overlays[i]
        overlay.style.display = 'block'
    }
}