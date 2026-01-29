# 自動返信メール設定ガイド

フォーム送信後の自動返信メールを設定する手順です。

## 📋 目次

1. [前提条件](#前提条件)
2. [Resendアカウントの作成とAPIキー取得](#resendアカウントの作成とapiキー取得)
3. [ドメイン認証（カスタムドメイン使用時）](#ドメイン認証カスタムドメイン使用時)
4. [環境変数の設定](#環境変数の設定)
5. [動作確認](#動作確認)
6. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

- Next.jsプロジェクトがセットアップ済み
- `.env.local` ファイルを作成できる環境

---

## Resendアカウントの作成とAPIキー取得

### ステップ1: Resendアカウント作成

1. [Resend](https://resend.com/) にアクセス
2. 「Sign Up」をクリック
3. メールアドレスまたはGitHubアカウントでサインアップ
4. メール認証を完了

### ステップ2: APIキーの取得

1. Resendダッシュボードにログイン
2. 左メニューから「API Keys」を選択
3. 「Create API Key」をクリック
4. 以下の情報を入力：
   - **Name**: `kiwami-portfolio`（任意の名前）
   - **Permission**: `Sending access`（送信権限）
5. 「Add」をクリック
6. **重要**: 表示されたAPIキーをコピー（後で再表示できません）
   - 例: `re_1234567890abcdefghijklmnopqrstuvwxyz`

### ステップ3: APIキーを環境変数に設定

`.env.local` ファイルに以下を追加：

```env
RESEND_API_KEY=re_1234567890abcdefghijklmnopqrstuvwxyz
```

---

## ドメイン認証（カスタムドメイン使用時）

カスタムドメイン（`kiwami.kawaraban.co.jp`）を使用する場合は、以下を実施してください。

### ステップ1: Resendでドメインを追加

1. Resendダッシュボード → 左メニュー「Domains」を選択
2. 「Add Domain」をクリック
3. ドメイン名を入力: `kiwami.kawaraban.co.jp`
4. 「Add」をクリック

### ステップ2: DNSレコードを確認

Resendで以下のDNSレコードが表示されます：

- **SPFレコード（TXT）**
  - ホスト名: `@` または空欄
  - 値: `v=spf1 include:resend.com ~all`

- **DKIMレコード（TXT）**（通常2〜3個）
  - ホスト名: `resend._domainkey` など
  - 値: 長い文字列（Resendで表示されたものをそのまま使用）

- **DMARCレコード（TXT）**（オプション）
  - ホスト名: `_dmarc`
  - 値: `v=DMARC1; p=none; rua=mailto:dmarc@kiwami.kawaraban.co.jp`

### ステップ3: エックスサーバーでDNSレコードを設定

1. エックスサーバーのコントロールパネルにログイン
2. 「ドメイン」→「DNSレコード設定」を選択
3. 対象ドメイン: `kiwami.kawaraban.co.jp` を選択
4. 上記のDNSレコードを追加：
   - 各レコードの「追加」をクリック
   - ホスト名、種別（TXT）、値を入力
   - 「確認画面へ進む」→「追加する」
5. 設定を保存

### ステップ4: DNS反映を待つ

- DNS反映には通常10〜30分かかります（最大48時間）
- 確認方法：
  - コマンドライン: `nslookup -type=TXT kiwami.kawaraban.co.jp`
  - オンラインツール: https://mxtoolbox.com/

### ステップ5: Resendで認証を確認

1. Resendダッシュボード → 「Domains」に戻る
2. 追加したドメインのステータスを確認
3. 「Verified」になれば認証完了

---

## 環境変数の設定

### ローカル開発環境（`.env.local`）

`.env.local` ファイルを作成（または編集）し、以下を設定：

```env
# Resend APIキー（必須）
RESEND_API_KEY=re_1234567890abcdefghijklmnopqrstuvwxyz

# 送信元メールアドレス（必須）
# カスタムドメイン使用時
RESEND_FROM_EMAIL=投資のKAWARA版 <portfolio@kiwami.kawaraban.co.jp>
```

### 本番環境（Vercel）

1. Vercelダッシュボード → プロジェクトを選択
2. 「Settings」→「Environment Variables」を選択
3. 以下を追加：
   - `RESEND_API_KEY`: ResendのAPIキー
   - `RESEND_FROM_EMAIL`: `投資のKAWARA版 <portfolio@kiwami.kawaraban.co.jp>`
4. 「Save」をクリック
5. 再デプロイを実行

---

## 動作確認

### ステップ1: 開発サーバーを起動

```bash
npm run dev
```

### ステップ2: フォームを送信

1. ブラウザで `http://localhost:3000` を開く
2. フォームに以下を入力：
   - 苗字・名前（必須）
   - メールアドレス（必須）
   - 資産情報（任意）
3. 「送信する」ボタンをクリック

### ステップ3: ログを確認

ターミナルで以下のログを確認：

```
=== フォーム送信受信 ===
Email: test@example.com
Name: 山田 太郎
RESEND_API_KEY is set (length: 51)
Using from email: 投資のKAWARA版 <portfolio@kiwami.kawaraban.co.jp>
Sending admin email...
Admin email send result (data): {"data":{"id":"..."}}
Admin email sent successfully, ID: ...
Sending user email to: test@example.com
User email send result (data): {"data":{"id":"..."}}
User email sent successfully, ID: ...
```

### ステップ4: メール受信を確認

1. 入力したメールアドレスの受信トレイを確認
2. 件名: `【投資のKAWARA版】ポートフォリオ受付完了`
3. 本文に以下が含まれていることを確認：
   - 「ポートフォリオ情報の送信を受け付けました。」
   - 「分析完了後、レポートをメールにてお届けします。」

---

## トラブルシューティング

### 問題1: `RESEND_API_KEY is not set` エラー

**原因**: 環境変数が設定されていない

**解決方法**:
1. `.env.local` ファイルに `RESEND_API_KEY` が正しく設定されているか確認
2. 開発サーバーを再起動（環境変数の変更は再起動が必要）
3. Vercelの場合は、環境変数を設定して再デプロイ

### 問題2: `RESEND_FROM_EMAILが未設定` エラー

**原因**: 送信元メールアドレスが設定されていない

**解決方法**:
1. `.env.local` に `RESEND_FROM_EMAIL` を追加
2. 形式: `投資のKAWARA版 <portfolio@kiwami.kawaraban.co.jp>`
3. 開発サーバーを再起動

### 問題3: メールが届かない

**確認項目**:

1. **サーバーログを確認**
   - `User email send result (data):` のログを確認
   - エラーが表示されていないか確認

2. **Resendダッシュボードを確認**
   - Resendダッシュボード → 「Emails」を確認
   - 送信履歴とステータスを確認
   - エラーがある場合は詳細を確認

3. **ドメイン認証を確認**
   - Resendダッシュボード → 「Domains」でステータスが「Verified」か確認
   - 未認証の場合は、DNSレコードの設定を再確認

4. **スパムフォルダを確認**
   - メールがスパムフォルダに振り分けられていないか確認

### 問題4: ドメイン認証が完了しない

**原因**: DNSレコードが正しく設定されていない

**解決方法**:
1. DNSレコードの値を再確認（コピー&ペースト推奨）
2. ホスト名が正しいか確認（特にDKIMの `resend._domainkey` など）
3. TTLを短く設定（例: 300秒）して再試行
4. 数時間待ってから再確認

### 問題5: ブラウザコンソールでエラーが表示される

**確認方法**:
1. ブラウザの開発者ツール（F12）を開く
2. 「Console」タブを確認
3. `API Response:` のログを確認：
   ```json
   {
     "ok": true,
     "adminMailSent": true,
     "userMailSent": true,
     "userMailError": null
   }
   ```
4. `userMailSent: false` の場合は、`userMailError` の内容を確認

---

## 自動返信メールの内容

### 件名
```
【投資のKAWARA版】ポートフォリオ受付完了
```

### 本文
```
ポートフォリオ情報の送信を受け付けました。
分析完了後、レポートをメールにてお届けします。
（目安）◯営業日以内

※本メールは自動送信です。
※本サービスは投資助言ではなく、情報整理・レポート提供を目的としています。
```

---

## 参考リンク

- [Resend公式サイト](https://resend.com/)
- [Resendドキュメント](https://resend.com/docs)
- [Resendドメイン認証ガイド](https://resend.com/docs/dashboard/domains/introduction)
