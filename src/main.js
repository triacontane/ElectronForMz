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

let mainWindow = null;

(() => {
    'use strict';
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
    const {app, BrowserWindow, Menu, ipcMain, shell} = require('electron');
    const {join} = require('path');
    const {format} = require('url');
    const processArgv = process.argv[2] ?? '';
    const project = require('../project/package.json').window;
    const isMac = process.platform === 'darwin';

    /**
     * This code ensures that the window creation process occurs once the Electron app
     * is fully initialized and ready to handle windows and events.
     */
    app.whenReady()
        .then(restoreOrCreateWindow) // Call the restoreOrCreateWindow function to create or restore the window.
        .catch(e => console.error('Failed to create window:', e)); // Handle any errors that may occur during window creation.

    /**
     * Asynchronous function to create the application's main window.
     */
    async function createWindow() {
        // Create a new BrowserWindow instance with specified properties.
        mainWindow = new BrowserWindow({
            width: project.width, // Set the width of the window based on the project package.json.
            height: project.height, // Set the height of the window based on the project package.json.
            show: false, // Do not show the window immediately, wait for ready-to-show event.
            useContentSize: true, // Use content size instead of window size.
            webPreferences: {
                nodeIntegration: false, // Disable Node.js integration in the renderer process.
                contextIsolation: true, // Enable context isolation for improved security.
                sandbox: false, // Disable the sandbox for web content.
                disableContextMenu: true, // Disable the context menu.
                preload: join(app.getAppPath(), 'src/preload.js') // Load a script before web content.
            },
            icon: join(app.getAppPath(), 'project/icon/icon.png') // Set the application icon.
        });

        // Set the application menu to null, disabling the default menu.
        Menu.setApplicationMenu(null);

        // Show the window when it's ready.
        mainWindow?.once('ready-to-show', () => {
            mainWindow?.show(); // Display the mainWindow.

            // Open DevTools in detached mode and focus the window if in debug mode.
            if (processArgv.includes('debug')) {
                mainWindow?.webContents.openDevTools({mode: 'detach'});
                mainWindow?.webContents.once('devtools-opened', () => {
                    mainWindow?.focus(); // Focus the mainWindow after DevTools are opened.
                });
            }
        });

        // Define a handler for opening external links in the default browser instead of opening it as a new Electron window.
        mainWindow?.webContents.setWindowOpenHandler(details => {
            shell.openExternal(details.url); // Open the link in the default browser.
            return {action: 'deny'}; // Deny opening the link as a new Electron window.
        });

        // Load the main HTML file from the project directory.
        await mainWindow.loadURL(
            format({
                protocol: 'file',
                slashes: true,
                pathname: join(app.getAppPath(), 'project/index.html')
            })
        );

        return mainWindow; // Return the created mainWindow instance.
    }

    /**
     * Asynchronous function to restore an existing mainWindow or create a new one if none exists.
     */
    async function restoreOrCreateWindow() {
        // Attempt to find any existing mainWindow that is not destroyed.
        let mainWindow = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

        // If no existing mainWindow is found, create a new one.
        if (!mainWindow) {
            mainWindow = await createWindow(); // Create a new mainWindow.
        }

        // If the mainWindow was minimized, restore it to its previous state.
        if (mainWindow.isMinimized()) {
            mainWindow.restore(); // Restore the mainWindow if it was minimized.
        }

        mainWindow.focus(); // Bring the mainWindow to the foreground and focus on it.
    }

    /**
     * Prevent electron from running multiple instances.
     */

    // Attempt to acquire a lock for a single instance of the application.
    const isSingleInstance = app.requestSingleInstanceLock();

    // If the lock is not acquired (another instance is already running), quit this instance.
    if (!isSingleInstance) {
        app.quit(); // Close the current application instance.
        process.exit(0); // Terminate the Node.js process.
    }

    // Handle the event when a second instance is detected.
    app.on('second-instance', restoreOrCreateWindow);

    /**
     * Shout down background process if all windows was closed
     */
    // This event handler listens for the 'window-all-closed' event, which is emitted when all application windows are closed.
    app.on('window-all-closed', () => {
        // Check if the platform is not macOS.
        // On macOS, it's common for applications to remain active even if all windows are closed.
        if (!isMac) {
            // If the platform is not macOS, quit the application using the app.quit() method.
            app.quit();
        }
    });

    // Check if the current environment is macOS
    if (isMac) {
        // Listen for the 'activate' event, which occurs when the app is clicked in the dock
        app.on('activate', () => {
            // Check if there are no open windows
            if (BrowserWindow.getAllWindows().length === 0) {
                // If no windows are open, restore the previous window or create a new one
                restoreOrCreateWindow();
            }
        });

        // Set up the macOS-specific menu for the app
        setupMacOSMenu();
    }

    /**
     * Creates a custom Mac OS menu for the application.
     */
    function setupMacOSMenu() {
        // Define the template for the macOS menu
        const macMenuTemplate = [
            {
                label: app.name,
                submenu: [
                    {role: 'about'},
                    {type: 'separator'},
                    {role: 'hide'},
                    {role: 'unhide'},
                    {type: 'separator'},
                    {role: 'quit'}
                ]
            }
        ];

        // Build the custom application menu for macOS using the template
        const macAppMenu = Menu.buildFromTemplate(macMenuTemplate);

        // Set the custom application menu for macOS
        Menu.setApplicationMenu(macAppMenu);
    }

    ipcMain.handle('option-valid', event => {
        mainWindow.webContents.send('option-valid-reply', processArgv);
    });

    ipcMain.handle('open-dev-tools', event => {
        mainWindow.webContents.openDevTools();
    });

    ipcMain.handle('full-screen', (event, value) => {
        mainWindow.setFullScreen(value);
    });

    ipcMain.handle('reload-page', event => {
        mainWindow.webContents.reloadIgnoringCache();
    });
})();
