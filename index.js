// imports
const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const tmp = require('tmp-promise');
const {PDFDocument } = require('pdf-lib');

// global data
var mainWindow;
var previewWindow;
var workWindow;

var lastFiles = [];
var lastFile = "";
var lastData = Buffer.from("");

const isWindows = process.platform === "win32";
const isLinux = process.platform === "linux";
const isMac = process.platform === "darwin";

// do this as early as possible
Menu.setApplicationMenu(false);

// helper functions
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
	//workWindow.webContents.openDevTools();
	workWindow.loadFile('static/worker.html');
	workWindow.on('close', e => hideWindow(e, workWindow));
}

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

async function maybeSaveTemp(data) {
	if (lastData != data) {
		switch(lastFile) {
			case "":
				return tmp.file().then( f => {
					lastFile = f.path;
					lastData = data;
					fs.writeFileSync(lastFile, data);
				});
			default:
				fs.writeFileSync(lastFile, data);
		}
	}
	return data;
}

// event handlers -- IPC
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
	mergePDFs(args).then(pdf => maybeSaveTemp(pdf)).then( (_) => {
		previewWindow.webContents.send(`viewer-show-file`, lastFile); 
		previewWindow.show(); 
		workWindow.webContents.send('hide-spinner');
	});
});

ipcMain.on(`save-file`, (e, args) => {
	let save_name = dialog.showSaveDialogSync(mainWindow, { title: 'Save Merged PDF', filters: [ { name: 'PDF Files', extensions: [ 'pdf' ] }, { name: 'All Files', extensions: [ '*' ] } ] });
	workWindow.webContents.send('show-spinner');
	mergePDFs(args).then(pdf => {
		if (lastFile != "" && pdf == lastData) {
			fs.copyFileSync(lastFile, save_name);
		} else {
			lastData = pdf;
			lastFile = save_name;
			fs.writeFileSync(save_name, pdf);
		}
		workWindow.webContents.send('hide-spinner');
	});
});
	
ipcMain.on(`merge-files`, (e, args) => {
	workWindow.webContents.send('show-spinner');
	mergePDFs(args).then(pdf => maybeSaveTemp(pdf)).then( (_) => workWindow.webContents.send('hide-spinner') );
});

ipcMain.on(`quit-app`, (e, args) => app.quit() );

ipcMain.on(`display-app-menu`, function(e, args) {
    if ((isWindows || isLinux) && mainWindow) {
        menu.popup({
            window: mainWindow,
            x: args.x,
            y: args.y
        });
    }
});

// event handlers -- application
app.whenReady().then(createWindows);

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindows()
    }
});

