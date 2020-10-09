const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const {PDFDocument } = require('pdf-lib');

var mainWindow;
var previewWindow;
var workWindow;

const isWindows = process.platform === "win32";
const isLinux = process.platform === "linux";
const isMac = process.platform === "darwin";

Menu.setApplicationMenu(false);

function createWindow(width, height, showMe, parentWindow) {
	var win = new BrowserWindow({
		width: width,
		height: height,
		parent: parentWindow!=undefined?parentWindow:null,
		show: showMe,
		frame: isWindows||isLinux?false:true,
		
        webPreferences: {
            preload: path.join(__dirname, "static/scripts/preload.js"),
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });
	
	win.setMenuBarVisibility(false);
	win.setMenu(null);
	
	return win;
}

function hideWindow(event, window) {
	event.preventDefault();
	window.hide();
}

function createWindows() {
	mainWindow = createWindow(1024, 768, true, undefined);
	mainWindow.webContents.openDevTools();
    mainWindow.loadFile('static/index.html');
	mainWindow.on('close', e => {
		previewWindow.close();
		previewWindow = null;
		workWindow.close();
		workWindow = null;
	});
    mainWindow.on("closed", () => {
		mainWindow = null
		app.quit();
	});
	previewWindow = createWindow(768, 1024, true, mainWindow);
	previewWindow.loadFile('static/viewer.html');
	previewWindow.on('close', e => hideWindow(e, previewWindow));
	workWindow = createWindow(600, 1024, false, mainWindow);
	workWindow.loadFile('static/worker.html');
	workWindow.on('close', e => hideWindow(e, workWindow));
}
	
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindows)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindows()
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
