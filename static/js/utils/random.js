'use strict'

module.exports = {
    randomString: (length) => {
        let strArray = []
        let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
        for (let i = 0; i < length; i++) {
            let index = module.exports.randomInt(0, chars.length-1)
            strArray.push(chars[index])
        }
        return strArray.join('')
    },

    /**
     * Returns a random integer. Lower and upper are both included.
     */
    randomInt: (lower, upper) => {
        return Math.floor(lower + Math.random()*(upper-lower + 1))
    }
}