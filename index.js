const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const tmp = require('tmp-promise');

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
            nodeIntegration: true,
			worldSafeExecuteJavaScript: true
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
	//mainWindow.webContents.openDevTools();
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
	previewWindow = createWindow(1024, 768, false, mainWindow);
	//previewWindow.webContents.openDevTools();
	previewWindow.loadFile('static/viewer.html');
	previewWindow.on('close', e => hideWindow(e, previewWindow));
	workWindow = createWindow(800, 600, false, mainWindow);
	workWindow.webContents.openDevTools();
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

var lastFiles = [];
var lastFile = "";
var lastData = Buffer.from("");

async function mergePDFs(sourcePDFs) {
	if (sourcePDFs.filter( item => !lastFiles.includes(item) ).length == 0 && sourcePDFs.length == lastFiles.length) return lastData;
	
    if (sourcePDFs.length == 0) {
        return Buffer.from("");
    } else  if (sourcePDFs.length == 1) {
        return fs.readFileSync(sourcePDFs[0]);
    } else {
        let doc = await PDFDocument.create();

		lastFiles = []; // clear it
        for( src of sourcePDFs ) {
			lastFiles.push(src);
            const data = await PDFDocument.load(fs.readFileSync(src));
            const contentPages = await doc.copyPages(data, data.getPageIndices());

            for (const page of contentPages) {
                doc.addPage( page );
            }
        }

        return doc.save();
    }
}

ipcMain.on(`view-file`, (e, args) => {
    console.log(require('util').inspect(args, { depth: 3 }));
	previewWindow.show();
	previewWindow.webContents.send(`viewer-show-file`, args);
});

ipcMain.on(`show-worker`, (e, args) => {
	workWindow.show();
	workWindow.webContents.send(`worker-show-data`, args);
});

ipcMain.on(`preview-merged`, (e, args) => {
	workWindow.webContents.send('show-spinner');
	mergePDFs(args).then(pdf => {
		if (lastFile != "" && pdf == lastData) {
			previewWindow.webContents.send(`viewer-show-file`, lastFile); 
			previewWindow.show(); 
		} else {
			lastData = pdf;
			tmp.file().then( f => {
				lastFile = f.path;
				fs.writeFileSync(f.path, pdf);
				previewWindow.webContents.send(`viewer-show-file`, f.path); 
				previewWindow.show(); 
			});
		}
		workWindow.webContents.send('hide-spinner');
	});
});
