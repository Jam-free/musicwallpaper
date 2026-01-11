# 部署指南 / Deployment Guide

## 🚀 快速启动项目

### 1. 安装依赖

在项目根目录运行：

```bash
npm install
```

如果遇到权限问题，可以尝试：
```bash
npm install --legacy-peer-deps
```

或者使用 yarn：
```bash
yarn install
```

### 2. 启动开发服务器

```bash
npm run dev
```

项目会在 `http://localhost:3000` 启动，浏览器会自动打开。

### 3. 预览效果

- 在输入框中输入任意歌曲名称（英文或中文都可以）
- 点击搜索按钮或按回车
- 等待加载完成后，会显示生成的壁纸
- 点击 "Download" 可以下载壁纸

---

## 📦 上传到 GitHub

### 方法一：使用命令行

1. **初始化 Git 仓库**（如果还没有）：
```bash
git init
```

2. **添加所有文件**：
```bash
git add .
```

3. **提交代码**：
```bash
git commit -m "Initial commit: music window app"
```

4. **在 GitHub 上创建新仓库**：
   - 访问 https://github.com/new
   - 输入仓库名称（如：`music-window`）
   - 不要勾选 "Initialize with README"（因为我们已经有了）
   - 点击 "Create repository"

5. **连接远程仓库并推送**：
```bash
git remote add origin https://github.com/你的用户名/music-window.git
git branch -M main
git push -u origin main
```

### 方法二：使用 GitHub Desktop

1. 下载并安装 [GitHub Desktop](https://desktop.github.com/)
2. 打开 GitHub Desktop，选择 "Add" → "Add Existing Repository"
3. 选择项目文件夹
4. 点击 "Publish repository" 上传到 GitHub

---

## 🌐 部署到 Vercel

### 自动部署（推荐）

1. **访问 Vercel**：
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**：
   - 点击 "New Project"
   - 选择你的 GitHub 仓库（music-window）
   - Vercel 会自动检测到这是一个 Vite 项目

3. **配置部署**（通常不需要修改）：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **点击 Deploy**：
   - 等待构建完成（通常 1-2 分钟）
   - 部署完成后会获得一个 URL（如：`music-window.vercel.app`）

5. **自定义域名**（可选）：
   - 在项目设置中可以添加自定义域名

### 手动部署

如果需要手动部署：

```bash
# 构建生产版本
npm run build

# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

---

## ✅ 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] 在本地测试 `npm run build` 成功
- [ ] Vercel 项目已创建并连接 GitHub 仓库
- [ ] 部署成功，网站可以访问
- [ ] 测试搜索功能是否正常
- [ ] 测试下载功能是否正常

---

## 🐛 常见问题

### 1. npm install 失败

**问题**：权限错误或网络问题

**解决方案**：
- 使用 `npm install --legacy-peer-deps`
- 或使用 `yarn install`
- 检查网络连接和 npm 镜像源

### 2. 构建失败

**问题**：Vercel 构建时出错

**解决方案**：
- 检查 `package.json` 中的依赖版本
- 确保 Node.js 版本 >= 16
- 查看 Vercel 构建日志中的具体错误信息

### 3. 部署后 API 请求失败

**问题**：iTunes API 跨域问题

**解决方案**：
- iTunes API 支持 CORS，通常不会有问题
- 如果遇到问题，检查浏览器控制台的错误信息

### 4. 图片加载失败

**问题**：专辑封面无法显示

**解决方案**：
- 检查网络连接
- 某些图片可能因为 CORS 限制无法加载
- 可以尝试使用代理或更换图片源

---

## 📱 测试建议

部署后建议测试：

1. ✅ 在不同设备上访问（手机、平板、电脑）
2. ✅ 测试不同歌曲的搜索
3. ✅ 测试壁纸下载功能
4. ✅ 检查移动端显示效果
5. ✅ 测试加载动画和过渡效果

---

## 🎉 完成！

部署成功后，你的网站就可以被任何人访问了！

分享你的网站链接，让朋友们也来试试吧！






