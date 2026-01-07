# 修复 xcrun 错误并部署

## 问题
系统出现 `xcrun: error: invalid active developer path` 错误，这通常是因为 macOS CommandLineTools 需要更新。

## 解决方案

### 方法一：更新 CommandLineTools（推荐）

在终端执行：

```bash
xcode-select --install
```

如果已安装但路径错误，执行：

```bash
sudo xcode-select --reset
xcode-select --install
```

### 方法二：手动部署（如果 xcrun 问题暂时无法解决）

在终端中依次执行以下命令：

```bash
# 1. 进入项目目录
cd "/Users/jianhui/Desktop/AI builder"

# 2. 初始化 Git（如果还没有）
git init

# 3. 添加远程仓库
git remote add origin https://github.com/Jam-free/musicwallpaper.git
# 如果已存在，更新地址：
# git remote set-url origin https://github.com/Jam-free/musicwallpaper.git

# 4. 添加所有文件
git add .

# 5. 提交更改
git commit -m "Initial commit: Music Window - Album cover wallpaper generator"

# 6. 推送到 GitHub
git branch -M main
git push -u origin main
```

### 方法三：使用 GitHub Desktop

1. 下载并安装 [GitHub Desktop](https://desktop.github.com/)
2. 打开 GitHub Desktop
3. 选择 "Add" -> "Add Existing Repository"
4. 选择项目目录：`/Users/jianhui/Desktop/AI builder`
5. 点击 "Publish repository"
6. 输入仓库名称：`musicwallpaper`
7. 选择账户：`Jam-free`
8. 点击 "Publish repository"

## 身份验证

如果推送时要求身份验证：

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" -> "Generate new token (classic)"
3. 选择 `repo` 权限
4. 生成 token 并复制
5. 推送时使用 token 作为密码（用户名是你的 GitHub 用户名）

## 验证部署

部署成功后，访问：
https://github.com/Jam-free/musicwallpaper

