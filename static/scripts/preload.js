// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { remote } = require("electron");
const {
    getCurrentWindow,
    openMenu,
    minimizeWindow,
    maximizeWindow,
    unmaximizeWindow,
    maxUnmaxWindow,
    isWindowMaximized,
    closeWindow
} = require("./menu-functions");
const {
    inspect,
    sendIPC,
    invokeIPC
} = require("./aux-functions");
const path = require('path');
const con = require('console');

window.addEventListener("DOMContentLoaded", () => {
    window.getCurrentWindow = getCurrentWindow;
    window.openMenu = openMenu;
    window.minimizeWindow = minimizeWindow;
    window.maximizeWindow = maximizeWindow;
    window.unmaximizeWindow = unmaximizeWindow;
    window.maxUnmaxWindow = maxUnmaxWindow;
    window.isWindowMaximized = isWindowMaximized;
    window.closeWindow = closeWindow;
    window.inspectData = inspect;
    window.path = path;
    window.dirpath = __dirname;
    window.cons = con;
    window.newWindow = (url) => {
        con.log('newWindow');
        const BW = remote.BrowserWindow;
        const win = new BW({ height: 768, width: 1024 });
        if (url) {
            con.log(`with URL ${url}`);
            win.loadURL(url);
        }
    };
	window.showWorker = (data) => { 
	    var dts = [];
		for (const f of event.dataTransfer.files) { 
			dts.push( f.path );
		}
		sendIPC('show-worker', dts);
	};
	window.viewFile = (filename) => sendIPC('view-file', filename);
});