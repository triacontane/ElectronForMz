こんにちは！
NW.jsで動作しているRPGツクールMZですが、ちょっと事情があってエンジンをElectronに移行できないかを調査、検討してみました。
結果、思ったよりも簡単だったので過程と成果物を共有します。

## Electronとは
Electronとは、NW.jsと同様にクロスプラットフォームで動作するデスクトップアプリケーションのフレームワークです。
NW.jsと比べて以下のメリットがあります。

- 将来的に見て安心(NW.jsには今後OSのアップデートに付いていけるか不安。特にMac)
- パッケージングやインストーラを使ったデプロイメントが可能(electron-builderを使用)

## 対象読者
- Node.jsのインストールとnpmコマンドが実行できるひと
- フロント開発用のエディタ（VSCode等）を使ったことがあるひと

## 動作確認バージョン
- OS Windows11
- Node.js v18.16.0
- npm v9.5.1
- Electron v25.3.0
- electron-builder v24.4.0
- RPGツクールMZ コアスクリプト v1.7.0

## 準備
まず、Electronの動作環境を整える必要があります。今回は私が調査用に作成したプロジェクトをもとに解説します。以後、本プロジェクトと呼称します。

### リポジトリのチェックアウト
<https://github.com/triacontane/ElectronForMz.git>

以後のコマンドはすべてチェックアウトしたディレクトリで行います。

### Node.jsのダウンロードとインストール
下記のサイトに従って推奨版をダウンロード、インストールします。

<https://nodejs.org/ja/download/>

### Electronのインストール
package.jsonに記載されたバージョンでよければ `npm -install` でもOKです。  
`npm install -D electron`

### electron-builderのインストール
package.jsonに記載されたバージョンでよければ `npm -install` でもOKです。  
`npm install -D electron-builder`

### RPGツクールMZのプロジェクトをコピー
本リポジトリの`project`配下にRPGツクールMZのプロジェクトをコピーします。

### プラグインの有効化
RPGツクールMZ本体から本リポジトリ同梱プラグイン`ElectronForMz.js`を有効化します。

<https://github.com/triacontane/ElectronForMz/blob/main/project/js/plugins/ElectronForMz.js>

## 実行
とりあえず動かしてみるだけなら解説は不要なので、まずやり方だけ共有します。

### 通常起動
`npm run start`

### テストプレー
`npm run test`

### テストプレー(開発ツール起動)
`npm run debug`

### デプロイメント
`npm run deploy`

## 本プロジェクトの詳細解説
### main.js
メインプロセスで動作するエントリポイントです。ElectronはNW.jsと異なり、メインプロセスとレンダラープロセスに分かれて動作しますが、本プロジェクトでは従来のRPGツクールMZのコアスクリプトはすべてレンダラープロセスで動かしています。

<https://github.com/triacontane/ElectronForMz/blob/main/main.js>

```main.js
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
```
開発時にのみ表示される警告を消します。

``` main.js
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
```
`width`および`height`は画面サイズです。ゲーム中で指定している画面サイズに合わせて指定します。

`nodeIntegration`はレンダラープロセスでNode.jsの機能を使用可能にするオプションです。
`false`にすることで`Utils.isNwjs`が`false`を返します。この関数で判定した分岐のなかにはNW.js特有の記述があることが多いので無効にします。

`icon`はアイコンファイルのパスです。特に問題が無ければプロジェクト配下のものを指定すればOKです。

``` main.js
const indexURL = format({
    protocol: 'file',
    slashes: true,
    pathname: join(app.getAppPath(), 'project', 'index.html')
});

await browserWindow.loadURL(indexURL);
```
設定を定義したら、レンダラープロセスをプロジェクト配下の`index.html`を指定して起動します。

``` main.js
Menu.setApplicationMenu(null);
```
メニューバーを設定します。RPGツクールMZではもともとメニューバーを表示していないので明示的にnullを指定しています。
コメントアウトするとElectronのデフォルトメニューバーが表示されます。自分で作り込んだものを指定すれば便利なデバッグツールになるかもしれません。

