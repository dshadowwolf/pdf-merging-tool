const { ipcRenderer } = require('electron')
const path = require('path');

ipcRenderer.on(`worker-show-data`, (e, data) => {
	displayData(data);
});

function makeCell(contents) {
	var cell = $('<td></td>');
	cell.append(contents);
	return cell;
}

function makeRow(filedata) {
	var row = $('<tr class="list-item"></tr>');
	var button = $('<button type=button class="view-file-btn"><image class="view-button" src="images/magnifying-search-lenses-tool.svg"/></button>');
	button.on('click', (event) => { window.viewFile(path.resolve(filedata.path)); event.preventDefault(); });
	var button_row = $('<td class="view-button-cell"></td>');
	button_row.append(button);
	row.append(button_row);
	row.append(makeCell(filedata.path));
	row.append(makeCell(filedata.type));
	row.append(makeCell(`${filedata.size} bytes`));
	return row;
}

function makeTableData(file_list) {
	var rv = [];
	
	for ( file of file_list ) rv.push(makeRow(file));
	
	return rv;
}

function displayData(data) {
	let t = "";

	let q = $('#data_display > table.file-list > tbody');
	q.innerText = '';
	
	for ( row of makeTableData(data) ) {
		q.append(row);
	}
}
