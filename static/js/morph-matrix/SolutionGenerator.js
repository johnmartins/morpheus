'use strict'

class SolutionGenerator {
    constructor (matrix) {

        this.matrix = matrix

    }

    generateAll({limit=100, onlyCount=false}={}) {
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
        let solutionTreeArray = []
        const firstFr = frArray.shift()
        for (let firstDs of firstFr.designSolutions) {

            let previousLevel = []
            let tree = new SolutionTree({maxWidth: limit})
            let rootNode = new SolutionNode(tree, firstFr.position, firstDs)
            tree.setRootNode(rootNode)
            solutionTreeArray.push(tree)

            previousLevel.push(rootNode)

            // Loop through next FR and add branches to those DSs
            for (let i = 0; i < frArray.length; i++) {
                const fr = frArray[i]
                let dsArray = fr.designSolutions
                let nextLevel = []

                // Go through each DS for this FR
                for (let ds of dsArray) {
                    if (ds.isDisabled()) continue

                    // For all nodes of the previous level: 
                    // add the new DSs if they are compatible
                    for (let node of previousLevel) {
                        if (node.isIncompatile(ds)) {
                            continue
                        }

                        let newNode = new SolutionNode(tree, fr.position, ds, {
                            parent: node
                        })
                        node.addBranch(newNode)

                        // Queue new nodes for the next trip through the loop
                        nextLevel.push(newNode)
                    }
                }

                previousLevel = nextLevel
            }
        }

        // Get solution count
        let solCount = 0
        for (let tree of solutionTreeArray) {
            console.log('Top tree level width: '+tree.topLevelWidth)
            solCount += tree.topLevelWidth
        }

        if (onlyCount === true) return solCount

        return solCount

    }

    _createSolutionFromTrees(treeArray) {

        for (let tree of treeArray) {

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
        
        this.topLevel = 0
        this.topLevelWidth = 0
    }

    setRootNode (node, level) {
        this.rootNode = node
        this.addLevelWidth(level)
    }

    addLevelWidth (level) {
        if (!this.levelData.get(level)) {
            this.levelData.set(level, 0)
        }
        let levelWidth = this.levelData.get(level)+1
        this.levelData.set(level, levelWidth)

        if (level > this.topLevel) {
            this.topLevel = level
        }
        this.topLevelWidth = levelWidth
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
        this.incompatibleDsSet = new Set()
        
        // Handle accumulated incompatibilities from parent node and new DS
        if (parent) {
            // Inherit parent incompatibilities
            this.incompatibleDsSet = new Set(parent.getIncompatibilitySet())
        }

        let incomps = ds.getIncompatibleDsIDArray()
        for (let dsID of incomps) {
            this.addIncompatibility(dsID)
        }

        console.log(this.incompatibleDsSet)
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

    addIncompatibility (dsID) {
        this.incompatibleDsSet.add(dsID)
    }
}

module.exports = SolutionGenerator