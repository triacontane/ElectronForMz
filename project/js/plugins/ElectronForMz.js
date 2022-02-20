/*=============================================================================
 ElectronForMz.js
----------------------------------------------------------------------------
 (C)2022 Triacontane
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.0.0 2022/02/20 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

/*:
 * @plugindesc Electron開発支援プラグイン
 * @target MZ
 * @url https://github.com/triacontane/RPGMakerMV/tree/mz_master/ElectronForMz.js
 * @author トリアコンタン
 *
 * @help ElectronForMz.js
 *
 * RPGツクールMZをElectronで開発、デプロイメントするために
 * 必要なプラグインです。
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

(() => {
    'use strict';

    if (typeof $electronModules === 'undefined') {
        return;
    }

    const ipcRenderer = $electronModules.ipcRenderer;
    let options = '';
    ipcRenderer.on('option-valid-reply', (event, arg) => {
        options = arg;
    });
    ipcRenderer.send('option-valid');

    const _Utils_isOptionValid = Utils.isOptionValid;
    Utils.isOptionValid = function(name) {
        return _Utils_isOptionValid.apply(this, arguments) || options.split(',').includes(name);
    };

    const _SceneManager_showDevTools = SceneManager.showDevTools;
    SceneManager.showDevTools = function() {
        _SceneManager_showDevTools.apply(this, arguments);
        if (Utils.isOptionValid('test')) {
            ipcRenderer.send('open-dev-tools');
        }
    };
})();
