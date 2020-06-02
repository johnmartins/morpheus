'use strict'

const { app, Menu } = require('electron')

module.exports = {
    build: (win) => {
        const isMac = process.platform === 'darwin'

        const template = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'New',
                        click: () => {win.webContents.send('menu-event', {type: 'new'})} 
                    },
                    {
                        label: 'Open',
                        click: () => {win.webContents.send('menu-event', {type: 'open'})}
                    },
                    {
                        label: 'Save',
                        click: () => {win.webContents.send('menu-event', {type: 'save'})}
                    },
                    {
                        label: 'Save As...',
                        click: () => {win.webContents.send('menu-event', {type: 'save-as'})}
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'quit'
                    }]
            },
            {
                label:  'Dev',
                submenu: [
                    { role: 'reload' },
                    { role: 'forcereload' },
                    { role: 'toggledevtools' },
                ]
            }
        ]
    
        let menu = null
        if (!isMac) {
            menu = Menu.buildFromTemplate(template)
        } else {
            // TODO: Mac menu..
        }
       
        Menu.setApplicationMenu(menu)
    }
}