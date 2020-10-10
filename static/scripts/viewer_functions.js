$(document).ready( () => displayDefault("../../other/blank.pdf") );

function displayDefault(pagename) {
	const elem = document.getElementById('data_display');
	const disp = document.createElement('iframe');
	elem.innerHTML = "";
	disp.src = `./pdfjs/web/viewer.html?file=${pagename}`
	elem.appendChild(disp);
}
