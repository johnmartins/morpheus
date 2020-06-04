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
                    click: () => {win.webContents.send('menu-event', {type: 'new'})},
                    accelerator: isMac ? 'Option+Cmd+N' : 'Ctrl+N'
                },
                {
                    label: 'Open',
                    click: () => {win.webContents.send('menu-event', {type: 'open'})},
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
                    role:  isMac ? 'close' : 'quit'
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
    }
}