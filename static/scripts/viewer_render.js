const path = require('path'); // needed for some bits of resolution, I think...
const con = require('console');

function viewPDF(filename) {
    let path = window.path.resolve(window.dirpath, '../pdfjs/web/viewer.html');
    let target = encodeURI(`file://${path}?file=${filename}`);
    let ele = document.getElementById('viewer');
    ele.innerHTML = ''; // destroy the old instance of PDF.js (if it exists)
    // Create an iframe that points to our PDF.js viewer, and tell PDF.js to open the file that was selected from the file picker.
    const iframe = document.createElement('iframe');
    iframe.src = target;
    // Add the iframe to our UI.
    ele.appendChild(iframe);

}

window.addEventListener("DOMContentLoaded", () => {
    let params = new URLSearchParams(window.location.search);
    let name = params.get('file');
    viewPDF(name);
});
