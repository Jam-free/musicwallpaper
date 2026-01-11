#!/usr/bin/env python3
"""
GitHub 部署脚本
自动将项目部署到 GitHub 仓库
"""

import subprocess
import os
import sys

def run_command(cmd, description):
    """执行命令并显示结果"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            check=False
        )
        if result.stdout:
            print(result.stdout)
        if result.stderr and result.returncode != 0:
            print(f"⚠️  {result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

def main():
    print("🚀 开始部署到 GitHub...")
    print("=" * 50)
    
    # 切换到项目目录
    project_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_dir)
    print(f"📁 项目目录: {project_dir}")
    
    # 1. 检查是否已初始化 Git
    if not os.path.exists(".git"):
        print("\n📦 初始化 Git 仓库...")
        if not run_command("git init", "初始化 Git"):
            print("❌ Git 初始化失败")
            return False
    else:
        print("\n✅ Git 仓库已存在")
    
    # 2. 检查远程仓库
    result = subprocess.run(
        "git remote -v",
        shell=True,
        capture_output=True,
        text=True
    )
    
    if "origin" not in result.stdout:
        print("\n🔗 添加远程仓库...")
        if not run_command(
            "git remote add origin https://github.com/Jam-free/musicwallpaper.git",
            "添加远程仓库"
        ):
            print("⚠️  添加远程仓库失败，可能已存在")
    else:
        print("\n✅ 远程仓库已配置")
        # 更新远程仓库地址
        run_command(
            "git remote set-url origin https://github.com/Jam-free/musicwallpaper.git",
            "更新远程仓库地址"
        )
    
    # 3. 添加文件
    print("\n📝 添加文件到暂存区...")
    if not run_command("git add .", "添加文件"):
        print("❌ 添加文件失败")
        return False
    
    # 4. 检查是否有更改
    result = subprocess.run(
        "git status --porcelain",
        shell=True,
        capture_output=True,
        text=True
    )
    
    if not result.stdout.strip():
        print("\n✅ 没有新的更改需要提交")
    else:
        # 5. 提交更改
        print("\n💾 提交更改...")
        commit_message = "Initial commit: Music Window - Album cover wallpaper generator"
        if not run_command(
            f'git commit -m "{commit_message}"',
            "提交更改"
        ):
            print("❌ 提交失败")
            return False
    
    # 6. 检查当前分支
    result = subprocess.run(
        "git branch --show-current",
        shell=True,
        capture_output=True,
        text=True
    )
    current_branch = result.stdout.strip() or "main"
    
    # 7. 确保在 main 分支
    if current_branch != "main":
        print(f"\n🌿 切换到 main 分支（当前: {current_branch}）...")
        run_command("git checkout -b main", "创建 main 分支")
        current_branch = "main"
    
    # 8. 推送到 GitHub
    print(f"\n⬆️  推送到 GitHub (分支: {current_branch})...")
    print("⚠️  注意：如果这是首次推送，可能需要身份验证")
    print("   请准备好 GitHub Personal Access Token 或配置 SSH key")
    
    push_success = run_command(
        f"git push -u origin {current_branch}",
        "推送到 GitHub"
    )
    
    if not push_success:
        print("\n⚠️  推送可能失败，常见原因：")
        print("   1. 需要身份验证（使用 Personal Access Token）")
        print("   2. 远程仓库已有内容，需要先拉取")
        print("   3. 权限问题")
        print("\n💡 可以尝试手动执行：")
        print(f"   git pull origin {current_branch} --allow-unrelated-histories")
        print(f"   git push -u origin {current_branch}")
        return False
    
    print("\n" + "=" * 50)
    print("✅ 部署完成！")
    print("🌐 访问: https://github.com/Jam-free/musicwallpaper")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)




