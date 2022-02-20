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

## 下準備
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

## 本リポジトリの詳細解説
### main.js



### 参考資料
<https://qiita.com/saki-engineering/items/203892838e15b3dbd300>
