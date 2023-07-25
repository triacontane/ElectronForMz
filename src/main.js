/*=============================================================================
 main.js
----------------------------------------------------------------------------
 Version
 1.2.0 2023/07/23 Mac対応と全体的な見直しを行いました。
 1.1.0 2023/06/01 Electron v20.3.9およびコアスクリプトv1.6.0に対応
 1.0.0 2022/02/20 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

let browserWindow = null;

(() => {
    'use strict';

    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
    const {app, BrowserWindow, Menu, ipcMain, shell} = require('electron');
    const {join} = require('path');
    const {format} = require('url');
    const {platform} = require('node:process');
    const processArgv = process.argv[2] || '';

    /**
     * createWindow
     * メインウィンドウを生成します。
     */
    async function createWindow() {
        browserWindow = new BrowserWindow({
            width: 816,
            height: 624,
            show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
            useContentSize: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: false,
                preload: join(app.getAppPath(), 'src/preload.js')
            },
            icon: join(app.getAppPath(), 'project/icon/icon.png')
        });

        browserWindow.on('ready-to-show', () => {
            browserWindow?.show();
            if (processArgv.includes('debug')) {
                browserWindow?.webContents.openDevTools();
            }
        });

        // Open external link in the OS default browser instead of opening it as a new Electron window.
        browserWindow.webContents.setWindowOpenHandler(details => {
            shell.openExternal(details.url);
            return {action: 'deny'};
        });

        Menu.setApplicationMenu(null);

        const indexURL = format({
            protocol: 'file',
            slashes: true,
            pathname: join(app.getAppPath(), 'project', 'index.html')
        });

        await browserWindow.loadURL(indexURL);

        return browserWindow;
    }

    /**
     * Restore an existing BrowserWindow or Create a new BrowserWindow.
     */
    async function restoreOrCreateWindow() {
        let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

        if (window === undefined) {
            window = await createWindow();
        }

        if (window.isMinimized()) {
            window.restore();
        }

        window.focus();
    }

    /**
     * Prevent electron from running multiple instances.
     */
    const isSingleInstance = app.requestSingleInstanceLock();
    if (!isSingleInstance) {
        app.quit();
        process.exit(0);
    }
    app.on('second-instance', restoreOrCreateWindow);

    /**
     * Shout down background process if all windows was closed
     */
    app.on('window-all-closed', () => {
        if (platform !== 'darwin') {
            app.quit();
        }
    });

    /**
     * Create the application window when the background process is ready.
     */
    app.whenReady()
        .then(restoreOrCreateWindow)
        .catch(e => console.error('Failed create window:', e));

    ipcMain.handle('option-valid', event => {
        browserWindow.webContents.send('option-valid-reply', processArgv);
    });

    ipcMain.handle('open-dev-tools', event => {
        browserWindow.webContents.openDevTools();
    });

    ipcMain.handle('full-screen', (event, value) => {
        browserWindow.setFullScreen(value);
    });

    ipcMain.handle('reload-page', event => {
        browserWindow.webContents.reloadIgnoringCache();
    });
})();
