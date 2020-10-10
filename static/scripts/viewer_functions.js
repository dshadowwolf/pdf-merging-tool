const { ipcRenderer } = require('electron');
const path = require('path');

$(document).ready( () => display(path.resolve(__dirname, "other/blank.pdf")) );

function display(pagename) {
	const elem = document.getElementById('data_display');
	const disp = document.createElement('iframe');
	elem.innerHTML = "";
	disp.src = `./pdfjs/web/viewer.html?file=${pagename}`
	elem.appendChild(disp);
}

ipcRenderer.on('viewer-show-file', (e, data) => display(data));