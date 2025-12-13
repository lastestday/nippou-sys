# API仕様書 - 営業日報システム

## 1. API概要

### ベースURL

```
https://api.example.com/api/v1
```

### 認証方式

- JWT (JSON Web Token) を使用
- リクエストヘッダーに `Authorization: Bearer {token}` を付与

### 共通レスポンス形式

#### 成功時

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

#### エラー時

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": [ ... ]
  }
}
```

### HTTPステータスコード

| コード | 意味                  | 使用場面                       |
| ------ | --------------------- | ------------------------------ |
| 200    | OK                    | 成功                           |
| 201    | Created               | リソース作成成功               |
| 400    | Bad Request           | リクエストパラメータ不正       |
| 401    | Unauthorized          | 認証エラー                     |
| 403    | Forbidden             | 権限不足                       |
| 404    | Not Found             | リソースが見つからない         |
| 409    | Conflict              | リソースの競合（重複登録など） |
| 500    | Internal Server Error | サーバーエラー                 |

---

## 2. 認証API

### 2.1 ログイン

**エンドポイント**: `POST /auth/login`

**説明**: メールアドレスとパスワードでログインし、JWTトークンを取得

**リクエスト**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "employee_id": 1,
      "employee_name": "山田太郎",
      "email": "user@example.com",
      "department": "営業部",
      "position": "営業担当",
      "manager_id": 5,
      "role": "sales"
    }
  },
  "message": "Login successful"
}
```

**エラーレスポンス** (401 Unauthorized):

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "メールアドレスまたはパスワードが正しくありません"
  }
}
```

---

### 2.2 ログアウト

**エンドポイント**: `POST /auth/logout`

**説明**: ログアウト処理（トークンの無効化）

**ヘッダー**: `Authorization: Bearer {token}`

**レスポンス** (200 OK):

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 2.3 トークン更新

**エンドポイント**: `POST /auth/refresh`

**説明**: トークンをリフレッシュ

**ヘッダー**: `Authorization: Bearer {token}`

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 3. 日報API

### 3.1 日報一覧取得

**エンドポイント**: `GET /daily-reports`

**説明**: 日報の一覧を取得（検索・絞り込み対応）

**クエリパラメータ**:

| パラメータ  | 型      | 必須 | 説明                                          | デフォルト       |
| ----------- | ------- | ---- | --------------------------------------------- | ---------------- |
| date_from   | date    | No   | 開始日 (YYYY-MM-DD)                           | 7日前            |
| date_to     | date    | No   | 終了日 (YYYY-MM-DD)                           | 本日             |
| employee_id | integer | No   | 営業担当者ID                                  | ログインユーザー |
| status      | string  | No   | ステータス (draft/submitted/reviewed)         | 全て             |
| page        | integer | No   | ページ番号                                    | 1                |
| per_page    | integer | No   | 1ページあたりの件数                           | 20               |
| sort_by     | string  | No   | ソート項目 (report_date/employee_name/status) | report_date      |
| order       | string  | No   | ソート順 (asc/desc)                           | desc             |

**権限制御**:

- 営業担当者: 自分の日報のみ取得可能
- 上長: 自分と部下の日報を取得可能

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "report_id": 123,
        "employee_id": 1,
        "employee_name": "山田太郎",
        "report_date": "2025-12-11",
        "status": "submitted",
        "visit_count": 3,
        "has_comments": true,
        "created_at": "2025-12-11T09:30:00Z",
        "updated_at": "2025-12-11T17:45:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_pages": 5,
      "total_count": 95
    }
  }
}
```

---

### 3.2 日報詳細取得

**エンドポイント**: `GET /daily-reports/{report_id}`

**説明**: 指定した日報の詳細情報を取得

**パスパラメータ**:

