# GitHub 部署指南

本指南将帮助你将 Music Window 项目部署到 GitHub 仓库。

## 仓库信息

- **仓库地址**: https://github.com/Jam-free/musicwallpaper.git
- **仓库名称**: musicwallpaper

## 快速部署

### 方式一：使用部署脚本（最简单）

```bash
# 在项目根目录执行
bash deploy-to-github.sh
```

脚本会自动完成以下操作：
1. 初始化 Git 仓库（如果还没有）
2. 添加远程仓库
3. 提交所有文件
4. 推送到 GitHub

### 方式二：手动部署

#### 步骤 1: 检查 Git 状态

```bash
# 检查是否已初始化 Git
git status
```

如果显示 "not a git repository"，需要初始化：

```bash
git init
```

#### 步骤 2: 配置 Git（如果还没有配置）

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

#### 步骤 3: 添加远程仓库

```bash
# 检查是否已有远程仓库
git remote -v

# 如果没有，添加远程仓库
git remote add origin https://github.com/Jam-free/musicwallpaper.git

# 如果已存在但地址不对，更新地址
git remote set-url origin https://github.com/Jam-free/musicwallpaper.git
```

#### 步骤 4: 添加并提交文件

```bash
# 添加所有文件（.gitignore 会自动排除不需要的文件）
git add .

# 查看将要提交的文件
git status

# 提交更改
git commit -m "Initial commit: Music Window - Album cover wallpaper generator"
```

#### 步骤 5: 推送到 GitHub

```bash
# 确保在 main 分支
git branch -M main

# 推送到 GitHub（首次推送）
git push -u origin main
```

如果遇到错误，可能需要：

```bash
# 如果远程仓库已有内容，先拉取
git pull origin main --allow-unrelated-histories

# 然后再推送
git push -u origin main
```

## 常见问题

### 1. 推送被拒绝（Permission denied）

**解决方案**:
- 确保已登录 GitHub
- 检查仓库权限
- 使用 SSH 方式（如果已配置 SSH key）:
  ```bash
  git remote set-url origin git@github.com:Jam-free/musicwallpaper.git
  ```

### 2. 仓库不为空

如果远程仓库已有内容（如 README），需要先拉取：

```bash
git pull origin main --allow-unrelated-histories
# 解决可能的冲突后
git push -u origin main
```

### 3. 需要身份验证

GitHub 现在要求使用 Personal Access Token 而不是密码：

1. 访问 https://github.com/settings/tokens
2. 生成新的 token（选择 `repo` 权限）
3. 使用 token 作为密码

或者使用 GitHub CLI:

```bash
gh auth login
```

## 验证部署

部署成功后，访问以下地址查看仓库：

https://github.com/Jam-free/musicwallpaper

## 后续更新

以后更新代码时，使用以下命令：

```bash
# 添加更改
git add .

# 提交更改
git commit -m "描述你的更改"

# 推送到 GitHub
git push
```

## 下一步：部署到 Vercel

代码推送到 GitHub 后，可以：

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择 `Jam-free/musicwallpaper` 仓库
5. Vercel 会自动检测 Vite 配置
6. 点击 "Deploy" 完成部署

项目会自动部署到 Vercel，获得一个可访问的 URL！

