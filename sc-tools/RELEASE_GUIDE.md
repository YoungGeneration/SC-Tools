# SC-Tools 发布指南

## 📦 当前可用的安装包

### Windows (已构建 ✅)
- **MSI 安装包**: `SC-Tools-v0.1.0-Windows.msi` (8.5 MB)
- **NSIS 安装程序**: `SC-Tools-v0.1.0-Windows-Setup.exe` (6.2 MB)  
- **绿色版**: `SC-Tools-v0.1.0-Windows-Portable.zip` (8.1 MB)

### macOS (需 GitHub Actions 构建)
- **Universal Binary**: `SC-Tools-v0.1.0-macOS.zip`
- **Homebrew**: `SC-Tools-v0.1.0-macOS.tar.gz`

### Linux (需 GitHub Actions 构建)
- **AppImage**: `SC-Tools-v0.1.0-Linux-x86_64.AppImage`
- **Debian/Ubuntu**: `SC-Tools-v0.1.0-Linux-x86_64.deb`
- **Fedora/RHEL**: `SC-Tools-v0.1.0-Linux-x86_64.rpm`
- **ARM64**: 所有格式的 ARM64 版本

---

## 🚀 发布流程

### 方式 1: GitHub Actions 自动构建（推荐）

```bash
# 1. 更新版本号
# 编辑 sc-tools/package.json 和 src-tauri/Cargo.toml

# 2. 提交更改
git add .
git commit -m "chore: bump version to v0.1.0"

# 3. 创建并推送 tag
git tag v0.1.0
git push origin main
git push origin v0.1.0

# 4. GitHub Actions 自动构建所有平台
# 访问 https://github.com/your-repo/sc-tools/actions
# 等待构建完成（约 15-20 分钟）

# 5. 发布到 GitHub Releases
# 访问 https://github.com/your-repo/sc-tools/releases
# 编辑草稿，添加更新日志，发布
```

### 方式 2: 本地构建（仅 Windows）

```bash
cd sc-tools

# 构建
npm run tauri build

# 打包
powershell -ExecutionPolicy Bypass -File build-all-platforms.ps1

# 结果位于 release-assets/
```

---

## 📋 构建矩阵

| 平台 | 运行环境 | 输出格式 | 状态 |
|------|---------|---------|------|
| Windows x64 | windows-2022 | .msi, .exe, .zip | ✅ 已测试 |
| macOS Universal | macos-14 | .zip, .tar.gz | ⏳ 需 CI |
| Linux x64 | ubuntu-22.04 | .AppImage, .deb, .rpm | ⏳ 需 CI |
| Linux ARM64 | ubuntu-22.04-arm | .AppImage, .deb, .rpm | ⏳ 需 CI |

---

## 🔧 配置要求

### GitHub Secrets（可选）
- `TAURI_SIGNING_PRIVATE_KEY`: 代码签名私钥
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: 私钥密码

### 本地环境
- **Windows**: Node.js 20+, Rust, Visual Studio Build Tools
- **macOS**: Node.js 20+, Rust, Xcode Command Line Tools
- **Linux**: Node.js 20+, Rust, GTK3, WebKit2GTK

---

## 📝 版本号规范

遵循语义化版本 (Semantic Versioning):
- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

示例: `v1.2.3`

---

## ✅ 发布检查清单

- [ ] 更新 CHANGELOG.md
- [ ] 更新版本号（package.json + Cargo.toml）
- [ ] 运行完整测试套件
- [ ] 本地构建验证
- [ ] 创建 Git tag
- [ ] 推送到 GitHub
- [ ] 等待 CI 构建完成
- [ ] 验证所有安装包
- [ ] 编写 Release Notes
- [ ] 发布到 GitHub Releases

---

## 🔗 相关文件

- `.github/workflows/release.yml` - CI/CD 配置
- `build-all-platforms.ps1` - Windows 本地构建脚本
- `release-assets/README.md` - 用户安装指南
- `TEST_REPORT.md` - 测试报告

---

**参考项目**: [cc-switch](https://github.com/farion1231/cc-switch/releases)