- `report_id`: 日報ID

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "report": {
      "report_id": 123,
      "employee_id": 1,
      "employee_name": "山田太郎",
      "report_date": "2025-12-11",
      "status": "submitted",
      "problem": "A社との契約条件について調整が必要。価格面で折り合いがつかない状況。",
      "plan": "B社への提案書を作成し、訪問予定。C社からの問い合わせに対応。",
      "created_at": "2025-12-11T09:30:00Z",
      "updated_at": "2025-12-11T17:45:00Z",
      "visits": [
        {
          "visit_id": 456,
          "customer_id": 10,
          "customer_name": "株式会社A商事",
          "visit_time": "10:00",
          "visit_content": "新商品の提案。担当者の反応は良好だが、価格について再検討が必要とのこと。",
          "display_order": 1
        },
        {
          "visit_id": 457,
          "customer_id": 15,
          "customer_name": "B物産株式会社",
          "visit_time": "14:30",
          "visit_content": "契約更新について打ち合わせ。次回訪問時に正式な提案書を持参する予定。",
          "display_order": 2
        }
      ],
      "comments": [
        {
          "comment_id": 789,
          "commenter_id": 5,
          "commenter_name": "佐藤次郎（上長）",
          "comment_type": "problem",
          "comment_text": "A社の件、価格調整については本部と相談しましょう。明日ミーティングを設定します。",
          "created_at": "2025-12-11T18:30:00Z"
        }
      ]
    }
  }
}
```

**エラーレスポンス** (404 Not Found):

```json
{
  "success": false,
  "error": {
    "code": "REPORT_NOT_FOUND",
    "message": "指定された日報が見つかりません"
  }
}
```

---

### 3.3 日報作成

**エンドポイント**: `POST /daily-reports`

**説明**: 新しい日報を作成

**リクエスト**:

```json
{
  "report_date": "2025-12-11",
  "problem": "今日の課題内容",
  "plan": "明日の予定内容",
  "status": "draft",
  "visits": [
    {
      "customer_id": 10,
      "visit_time": "10:00",
      "visit_content": "訪問内容の詳細",
      "display_order": 1
    },
    {
      "customer_id": 15,
      "visit_time": "14:30",
      "visit_content": "訪問内容の詳細",
      "display_order": 2
    }
  ]
}
```

**バリデーション**:

- `report_date`: 必須、日付形式
- `problem`: status='submitted'の場合必須
- `plan`: status='submitted'の場合必須
- `visits`: 最低1件必須
- `visits[].customer_id`: 必須
- `visits[].visit_content`: 必須

**レスポンス** (201 Created):

```json
{
  "success": true,
  "data": {
    "report_id": 124,
    "employee_id": 1,
    "report_date": "2025-12-11",
    "status": "draft",
    "created_at": "2025-12-11T18:00:00Z"
  },
  "message": "日報を作成しました"
}
```

**エラーレスポンス** (409 Conflict):

```json
{
  "success": false,
  "error": {
    "code": "REPORT_ALREADY_EXISTS",
    "message": "この日付の日報は既に存在します"
  }
}
```

---

### 3.4 日報更新

**エンドポイント**: `PUT /daily-reports/{report_id}`

**説明**: 既存の日報を更新

**パスパラメータ**:

- `report_id`: 日報ID

**リクエスト**:

```json
{
  "problem": "更新後の課題内容",
  "plan": "更新後の予定内容",
  "status": "submitted",
  "visits": [
    {
      "visit_id": 456,
      "customer_id": 10,
      "visit_time": "10:00",
      "visit_content": "更新後の訪問内容",
      "display_order": 1
    },
    {
      "customer_id": 20,
      "visit_time": "16:00",
      "visit_content": "新規追加の訪問記録",
      "display_order": 2
    }
  ]
}
```

**注意事項**:

- `visit_id`が指定されている場合は更新、指定されていない場合は新規作成
- リクエストに含まれない既存の訪問記録は削除される

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "report_id": 124,
    "updated_at": "2025-12-11T19:00:00Z"
  },
  "message": "日報を更新しました"
}
```

**エラーレスポンス** (403 Forbidden):

```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "この日報を編集する権限がありません"
  }
}
```

---

### 3.5 日報削除

**エンドポイント**: `DELETE /daily-reports/{report_id}`

**説明**: 日報を削除（下書きのみ削除可能）

**パスパラメータ**:

- `report_id`: 日報ID

**レスポンス** (200 OK):

```json
{
  "success": true,
  "message": "日報を削除しました"
}
```

**エラーレスポンス** (400 Bad Request):

