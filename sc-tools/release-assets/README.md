# SC-Tools v0.1.0 - 发布说明

AI Coding CLI 配置管理器 + API 网关

## 📦 Windows 安装包

### 1. MSI 安装包（推荐）
**文件**: `SC-Tools-v0.1.0-Windows.msi` (8.5 MB)

- ✅ 标准 Windows 安装程序
- ✅ 自动添加到开始菜单
- ✅ 支持自动更新
- ✅ 可通过控制面板卸载

**安装方法**:
```
双击 .msi 文件，按照向导完成安装
```

### 2. NSIS 安装程序
**文件**: `SC-Tools-v0.1.0-Windows-Setup.exe` (6.2 MB)

- ✅ 轻量级安装程序
- ✅ 快速安装
- ✅ 支持静默安装

**安装方法**:
```
双击 .exe 文件，按照向导完成安装
```

### 3. 绿色版（免安装）
**文件**: `SC-Tools-v0.1.0-Windows-Portable.zip` (8.1 MB)

- ✅ 无需安装，解压即用
- ✅ 便于携带
- ✅ 不写入注册表

**使用方法**:
```
1. 解压 .zip 文件到任意目录
2. 双击 sc-tools.exe 运行
```

---

## 🚀 系统要求

- **操作系统**: Windows 10 或更高版本 (x64)
- **内存**: 建议 4GB 以上
- **磁盘空间**: 至少 100MB 可用空间

---

## 📋 功能特性

### 核心功能
- ✅ **供应商管理** - 统一管理 Claude Code/Codex/Gemini/OpenCode 配置
- ✅ **API 代理网关** - 支持故障转移和熔断器
- ✅ **MCP 管理** - 统一管理 MCP 服务器配置
- ✅ **Skills 管理** - 安装、卸载、扫描 Skills
- ✅ **提示词管理** - 多应用提示词 CRUD
- ✅ **使用统计** - Token 追踪和成本分析
- ✅ **深链接** - sctools:// 一键导入配置
- ✅ **配置导入导出** - JSON/ZIP 备份

### 技术亮点
- 🔄 Live 配置同步（实时写入各应用配置文件）
- 🔀 代理接管模式（启动时接管，停止时恢复）
- 🛡️ 故障转移 + 熔断器（自动切换备用供应商）
- 💾 SQLite 数据库（v0→v6 自动迁移）
- 🌐 国际化支持（中文/英文/日文）

---

## 📖 使用指南

### 首次启动
1. 运行 SC-Tools
2. 添加供应商配置（API Key、Base URL 等）
3. 启用代理服务器（可选）
4. 配置 MCP 服务器（可选）

### 供应商配置
- 支持 Claude Code、Codex、Gemini、OpenCode
- 支持自定义端点
- 支持故障转移队列

### 代理服务器
- 默认监听: `127.0.0.1:15721`
- 支持 Anthropic/OpenAI/Gemini API
- 自动 Token 计算和成本追踪

---

## 🔧 故障排除

### 应用无法启动
- 检查是否有杀毒软件拦截
- 尝试以管理员身份运行
- 检查 Windows 防火墙设置

### 代理服务器无法启动
- 检查端口 15721 是否被占用
- 查看日志文件: `~/.sc-tools/logs/`

### 配置丢失
- 检查数据库文件: `~/.sc-tools/sc-tools.db`
- 尝试从备份恢复

---

## 📝 更新日志

### v0.1.0 (2026-02-08)
- 🎉 首个正式版本发布
- ✅ 完整的供应商管理功能
- ✅ API 代理网关（故障转移 + 熔断器）
- ✅ MCP 和 Skills 统一管理
- ✅ 使用统计和成本分析
- ✅ 多平台支持（Windows/macOS/Linux）

---

## 🔗 相关链接

- **GitHub**: https://github.com/your-repo/sc-tools
- **文档**: https://github.com/your-repo/sc-tools/wiki
- **问题反馈**: https://github.com/your-repo/sc-tools/issues

---

## 📄 许可证

MIT License

---

**感谢使用 SC-Tools！**
