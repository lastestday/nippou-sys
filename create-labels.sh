#!/bin/bash

# GitHubラベルを作成するスクリプト

set -e

echo "Creating GitHub Labels..."

# ラベル定義（name:color:description）
labels=(
    "setup:0E8A16:Project setup and configuration"
    "database:1D76DB:Database schema and migrations"
    "backend:5319E7:Backend API implementation"
    "frontend:FBCA04:Frontend UI implementation"
    "ui:FBCA04:UI components and design"
    "auth:D93F0B:Authentication and authorization"
    "api:5319E7:API endpoints"
    "security:B60205:Security and vulnerability fixes"
    "testing:0E8A16:Testing and quality assurance"
    "documentation:0075CA:Documentation"
    "devops:006B75:DevOps, CI/CD, deployment"
    "ci/cd:006B75:Continuous Integration and Deployment"
    "deployment:006B75:Deployment configuration"
    "priority:high:D93F0B:High priority"
    "priority:medium:FBCA04:Medium priority"
    "priority:low:0E8A16:Low priority"
)

for label_def in "${labels[@]}"; do
    IFS=':' read -r name color description <<< "$label_def"

    echo "Creating label: $name"

    # ラベルが既に存在する場合はスキップ
    if gh label list | grep -q "^$name"; then
        echo "  ⊘ Label already exists"
    else
        if gh label create "$name" --color "$color" --description "$description"; then
            echo "  ✓ Created successfully"
        else
            echo "  ✗ Failed to create"
        fi
    fi

    echo ""
done

echo "All labels created!"
echo "View labels: gh label list"