```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_SUBMITTED_REPORT",
    "message": "提出済みの日報は削除できません"
  }
}
```

---

### 3.6 日報ステータス更新

**エンドポイント**: `PATCH /daily-reports/{report_id}/status`

**説明**: 日報のステータスを更新

**パスパラメータ**:

- `report_id`: 日報ID

**リクエスト**:

```json
{
  "status": "reviewed"
}
```

**ステータス遷移ルール**:

- 営業担当者: `draft` → `submitted`
- 上長: `submitted` → `reviewed`

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "report_id": 124,
    "status": "reviewed",
    "updated_at": "2025-12-11T20:00:00Z"
  },
  "message": "ステータスを更新しました"
}
```

---

## 4. コメントAPI

### 4.1 コメント追加

**エンドポイント**: `POST /daily-reports/{report_id}/comments`

**説明**: 日報にコメントを追加（上長のみ）

**パスパラメータ**:

- `report_id`: 日報ID

**リクエスト**:

```json
{
  "comment_type": "problem",
  "comment_text": "コメント内容"
}
```

**comment_type**:

- `problem`: Problemへのコメント
- `plan`: Planへのコメント
- `general`: 全体へのコメント

**レスポンス** (201 Created):

```json
{
  "success": true,
  "data": {
    "comment_id": 790,
    "report_id": 124,
    "commenter_id": 5,
    "commenter_name": "佐藤次郎",
    "comment_type": "problem",
    "comment_text": "コメント内容",
    "created_at": "2025-12-11T20:30:00Z"
  },
  "message": "コメントを追加しました"
}
```

**エラーレスポンス** (403 Forbidden):

```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "コメントを追加する権限がありません"
  }
}
```

---

### 4.2 コメント一覧取得

**エンドポイント**: `GET /daily-reports/{report_id}/comments`

**説明**: 指定した日報のコメント一覧を取得

**パスパラメータ**:

- `report_id`: 日報ID

**クエリパラメータ**:

- `comment_type` (optional): コメント種別で絞り込み

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "comment_id": 789,
        "commenter_id": 5,
        "commenter_name": "佐藤次郎",
        "comment_type": "problem",
        "comment_text": "コメント内容",
        "created_at": "2025-12-11T18:30:00Z"
      }
    ]
  }
}
```

---

### 4.3 コメント削除

**エンドポイント**: `DELETE /daily-reports/{report_id}/comments/{comment_id}`

**説明**: コメントを削除（自分のコメントのみ）

**パスパラメータ**:

- `report_id`: 日報ID
- `comment_id`: コメントID

**レスポンス** (200 OK):

```json
{
  "success": true,
  "message": "コメントを削除しました"
}
```

---

## 5. 顧客マスタAPI

### 5.1 顧客一覧取得

**エンドポイント**: `GET /customers`

**説明**: 顧客マスタの一覧を取得

**クエリパラメータ**:

| パラメータ    | 型      | 必須 | 説明                | デフォルト    |
| ------------- | ------- | ---- | ------------------- | ------------- |
| customer_name | string  | No   | 顧客名（部分一致）  | -             |
| industry      | string  | No   | 業種                | -             |
| page          | integer | No   | ページ番号          | 1             |
| per_page      | integer | No   | 1ページあたりの件数 | 50            |
| sort_by       | string  | No   | ソート項目          | customer_name |
| order         | string  | No   | ソート順 (asc/desc) | asc           |

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "customer_id": 10,
        "customer_name": "株式会社A商事",
        "contact_person": "田中一郎",
        "phone": "03-1234-5678",
        "email": "tanaka@a-shoji.co.jp",
        "address": "東京都千代田区...",
        "industry": "商社",
        "created_at": "2025-01-15T10:00:00Z",
        "updated_at": "2025-10-20T14:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 50,
      "total_pages": 3,
      "total_count": 125
    }
  }
}
```

---

### 5.2 顧客詳細取得

**エンドポイント**: `GET /customers/{customer_id}`

**説明**: 指定した顧客の詳細情報を取得

**パスパラメータ**:

- `customer_id`: 顧客ID

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "customer": {
      "customer_id": 10,
      "customer_name": "株式会社A商事",
      "contact_person": "田中一郎",
      "phone": "03-1234-5678",
      "email": "tanaka@a-shoji.co.jp",
      "address": "東京都千代田区...",
      "industry": "商社",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-10-20T14:30:00Z"
    }
  }
}
```

