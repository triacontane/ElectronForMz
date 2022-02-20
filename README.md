# Electron for MZ
Electron for MZは、RPGツクールMZをElectron上で開発、テスト、デプロイメントするための補助ツールです。現在はWindowsのみをサポートしています。
Macは動作、検証環境がないのでサポートしていませんが、原理的には対応は容易なはずなので有志に期待しましょう。

## Electronとは
Electronとは、NW.jsと同様にクロスプラットフォームで動作するデスクトップアプリケーションのフレームワークです。
NW.jsと比べて以下のメリットがあります。

- 将来的に見て安心(NW.jsには今後OSのアップデートに付いていけるか不安。特にMac)
- パッケージングやインストーラを使ったデプロイメントが可能(electron-builderを使用)
- 本体v1.4.3時点で発生しているNW.jsのプロセスが終了後も残り続けてしまう問題を回避できる

## 対象読者
- Node.jsのインストールとnpmコマンドが実行できるひと
- フロント開発用のエディタ（VSCode等）を使ったことがあるひと

## 動作確認バージョン
- OS Windows10
- Node.js v16.14.0
- npm v8.3.1
- Electron v5.0.13
- electron-builder v20.44.4

## 準備
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
本プロジェクトの`project`配下にRPGツクールMZのプロジェクトをコピーします。

### プラグインの有効化
RPGツクールMZ本体から本プロジェクト同梱プラグイン`ElectronForMz.js`を有効化します。  
<https://github.com/triacontane/ElectronForMz/blob/main/project/js/plugins/ElectronForMz.js>

## 実行
### 通常起動
`npm start`

### テストプレー
`npm test`

### テストプレー(開発ツール起動)
`npm debug`

## デプロイメント
指定したパスにデプロイメントします。パスを省略するとdistフォルダ配下に作成されます。  
`node build-win.js C:\deploy/test`

## 本プロジェクトの詳細解説
### main.js
メインプロセスで動作するエントリポイントです。
<https://github.com/triacontane/ElectronForMz/blob/main/main.js>

```main.js
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
```
開発時にのみ表示される警告を消します。

``` main.js
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
```
`width`および`height`は画面サイズです。ゲーム中で指定している画面サイズに合わせて指定します。
`nodeIntegration`はレンダラープロセス（RPGツクールMZ自体が動作するプロセス）でNode.jsの機能を使用可能にするオプションです。  
`false`にすることで`Utils.isNwjs`が`false`を返します。この関数で判定した分岐のなかにはNW.js特有の記述があることが多いので無効にします。
`icon`はアイコンファイルのパスです。特に問題が無ければプロジェクト配下のものを指定すればOKです。  
設定を定義したら、最後にレンダラープロセスとしてプロジェクト配下の`index.html`を起動します。  

``` main.js
Menu.setApplicationMenu(null);
```
メニューバーを設定します。RPGツクールMZではもともとメニューバーを表示していないので明示的にnullを指定しています。  
コメントアウトするとElectronのデフォルトメニューバーが表示されます。自分で作り込んだものを指定すれば便利なデバッグツールになるかもしれません。

``` main.js
ipcMain.on('option-valid', event => {
    event.reply('option-valid-reply', processArgv);
});
ipcMain.on('open-dev-tools', event => {
    mainWindow.webContents.openDevTools();
});
```
レンダラープロセスからの要求で引数の返却と開発者ツールの立ち上げを行います。

### preload.js
レンダラープロセスでNode.jsを禁止したので、必要なAPIだけをレンダラープロセスから参照可能にするためのコードです。グローバル変数`$electronModules`に格納しているのでご注意ください。
<https://github.com/triacontane/ElectronForMz/blob/main/preload.js>

```preload.js
process.once('loaded', () => {
    global.$electronModules = {};
    global.$electronModules.ipcRenderer = electron.ipcRenderer;
});
```
レンダラープロセスからElectronAPIの`ipcRenderer`を使用可能にします。

### ElectronForMz.js

ElectronでRPGツクールMZを動かすために、MZ側で有効にする必要があるプラグインです。本プロジェクトの中核になるはずでしたが、思ったほど必要な記述はなかったです。

<https://github.com/triacontane/ElectronForMz/blob/main/project/js/plugins/ElectronForMz.js>

```ElectronForMz.js
if (typeof $electronModules === 'undefined') {
    return;
}
```
ブラウザ経由の起動の場合はプラグインを無効化します。`$electronModules`は`preload.js`で定義しています。

```ElectronForMz.js
const ipcRenderer = $electronModules.ipcRenderer;
let options = '';
ipcRenderer.on('option-valid-reply', (event, arg) => {
    options = arg;
});
ipcRenderer.send('option-valid');
```
メインプロセスから引数を引っ張ってきます。NW.js用のパラメータが使えないのでその代わりです。

```ElectronForMz.js
const _SceneManager_showDevTools = SceneManager.showDevTools;
SceneManager.showDevTools = function() {
    _SceneManager_showDevTools.apply(this, arguments);
    if (Utils.isOptionValid('test')) {
        ipcRenderer.send('open-dev-tools');
    }
};
```
メインプロセスを呼んで開発者ツールを立ち上げてもらいます。  

必要な記述はこれだけでした。RPGツクールMZのコアスクリプトは、意外とNW.jsに対する依存度が低いようです。

### build-win.js
Windows向けにビルドするためのファイルです。
<https://github.com/triacontane/ElectronForMz/blob/main/build-win.js>

```build-win.js
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
```
`icon`はアプリケーションやインストーラのアイコンに使われる画像です。256*256で用意します。icoファイルでもOKです。  
`target`はデプロイメント方法です。`zip`は文字通りzipファイルを作成します。プラットフォームごとに様々な設定がありWindows向けだと`nsis`でインストーラ付きでデプロイメントできます。
`asar`はデプロイメント時にパッケージングする設定です。暗号化ではないので絶対ではないですが、中身が見られにくくなります。

詳細設定はドキュメントをご参照ください。
<https://www.electron.build/configuration/configuration>

## 参考資料
<https://qiita.com/saki-engineering/items/203892838e15b3dbd300>
