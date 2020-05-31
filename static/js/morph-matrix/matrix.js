class MorphMatrix {
    containerID = null
    containerElement = null
    constructor(containerID) {
        this.containerElement = document.getElementById(containerID)
        this.containerID = containerID

        if (!this.containerElement) throw new Error('Failed to find matrix container')
    }

    addFunction (name) {

    }

    addPartSolution (name) {

    }
}