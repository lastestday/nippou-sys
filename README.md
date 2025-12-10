# 営業日報システム (Sales Daily Report System)

A web-based system for sales representatives to submit daily reports and managers to review and comment on them.

## 技術スタック

- **言語**: TypeScript
- **フレームワーク**: Next.js (App Router)
- **UIコンポーネント**: shadcn/ui + Tailwind CSS
- **APIスキーマ定義**: OpenAPI (Zodによる検証)
- **DBスキーマ定義**: Prisma.js
- **テスト**: Vitest
- **デプロイ**: Google Cloud Run

## セットアップ

### 前提条件

- Node.js 18.x以上
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# Prismaのセットアップ
npx prisma generate
```

### 環境変数

`.env.local`ファイルを作成し、以下の環境変数を設定:

```env
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 開発

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### コード品質

```bash
# ESLintチェック
npm run lint

# ESLint自動修正
npm run lint:fix

# Prettierでフォーマット
npm run format

# フォーマットチェック
npm run format:check

# TypeScript型チェック
npm run type-check
```

### テスト

```bash
# テストを実行（ウォッチモード）
npm run test

# テストを1回実行
npm run test:run

# UIモードでテスト
npm run test:ui

# カバレッジレポート生成
npm run test:coverage
```

## ビルド

```bash
# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start
```

## プロジェクト構造

```
.
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Reactコンポーネント
│   ├── lib/             # ユーティリティ関数
│   ├── types/           # TypeScript型定義
│   └── utils/           # ヘルパー関数
├── prisma/              # Prismaスキーマ
├── __tests__/           # テストファイル
├── public/              # 静的ファイル
└── docs/                # ドキュメント
```

## ドキュメント

- [CLAUDE.md](CLAUDE.md) - 開発ガイドライン + 要件定義 + ER図
- [SCREEN_DESIGN.md](SCREEN_DESIGN.md) - 画面定義書
- [API_SPECIFICATION.md](API_SPECIFICATION.md) - API仕様書
- [TEST_SPECIFICATION.md](TEST_SPECIFICATION.md) - テスト仕様書

## ライセンス

ISC
