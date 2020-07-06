'use strict'

const random = require('./../utils/random')

class Incompatibility {

    constructor (ds1, ds2, {id = null} = {}) {
        this.id = id ? id : random.randomString(8)
        this.ds1 = ds1
        this.ds2 = ds2

        ds1.setIncompatibleWith(ds2) // Is automatically mirrored

        console.log('NEW INCOMPATIBILITY')
        console.log(ds1)
        console.log(ds2)
    }

}

module.exports = Incompatibility