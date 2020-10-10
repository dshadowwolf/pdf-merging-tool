function getExtension(name) {
    let re = /.*\.(.+)$/;
    return re.exec(name)[1].toLowerCase();
}

function basename(path) {
    return path.replace(/.*\//, '');
}

function dirname(path) {
    return path.match(/.*\//);
}

document.addEventListener('drop', (event) => {
    event.preventDefault(); 
    event.stopPropagation(); 

	window.showWorker(event.dataTransfer.files);
});

document.addEventListener('dragover', (e) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
}); 

document.addEventListener('dragenter', (event) => { 
 //   console.log('File is in the Drop Space'); 
}); 

document.addEventListener('dragleave', (event) => { 
//    console.log('File has left the Drop Space'); 
}); 


