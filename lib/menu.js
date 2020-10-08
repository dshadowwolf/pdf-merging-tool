const { app, Menu } = require("electron");

const isMac = process.platform === "darwin";

const template = [
    { label: "New Merged PDF", accelerator: 'CommandOrControl+N', click: (event) => console.log('not implemented - New')  },
    { label: "Save Merged PDF", accelerator: 'CommandOrControl+S', click: (event) => console.log('Save!') },
    { label: "Save Copy As...", accelerator: 'CommandOrControl+Shift+S', click: (event) => console.log('Save As!') },
    { type: 'separator' },
    isMac ? { role: "close" } : { role: "quit" }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

module.exports = {
  menu
};
