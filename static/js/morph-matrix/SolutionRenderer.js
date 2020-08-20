'use strict'

const storageService = require("../services/storage-service")

class SolutionRenderer {
    constructor (container, solutionArray, frArray, dsMap) {
        this.container = container
        this.solutionArray = solutionArray
        this.frArray = frArray
        this.dsMap = dsMap
        this.tableWrapper = document.createElement('div')
        this.tableWrapper.classList.add('matrix')

        this._createTable()
    }

    /**
     * Renders in the container specified in the constructor. 
     * Returns the rendered element such that it can be referenced and removed.
     */
    render () {
        this.container.appendChild(this.tableWrapper)

        return this.tableWrapper
    }

    _createTable () {
        let table = document.createElement('table')
        table.style.fontFamily = 'monospace'
        table.style.fontSize = '0.9rem'
        let tbody = document.createElement('tbody')
        table.appendChild(tbody)

        let headerRow = tbody.insertRow()
        let frHeaderCell = headerRow.insertCell()
        frHeaderCell.classList.add('mm-label-cell')
        frHeaderCell.innerHTML = 'Sub-Functions'

        // Loop through FRs
        for (let i = 0; i < this.frArray.length; i++) {
            const fr = this.frArray[i]
            let row = tbody.insertRow()
            let frCell = row.insertCell()
            frCell.innerHTML = fr.description
        }

        // Loop through solutions. Remember to create empty cells for non-mapped DSs
        for (let i = 0; i < this.solutionArray.length; i++) {
            const solution = this.solutionArray[i]
            
            let solutionHeader = table.rows[0].insertCell()
            solutionHeader.classList.add('mm-label-cell')
            solutionHeader.innerHTML = solution.name

            // Loop through FRs again
            for (let j = 0; j < this.frArray.length; j++) {
                const fr = this.frArray[j]
                const dsID = solution.getDsForFr(fr.id)
                const ds = this.dsMap[dsID]

                console.log(ds)

                let dsCell = table.rows[j+1].insertCell()
                let descContainer = document.createElement('div')
                descContainer.style.height = '2rem'
                dsCell.appendChild(descContainer)

                if (!ds) {
                    descContainer.innerHTML = 'N/A'
                } else {                    
                    descContainer.innerHTML = ds.description

                    if (!ds.image) continue
                    let img = document.createElement('img')
                    img.style.marginTop = '4px'
                    img.src = storageService.getTmpStorageDirectory() + ds.image
                    img.width = 140
                    img.height = 140
                    dsCell.appendChild(img)
                }
            }
        }

        this.tableWrapper.appendChild(table)
    }
}

module.exports = SolutionRenderer
