'use strict'

const random = require('./../utils/random')

class Incompatibility {

    static count = 0

    constructor (ds1, ds2, {id = null, name = null} = {}) {
        this.name = name ? name : this._getDefaultName()
        this.id = id ? id : 'incomp-'+random.randomString(8)
        this.ds1 = ds1
        this.ds2 = ds2

        ds1.setIncompatibleWith(ds2, this) // Is automatically mirrored

        console.log('NEW INCOMPATIBILITY')
        console.log(ds1)
        console.log(ds2)
    }

    _getDefaultName () {
        Incompatibility.count++
        let number = String(Incompatibility.count)
        if (String(number).length === 1) number = `00${number}`
        if (String(number).length === 2) number = `0${number}`
        return `incompatibility ${number}`
    }

}

module.exports = Incompatibility