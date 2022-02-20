const electron = require('electron');

process.once('loaded', () => {
    global.$electronModules = {};
    global.$electronModules.ipcRenderer = electron.ipcRenderer;
});