``` main.js
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
    browserWindow.webContents.reloadIgnoringCache();
});
```
レンダラープロセスからの要求で引数の返却と開発者ツールの立ち上げを行います。
また、プラグインでプロセス間通信を使用するサンプルとして、強制的にフルスクリーン化する処理も定義しています。

プロセス間通信については、Electronのやや技術的な話になるのでここでは割愛します。必要に応じてドキュメントをご参照ください。
https://www.electronjs.org/ja/docs/latest/tutorial/ipc

### preload.js
レンダラープロセスでNode.jsを禁止したので、必要なAPIだけをレンダラープロセスから参照可能にするためのコードです。グローバル変数`electronAPI`に格納しているのでご注意ください。
<https://github.com/triacontane/ElectronForMz/blob/main/preload.js>

```preload.js
process.once('loaded', () => {
    contextBridge.exposeInMainWorld('electronAPI', {
        optionValid: () => ipcRenderer.invoke('option-valid'),
        optionValidReply: callBack => ipcRenderer.on('option-valid-reply', callBack),
        openDevTools: () => ipcRenderer.invoke('open-dev-tools'),
        fullScreen: value => ipcRenderer.invoke('full-screen', value),
        reloadPage: () => ipcRenderer.invoke('reload-page')
    });
});
```
レンダラープロセスから`electronAPI`を通じて定義したAPIを呼べるようになります。

### ElectronForMz.js

ElectronでRPGツクールMZを動かすために、MZ側で有効にする必要があるプラグインです。本プロジェクトの中核になるはずでしたが、思ったほど必要な記述はなかったです。

<https://github.com/triacontane/ElectronForMz/blob/main/project/js/plugins/ElectronForMz.js>

```ElectronForMz.js
Utils.isElectron = function () {
    return !!window.electronAPI;
}

if (!Utils.isElectron()) {
    return;
}
```
Electron経由の起動かどうかの判定処理をUtilsに追加しています。
そして、Electron以外からの起動ではプラグインを無効化します。`electronAPI`は`preload.js`で定義しています。

```ElectronForMz.js
window.electronAPI.optionValid();
window.electronAPI.optionValidReply((event, arg) => {
    options = arg;
});
```
メインプロセスから引数を引っ張ってきます。NW.js用のパラメータが使えないのでその代わりです。
メインプロセスの`optionValid`を呼んで、呼び出し先から`optionValidReply`が逆に呼ばれます。

```ElectronForMz.js
const _SceneManager_reloadGame = SceneManager.reloadGame;
SceneManager.reloadGame = function () {
    if (Utils.isElectron()) {
        window.electronAPI.reloadPage();
    } else {
        _SceneManager_reloadGame.apply(this, arguments);
    }
};
```
F5キー等でゲームをリロードする場合の処理は、Electron専用の処理が必要になります。

```ElectronForMz.js
const _SceneManager_showDevTools = SceneManager.showDevTools;
SceneManager.showDevTools = function() {
    _SceneManager_showDevTools.apply(this, arguments);
    if (Utils.isOptionValid('test')) {
        window.electronAPI.openDevTools();
    }
};
```
メインプロセスを呼んで開発者ツールを立ち上げてもらいます。

```ElectronForMz.js
const _SceneManager_terminate = SceneManager.terminate;
SceneManager.terminate = function() {
    if (Utils.isElectron()) {
        window.close();
    } else {
        _SceneManager_terminate.apply(this, arguments);
    }
};
```
シャットダウン時にElectron経由の起動であればwindowを閉じます。
RPGツクールMZ コアスクリプトのアップデートにより本記述が必要になりました。

必要な記述はこれだけでした。RPGツクールMZのコアスクリプトは、意外とNW.jsに対する依存度が低いようです。

### .electron-builder.config.js
ビルドするためのファイルです。

