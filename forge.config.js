'use strict'

const fs = require('fs')
const path = require('path')

const skipCertificate = true
const certFilePath = path.join('./', 'build-resources', 'certificates', 'win.pfx')
const passwordFilePath = path.join('./', 'build-resources', 'certificates', 'win-pwd.txt')

module.exports = {
    packagerConfig: {
        icon: "build-resources/icons/app-icon",
        asar: true
    },
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                certificateFile: skipCertificate ? "" : certFilePath,
                certificatePassword: skipCertificate ? "" : getPassword()
            }
        }
    ]
}

function getPassword () {
    // Use FS to sync read passwordFilePath and return the contents without linebreaks
    return "abcdefg"
}