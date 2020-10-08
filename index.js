const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const {PDFDocument } = require('pdf-lib');

var mainWindow;

const isWindows = process.platform === "win32";
const isLinux = process.platform === "linux";
const isMac = process.platform === "darwin";

const template = [
    { label: "Save Merged PDF", accelerator: 'CommandOrControl+S', click: (event) => {
        console.log('Save!');
        let filename = dialog.showSaveDialogSync(mainWindow, {
            title: 'Save Merged PDF',
            filters: [
                { name: 'PDF Files', extensions: [ 'pdf' ] },
                { name: 'All Files', extensions: [ '*' ] }
            ]
        });
        let data = mergePDFs();
        data instanceof Promise?data.then(dataBuffer => {
            console.log(`writing ${dataBuffer.length} bytes to ${filename}`);
            fs.writeFileSync(filename, dataBuffer);
        }):fs.writeFileSync(filename, data);
    } },
    { type: 'separator' },
    isMac ? { role: "close" } : { role: "quit" }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

function createWindow () {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        frame: isWindows||isLinux?false:true,

        webPreferences: {
            preload: path.join(__dirname, "static/scripts/preload.js"),
            enableRemoteModule: true,
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    win.loadFile('static/index.html');
    win.webContents.openDevTools();
    win.on("closed", () => mainWindow = null);
    mainWindow = win;
    win.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures, referrer, postBody) => {
        if (url.includes('viewer.html')) {
            event.preventDefault();
            const nwin = new BrowserWindow({
                webContents: options.webContents,
                show: false,
                webPreferences: options.webPreferences,
                preload: options.preload,
                frame: options.frame
            });
            if (options.menubar == "no" || options.menubar == false) nwin.setMenuBarVisibility(false);
            nwin.once('ready-to-show', () => nwin.show());
            nwin.loadURL(url);
            event.newGuest = nwin;
        } 
    });
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

async function mergePDFs() {
    if (sourcePDFs.length == 0) {
        return Buffer.from("");
    } else  if (sourcePDFs.length == 1) {
        return fs.readFileSync(sourcePDFs[0]);
    } else {
        let doc = await PDFDocument.create();

        for( let i = 0; i < sourcePDFs.length; i++) {
            console.log(`reading ${sourcePDFs[i]} (item ${i} in the array of ${sourcePDFs.length} items)`);
            const data = await PDFDocument.load(fs.readFileSync(sourcePDFs[i]));
            const contentPages = await doc.copyPages(data, data.getPageIndices());
            let pc = 1;
            for (const page of contentPages) {
                doc.addPage( page );
                console.log(`merging page ${pc} of ${sourcePDFs[i]} into output document`);
                pc += 1;
            }
        }

        return doc.save();
    }
}

var sourcePDFs = [];

ipcMain.on(`merge-pdfs`, function(e, args) {
    let data = mergePDFs();
    data instanceof Promise?data.then( d => e.returnValue = d):e.returnValue = data;
});

ipcMain.on(`file-data`, (e, args) => {
    console.log(require('util').inspect(args, { depth: 3 }));
    sourcePDFs = args.map( (item) => item.name );
    console.log(require('util').inspect(sourcePDFs, { depth: 3 }));
});