---

### 5.3 顧客登録

**エンドポイント**: `POST /customers`

**説明**: 新しい顧客を登録（管理者のみ）

**リクエスト**:

```json
{
  "customer_name": "株式会社A商事",
  "contact_person": "田中一郎",
  "phone": "03-1234-5678",
  "email": "tanaka@a-shoji.co.jp",
  "address": "東京都千代田区...",
  "industry": "商社"
}
```

**バリデーション**:

- `customer_name`: 必須、最大100文字
- `email`: メール形式チェック（入力時のみ）
- `phone`: 数字とハイフンのみ（入力時のみ）

**レスポンス** (201 Created):

```json
{
  "success": true,
  "data": {
    "customer_id": 126,
    "customer_name": "株式会社A商事",
    "created_at": "2025-12-11T21:00:00Z"
  },
  "message": "顧客を登録しました"
}
```

---

### 5.4 顧客更新

**エンドポイント**: `PUT /customers/{customer_id}`

**説明**: 顧客情報を更新（管理者のみ）

**パスパラメータ**:

- `customer_id`: 顧客ID

**リクエスト**:

```json
{
  "customer_name": "株式会社A商事",
  "contact_person": "田中一郎",
  "phone": "03-1234-5678",
  "email": "tanaka@a-shoji.co.jp",
  "address": "東京都千代田区...",
  "industry": "商社"
}
```

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "customer_id": 10,
    "updated_at": "2025-12-11T21:30:00Z"
  },
  "message": "顧客情報を更新しました"
}
```

---

### 5.5 顧客削除

**エンドポイント**: `DELETE /customers/{customer_id}`

**説明**: 顧客を削除（管理者のみ、訪問記録がある場合は削除不可）

**パスパラメータ**:

- `customer_id`: 顧客ID

**レスポンス** (200 OK):

```json
{
  "success": true,
  "message": "顧客を削除しました"
}
```

**エラーレスポンス** (400 Bad Request):

```json
{
  "success": false,
  "error": {
    "code": "CUSTOMER_HAS_VISITS",
    "message": "訪問記録が存在するため削除できません"
  }
}
```

---

## 6. 社員マスタAPI

### 6.1 社員一覧取得

**エンドポイント**: `GET /employees`

**説明**: 社員マスタの一覧を取得

**クエリパラメータ**:

| パラメータ    | 型      | 必須 | 説明                | デフォルト |
| ------------- | ------- | ---- | ------------------- | ---------- |
| employee_name | string  | No   | 社員名（部分一致）  | -          |
| department    | string  | No   | 部署                | -          |
| page          | integer | No   | ページ番号          | 1          |
| per_page      | integer | No   | 1ページあたりの件数 | 50         |

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "employee_id": 1,
        "employee_name": "山田太郎",
        "email": "yamada@example.com",
        "department": "営業部",
        "position": "営業担当",
        "manager_id": 5,
        "manager_name": "佐藤次郎",
        "created_at": "2025-01-10T10:00:00Z",
        "updated_at": "2025-12-01T14:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 50,
      "total_pages": 2,
      "total_count": 85
    }
  }
}
```

---

### 6.2 社員詳細取得

**エンドポイント**: `GET /employees/{employee_id}`

**説明**: 指定した社員の詳細情報を取得

**パスパラメータ**:

