# 超精密！ポートフォリオAI分析「極」

ポートフォリオ診断フォーム（PoC）

## 概要

このアプリケーションは、7つのカテゴリに分かれた資産情報を入力し、社内宛にメール送信するポートフォリオ診断フォームです。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **メール送信**: Resend

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=投資のKAWARA版.com <portfolio@kiwami.kawaraban.co.jp>
```

**環境変数の説明：**
- `RESEND_API_KEY`（必須）: ResendのAPIキー
- `RESEND_FROM_EMAIL`（必須）: 送信元メールアドレス
  - カスタムドメインを使用する場合は、Resendでドメイン認証が必要です
  - 形式: `投資のKAWARA版 <portfolio@kiwami.kawaraban.co.jp>`

### 3. Resendの設定（自動返信メール用）

#### ステップ1: Resendアカウントの作成とAPIキーの取得

1. [Resend](https://resend.com/) にアクセス
2. アカウントを作成（無料プランでも利用可能）
3. ダッシュボードにログイン
4. 「API Keys」→「Create API Key」をクリック
5. APIキー名を入力（例: "kiwami-portfolio"）
6. 生成されたAPIキーをコピー
7. `.env.local` の `RESEND_API_KEY` に設定

#### ステップ2: ドメイン認証（カスタムドメインを使用する場合）

カスタムドメイン（`kiwami.kawaraban.co.jp`）を使用する場合は、以下を実施してください：

1. **Resendでドメインを追加**
   - Resendダッシュボード → 「Domains」→「Add Domain」
   - ドメイン名を入力: `kiwami.kawaraban.co.jp`
   - 「Add」をクリック

2. **DNSレコードを設定**
   - Resendで表示されたDNSレコードをコピー
   - エックスサーバーなどのDNS管理画面で以下を追加：
     - **SPFレコード（TXT）**: `v=spf1 include:resend.com ~all`
     - **DKIMレコード（TXT）**: Resendで表示された値（複数）
     - **DMARCレコード（TXT）**: オプション

3. **認証完了を確認**
   - DNS反映後（10〜30分程度）、Resendダッシュボードでステータスが「Verified」になるのを確認

4. **環境変数を設定**
   - `.env.local` の `RESEND_FROM_EMAIL` に以下を設定：
     ```
     RESEND_FROM_EMAIL=投資のKAWARA版 <portfolio@kiwami.kawaraban.co.jp>
     ```

#### ステップ3: 動作確認

1. 開発サーバーを起動: `npm run dev`
2. フォームにメールアドレスを入力して送信
3. サーバーログで以下を確認：
   - `Admin email send result (data):` - 管理者メールの送信結果
   - `User email send result (data):` - 自動返信メールの送信結果
4. 入力したメールアドレスに自動返信メールが届くことを確認

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 機能

### フォーム機能

- **7つのカテゴリ**: アコーディオンUIで各カテゴリを入力
  1. 現金・預金
  2. 上場株
  3. ETF・投資信託
  4. 債券
  5. 貴金属・コモディティ
  6. 暗号資産
  7. その他（未上場株・事業投資・私募投資）

- **詳細行**: 各カテゴリ（現金・預金を除く）で最大20行まで詳細を追加可能
  - 数量または金額で入力可能
  - 未完成行は自動的にフィルタリング

- **状態管理**: 
  - `editing`: 入力中
  - `submitting`: 送信中（ボタン無効化）
  - `submitted`: 送信成功（サンクス画面表示）
  - `error`: 送信失敗（エラーメッセージ表示）

### API機能

- **エンドポイント**: `POST /api/submit`
- **メール送信**: Resendを使用して社内宛にメール送信
- **メール本文**: 整形されたテキスト形式 + JSONデータ

## プロジェクト構造

```
tetris-app/
├── app/
│   ├── api/
│   │   └── submit/
│   │       └── route.ts          # APIルート（メール送信）
│   ├── components/
│   │   ├── CategoryAccordion.tsx # アコーディオンコンポーネント
│   │   ├── DetailRow.tsx         # 詳細行コンポーネント
│   │   ├── CashCategory.tsx      # 現金・預金カテゴリ
│   │   ├── ListedStocksCategory.tsx
│   │   ├── FundsCategory.tsx
│   │   ├── BondsCategory.tsx
│   │   ├── CommoditiesCategory.tsx
│   │   ├── CryptoCategory.tsx
│   │   └── OtherCategory.tsx
│   ├── globals.css               # グローバルスタイル
│   ├── layout.tsx                # ルートレイアウト
│   └── page.tsx                  # メインフォームページ
├── types/
│   └── portfolio.ts              # 型定義
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## ビルド

```bash
npm run build
```

## 本番環境での実行

```bash
npm start
```

## 注意事項

- ResendのAPIキーは必ず環境変数で管理してください
- **ドメイン認証が未完了の場合**: `RESEND_FROM_EMAIL` を設定せず、デフォルトドメイン（`onboarding@resend.dev`）が使用されます
- **カスタムドメインを使用する場合**: Resendでドメイン認証が必要です（DNSレコードの設定が必要）
- 未完成の詳細行は送信時に自動的に除外されます
