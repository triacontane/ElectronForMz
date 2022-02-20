/*=============================================================================
 main.js
----------------------------------------------------------------------------
 https://electronjs.org/docs/tutorial/first-app
----------------------------------------------------------------------------
 Version
 1.0.0 2018/07/19 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

let mainWindow = null;

(function() {
    'use strict';
    const {app, BrowserWindow, Menu} = require('electron');

    /**
     * createWindow
     * メインウィンドウを生成します。
     */
    function createWindow() {
        const path = require('path');
        const base = path.dirname(process.mainModule.filename);
        const iconPath = path.join(base, 'icon.png');
        const debug = process.argv.includes('debug');

        mainWindow = new BrowserWindow({
            title         : '',
            width         : debug ? 1057 : 816,
            height        : 624,
            useContentSize: true,
            webPreferences: {nodeIntegration: true},
            icon : iconPath
        });
        mainWindow.loadFile('index.html');
        if (debug) {
            mainWindow.webContents.openDevTools();
        }
        mainWindow.on('closed', () => {
            mainWindow = null;
        });
        const menu = Menu.buildFromTemplate([]);
        Menu.setApplicationMenu(menu);
    }

    app.on('ready', createWindow);

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', function() {
        if (mainWindow === null) {
            createWindow();
        }
    });
})();
