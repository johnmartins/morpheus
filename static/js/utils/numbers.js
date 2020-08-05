'use strict'

module.exports = {
    fillWithZeros: (number, desiredLength) => {
        let length = String(number).length
        let zeros = ''
        for (let i = 0; i < desiredLength - length; i++) {
            zeros += "0"
        }
        return `${zeros}${number}`
    }
}