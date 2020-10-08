const utils = require('util');
const { ipcRenderer } = require('electron');

function inspect(data) {
    return utils.inspect(data, { depth: 3 });
}

function sendIPC(name, data) {
    ipcRenderer.send(name, data);
}

async function invokeIPC(name, data) {
    return ipcRenderer.invoke(name, data);
}

module.exports = { inspect, sendIPC, invokeIPC };
