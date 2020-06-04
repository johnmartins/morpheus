'use strict'

const zlib = require('zlib')
const os = require('os')
const fs = require('fs')
const random = require('./../utils/random')
const tmpStorage = os.tmpdir() + '/morpheus/'+ random.randomString(8) + '/'

module.exports = {
    getTmpStorageDirectory: function () {
        console.log(`Checking if temp storage directory ${tmpStorage} exists`)
        let exists = fs.existsSync(tmpStorage)
        console.log(`tmpStorage exists: ${exists}`)
        
        if (exists) return tmpStorage
        
        try {
            fs.mkdirSync(tmpStorage, {
                recursive: true
            })
        } catch (err) {
            console.error('Failed to create temp storage directory')
            console.error(err.message)
            console.error(err.stack)
            return null
        }

        console.log(`tmpStorage exists: ${tmpStorage}`)

        return tmpStorage + '/'
    },

    copyFileToTmp: async function (originalPath, {filePrefix = ''} = {}) {
        let fileExtension = path.extname(originalPath)
        let targetFileName = `${filePrefix}${random.randomString(10)}${fileExtension}`
        let tmpDir = module.exports.getTmpStorageDirectory()
        let targetPath = `${tmpDir}${targetFileName}`

        try {
            await copyPromisified (originalPath, targetPath)
        } catch (err) {
            console.error(`Failed to copy file from ${originalPath} to ${targetPath}`)
            console.error(err.message)
            console.error(err.stack)
        }

        console.log("file was successfully copied to "+targetPath)
        
        return targetPath
    },

    removeFileFromTmp: function (fileName, callback) {
        fs.unlink(module.exports.getTmpStorageDirectory() + fileName, callback)
    }
}

function copyPromisified (from, to) {
    return new Promise( (resolve, reject) => {
        fs.copyFile(from, to, (err) => {
            if (err) {
                reject(err)
                return
            }
            console.log("Done copying!")
            resolve()
        })
    })
}