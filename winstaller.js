'use strict'

const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const fs = require('fs')
const path = require('path')

const sourceDir = path.join('./')
const outDir = path.join(sourceDir, 'out')


getInstallerConfig()
    .then(createWindowsInstaller)
    .catch((err) => {
        console.error(err.message || err)
        process.exit(1)
    })

function getInstallerConfig () {
    console.log('Creating config')

    return Promise.resolve({
        appDirectory: path.join(outDir, 'Morpheus-win32-ia32/'),
        authors: 'Julian Martinsson',
        noMsi: true,
        outputDirectory: path.join(outDir, 'windows-installer'),
        exe: 'morpheus.exe',
        setupExe: 'morpheus-installer.exe',
        setupIcon: path.join(sourceDir, 'build-resources', 'icons', 'app-icon.ico') 
    })
}