<https://github.com/triacontane/ElectronForMz/blob/main/.electron-builder.config.js>

```.electron-builder.config.js
appId: 'com.rpgmaker.game',
asar: true,
afterPack: './scripts/myAfterPackHook.js',
directories: {
    output: 'dist'
},

win: {
    target: 'zip',
    icon: 'icon-win.png'
},
mac: {
    target: 'dmg',
    category: 'Games',
    icon: 'icon-mac.png'
},
linux: {
    target: 'AppImage',
    category: 'Game',
    icon: 'icon-win.png'
}
```
`win`, `mac`, `linux`はそれぞれのプラットフォーム向けの設定です。  
`icon`はアプリケーションやインストーラのアイコンに使われる画像です。256*256で用意します。icoファイルでもOKです。  
`target`はデプロイメント方法です。`zip`は文字通りzipファイルを作成します。プラットフォームごとに様々な設定がありWindows向けだと`nsis`でインストーラ付きでデプロイメントできます。  
`asar`はデプロイメント時にパッケージングする設定です。有効にすると各種リソースが`app.asar`というファイルにまとめられます。暗号化ではないので絶対ではないですが、中身が見られにくくなります。  
`output`は出力ディレクトリです。`dist`にすると`dist/win-unpacked`にWindows向けの未パッケージングファイル一式が出力されます。  
`afterPack`はパッケージング後に実行するスクリプトです。`scripts/myAfterPackHook.js`に記述しています。  

詳細設定はドキュメントをご参照ください。

<https://www.electron.build/configuration/configuration>

## プラグインとの連携
プラグイン側でElectronForMZと連携するサンプルです。

例では『フルスクリーン起動プラグイン』を使っています。

このプラグインは、ゲーム起動時に自動でフルスクリーン化できるプラグインですが、レンダラープロセスでは通常、強制的なフルスクリーン制御は機能しません。キー押下などユーザの能動的なアクションが起点になる必要があります。

そこでプロセス間通信を使ってメインプロセスにフルスクリーン化の処理を定義し呼び出すように変更しています。

<https://github.com/triacontane/ElectronForMz/blob/main/project/js/plugins/StartUpFullScreen.js>

```StartUpFullScreen.js
const _Graphics__requestFullScreen = Graphics._requestFullScreen;
Graphics._requestFullScreen = function() {
    if (Utils.isElectron()) {
        window.electronAPI.fullScreen(true);
        this._fullScreenForElectron = true;
    } else {
        _Graphics__requestFullScreen.apply(this, arguments);
    }
};

const _Graphics__cancelFullScreen = Graphics._cancelFullScreen;
Graphics._cancelFullScreen = function() {
    if (Utils.isElectron()) {
        window.electronAPI.fullScreen(false);
        this._fullScreenForElectron = false;
    } else {
        _Graphics__cancelFullScreen.apply(this, arguments);
    }
};

const _Graphics__isFullScreen = Graphics._isFullScreen;
Graphics._isFullScreen = function() {
    if (Utils.isElectron()) {
        return this._fullScreenForElectron;
    } else {
        return _Graphics__isFullScreen.apply(this, arguments);
    }
};

const _Graphics__defaultStretchMode = Graphics._defaultStretchMode;
Graphics._defaultStretchMode = function() {
    if (Utils.isElectron()) {
        return true;
    } else {
        return _Graphics__defaultStretchMode.apply(this, arguments);
    }
};
```

## CI/CDの導入
以下で解説します。  
<https://github.com/triacontane/ElectronForMz/blob/main/README_CICD.md>

## おわりに
今回の調査で（Node.jsの初歩的な知見があれば）わりと簡単にElectronでのデプロイメントまで出来てしまうことが分かったので、今後はソフトウェアエンジニア以外でも気軽にデプロイメントできるようやり方を考えていきたいと思います。

## 参考資料
<https://www.electronjs.org/ja/docs/latest/>  
<https://qiita.com/saki-engineering/items/203892838e15b3dbd300>
