/*=============================================================================
 build-win.js
----------------------------------------------------------------------------
 Doc : https://www.electron.build/configuration/configuration
----------------------------------------------------------------------------
 Version
 1.0.0 2019/05/28 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

const builder = require('electron-builder');
const outputPath = process.argv[2] || __dirname + '/dist';

builder.build({
    config: {
        appId: 'electron_for_mz',
        win: {
            icon: 'icon.png',
            target: {
                target: 'zip',
                arch: ['x64']
            }
        },
        asar: true,
        directories: {
            output: outputPath
        }
    }
});
