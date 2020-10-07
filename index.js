const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { menu } = require('./lib/menu');

let mainWindow;

const isWindows = process.platform === "win32";
const isLinux = process.platform === "linux";

function createWindow () {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        frame: isWindows||isLinux?false:true,

        webPreferences: {
            preload: path.join(__dirname, "static/scripts/preload.js"),
            enableRemoteModule: true
        }
    })

    // and load the index.html of the app.
    win.loadFile('static/index.html');
    //win.webContents.openDevTools();
    win.on("closed", () => mainWindow = null);
    mainWindow = win;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// Register an event listener. When ipcRenderer sends mouse click co-ordinates, show menu at that point.
ipcMain.on(`display-app-menu`, function(e, args) {
    if ((isWindows || isLinux) && mainWindow) {
        menu.popup({
            window: mainWindow,
            x: args.x,
            y: args.y
        });
    }
});
