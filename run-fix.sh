#!/bin/bash

# 交互式修复和部署脚本

echo "🔧 CommandLineTools 修复和 GitHub 部署"
echo "======================================"
echo ""

# 检查是否需要重置
echo "步骤 1: 重置 xcode-select 路径"
echo "----------------------------"
echo "⚠️  这一步需要输入你的 macOS 用户密码"
echo ""
read -p "是否现在执行重置？(y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo xcode-select --reset
    if [ $? -eq 0 ]; then
        echo "✅ 路径已重置"
    else
        echo "❌ 重置失败"
    fi
else
    echo "⏭️  跳过重置步骤"
fi

echo ""
echo "步骤 2: 安装 CommandLineTools"
echo "----------------------------"
echo "✅ 已触发安装请求"
echo ""
echo "📋 如果弹出安装窗口："
echo "   1. 点击 '安装' 按钮"
echo "   2. 等待安装完成（可能需要 5-10 分钟）"
echo "   3. 安装完成后，关闭窗口"
echo ""
read -p "安装完成后，按 Enter 继续..."

echo ""
echo "步骤 3: 验证 Git"
echo "----------------------------"
if git --version &> /dev/null; then
    echo "✅ Git 可用: $(git --version)"
else
    echo "❌ Git 仍然不可用"
    echo "   请确保 CommandLineTools 已完全安装"
    echo "   可以运行: git --version 测试"
    exit 1
fi

echo ""
echo "步骤 4: 部署到 GitHub"
echo "----------------------------"
cd "$(dirname "$0")"

# 初始化 Git
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
fi

# 配置远程仓库
if git remote | grep -q "origin"; then
    echo "🔄 更新远程仓库地址..."
    git remote set-url origin https://github.com/Jam-free/musicwallpaper.git
else
    echo "🔗 添加远程仓库..."
    git remote add origin https://github.com/Jam-free/musicwallpaper.git
fi

# 添加文件
echo "📝 添加文件到暂存区..."
git add .

# 检查是否有更改
if git diff --cached --quiet && [ -z "$(git status --porcelain)" ]; then
    echo "ℹ️  没有新更改"
    if ! git rev-parse --verify HEAD &> /dev/null; then
        echo "💾 创建初始提交..."
        git commit -m "Initial commit: Music Window - Album cover wallpaper generator"
    fi
else
    echo "💾 提交更改..."
    git commit -m "Initial commit: Music Window - Album cover wallpaper generator" || {
        echo "⚠️  提交失败，可能需要配置 git user"
        echo "   运行以下命令配置："
        echo "   git config user.name \"Your Name\""
        echo "   git config user.email \"your.email@example.com\""
        echo "   然后重新运行此脚本"
        exit 1
    }
fi

# 确保在 main 分支
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ -z "$CURRENT_BRANCH" ]; then
    git checkout -b main
    CURRENT_BRANCH="main"
elif [ "$CURRENT_BRANCH" != "main" ]; then
    git checkout -b main 2>/dev/null || git checkout main
    CURRENT_BRANCH="main"
fi

# 推送到 GitHub
echo "⬆️  推送到 GitHub..."
echo "⚠️  如果提示输入密码，请使用 GitHub Personal Access Token"
echo ""
git push -u origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "✅ 部署成功！"
    echo "🌐 访问: https://github.com/Jam-free/musicwallpaper"
    echo "======================================"
else
    echo ""
    echo "⚠️  推送失败，可能的原因："
    echo "   1. 需要身份验证（使用 Personal Access Token）"
    echo "   2. 远程仓库已有内容"
    echo ""
    echo "💡 如果远程仓库已有内容，运行："
    echo "   git pull origin $CURRENT_BRANCH --allow-unrelated-histories"
    echo "   git push -u origin $CURRENT_BRANCH"
fi




