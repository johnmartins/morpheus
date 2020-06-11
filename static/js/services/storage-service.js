'use strict'

const path = require('path')
const extractor = require('unzipper')
const archiver = require('archiver')
const os = require('os')
const fs = require('fs')
const random = require('./../utils/random')
const tmpStorageRoot = os.tmpdir() + '/morpheus/'
const tmpStorage = tmpStorageRoot + random.randomString(8) + '/'

module.exports = {
    getTmpStorageDirectory: function () {
        let exists = fs.existsSync(tmpStorage)
        
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
    },

    /**
     * Zip up the entire tmp work directory which contains all files necessary to recreate the current project.
     * @param {function} callback 
     */
    zipTmpStorageDir: function (callback) {
        let destinationFile = tmpStorageRoot + random.randomString(8)+'.morph'

        // write stream for zip file
        let zipWriteStream = fs.createWriteStream(destinationFile, {flags: 'w'})
        var archive = archiver('zip', {
            zlib: {level: 9}
        })
    
        zipWriteStream.on('close', () => {
            console.log(archive.pointer() + ' total bytes')
            console.log('archiver has been finalized and the write stream file descriptor has closed.')
            callback(destinationFile)
        })
    
        archive.on('warning', function(err) {
            if (err.code === 'ENOENT') {
                throw err
            } else {
                // throw error
                throw err
            }
        })
    
        archive.on('error', function(err) {
            throw err
        })
        
        // pipe archive data to the file
        archive.pipe(zipWriteStream);
    
        // Zip all contents in the tmp storage directory
        archive.directory(module.exports.getTmpStorageDirectory(), false)
    
        // We are done staging files. Start zipping.
        archive.finalize()
    },

    unzipInTmpStorage: async function (sourceFile, callback) {
        let destination = module.exports.getTmpStorageDirectory()
        fs.createReadStream(sourceFile).pipe(extractor.Extract({ path: destination }))
        .promise().then( () => {
            console.log("Done unzipping")
            callback()
        } )
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