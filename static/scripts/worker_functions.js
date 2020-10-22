const { ipcRenderer } = require('electron')
const path = require('path');

ipcRenderer.on(`worker-show-data`, (e, data) => {
	displayData(data);
});

ipcRenderer.on(`show-spinner`, (e) => {
	$('#fade-wrapper').show();
});
	
ipcRenderer.on(`hide-spinner`, (e) => {
	$('#fade-wrapper').hide();
});

var files = [];

$(document).ready( () => {
	let dd = $('#data_display');
	let ch = $('#fade-wrapper > div.sk-chase');
	ch.offset( { top: ((dd.height()/2) - (ch.height()/2)) + 37, left: ((dd.width()/2) - (ch.width()/2)) } )
	$('#quit-button').on('click', () => ipcRenderer.sendSync('quit-app') );
	$('#preview-button').on('click', () => ipcRenderer.send('preview-merged', files ) );
	$('#save-button').on('click', () => ipcRenderer.sendSync('save-file', files) );
	$('#merge-button').on('click', () => ipcRenderer.sendSync('merge-files', files) );
	$('#fade-wrapper').hide();
});

function makeCell(contents, classes) {
	let classlist = "no-cell-borders";
	if (classes)
		classes.forEach( classname => classlist = `${classlist} ${classname}` );
	
	let cell = $(`<td class="${classlist}"></td>`);
	cell.append(contents);
	return cell;
}

function makeSize(filesize, mark) {
	let marks = [ 'Bytes', 'KiB', 'MiB', 'GiB', 'TiB', '???' ];
	
	if (filesize > 1024) return makeSize(filesize/1024, ++mark);
	else {
		let sz = filesize.toFixed(2).toString().padStart(6, " ");
		let sp = marks[mark > marks.length?5:mark].padEnd(5, " ");
		return `${sz} ${sp}`;
	}
}

function makeRow(filedata) {
	let row         = $('<tr class="list-item"></tr>');
	let btn         = $(`<button type=button class="view-file-btn tooltip"><span class="tooltiptext">View ${path.basename(filedata.path)}</span><image class="view-button" src="images/search.svg"/></button>`);
	let size_cell   = makeCell(makeSize(filedata.size, 0));
	
	btn.on('click', (event) => { window.viewFile(path.resolve(filedata.path)); event.preventDefault(); });
	
	row.append(makeCell(btn, [ 'view-button-cell' ]));
	row.append(makeCell(filedata.path, [ 'name-cell' ]));
	row.append(makeCell(makeSize(filedata.size, 0), [ 'size-cell' ]));
	
	return row;
}

function makeTableData(file_list) {
	var rv = [];
	
	file_list.filter( (file) => file.type === 'application/pdf' ).forEach( (file) => {
		rv.push(makeRow(file));
		files.push(file.path);
	});
	
	return rv;
}

function displayData(data) {
	let table_body = $('#data_display > table.file-list > tbody');
	table_body.text('');
	if (data.isFirst) files = [];

	makeTableData(data.data).forEach( row => table_body.append(row) )
}
