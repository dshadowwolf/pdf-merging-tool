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

    var data = [];

    for (const f of event.dataTransfer.files) { 
        // Using the path attribute to get absolute file path 
        data.push( { name: f.path, extension: getExtension(f.path) } );
    }
    console.log(window.inspectData(data));
    document.body.dispatchEvent(new CustomEvent('dataReady', { detail: data, bubbles: true, cancelable: false }));
});

document.addEventListener('dragover', (e) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
}); 

document.addEventListener('dragenter', (event) => { 
    console.log('File is in the Drop Space'); 
}); 

document.addEventListener('dragleave', (event) => { 
    console.log('File has left the Drop Space'); 
}); 

document.addEventListener('dataReady', (event) => {
    let fdata = event.detail;
    let doc = document.getElementById('data_display');
    doc.innerHtml = "";
    doc.innerText = "";
    let filtered = fdata.filter((item) => item.extension === 'pdf');
    let wrapper = document.createElement('ul');
    wrapper.className = 'file-list';
    for ( const item of filtered ) {
        let it = document.createElement('li');
        it.className = 'file-list-item';
        let txt = document.createTextNode(basename(item.name));
        it.appendChild(txt);
        //let name = encodeURIComponent(item.name);

        it.addEventListener('click',  (event) => {
            let p = window.path.resolve(window.dirpath, `../viewer.html`);
            window.open(encodeURI(`file://${p}?file=${item.name}`), '_blank', "preload=./scripts/preload.js, frame=yes, toolbar=no, menubar=no");
        });
        wrapper.appendChild(it);
    }
    window.sendLoadedFileList(filtered);
    doc.appendChild(wrapper);
});


