'use strict'

const Solution = require('./Solution')
const numbersUtil = require('./../utils/numbers')
const {NoDesignSolutionsError, GenerationCapacityError, SolutionExistsError} = require('./../errors')

/**
 * The SolutionGenerator class can be used to generate all possible solutions 
 * that can be derived from an instance of the MorphMatrix class.
 * It can also be used to only count the solutions, which uses parts of the same algorithm.
 * 
 * The SolutionGenerator requires an associated MorphMatrix instance. 
 * The function "generateAll" can then be used to either generate all solutions, 
 * or count the possible solutions.
 */
class SolutionGenerator {
    constructor (matrix) {
        this.matrix = matrix
    }

    generateAll({limit=100, onlyCount=false}={}) {
        let frArray = []

        SolutionTree.highLevelBranches = 0
        SolutionTree.maxWidth = limit
        
        // Remove any FRs that does not contain availabe DSs
        for (let i = 0; i < this.matrix.functionalRequirements.length; i++) {
            const fr = this.matrix.functionalRequirements[i]
            if (fr.getEnabledDsCount() > 0) {
                frArray.push(fr)
            }
        }
        if (frArray.length === 0) {
            throw new NoDesignSolutionsError('No sub-solutions in matrix. Failed to generate solution trees.')
        }

        // Create one tree per DS in the first FR 
        // If the amount of branches exceeds the limit, then break.
        let solutionTreeArray = []
        const firstFr = frArray.shift()
        for (let firstDs of firstFr.designSolutions) {
            if (firstDs.isDisabled()) continue

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

                if (nextLevel.length > 0) {
                    tree.setTopLevelNodes(nextLevel)
                }
            }
        }

        // Get solution count
        let solCount = 0
        for (let tree of solutionTreeArray) {
            solCount += tree.topLevelWidth
        }

        if (onlyCount === true) return solCount

        this._createSolutionFromTrees(solutionTreeArray)

        return solCount

    }

    _createSolutionFromTrees(treeArray) {

        let solutionNumber = 1

        // There is one tree for each lowest level DS. Thus, if your first FR has three DSs attached to it, 
        // and none of them are disabled, then you will also have three trees.
        for (let tree of treeArray) {
            // This algorithm uses the top level nodes (Highest level FR design solutions), and walks backwards
            // until the lowest level is reached. Each node has an associated DS, which is added to the solution.
            // Once the lowest level is reached (the root node), the solution is completed, and the algorithm moves on to the next 
            // available top node.
            for (let topNode of tree.topLevelNodes) { 

                let currentNode = topNode
                let solution = new Solution()
                solution.name = `generated-solution-${numbersUtil.fillWithZeros(solutionNumber, 4)}`

                solutionNumber += 1

                // The final step of this loop sets currentNode to its own parent.
                // Thus, if will loop until it reaches the bottom of the tree, the root node, which has no parent.
                while(currentNode) {
                    const ds = currentNode.ds
                    const fr = this.matrix.getFunctionalRequirement(ds.frID)
                    solution.bindFrToDs(fr, ds)

                    currentNode = currentNode.parent
                }

                try {
                    this.matrix.addSolution(solution)
                } catch (err) {
                    if (err.code === 'SOLUTION_EXISTS') {
                        console.log('Skipping one existing solution')
                    } else {
                        throw err
                    }
                }
                
            }
        }
    }
}

/**
 * Maps out all possible solutions that can be derived from a single DS (the root node) 
 * and all nodes that it can be combined with.
 * The SolutionTree class is used by the SolutionGenerator class, and serves no other purpose.
 */
class SolutionTree {

    static highLevelBranches = 0
    static maxWidth = 100

    constructor () {
        this.rootNode = null
        this.levelData = new Map() // FR position -> amout of branches from that level
        
        this.topLevel = 0
        this.topLevelWidth = 0
        this.topLevelNodes = []
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
            SolutionTree.highLevelBranches -= this.topLevelWidth
        }

        SolutionTree.highLevelBranches += 1

        this.topLevelWidth = levelWidth
    }

    getLevelWidth (level) {
        return this.levelData.get(level)
    }

    setTopLevelNodes (topLevelNodeArray) {
        this.topLevelNodes = topLevelNodeArray
    }
}

/**
 * A solution node represents one DS. Besides the DS, the node also contains information about which other nodes on the next level
 * this node can be combined with. It also contains all acumulated incompatibilities from lower level nodes, and the parent of this node.
 * The SolutionNode class is used by the SolutionTree class, and serves no other purpose.
 */
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
    }

    addBranch (node) {
        this.tree.addLevelWidth(this.level)

        if (SolutionTree.highLevelBranches > SolutionTree.maxWidth) {
            throw new GenerationCapacityError(`Solution tree width exceeded limit of ${SolutionTree.maxWidth}`)
        }

        this.branches.push(node)
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