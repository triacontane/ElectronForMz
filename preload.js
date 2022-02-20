/*=============================================================================
 preload.js
----------------------------------------------------------------------------
 Version
 1.0.0 2022/02/20 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

const electron = require('electron');

process.once('loaded', () => {
    global.$electronModules = {};
    global.$electronModules.ipcRenderer = electron.ipcRenderer;
});