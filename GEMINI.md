# プロジェクト要件: 今年の夏アイスギャラリー

## 1. プロジェクト概要

Google Photos上に作成した「アイス」アルバムの写真をInstagram風のギャラリー形式で表示し、写真をクリックするとメタデータ（撮影日時、説明、カメラモデル、画像サイズ）も合わせて表示するウェブサイト。GitHub Pagesで公開し、食べたアイスの総数もカウントして表示する。

## 2. アーキテクチャ

* **ホスティング:** GitHub Pages
    * 静的なHTML、CSS、JavaScriptファイルを提供。
* **フロントエンド:** HTML, CSS, JavaScript
    * **HTML:** サイトの構造とコンテンツを定義。
    * **CSS:** レスポンシブなギャラリーレイアウト（グリッド形式）と、詳細表示モーダルのスタイリング。
    * **JavaScript:**
        * Google Photos Library APIとの連携。
        * OAuth 2.0 (PKCE) 認証フローの実装。
        * 指定されたアルバムからの写真データ取得と動的なギャラリー生成。
        * 写真クリックイベントのハンドリング、詳細表示モーダルの制御。
        * 取得した写真のメタデータ表示。
        * 写真の総数カウント。
* **データソース:** Google Photos Library API
    * 特定のアルバム内のメディアアイテム（写真）の取得。
    * 写真のURL (`baseUrl`) とメタデータ (`description`, `creationTime`, `cameraModel`, `width`, `height`) の取得。
* **認証方式:** OAuth 2.0 Authorization Code Flow with PKCE
    * クライアントサイドJavaScriptでの認証処理。クライアントシークレットは非公開。
    * アクセストークンの安全な取得と利用。

## 3. 要件詳細

### 3.1. 機能要件

1.  **Google Photos認証:**
    * ユーザーはGoogleアカウントを通じて、本ウェブサイトが自身のGoogle Photosデータにアクセスすることを許可できること。
    * OAuth 2.0 Authorization Code Flow with PKCEに基づき、安全な認証プロセスを提供すること。
2.  **アルバムの指定と写真取得:**
    * 特定のGoogle PhotosアルバムのIDをJavaScriptコード内にハードコードし、そのアルバム内の写真をAPI経由で取得すること。
    * アルバム内のすべての写真データ（URL、メタデータ）を効率的に取得できること。
3.  **ギャラリー表示:**
    * 取得した写真を、Instagramのようなグリッド形式のギャラリーとして表示すること。
    * ギャラリーはレスポンシブデザインに対応し、様々なデバイス（PC、スマートフォンなど）で適切に表示されること。
4.  **写真詳細表示とメタデータ表示:**
    * ギャラリー内の写真をクリックすると、その写真が拡大表示されるモーダルウィンドウが開くこと。
    * 拡大表示された写真とともに、以下のメタデータが表示されること：
        * `description` (写真の説明)
        * `creationTime` (撮影日時)
        * `cameraModel` (カメラのモデル名)
        * `width` (画像の幅)
        * `height` (画像の高さ)
5.  **アイスの総数カウント:**
    * ギャラリーに表示されている写真の総数をカウントし、サイト上の分かりやすい場所に「食べたアイスの数：XX個」のように表示すること。

### 3.2. 非機能要件

1.  **ホスティング環境:** GitHub Pagesにデプロイし、ウェブサイトとして公開できること。
2.  **パフォーマンス:** 写真の読み込みやギャラリーの描画がスムーズに行われ、ユーザーがストレスなく閲覧できること。
3.  **セキュリティ:**
    * Google Photos Library APIのクライアントシークレットは絶対に公開しないこと。
    * OAuth認証フローはPKCEを適切に実装し、セキュアであること。
    * APIキー（クライアントID）はGitHub Pagesの公開JavaScriptに含まれるが、これはGoogleが許可する範囲内での公開であり問題ないこと。
4.  **メンテナンス性:** コードは整理されており、将来的な機能追加やバグ修正が比較的容易であること。