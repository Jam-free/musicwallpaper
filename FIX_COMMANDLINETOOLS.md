# 修复 CommandLineTools 问题

## 当前状态

❌ **CommandLineTools 未正确安装**

检测到的问题：
- CommandLineTools 路径指向：`/Library/Developer/CommandLineTools`
- 但该目录下缺少 `xcrun` 文件
- Git 命令无法正常执行

## 解决方案

### 方法一：重新安装 CommandLineTools（推荐）

在终端执行以下命令：

```bash
# 1. 重置 xcode-select 路径（需要输入密码）
sudo xcode-select --reset

# 2. 重新安装 CommandLineTools
xcode-select --install
```

如果弹出安装窗口：
1. 点击 **"安装"** 按钮
2. 等待安装完成（可能需要 5-10 分钟）
3. 安装完成后，关闭窗口

### 方法二：手动指定 Xcode 路径（如果已安装 Xcode）

如果你已经安装了完整版 Xcode：

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### 方法三：使用 GitHub Desktop（无需修复）

如果不想修复 CommandLineTools，可以直接使用图形界面工具：

1. **下载 GitHub Desktop**
   - 访问：https://desktop.github.com/
   - 下载并安装

2. **添加仓库**
   - 打开 GitHub Desktop
   - 选择 "Add" -> "Add Existing Repository"
   - 选择目录：`/Users/jianhui/Desktop/AI builder`

3. **发布到 GitHub**
   - 点击 "Publish repository"
   - 仓库名：`musicwallpaper`
   - 账户：`Jam-free`
   - 点击 "Publish repository"

## 验证修复

修复后，在终端测试：

```bash
git --version
```

如果显示版本号（如 `git version 2.x.x`），说明修复成功。

然后运行部署脚本：

```bash
cd "/Users/jianhui/Desktop/AI builder"
bash quick-deploy.sh
```

## 常见问题

### Q: sudo 命令要求输入密码
A: 这是正常的，输入你的 macOS 用户密码（输入时不会显示字符）

### Q: 安装很慢
A: CommandLineTools 文件较大（约 500MB），需要一些时间下载和安装

### Q: 安装失败
A: 检查网络连接，或尝试从 Apple 开发者网站手动下载安装包

