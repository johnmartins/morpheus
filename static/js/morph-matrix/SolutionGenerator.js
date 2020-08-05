'use strict'

class SolutionGenerator {
    constructor (matrix) {

        this.matrix = matrix

    }

    generateAll({limit=100}={}) {
        let count = 0
        let frArray = []
        
        // Remove any FRs that does not contain availabe DSs
        for (let i = 0; i < this.matrix.functionalRequirements.length; i++) {
            const fr = this.matrix.functionalRequirements[i]
            if (fr.getEnabledDsCount() > 0) {
                frArray.push(fr)
            }
        }
        if (frArray.length === 0) {
            console.error('No DSs detected. Can not generate solutions.')
            return
        }

        // Create one tree per DS in the first FR 
        // If the amount of branches exceeds the limit, then break.
        const firstFr = frArray.shift()
        for (let firstDs of firstFr.designSolutions) {

            let previousLevel = []
            let tree = new SolutionTree({maxWidth: limit})
            let rootNode = new SolutionNode(tree, firstFr.position, firstDs)
            tree.setRootNode(rootNode)

            previousLevel.push(rootNode)

            // Loop through next FR and add branches to those DSs
            for (let i = 0; i < frArray.length; i++) {
                const fr = frArray[i]
                let dsArray = fr.designSolutions
                let nextLevel = []

                for (let ds of dsArray) {
                    if (ds.isDisabled()) continue

                    for (let node of previousLevel) {
                        if (node.isIncompatile(ds)) {
                            continue
                        }

                        let newNode = new SolutionNode(tree, fr.position, ds, {
                            parent: node
                        })
                        node.addBranch(newNode)
                        nextLevel.push(newNode)
                    }
                }

                previousLevel = nextLevel
            }
        }
    }
}

/**
 * Maps out all possible solutions from a single DS
 */
class SolutionTree {
    constructor ({maxWidth = 100} = {}) {
        this.maxWidth = maxWidth
        this.rootNode = null
        this.levelData = new Map() // FR position -> amout of branches from that level
    }

    setRootNode (node, level) {
        this.rootNode = node
        this.addLevelWidth(level)
    }

    addLevelWidth (level) {
        if (!this.levelData.get(level)) {
            this.levelData.set(level, 0)
        }
        this.levelData.set(level, this.levelData.get(level)+1)
    }

    getLevelWidth (level) {
        return this.levelData.get(level)
    }
}

class SolutionNode {
    constructor (tree, level, ds, {parent = null} = {}) {
        this.parent = parent
        this.tree = tree
        this.level = level  // Level = FR position
        this.ds = ds
        this.branches = []

        // Handle accumulated incompatibilities from parent node and new DS
        if (!parent) {
            // No inherited incompatibilities. Ds incomps only
            this.incompatibleDsSet = new Set(ds.getIncompatibleDsIDArray())
        } else {
            // Inherit parent incompatibilities, and add ds incomps
            let incomps = ds.getIncompatibleDsIDArray().concat(parent.getIncompatibilitySet())
            this.incompatibleDsSet = new Set(incomps)
        }
    }

    addBranch (node) {
        this.tree.addLevelWidth(this.level)

        if (this.tree.getLevelWidth(this.level) > this.tree.maxWidth) {
            throw new Error(`Tree width exceeded limit of ${this.tree.maxWidth}`)
        }

        this.branches.push(node)

        console.log(this.tree.getLevelWidth(this.level))
    }

    isIncompatile (ds) {
        if (this.incompatibleDsSet.has(ds.id)) {
            return true
        }
        return false
    }

    getIncompatibilitySet () {
        return this.incompatibleDsSet
    }

    addIncompatibility (ds) {
        this.incompatibleDsSet.add(ds.id)
    }
}

module.exports = SolutionGenerator