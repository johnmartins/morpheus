'use strict'

const { app, Menu } = require('electron')

module.exports = {
    build: (win) => {
        const isMac = process.platform === 'darwin'

        const template = []

        // Mac application menu
        if (isMac) {
            template.push({
                label: app.name,
                submenu: [
                    { role: 'hide' },
                    { role: 'hideothers' },
                    { role: 'unhide' },
                    { role: 'separator' },
                    { role: 'quit' }
                ]
            })
        }

        // File menu
        template.push({
            label: 'File',
            submenu: [
                {
                    label: 'New',
                    click: () => {win.webContents.send('menu-event', {type: 'new'})},   // First ask renderer for permission
                    accelerator: isMac ? 'Option+Cmd+N' : 'Ctrl+N'
                },
                {
                    label: 'Open',
                    click: () => {win.webContents.send('menu-event', {type: 'open'})},  // First ask renderer for permission
                    accelerator: isMac ? 'Cmd+O' : 'Ctrl+O'
                },
                {
                    label: 'Save',
                    click: () => {win.webContents.send('menu-event', {type: 'save'})},
                    accelerator: isMac ? 'Cmd+S' : 'Ctrl+S'
                },
                {
                    label: 'Save As...',
                    click: () => {win.webContents.send('menu-event', {type: 'save-as'})},
                    accelerator: isMac ? 'Cmd+Shift+S' : 'Ctrl+Shift+S'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Exit',
                    click: () => {win.webContents.send('menu-event', {type: 'exit'})}                                     // First ask renderer for permission
                }]
        })
        
        // Dev menu
        template.push({
            label:  'Dev',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
            ]
        })

        let menu = Menu.buildFromTemplate(template)

        Menu.setApplicationMenu(menu)

        // Handle window "x-button"
        win.on('close', (evt) => {
            evt.preventDefault()
            win.webContents.send('menu-event', {type: 'exit'})
        })
    }
}