# music window

A minimalist, mobile-first web application that transforms album covers into beautiful 9:16 wallpapers.

## Features

- 🎨 **Minimalist Design**: Inspired by Apple Music, Nothing, Arc, and Linear
- 🎵 **iTunes Search Integration**: Automatically fetches album covers from iTunes API
- 🖼️ **Smart Wallpaper Generation**: Creates 9:16 wallpapers with intelligent color extraction and gradient filling
- 📱 **Mobile-First**: Optimized for mobile devices (390-430px width)
- 🎯 **High-Quality Output**: Generates wallpapers with natural, seamless background fills
- ⬇️ **Download Support**: Export wallpapers as PNG files

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Framer Motion** - Smooth animations
- **Canvas API** - Color extraction and image processing

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## How It Works

1. **Search**: Enter a song name in the centered input field
2. **Fetch**: The app searches iTunes API for the song and retrieves the album cover
3. **Extract**: Dominant colors are extracted from the album cover using canvas analysis
4. **Generate**: A 9:16 wallpaper is created with:
   - The album cover centered and slightly elevated
   - A blurred, darkened version of the cover as background
   - A gradient fill based on extracted colors
   - Subtle noise overlay for texture
5. **Download**: Export the wallpaper as a PNG file

## Design Philosophy

- **Minimalism**: Only essential elements, generous whitespace
- **Subtlety**: Gentle animations, soft transitions, muted colors
- **Quality**: Production-ready code with attention to detail
- **Mobile-First**: Designed for phone screens, works on desktop

## Browser Support

Modern browsers with ES6+ and Canvas API support:
- Chrome/Edge (latest)
- Safari (latest)
- Firefox (latest)

## Deployment

### Deploy to GitHub

#### 方法一：使用部署脚本（推荐）

```bash
# 给脚本添加执行权限
chmod +x deploy-to-github.sh

# 运行部署脚本
bash deploy-to-github.sh
```

#### 方法二：手动部署

1. 初始化 Git 仓库（如果还没有）:
```bash
git init
```

2. 添加所有文件:
```bash
git add .
```

3. 提交更改:
```bash
git commit -m "Initial commit: Music Window - Album cover wallpaper generator"
```

4. 添加远程仓库:
```bash
git remote add origin https://github.com/Jam-free/musicwallpaper.git
```

5. 推送到 GitHub:
```bash
git branch -M main
git push -u origin main
```

### Deploy to Vercel

1. 确保代码已推送到 GitHub（见上方步骤）

2. Go to [Vercel](https://vercel.com) and sign in with GitHub

3. Click "New Project" and import your repository: `Jam-free/musicwallpaper`

4. Vercel will automatically detect Vite and configure the build settings

5. Click "Deploy" - your site will be live in minutes!

The `vercel.json` file is already configured for optimal Vercel deployment.

### Manual Build

For manual deployment to any static hosting service:

```bash
npm run build
```

Upload the `dist` folder to your hosting provider.

## License

MIT

