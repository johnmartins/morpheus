const { app, BrowserWindow, ipcMain, webContents, Menu } = require('electron')

function createWindow () {
    let win = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.setFullScreen(true)

    win.loadFile('static/html/index.html')
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

// Talk to back-end
ipcMain.on('ping', (evt, arg) => {
    console.log("Pinged from client")
    evt.reply('pong')
})