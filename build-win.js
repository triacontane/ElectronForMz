/*=============================================================================
 build-win.js
----------------------------------------------------------------------------
 https://electronjs.org/docs/tutorial/first-app
----------------------------------------------------------------------------
 Version
 1.0.0 2019/05/28 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

const builder = require('electron-builder');

['ja'].forEach(language => {
    builder.build({
        config: {
            appId: 'electron_for_mz',
            win: {
                icon: 'icon.png',
                target: {
                    target: 'nsis',
                    arch: ['x64', 'ia32']
                }
            },
            extraMetadata: {language: language},
            asar: true,
            directories: {
                output: `C:\\deploy\\electron_for_mz\\${language}\\`
            }
        }
    });
});
