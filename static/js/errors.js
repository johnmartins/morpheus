'use strict' 

class IncompatibilityExistsError extends Error {
    constructor (message) {
        super(message)
        this.code = 'INCOMP_EXISTS'
        this.name = this.constructor.name
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor)
        } else {
            this.stack = (new Error(message)).stack
        }
    }
}

module.exports = {IncompatibilityExistsError}