#!/bin/bash

# 部署脚本：将项目推送到 GitHub
# 使用方法: bash deploy-to-github.sh

echo "🚀 开始部署到 GitHub..."

# 检查是否已初始化 git 仓库
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
fi

# 添加远程仓库（如果不存在）
if ! git remote | grep -q "origin"; then
    echo "🔗 添加远程仓库..."
    git remote add origin https://github.com/Jam-free/musicwallpaper.git
else
    echo "🔄 更新远程仓库地址..."
    git remote set-url origin https://github.com/Jam-free/musicwallpaper.git
fi

# 添加所有文件
echo "📝 添加文件到暂存区..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m "Initial commit: Music Window - Album cover wallpaper generator" || echo "⚠️  没有新的更改需要提交"

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

# 如果分支不存在，创建并切换到 main
if [ -z "$CURRENT_BRANCH" ]; then
    echo "🌿 创建 main 分支..."
    git checkout -b main
    CURRENT_BRANCH="main"
fi

# 推送到 GitHub
echo "⬆️  推送到 GitHub..."
git push -u origin $CURRENT_BRANCH || {
    echo "❌ 推送失败，尝试强制推送..."
    echo "⚠️  如果这是第一次推送，可能需要先创建仓库或设置权限"
    echo "💡 提示：如果仓库是空的，可以尝试: git push -u origin $CURRENT_BRANCH --force"
}

echo "✅ 部署完成！"
echo "🌐 访问: https://github.com/Jam-free/musicwallpaper"




