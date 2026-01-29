# 本番環境へのデプロイ（クイックスタート）

Vercelへのデプロイ手順を簡潔にまとめました。

## 📋 前提条件

- GitHubアカウント
- Resendアカウント（APIキー取得済み）
- ドメイン認証完了（カスタムドメイン使用時）

## 🚀 デプロイ手順

### ステップ1: Gitリポジトリにプッシュ

```bash
# Gitリポジトリを初期化（まだの場合）
git init

# ファイルを追加
git add .

# コミット
git commit -m "Initial commit"

# GitHubにリポジトリを作成後、以下を実行
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

### ステップ2: Vercelでプロジェクトをインポート

1. [Vercel](https://vercel.com) にアクセス
2. GitHubアカウントでログイン
3. 「Add New...」→「Project」をクリック
4. GitHubリポジトリを選択
5. 「Import」をクリック

### ステップ3: 環境変数を設定

Vercelのプロジェクト設定画面で：

1. 「Environment Variables」を開く
2. 以下を追加：

   **RESEND_API_KEY**
   - Key: `RESEND_API_KEY`
   - Value: ResendのAPIキー（`re_` で始まる文字列）
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **RESEND_FROM_EMAIL**
   - Key: `RESEND_FROM_EMAIL`
   - Value: `投資のKAWARA版.com <portfolio@kiwami.kawaraban.co.jp>`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

3. 「Save」をクリック

### ステップ4: デプロイ実行

1. 「Deploy」ボタンをクリック
2. 数分待つ（ビルドが完了するまで）
3. デプロイ完了後、提供されたURL（例: `https://your-project.vercel.app`）でアクセス

## ✅ デプロイ後の確認

### 1. フォームが表示されるか確認

- デプロイされたURLにアクセス
- フォームが正しく表示されるか確認

### 2. メール送信をテスト

1. フォームにテストデータを入力
2. メールアドレスを入力（実際に受信できるアドレス）
3. 「送信する」をクリック
4. 以下を確認：
   - ブラウザのコンソール（F12）で `API Response` を確認
   - `userMailSent: true` になっているか確認
   - 入力したメールアドレスに自動返信メールが届くか確認

### 3. Vercelのログを確認

1. Vercelダッシュボード → プロジェクト → 「Logs」を開く
2. フォーム送信時のログを確認：
   - `Admin email send result (data):` - 管理者メールの送信結果
   - `User email send result (data):` - 自動返信メールの送信結果
   - エラーがある場合は詳細を確認

## 🔧 トラブルシューティング

### デプロイが失敗する

- **ビルドエラー**: ローカルで `npm run build` を実行してエラーを確認
- **環境変数エラー**: Vercelの環境変数設定を再確認

### メールが届かない

1. **環境変数を確認**
   - Vercelダッシュボードで `RESEND_API_KEY` と `RESEND_FROM_EMAIL` が正しく設定されているか確認
   - 環境変数を変更した場合は、再デプロイが必要

2. **ログを確認**
   - Vercelの「Logs」でエラーメッセージを確認
   - `RESEND_FROM_EMAILが未設定` エラーが出る場合は、環境変数を再設定

3. **Resendダッシュボードを確認**
   - Resendダッシュボード → 「Emails」で送信履歴を確認
   - エラーがある場合は詳細を確認

4. **ドメイン認証を確認**
   - Resendダッシュボード → 「Domains」でステータスが「Verified」か確認

## 📝 カスタムドメインの設定（オプション）

1. Vercelダッシュボード → プロジェクト → 「Settings」→「Domains」
2. 「Add Domain」をクリック
3. ドメイン名を入力（例: `kiwami.kawaraban.co.jp`）
4. 表示されたDNSレコードをDNSに追加
5. 認証完了を待つ（通常10〜30分）

## 🔄 更新のデプロイ

コードを更新した場合：

```bash
git add .
git commit -m "Update: 説明を追加"
git push
```

Vercelが自動的に再デプロイします（GitHubと連携している場合）。

手動で再デプロイする場合：
1. Vercelダッシュボード → プロジェクト
2. 「Deployments」タブ
3. 最新のデプロイの「...」メニュー → 「Redeploy」

## 📚 参考資料

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Resend公式ドキュメント](https://resend.com/docs)
- 詳細な設定手順: `AUTO_REPLY_EMAIL_SETUP.md`