- `employee_id`: 社員ID

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "employee": {
      "employee_id": 1,
      "employee_name": "山田太郎",
      "email": "yamada@example.com",
      "department": "営業部",
      "position": "営業担当",
      "manager_id": 5,
      "manager_name": "佐藤次郎",
      "created_at": "2025-01-10T10:00:00Z",
      "updated_at": "2025-12-01T14:00:00Z"
    }
  }
}
```

---

### 6.3 社員登録

**エンドポイント**: `POST /employees`

**説明**: 新しい社員を登録（管理者のみ）

**リクエスト**:

```json
{
  "employee_name": "山田太郎",
  "email": "yamada@example.com",
  "password": "password123",
  "department": "営業部",
  "position": "営業担当",
  "manager_id": 5
}
```

**バリデーション**:

- `employee_name`: 必須、最大50文字
- `email`: 必須、メール形式、重複チェック
- `password`: 必須、最低8文字
- `manager_id`: 自分自身は指定不可、循環参照チェック

**レスポンス** (201 Created):

```json
{
  "success": true,
  "data": {
    "employee_id": 86,
    "employee_name": "山田太郎",
    "email": "yamada@example.com",
    "created_at": "2025-12-11T22:00:00Z"
  },
  "message": "社員を登録しました"
}
```

**エラーレスポンス** (409 Conflict):

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "このメールアドレスは既に登録されています"
  }
}
```

---

### 6.4 社員更新

**エンドポイント**: `PUT /employees/{employee_id}`

**説明**: 社員情報を更新（管理者のみ）

**パスパラメータ**:

- `employee_id`: 社員ID

**リクエスト**:

```json
{
  "employee_name": "山田太郎",
  "email": "yamada@example.com",
  "password": "newpassword456",
  "department": "営業部",
  "position": "主任",
  "manager_id": 5
}
```

**注意事項**:

- `password`は変更する場合のみ指定

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "employee_id": 1,
    "updated_at": "2025-12-11T22:30:00Z"
  },
  "message": "社員情報を更新しました"
}
```

---

### 6.5 社員削除

**エンドポイント**: `DELETE /employees/{employee_id}`

**説明**: 社員を削除（管理者のみ、日報がある場合は削除不可）

**パスパラメータ**:

- `employee_id`: 社員ID

**レスポンス** (200 OK):

```json
{
  "success": true,
  "message": "社員を削除しました"
}
```

**エラーレスポンス** (400 Bad Request):

```json
{
  "success": false,
  "error": {
    "code": "EMPLOYEE_HAS_REPORTS",
    "message": "日報が存在するため削除できません"
  }
}
```

---

### 6.6 部下一覧取得

**エンドポイント**: `GET /employees/{employee_id}/subordinates`

**説明**: 指定した社員の直属の部下一覧を取得

**パスパラメータ**:

- `employee_id`: 社員ID

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "subordinates": [
      {
        "employee_id": 1,
        "employee_name": "山田太郎",
        "department": "営業部",
        "position": "営業担当"
      },
      {
        "employee_id": 2,
        "employee_name": "鈴木花子",
        "department": "営業部",
        "position": "営業担当"
      }
    ]
  }
}
```

---

## 7. ダッシュボードAPI

### 7.1 ダッシュボード情報取得

**エンドポイント**: `GET /dashboard`

**説明**: ダッシュボードに表示する情報を取得

**レスポンス** (200 OK):

**営業担当者向け**:

```json
{
  "success": true,
  "data": {
    "today_report": {
      "report_id": 123,
      "status": "submitted",
      "has_comments": true,
      "unread_comments_count": 2
    },
    "activity_summary": {
      "this_week_visits": 12,
      "this_month_visits": 45,
      "this_week_reports": 5,
      "pending_reports": 0
    },
    "recent_comments": [
      {
        "comment_id": 789,
        "report_date": "2025-12-10",
        "commenter_name": "佐藤次郎",
        "comment_text": "よく対応できています...",
        "created_at": "2025-12-10T19:00:00Z"
      }
    ]
  }
}
```

**上長向け**:

```json
{
  "success": true,
  "data": {
    "team_summary": {
      "total_subordinates": 5,
      "today_submitted_reports": 3,
      "today_pending_reports": 2,
      "unreviewed_reports": 8
    },
    "subordinate_reports": [
      {
        "employee_id": 1,
        "employee_name": "山田太郎",
        "report_date": "2025-12-11",
        "status": "submitted",
        "submitted_at": "2025-12-11T17:30:00Z"
      }
    ],
    "activity_summary": {
      "this_week_team_visits": 45,
      "this_month_team_visits": 180
    }
  }
}
```

---

## 8. 統計API（オプション）

