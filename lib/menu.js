const { app, Menu } = require("electron");

const isMac = process.platform === "darwin";

const template = [
  {
    label: "File",
      submenu: [
          { label: "New Merged PDF", accelerator: 'CommandOrControl+N'  },
          { label: "Save Merged PDF", accelerator: 'CommandOrControl+S' },
          { label: "Save Copy As...", accelerator: 'CommandOrControl+Shift+S' }
      ]
  },
  {
    label: "Window",
    submenu: [{ role: "minimize" }, { role: "zoom" }]
  },
    { type: 'separator' },
    isMac ? { role: "close" } : { role: "quit" }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

module.exports = {
  menu
};
