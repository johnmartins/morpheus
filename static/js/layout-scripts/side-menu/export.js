'use strict'

const NAME_SOLUTION_EXPORT_TARGET = 'export-solutions-radio'

module.exports = {

    setupListeners: () => {
        let tabExport = document.getElementById('tab-export')
        let btnExportMatrix = document.getElementById('btn-export-matrix')
        let btnExportSolutions = document.getElementById('btn-export-solutions')
        let solutionSelector = document.getElementById('export-solution-selector')

        // Listen for radio input changes
        tabExport.onclick = (evt) => {
            const name = evt.target.name
            if (!name) return
            if (name === NAME_SOLUTION_EXPORT_TARGET) {
                let val = tabExport.querySelector(`[name="${NAME_SOLUTION_EXPORT_TARGET}"]:checked`).value

                if (val === 'specific') {
                    // Show selector
                    console.log("show")
                } else {
                    // Hide selector
                    console.log("hide")
                }
            }
        }

        btnExportMatrix.onclick = () => {

        }

        btnExportSolutions.onclick = () => {

        }

        // Solution selector
        solutionSelector.onclick = () => {
            let open = solutionSelector.classList.contains('open')
            if (open) {
                solutionSelector.classList.remove('open')
            } else {
                solutionSelector.classList.add('open')
            }
        }
    }
}

