# データベースセットアップガイド

このドキュメントでは、営業日報システムのデータベースセットアップ手順を説明します。

## 前提条件

- PostgreSQL 14以上がインストールされていること
- Node.js 18以上がインストールされていること

## 1. データベースの作成

PostgreSQLに接続し、新しいデータベースを作成します。

```bash
# PostgreSQLにログイン
psql -U postgres

# データベース作成
CREATE DATABASE nippou_sys;

# ユーザーの作成（オプション）
CREATE USER nippou_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE nippou_sys TO nippou_user;

# 終了
\q
```

## 2. 環境変数の設定

`.env.example`ファイルを`.env`にコピーし、データベース接続情報を更新します。

```bash
cp .env.example .env
```

`.env`ファイルを編集し、実際の接続情報を設定します：

```env
DATABASE_URL="postgresql://ユーザー名:パスワード@ホスト:ポート/データベース名?schema=public"
```

例：
```env
DATABASE_URL="postgresql://nippou_user:your_password@localhost:5432/nippou_sys?schema=public"
```

## 3. マイグレーションの実行

Prismaマイグレーションを実行してデータベーススキーマを作成します。

```bash
# マイグレーション実行（初回）
npx prisma migrate dev --name init

# Prisma Clientの生成
npx prisma generate
```

## 4. シードデータの投入

開発環境で使用するサンプルデータを投入します。

```bash
npm run db:seed
```

シードデータには以下が含まれます：
- 社員データ（部長1名、営業担当2名）
- 顧客データ（3社）
- 日報データ（サンプル2件）
- 訪問記録データ
- コメントデータ

## 5. データベースの確認

Prisma Studioを使用してデータベースの内容を確認できます。

```bash
npx prisma studio
```

ブラウザで http://localhost:5555 が開き、データベースの内容を確認・編集できます。

## データベーススキーマ

### テーブル一覧

1. **employee** - 社員マスタ
   - 社員情報と上司-部下の階層構造を管理

2. **customer** - 顧客マスタ
   - 顧客の基本情報を管理

3. **daily_report** - 日報
   - 営業担当者が作成する日次の報告書
   - 一人の社員につき1日1件（employee_id + report_date がユニーク）

4. **visit_record** - 訪問記録
   - 日報に紐づく顧客訪問の記録（複数件登録可能）

5. **report_comment** - 日報コメント
   - 上司が日報に対して追加するコメント

詳細なER図は [CLAUDE.md](../CLAUDE.md) を参照してください。

## よく使うPrismaコマンド

```bash
# スキーマ変更後のマイグレーション作成
npx prisma migrate dev --name 変更内容の説明

# 本番環境へのマイグレーション適用
npx prisma migrate deploy

# データベースをリセット（開発環境のみ）
npx prisma migrate reset

# Prisma Clientの再生成
npx prisma generate

# スキーマのフォーマット
npx prisma format

# スキーマの検証
npx prisma validate

# Prisma Studio起動
npx prisma studio
```

## トラブルシューティング

### マイグレーションエラーが発生する場合

1. データベース接続情報が正しいか確認
2. PostgreSQLサービスが起動しているか確認
3. データベースが存在するか確認

### シードデータ投入エラーが発生する場合

1. マイグレーションが正常に完了しているか確認
2. 既存データとの整合性を確認（リセットが必要な場合は `npx prisma migrate reset`）

## 本番環境へのデプロイ

本番環境では、以下の点に注意してください：

1. 環境変数は安全に管理（Cloud Secretsなど）
2. マイグレーションは `npx prisma migrate deploy` を使用
3. シードデータは本番環境では実行しない
4. データベースのバックアップを定期的に取得
5. 接続プーリングの設定を検討（Prisma Accelerateなど）

## 参考資料

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
