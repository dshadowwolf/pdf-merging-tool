const { ipcRenderer } = require('electron')
const path = require('path');

ipcRenderer.on(`worker-show-data`, (e, data) => {
	displayData(data);
});

function displayData(data) {
	let t = "";

	let q = $('<ul class="file-list" id="listings"></ul>');
	
	for ( filename of data ) {
		let r = $(`<li class="file-list-item">${path.resolve(filename)}</li>`);
		r.on('click', () => window.viewFile(path.resolve(filename)));
		q.append(r);
	}
	
	$('#data_display').text('');
	$('#data_display').append(q);
}
