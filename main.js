/*=============================================================================
 main.js
----------------------------------------------------------------------------
 Version
 1.1.0 2023/06/01 Electron v20.3.9およびコアスクリプトv1.6.0に対応
 1.0.0 2022/02/20 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

let mainWindow = null;

(()=> {
    'use strict';

    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
    const {app, BrowserWindow, Menu, ipcMain} = require('electron');
    const processArgv = process.argv[2] || '';

    /**
     * createWindow
     * メインウィンドウを生成します。
     */
    function createWindow() {
        mainWindow = new BrowserWindow({
            width         : 816,
            height        : 624,
            useContentSize: true,
            webPreferences: {
                nodeIntegration: false,
                preload: __dirname + '/preload.js'
            },
            icon : __dirname + '/project/icon/icon.png'
        });
        mainWindow.loadFile('project/index.html');
        mainWindow.on('closed', () => {
            mainWindow = null;
        });
        Menu.setApplicationMenu(null);
        if (processArgv.includes('debug')) {
            mainWindow.webContents.openDevTools();
        }
    }
    app.on('ready', createWindow);

    ipcMain.handle('option-valid', event => {
        mainWindow.webContents.send('option-valid-reply', processArgv);
    });
    ipcMain.handle('open-dev-tools', event => {
        mainWindow.webContents.openDevTools();
    });
    ipcMain.handle('full-screen', (event, value) => {
        mainWindow.setFullScreen(value);
    });
})();
