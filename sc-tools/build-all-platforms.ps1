# SC-Tools 多平台构建脚本
# 用法: .\build-all-platforms.ps1

$ErrorActionPreference = 'Stop'
$VERSION = "0.1.0"

Write-Host "=== SC-Tools 多平台构建脚本 ===" -ForegroundColor Cyan
Write-Host "版本: $VERSION" -ForegroundColor Green
Write-Host ""

# 检查环境
Write-Host "[1/5] 检查构建环境..." -ForegroundColor Yellow
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "未找到 npm，请先安装 Node.js"
}
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Error "未找到 cargo，请先安装 Rust"
}
Write-Host "✓ 环境检查通过" -ForegroundColor Green

# 清理旧构建
Write-Host "[2/5] 清理旧构建..." -ForegroundColor Yellow
if (Test-Path "src-tauri/target/release/bundle") {
    Remove-Item -Recurse -Force "src-tauri/target/release/bundle"
}
if (Test-Path "release-assets") {
    Remove-Item -Recurse -Force "release-assets"
}
New-Item -ItemType Directory -Force -Path "release-assets" | Out-Null
Write-Host "✓ 清理完成" -ForegroundColor Green

# 安装依赖
Write-Host "[3/5] 安装依赖..." -ForegroundColor Yellow
npm ci
Write-Host "✓ 依赖安装完成" -ForegroundColor Green

# 构建应用
Write-Host "[4/5] 构建 Tauri 应用..." -ForegroundColor Yellow
npm run tauri build
Write-Host "✓ 构建完成" -ForegroundColor Green

# 打包资源
Write-Host "[5/5] 打包发布资源..." -ForegroundColor Yellow

# Windows MSI 安装包
$msi = Get-ChildItem -Path "src-tauri/target/release/bundle/msi" -Filter "*.msi" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($msi) {
    Copy-Item $msi.FullName "release-assets/SC-Tools-v${VERSION}-Windows.msi"
    Write-Host "  ✓ MSI 安装包: SC-Tools-v${VERSION}-Windows.msi" -ForegroundColor Green
}

# Windows NSIS 安装程序
$nsis = Get-ChildItem -Path "src-tauri/target/release/bundle/nsis" -Filter "*-setup.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($nsis) {
    Copy-Item $nsis.FullName "release-assets/SC-Tools-v${VERSION}-Windows-Setup.exe"
    Write-Host "  ✓ NSIS 安装程序: SC-Tools-v${VERSION}-Windows-Setup.exe" -ForegroundColor Green
}

# Windows 绿色版
$exe = "src-tauri/target/release/sc-tools.exe"
if (Test-Path $exe) {
    $portableDir = "release-assets/SC-Tools-Portable"
    New-Item -ItemType Directory -Force -Path $portableDir | Out-Null
    Copy-Item $exe $portableDir
    Compress-Archive -Path "$portableDir/*" -DestinationPath "release-assets/SC-Tools-v${VERSION}-Windows-Portable.zip" -Force
    Remove-Item -Recurse -Force $portableDir
    Write-Host "  ✓ 绿色版: SC-Tools-v${VERSION}-Windows-Portable.zip" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== 构建完成 ===" -ForegroundColor Cyan
Write-Host "发布资源位于: release-assets/" -ForegroundColor Green
Write-Host ""
Get-ChildItem -Path "release-assets" | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  $($_.Name) ($size MB)" -ForegroundColor White
}
