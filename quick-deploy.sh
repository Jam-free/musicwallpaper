#!/bin/bash

# 快速部署脚本 - 自动检测并部署

echo "🚀 Music Window - GitHub 部署脚本"
echo "=================================="

# 检查 git 是否可用
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装或不可用"
    echo ""
    echo "请先安装 CommandLineTools："
    echo "1. 如果弹出安装窗口，点击 '安装'"
    echo "2. 或者运行: xcode-select --install"
    echo "3. 安装完成后，重新运行此脚本"
    exit 1
fi

# 测试 git 命令
if ! git --version &> /dev/null; then
    echo "❌ Git 命令执行失败（可能是 xcrun 问题）"
    echo ""
    echo "请先修复 xcrun 问题："
    echo "1. 运行: xcode-select --install"
    echo "2. 如果已安装，运行: sudo xcode-select --reset"
    echo "3. 然后重新运行: xcode-select --install"
    exit 1
fi

echo "✅ Git 可用"
echo ""

# 进入项目目录
cd "$(dirname "$0")"
echo "📁 项目目录: $(pwd)"
echo ""

# 1. 初始化 Git（如果需要）
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
    echo "✅ Git 仓库已初始化"
else
    echo "✅ Git 仓库已存在"
fi

# 2. 配置远程仓库
echo ""
echo "🔗 配置远程仓库..."
if git remote | grep -q "origin"; then
    echo "   更新远程仓库地址..."
    git remote set-url origin https://github.com/Jam-free/musicwallpaper.git
else
    echo "   添加远程仓库..."
    git remote add origin https://github.com/Jam-free/musicwallpaper.git
fi
echo "✅ 远程仓库已配置: https://github.com/Jam-free/musicwallpaper.git"

# 3. 添加文件
echo ""
echo "📝 添加文件到暂存区..."
git add .
echo "✅ 文件已添加"

# 4. 检查是否有更改
if git diff --cached --quiet && [ -z "$(git status --porcelain)" ]; then
    echo ""
    echo "ℹ️  没有新的更改需要提交"
    echo "   检查是否已有提交..."
    if git rev-parse --verify HEAD &> /dev/null; then
        echo "✅ 已有提交记录"
    else
        echo "⚠️  没有提交记录，创建初始提交..."
        git commit -m "Initial commit: Music Window - Album cover wallpaper generator" || {
            echo "❌ 提交失败，可能需要配置 git user.name 和 user.email"
            echo ""
            echo "请运行以下命令配置："
            echo "  git config user.name \"Your Name\""
            echo "  git config user.email \"your.email@example.com\""
            exit 1
        }
    fi
else
    echo ""
    echo "💾 提交更改..."
    git commit -m "Initial commit: Music Window - Album cover wallpaper generator" || {
        echo "❌ 提交失败"
        echo ""
        echo "可能的原因："
        echo "1. 需要配置 git user.name 和 user.email"
        echo "2. 没有更改需要提交"
        exit 1
    }
    echo "✅ 更改已提交"
fi

# 5. 确保在 main 分支
echo ""
echo "🌿 检查分支..."
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ -z "$CURRENT_BRANCH" ]; then
    echo "   创建 main 分支..."
    git checkout -b main
    CURRENT_BRANCH="main"
elif [ "$CURRENT_BRANCH" != "main" ]; then
    echo "   切换到 main 分支（当前: $CURRENT_BRANCH）..."
    git checkout -b main 2>/dev/null || git checkout main
    CURRENT_BRANCH="main"
fi
echo "✅ 当前分支: $CURRENT_BRANCH"

# 6. 推送到 GitHub
echo ""
echo "⬆️  推送到 GitHub..."
echo "⚠️  注意：首次推送可能需要身份验证"
echo "   如果提示输入密码，请使用 GitHub Personal Access Token"
echo ""
git push -u origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================="
    echo "✅ 部署成功！"
    echo "🌐 访问: https://github.com/Jam-free/musicwallpaper"
    echo "=================================="
else
    echo ""
    echo "=================================="
    echo "⚠️  推送可能失败，常见原因："
    echo "   1. 需要身份验证（使用 Personal Access Token）"
    echo "   2. 远程仓库已有内容"
    echo "   3. 权限问题"
    echo ""
    echo "💡 如果远程仓库已有内容，尝试："
    echo "   git pull origin $CURRENT_BRANCH --allow-unrelated-histories"
    echo "   git push -u origin $CURRENT_BRANCH"
    echo "=================================="
    exit 1
fi




