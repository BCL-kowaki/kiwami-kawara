# デプロイ手順

このNext.jsアプリケーションをサーバーにデプロイする方法を説明します。

## 方法1: Vercel（推奨・最も簡単）

VercelはNext.jsの開発元が提供するホスティングサービスで、設定が最も簡単です。

### 手順

1. **Vercelアカウントの作成**
   - [https://vercel.com](https://vercel.com) にアクセス
   - GitHub、GitLab、またはBitbucketアカウントでサインアップ

2. **プロジェクトをGitリポジトリにプッシュ**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repository-url>
   git push -u origin main
   ```

3. **Vercelでプロジェクトをインポート**
   - Vercelダッシュボードで「New Project」をクリック
   - GitHubリポジトリを選択
   - プロジェクトを選択して「Import」

4. **環境変数の設定**
   - プロジェクト設定で「Environment Variables」を開く
   - 以下の環境変数を追加：
     - `RESEND_API_KEY`: ResendのAPIキー（必須）
     - `RESEND_FROM_EMAIL`: `投資のKAWARA版.com <portfolio@kiwami.kawaraban.co.jp>`（必須）
   - 各環境変数の「Environment」で「Production」「Preview」「Development」を選択
   - 「Save」をクリック

5. **デプロイ**
   - 「Deploy」をクリック
   - 数分でデプロイが完了します
   - デプロイ完了後、提供されたURL（例: `https://your-project.vercel.app`）でアクセス可能

### カスタムドメインの設定（オプション）
- プロジェクト設定の「Domains」からカスタムドメインを追加可能

---

## 方法2: Netlify

### 手順

1. **Netlifyアカウントの作成**
   - [https://www.netlify.com](https://www.netlify.com) にアクセス
   - アカウントを作成

2. **netlify.tomlの作成**（既に作成済み）

3. **Gitリポジトリに接続**
   - Netlifyダッシュボードで「Add new site」→「Import an existing project」
   - Gitリポジトリを選択

4. **ビルド設定**
   - Build command: `npm run build`
   - Publish directory: `.next`

5. **環境変数の設定**
   - Site settings → Environment variables
   - `RESEND_API_KEY` を追加

---

## 方法3: 独自サーバー（VPS/クラウド）

### 必要なもの
- Node.js 18以上がインストールされたサーバー
- PM2などのプロセスマネージャー（推奨）

### 手順

1. **サーバーにファイルをアップロード**
   ```bash
   # SCPやFTPなどでファイルをアップロード
   scp -r . user@your-server:/path/to/app
   ```

2. **サーバーで依存関係をインストール**
   ```bash
   cd /path/to/app
   npm install --production
   ```

3. **環境変数の設定**
   ```bash
   # .env.production ファイルを作成
   echo "RESEND_API_KEY=your_api_key_here" > .env.production
   ```

4. **ビルド**
   ```bash
   npm run build
   ```

5. **PM2で起動**
   ```bash
   npm install -g pm2
   pm2 start npm --name "kiwami-app" -- start
   pm2 save
   pm2 startup
   ```

6. **Nginxでリバースプロキシ設定**（オプション）
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 環境変数の確認

デプロイ前に、以下の環境変数が設定されていることを確認してください：

### 必須環境変数

- `RESEND_API_KEY`: ResendのAPIキー（必須）
  - Resendダッシュボード → API Keys → Create API Key で取得
- `RESEND_FROM_EMAIL`: 送信元メールアドレス（必須）
  - 形式: `投資のKAWARA版.com <portfolio@kiwami.kawaraban.co.jp>`
  - カスタムドメインを使用する場合は、Resendでドメイン認証が必要

### 環境変数の設定方法（Vercel）

1. Vercelダッシュボード → プロジェクトを選択
2. 「Settings」→「Environment Variables」を選択
3. 各環境変数を追加：
   - **Key**: `RESEND_API_KEY`
   - **Value**: ResendのAPIキー
   - **Environment**: Production, Preview, Development すべてにチェック
4. 同様に `RESEND_FROM_EMAIL` も追加
5. 「Save」をクリック
6. 再デプロイを実行（環境変数の変更は再デプロイが必要）

### ドメイン認証について

本番環境でカスタムドメイン（`kiwami.kawaraban.co.jp`）を使用する場合：
1. Resendでドメイン認証を完了（`AUTO_REPLY_EMAIL_SETUP.md` を参照）
2. 環境変数 `RESEND_FROM_EMAIL` に認証済みドメインを設定

---

## トラブルシューティング

### ビルドエラー
```bash
npm run build
```
をローカルで実行して、エラーがないか確認してください。

### 環境変数エラー
デプロイ先の環境変数設定を確認してください。VercelやNetlifyでは、ダッシュボードから設定できます。

### メール送信エラー
- ResendのAPIキーが正しく設定されているか確認
- ドメインが認証されているか確認（`from`フィールドで使用するドメイン）