### 8.1 訪問統計取得

**エンドポイント**: `GET /statistics/visits`

**説明**: 訪問回数の統計情報を取得

**クエリパラメータ**:

| パラメータ  | 型      | 必須 | 説明                                 |
| ----------- | ------- | ---- | ------------------------------------ |
| date_from   | date    | Yes  | 開始日                               |
| date_to     | date    | Yes  | 終了日                               |
| employee_id | integer | No   | 営業担当者ID                         |
| customer_id | integer | No   | 顧客ID                               |
| group_by    | string  | No   | グループ化（date/employee/customer） |

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "statistics": [
      {
        "date": "2025-12-11",
        "visit_count": 15,
        "report_count": 5
      }
    ],
    "summary": {
      "total_visits": 145,
      "total_reports": 45,
      "average_visits_per_day": 3.2
    }
  }
}
```

---

### 8.2 顧客別訪問履歴

**エンドポイント**: `GET /statistics/customer-visits/{customer_id}`

**説明**: 特定顧客への訪問履歴を取得

**パスパラメータ**:

- `customer_id`: 顧客ID

**クエリパラメータ**:

- `date_from` (optional): 開始日
- `date_to` (optional): 終了日

**レスポンス** (200 OK):

```json
{
  "success": true,
  "data": {
    "customer": {
      "customer_id": 10,
      "customer_name": "株式会社A商事"
    },
    "visits": [
      {
        "visit_id": 456,
        "report_date": "2025-12-11",
        "employee_name": "山田太郎",
        "visit_time": "10:00",
        "visit_content": "新商品の提案..."
      }
    ],
    "summary": {
      "total_visits": 24,
      "last_visit_date": "2025-12-11",
      "visit_frequency": "週2回"
    }
  }
}
```

---

## 9. エラーコード一覧

| コード                         | 説明                                               |
| ------------------------------ | -------------------------------------------------- |
| INVALID_CREDENTIALS            | 認証エラー（メールアドレスまたはパスワードが不正） |
| TOKEN_EXPIRED                  | トークンの有効期限切れ                             |
| TOKEN_INVALID                  | トークンが不正                                     |
| PERMISSION_DENIED              | 権限不足                                           |
| REPORT_NOT_FOUND               | 日報が見つからない                                 |
| REPORT_ALREADY_EXISTS          | 日報が既に存在（同日の日報重複）                   |
| CANNOT_DELETE_SUBMITTED_REPORT | 提出済み日報は削除不可                             |
| CUSTOMER_NOT_FOUND             | 顧客が見つからない                                 |
| CUSTOMER_HAS_VISITS            | 顧客に訪問記録が存在（削除不可）                   |
| EMPLOYEE_NOT_FOUND             | 社員が見つからない                                 |
| EMPLOYEE_HAS_REPORTS           | 社員に日報が存在（削除不可）                       |
| EMAIL_ALREADY_EXISTS           | メールアドレスが既に登録済み                       |
| INVALID_MANAGER                | 不正な上長指定（自己参照または循環参照）           |
| VALIDATION_ERROR               | バリデーションエラー                               |
| INTERNAL_SERVER_ERROR          | サーバー内部エラー                                 |

---

## 10. 補足事項

### ページネーション

一覧取得APIは全て以下の形式でページネーション情報を返します:

```json
{
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_pages": 5,
    "total_count": 95
  }
}
```

### 日時フォーマット

- 日付: `YYYY-MM-DD` (例: 2025-12-11)
- 時刻: `HH:MM` (例: 14:30)
- 日時: ISO 8601形式 `YYYY-MM-DDTHH:MM:SSZ` (例: 2025-12-11T18:30:00Z)

### レート制限（オプション）

- 1分あたり60リクエストまで
- レート制限超過時は `429 Too Many Requests` を返す

### CORS設定

- 本番環境: 特定のドメインのみ許可
- 開発環境: `*` で全て許可

### セキュリティ

- 全てのAPIはHTTPS必須
- パスワードはbcryptでハッシュ化
- SQLインジェクション対策（プリペアドステートメント使用）
- XSS対策（入力値のサニタイジング）
- CSRF対策（トークン検証）
