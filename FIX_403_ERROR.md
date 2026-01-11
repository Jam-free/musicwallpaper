# 修复 403 权限错误

## 错误信息
```
remote: Permission to Jam-free/musicwallpaper.git denied to Jam-free.
fatal: unable to access 'https://github.com/Jam-free/musicwallpaper.git/': The requested URL returned error: 403
```

## 原因
这通常是因为：
1. 使用了错误的密码（GitHub 已不再支持密码认证）
2. Personal Access Token 权限不足或已过期
3. 凭据缓存中保存了错误的凭据

## 解决方案

### 方法一：使用 Personal Access Token（推荐）

#### 步骤 1: 生成新的 Token

1. 访问：https://github.com/settings/tokens
2. 点击 **"Generate new token"** -> **"Generate new token (classic)"**
3. 填写信息：
   - **Note**: `Music Wallpaper Deploy`（任意名称）
   - **Expiration**: 选择 90 days 或 No expiration
   - **Select scopes**: 勾选 **`repo`**（全部仓库权限）
4. 点击 **"Generate token"**
5. **重要**：立即复制生成的 token（格式类似：`ghp_xxxxxxxxxxxxxxxxxxxx`），只显示一次！

#### 步骤 2: 清除旧的凭据

在终端执行：

```bash
cd "/Users/jianhui/Desktop/AI builder"

# 清除 macOS Keychain 中的 GitHub 凭据
git credential-osxkeychain erase <<EOF
host=github.com
protocol=https
EOF
```

或者手动清除：
1. 打开 "钥匙串访问"（Keychain Access）
2. 搜索 "github.com"
3. 删除所有相关的 "github.com" 条目

#### 步骤 3: 使用 Token 推送

```bash
cd "/Users/jianhui/Desktop/AI builder"
git push -u origin main
```

当提示时：
- **Username**: `Jam-free`
- **Password**: 粘贴刚才复制的 token（不是你的 GitHub 密码）

### 方法二：使用 GitHub CLI（gh）

如果已安装 GitHub CLI：

```bash
# 登录 GitHub
gh auth login

# 选择 GitHub.com
# 选择 HTTPS
# 选择使用浏览器登录或使用 token

# 然后推送
cd "/Users/jianhui/Desktop/AI builder"
git push -u origin main
```

### 方法三：在 URL 中包含 Token（临时方案）

```bash
cd "/Users/jianhui/Desktop/AI builder"

# 将 token 添加到 URL（替换 YOUR_TOKEN）
git remote set-url origin https://YOUR_TOKEN@github.com/Jam-free/musicwallpaper.git

# 推送
git push -u origin main

# 推送完成后，恢复原始 URL（安全考虑）
git remote set-url origin https://github.com/Jam-free/musicwallpaper.git
```

### 方法四：使用 SSH（如果已配置 SSH key）

```bash
cd "/Users/jianhui/Desktop/AI builder"

# 切换到 SSH 方式
git remote set-url origin git@github.com:Jam-free/musicwallpaper.git

# 推送
git push -u origin main
```

## 验证 Token 权限

确保 Token 有以下权限：
- ✅ **repo** - 完整仓库访问权限（包括私有仓库）

## 常见问题

### Q: Token 仍然被拒绝
A: 检查：
1. Token 是否已过期
2. Token 是否有 `repo` 权限
3. 是否使用了正确的用户名（`Jam-free`）

### Q: 不想每次输入 Token
A: 使用 Git Credential Helper：
```bash
git config --global credential.helper osxkeychain
```
然后第一次输入 Token 后，macOS 会保存它。

### Q: 使用 GitHub Desktop
A: 如果命令行有问题，可以使用 GitHub Desktop：
1. 下载：https://desktop.github.com/
2. 使用 GitHub 账号登录
3. 添加仓库并推送

## 推荐流程

1. ✅ 生成新的 Personal Access Token（有 `repo` 权限）
2. ✅ 清除旧的凭据缓存
3. ✅ 使用 Token 推送
4. ✅ 配置 credential helper 保存 Token




