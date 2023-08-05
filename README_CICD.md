こんにちは！  
先日PRを頂いて、[ElectronForMz](https://github.com/triacontane/ElectronForMz)(以下本プロジェクト)にCI/CDの設定が追加されました。 本稿ではその内容と使い方を紹介します。

## 本プロジェクトのCI/CDの概要
### 利用技術
本プロジェクトのCI/CDは、GitHub Actionsを利用しています。 GitHub Actionsは、GitHub上で動作するCI/CDサービスです。 GitHub Actionsの詳細については、[公式ドキュメント](https://docs.github.com/ja/actions)を参照してください。

### ビルドされる内容とタイミング
mainブランチにコミットがあると、自動的にビルドが実行され、Window, Mac, Linux向けのパッケージングファイルが作成されます。 my-artifactという名前で、ビルドされたファイルがアップロードされます。

以下が実際の作成例です。  
<https://github.com/triacontane/ElectronForMz/actions/runs/5768736330>

### 活用方法
本プロジェクトをForkした環境下でRPGツクールMZのプロジェクトを作成すると、mainブランチにコミットするだけでElectronのパッケージングファイルを自動で作成してくれます。 バージョンごとの成果物を確実に残しておけるほか、複数の環境でのテストも簡単に行えます。 以下のようなケースに特にオススメです。

- Electronを使ったRPGツクールMZ作品をマルチプラットフォームで配布したい
- プロジェクトをGitHubで管理している or 管理したい
- 複数人で開発している(特にテスト工程)

### 前提条件
利用にあたり、以下の技術や知見が必要です。

- GitHubのアカウントを持っていて、トークンの生成など基本的な機能が使用できる
- プロジェクトをForkできる
- Node.jsの基本的な知識がある

## 利用手順
### プロジェクトをForkする
本プロジェクトをForkしてください。 Forkすると、自分のアカウントに本プロジェクトのコピーが作成されます。

### 開発者設定からトークンを生成する
1. 自分自身のアカウントのSettingsから、Developer settingsを開きます。
2. Personal access tokensを開き、Generate new tokenをクリックします。
3. Noteに任意の名前を入力します。例えば「ElectronForMz」など。
4. Expirationの項目は、任意の日付を選択します。
5. workflowの項目にチェックを入れます。
6. Generate tokenをクリックします。
7. 生成されたトークンをコピーします。
   ![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/103744/c70024f6-1670-cf7c-142b-4bd5dbb5a959.png)

### Forkしたプロジェクトにトークンを設定する
1. ForkしたプロジェクトのSettingsを開きます。
2. secrets and variables配下のActionsを開きます。
3. New repository secretをクリックします。
4. Nameに「SECRET」と入力します。
5. Valueに先ほどコピーしたトークンを入力します。
6. Add secretをクリックします。
   ![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/103744/75ba0d0a-4549-6bc6-cbb6-c6051e95ba45.png)

### mainブランチに変更をコミットする
あとは、mainブランチに変更をコミットするだけです。 project配下のファイルがバイナリファイルも含めてすべて必要になるので`.gitignore`を必要に応じて編集してください。

## ビルド設定の変更
ビルド設定は、`.github/workflows/release.yml`に記述されています。 設定を変更したい場合はこのファイルを編集してください。  
https://github.com/triacontane/ElectronForMz/blob/main/.github/workflows/release.yml