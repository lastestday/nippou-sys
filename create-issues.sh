#!/bin/bash

# Issueを一括作成するスクリプト
# issues.jsonから読み込んでgh issueコマンドで作成

set -e

echo "Creating GitHub Issues from issues.json..."

# jqがインストールされているか確認
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install jq first."
    echo "  brew install jq"
    exit 1
fi

# issues.jsonファイルの存在確認
if [ ! -f "issues.json" ]; then
    echo "Error: issues.json not found"
    exit 1
fi

# Issueの数を取得
issue_count=$(jq '. | length' issues.json)
echo "Found $issue_count issues to create"
echo ""

# 各Issueを作成
for i in $(seq 0 $((issue_count - 1))); do
    title=$(jq -r ".[$i].title" issues.json)
    body=$(jq -r ".[$i].body" issues.json)
    labels=$(jq -r ".[$i].labels | join(\",\")" issues.json)

    echo "[$((i + 1))/$issue_count] Creating issue: $title"

    # gh issue createコマンドでIssueを作成
    if gh issue create --title "$title" --body "$body" --label "$labels"; then
        echo "  ✓ Created successfully"
    else
        echo "  ✗ Failed to create"
    fi

    echo ""

    # API制限を考慮して少し待機
    sleep 1
done

echo "All issues created!"
echo "View issues: gh issue list"
