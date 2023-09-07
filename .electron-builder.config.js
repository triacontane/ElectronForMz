/*=============================================================================
 .electron-builder.config.js
----------------------------------------------------------------------------
 Doc : https://www.electron.build/configuration/configuration
----------------------------------------------------------------------------
 Version
 1.2.0 2023/07/23 Mac対応と全体的な見直しを行いました。
 1.0.0 2019/05/28 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

module.exports = async function () {
    return {
        appId: 'com.rpgmaker.game',
        asar: true,
        afterPack: './scripts/myAfterPackHook.js',
        directories: {
            output: 'dist'
        },

        win: {
            target: 'zip',
            icon: 'project/icon/icon-electron.png'
        },
        mac: {
            target: 'dmg',
            category: 'Games',
            icon: 'project/icon/icon-electron-mac.png'
        },
        linux: {
            target: 'AppImage',
            category: 'Game',
            icon: 'project/icon/icon-electron.png'
        }
    };
};
