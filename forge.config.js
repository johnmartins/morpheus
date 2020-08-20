'use strict'

const fs = require('fs')
const path = require('path')
const { exit } = require('process')

const skipCertificate = false
const certFilePath = path.join('./', 'build-resources', 'certificates', 'win.pfx')
const passwordFilePath = path.join('./', 'build-resources', 'certificates', 'win-pwd.txt')

if (!skipCertificate) {
    console.log('Skip certificate: false. Attempting to sign code.')
    try {
        let certExists = fs.existsSync(certFilePath)
        let pwdExists = fs.existsSync(passwordFilePath)

        if (!certExists || !pwdExists) {
            throw new Error('Required files (win.pfx and win-pwd.txt) does not exist in directory "./build-resources/certificates"')
        }
    } catch (e) {
        console.error('Failed to sign code. Message: '+e.message)
        exit(1)
    }

}

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
    let content = fs.readFileSync(passwordFilePath, {encoding: 'utf8'})
    return content.replace('\n','').replace('\r\n','')
}