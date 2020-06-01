const { app, BrowserWindow} = require('electron')

// IPC request handler
require('./services/ipc-handler')()

function createWindow () {
    let win = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
        },
        show: false // Wait until window is ready
    })
    win.loadFile('static/html/index.html')
    win.on('ready-to-show', () => {
        win.show()
        win.maximize()
    })
    //win.setMenu(null)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
})