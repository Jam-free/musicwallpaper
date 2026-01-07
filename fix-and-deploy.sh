#!/bin/bash

# 修复 CommandLineTools 并部署的完整脚本

echo "🔧 修复 CommandLineTools 并部署到 GitHub"
echo "=========================================="
echo ""

# 步骤 1: 重置 xcode-select（需要密码）
echo "步骤 1/4: 重置 xcode-select 路径..."
echo "⚠️  需要输入你的 macOS 用户密码"
sudo xcode-select --reset

if [ $? -eq 0 ]; then
    echo "✅ 路径已重置"
else
    echo "❌ 重置失败，可能需要手动执行: sudo xcode-select --reset"
    echo "   继续尝试安装..."
fi

echo ""

# 步骤 2: 安装 CommandLineTools
echo "步骤 2/4: 安装 CommandLineTools..."
xcode-select --install

if [ $? -eq 0 ]; then
    echo "✅ 安装请求已发送"
    echo ""
    echo "📋 如果弹出安装窗口："
    echo "   1. 点击 '安装' 按钮"
    echo "   2. 等待安装完成（可能需要 5-10 分钟）"
    echo "   3. 安装完成后，关闭窗口"
    echo ""
    echo "⏳ 等待安装完成..."
    echo "   安装完成后，按 Enter 继续..."
    read -r
else
    echo "⚠️  可能已经安装或正在安装中"
fi

echo ""

# 步骤 3: 验证 Git
echo "步骤 3/4: 验证 Git 是否可用..."
if git --version &> /dev/null; then
    echo "✅ Git 可用: $(git --version)"
else
    echo "❌ Git 仍然不可用"
    echo "   请确保 CommandLineTools 安装完成后再运行此脚本"
    exit 1
fi

echo ""

# 步骤 4: 部署到 GitHub
echo "步骤 4/4: 部署到 GitHub..."
cd "$(dirname "$0")"

# 初始化 Git（如果需要）
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
fi

# 配置远程仓库
if git remote | grep -q "origin"; then
    git remote set-url origin https://github.com/Jam-free/musicwallpaper.git
else
    git remote add origin https://github.com/Jam-free/musicwallpaper.git
fi

# 添加文件
echo "📝 添加文件..."
git add .

# 提交
echo "💾 提交更改..."
git commit -m "Initial commit: Music Window - Album cover wallpaper generator" || {
    echo "⚠️  提交失败，可能没有新更改或需要配置 git user"
    echo "   配置命令："
    echo "   git config user.name \"Your Name\""
    echo "   git config user.email \"your.email@example.com\""
}

# 推送到 GitHub
echo "⬆️  推送到 GitHub..."
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
if [ -z "$CURRENT_BRANCH" ]; then
    git checkout -b main
    CURRENT_BRANCH="main"
fi

git push -u origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ 部署成功！"
    echo "🌐 访问: https://github.com/Jam-free/musicwallpaper"
    echo "=========================================="
else
    echo ""
    echo "⚠️  推送可能失败，常见原因："
    echo "   1. 需要身份验证（使用 Personal Access Token）"
    echo "   2. 远程仓库已有内容"
    echo ""
    echo "💡 如果远程仓库已有内容，尝试："
    echo "   git pull origin $CURRENT_BRANCH --allow-unrelated-histories"
    echo "   git push -u origin $CURRENT_BRANCH"
fi

