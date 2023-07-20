/*=============================================================================
 preload.js
----------------------------------------------------------------------------
 Version
 1.1.0 2023/06/01 Electron v20.3.9およびコアスクリプトv1.6.0に対応
 1.0.0 2022/02/20 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

const { contextBridge, ipcRenderer } = require('electron')

process.once('loaded', () => {
    contextBridge.exposeInMainWorld('electronAPI', {
        optionValid: () => ipcRenderer.invoke('option-valid'),
        optionValidReply: callBack => ipcRenderer.on('option-valid-reply', callBack),
        openDevTools: () => ipcRenderer.invoke('open-dev-tools'),
        fullScreen: value => ipcRenderer.invoke('full-screen', value),
        reloadPage: () => ipcRenderer.invoke('reload-page')
    });
});