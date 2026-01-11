# 手动推送指南

## 当前状态

✅ **已完成：**
- Git 仓库已初始化
- 远程仓库已配置：`https://github.com/Jam-free/musicwallpaper.git`
- 文件已添加并提交
- 当前分支：`main`
- 提交记录：`dffbd2e Initial commit: Music Window - Album cover wallpaper generator`

## 最后一步：推送到 GitHub

由于需要身份验证，请在终端手动执行：

```bash
cd "/Users/jianhui/Desktop/AI builder"
git push -u origin main
```

### 身份验证

如果提示输入用户名和密码：

1. **用户名**：输入你的 GitHub 用户名（`Jam-free`）

2. **密码**：使用 GitHub Personal Access Token（不是账户密码）

   **如何生成 Token：**
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token" -> "Generate new token (classic)"
   - 填写 Note（如：`Music Wallpaper Deploy`）
   - 选择过期时间（建议：90 days 或 No expiration）
   - 勾选权限：`repo`（全部仓库权限）
   - 点击 "Generate token"
   - **重要**：复制生成的 token（只显示一次）

3. 推送时：
   - Username: `Jam-free`
   - Password: 粘贴刚才复制的 token

### 如果远程仓库已有内容

如果推送失败，提示远程仓库已有内容，执行：

```bash
git pull origin main --allow-unrelated-histories
# 如果有冲突，解决冲突后：
git add .
git commit -m "Merge remote and local"
git push -u origin main
```

## 验证部署

推送成功后，访问：
**https://github.com/Jam-free/musicwallpaper**

你应该能看到所有项目文件。

## 使用 GitHub Desktop（替代方案）

如果不想使用命令行：

1. 下载 GitHub Desktop：https://desktop.github.com/
2. 打开后选择 "Add" -> "Add Existing Repository"
3. 选择目录：`/Users/jianhui/Desktop/AI builder`
4. 点击 "Publish repository"
5. 仓库名：`musicwallpaper`
6. 账户：`Jam-free`
7. 点击 "Publish repository"




