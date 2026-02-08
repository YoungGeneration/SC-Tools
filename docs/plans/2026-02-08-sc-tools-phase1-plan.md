# SC-Tools 桌面端 Phase 1 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 基于 CC Switch 项目改造出 SC-Tools 桌面端，完成品牌重命名、供应商简化、保留核心功能。

**Architecture:** 复制 cc-switch-main 到 sc-tools 目录，逐步改造：先完成品牌重命名（配置文件→Rust后端→前端→国际化），再简化供应商系统（删除预设和分类，统一为扁平列表），最后预留 SC-API 管理面板入口。

**Tech Stack:** Tauri 2 + Rust / React + TypeScript + TailwindCSS + shadcn/ui / SQLite / TanStack Query v5

---

## Task 1: 项目初始化 — 复制并清理代码库

**Files:**
- Create: `sc-tools/` (从 `cc-switch-main/` 复制)
- Delete: `sc-tools/node_modules/`, `sc-tools/src-tauri/target/`, `sc-tools/dist/`

**Step 1: 复制项目**

```bash
cd H:\GitHubproject\SC-Tools
cp -r cc-switch-main sc-tools
```

**Step 2: 清理构建产物和缓存**

```bash
cd sc-tools
rm -rf node_modules dist src-tauri/target .vite
```

**Step 3: 验证目录结构完整**

```bash
ls src/ src-tauri/ src\config\ src-tauri\src\
```
Expected: 所有源代码目录存在

**Step 4: Commit**

```bash
cd H:\GitHubproject\SC-Tools
git add sc-tools/
git commit -m "chore: copy cc-switch-main as sc-tools base"
```

---

## Task 2: 品牌重命名 — 核心配置文件

**Files:**
- Modify: `sc-tools/src-tauri/tauri.conf.json`
- Modify: `sc-tools/src-tauri/tauri.windows.conf.json`
- Modify: `sc-tools/package.json`
- Modify: `sc-tools/src-tauri/Cargo.toml`

**Step 1: 修改 tauri.conf.json**

将以下字段修改：
- `productName`: "CC Switch" → "SC-Tools"
- `identifier`: "com.ccswitch.desktop" → "com.sctools.desktop"
- deep-link schemes: "ccswitch" → "sctools"
- updater endpoints: 更新为 SC-Tools 的 GitHub releases URL

**Step 2: 修改 tauri.windows.conf.json**

- `title`: "CC Switch" → "SC-Tools"

**Step 3: 修改 package.json**

- `name`: "cc-switch" → "sc-tools"

**Step 4: 修改 Cargo.toml**

- `name`: "cc-switch" → "sc-tools"
- `description`: 更新为 SC-Tools 描述
- `lib.name`: "cc_switch_lib" → "sc_tools_lib"

**Step 5: 验证配置文件语法**

```bash
cd sc-tools
cat src-tauri/tauri.conf.json | python -m json.tool > nul
cat package.json | python -m json.tool > nul
```
Expected: 无错误输出

**Step 6: Commit**

```bash
git add sc-tools/src-tauri/tauri.conf.json sc-tools/src-tauri/tauri.windows.conf.json sc-tools/package.json sc-tools/src-tauri/Cargo.toml
git commit -m "chore: rename brand in core config files (CC Switch → SC-Tools)"
```

---

## Task 3: 品牌重命名 — Rust 后端源代码

**Files:**
- Modify: `sc-tools/src-tauri/src/lib.rs`
- Modify: `sc-tools/src-tauri/src/config.rs`
- Modify: `sc-tools/src-tauri/src/settings.rs`
- Modify: `sc-tools/src-tauri/src/auto_launch.rs`

**Step 1: 修改 lib.rs**

全局替换（注意保持上下文正确）：
- `"ccswitch://"` → `"sctools://"`
- `"cc-switch.log"` → `"sc-tools.log"`
- `"cc-switch.db"` → `"sc-tools.db"`
- `"cc-switch"` (日志文件名) → `"sc-tools"`
- `"com.ccswitch.desktop"` → `"com.sctools.desktop"`
- `"cc-switch-handler.desktop"` → `"sc-tools-handler.desktop"`
- `"CC Switch"` → `"SC-Tools"`

**Step 2: 修改 config.rs**

- `".cc-switch"` → `".sc-tools"` (配置目录)
- `"cc-switch.db"` → `"sc-tools.db"` (数据库文件名)

**Step 3: 修改 settings.rs**

- `".cc-switch"` → `".sc-tools"` (配置目录)

**Step 4: 修改 auto_launch.rs**

- `"CC Switch"` → `"SC-Tools"` (应用名称)
- 测试中的路径也需要更新

**Step 5: 全局搜索确认无遗漏**

```bash
cd sc-tools/src-tauri/src
grep -r "cc-switch\|CC Switch\|ccswitch\|cc_switch" --include="*.rs" -l
```
Expected: 仅剩深度链接和供应商相关文件（Task 4 和 Task 5 处理）

**Step 6: Commit**

```bash
git add sc-tools/src-tauri/src/lib.rs sc-tools/src-tauri/src/config.rs sc-tools/src-tauri/src/settings.rs sc-tools/src-tauri/src/auto_launch.rs
git commit -m "chore: rename brand in Rust backend (CC Switch → SC-Tools)"
```

---

## Task 4: 品牌重命名 — 深度链接模块

**Files:**
- Modify: `sc-tools/src-tauri/src/deeplink/mod.rs`
- Modify: `sc-tools/src-tauri/src/deeplink/parser.rs`
- Modify: `sc-tools/src-tauri/src/deeplink/tests.rs`
- Modify: `sc-tools/src-tauri/src/deeplink/skill.rs`
- Modify: `sc-tools/src-tauri/src/deeplink/mcp.rs`
- Modify: `sc-tools/src-tauri/src/deeplink/provider.rs`
- Modify: `sc-tools/src-tauri/src/deeplink/prompt.rs`
- Modify: `sc-tools/src-tauri/Info.plist`

**Step 1: 修改 deeplink 目录下所有文件**

全局替换：
- `"ccswitch://"` → `"sctools://"`
- `"ccswitch"` (scheme 名称) → `"sctools"`
- `"CC Switch"` → `"SC-Tools"`

**Step 2: 修改 Info.plist**

- `CFBundleURLName`: "CC Switch Deep Link" → "SC-Tools Deep Link"
- `CFBundleURLSchemes`: "ccswitch" → "sctools"

**Step 3: 验证深度链接测试**

```bash
cd sc-tools/src-tauri/src/deeplink
grep -n "ccswitch" *.rs
```
Expected: 无匹配结果

**Step 4: Commit**

```bash
git add sc-tools/src-tauri/src/deeplink/ sc-tools/src-tauri/Info.plist
git commit -m "chore: rename deeplink protocol (ccswitch:// → sctools://)"
```

---

## Task 5: 品牌重命名 — Rust 其余文件

**Files:**
- Modify: `sc-tools/src-tauri/src/provider.rs`
- Modify: `sc-tools/src-tauri/src/provider_defaults.rs`
- Modify: `sc-tools/src-tauri/src/services/provider/mod.rs`
- Modify: `sc-tools/src-tauri/src/proxy/provider_router.rs`
- Modify: 其他包含品牌名称的 .rs 文件

**Step 1: 搜索并修改所有剩余 Rust 文件**

```bash
cd sc-tools/src-tauri
grep -rn "cc-switch\|CC Switch\|ccswitch\|cc_switch" --include="*.rs" src/
```

对每个匹配项进行替换：
- `cc_switch_lib` → `sc_tools_lib`
- `cc-switch` → `sc-tools`
- `CC Switch` → `SC-Tools`
- `ccswitch` → `sctools`

**Step 2: 更新 Cargo.toml 中的 lib 引用**

确保 `src-tauri/Cargo.toml` 中 `[lib] name = "sc_tools_lib"` 与所有 `use` 语句一致。

**Step 3: 验证无遗漏**

```bash
grep -rn "cc-switch\|CC Switch\|ccswitch\|cc_switch" --include="*.rs" src/
```
Expected: 无匹配结果

**Step 4: Commit**

```bash
git add sc-tools/src-tauri/
git commit -m "chore: rename brand in all remaining Rust files"
```

---

## Task 6: 品牌重命名 — 前端代码和国际化

**Files:**
- Modify: `sc-tools/src/components/settings/AboutSection.tsx`
- Modify: `sc-tools/src/main.tsx`
- Modify: `sc-tools/src/i18n/locales/zh.json`
- Modify: `sc-tools/src/i18n/locales/en.json`
- Modify: `sc-tools/src/i18n/locales/ja.json`

**Step 1: 修改 AboutSection.tsx**

- GitHub URL 更新为 SC-Tools 仓库地址
- alt 文本和标题: "CC Switch" → "SC-Tools"

**Step 2: 修改 main.tsx**

- `"~/.cc-switch/config.json"` → `"~/.sc-tools/config.json"`
- `"cc-switch-theme"` → `"sc-tools-theme"`

**Step 3: 修改三个国际化文件**

对 zh.json、en.json、ja.json 执行全局替换：
- `"CC Switch"` → `"SC-Tools"`
- `"cc-switch"` → `"sc-tools"`
- `".cc-switch"` → `".sc-tools"`
- `"ccswitch"` → `"sctools"`

**Step 4: 全局搜索前端代码确认无遗漏**

```bash
cd sc-tools/src
grep -rn "cc-switch\|CC Switch\|ccswitch" --include="*.ts" --include="*.tsx" --include="*.json" .
```
Expected: 无匹配结果（或仅剩合作伙伴相关内容，后续处理）

**Step 5: Commit**

```bash
git add sc-tools/src/
git commit -m "chore: rename brand in frontend and i18n files"
```

---

## Task 7: 品牌重命名 — Flatpak、文档和资源文件

**Files:**
- Modify: `sc-tools/flatpak/com.ccswitch.desktop.desktop` → 重命名为 `com.sctools.desktop.desktop`
- Modify: `sc-tools/flatpak/com.ccswitch.desktop.yml` → 重命名为 `com.sctools.desktop.yml`
- Modify: `sc-tools/flatpak/com.ccswitch.desktop.metainfo.xml` → 重命名为 `com.sctools.desktop.metainfo.xml`
- Modify: `sc-tools/deplink.html`
- Modify: `sc-tools/README.md`

**Step 1: 重命名并修改 Flatpak 文件**

```bash
cd sc-tools/flatpak
mv com.ccswitch.desktop.desktop com.sctools.desktop.desktop
mv com.ccswitch.desktop.yml com.sctools.desktop.yml
mv com.ccswitch.desktop.metainfo.xml com.sctools.desktop.metainfo.xml
```

修改文件内容中所有 `ccswitch` → `sctools`，`CC Switch` → `SC-Tools`，`cc-switch` → `sc-tools`。

**Step 2: 修改 deplink.html**

全局替换：
- `"CC Switch"` → `"SC-Tools"`
- `"ccswitch://"` → `"sctools://"`
- `"ccswitch:"` → `"sctools:"`

**Step 3: 修改 README.md（及 README_ZH.md、README_JA.md）**

更新项目名称、仓库链接、安装命令等。

**Step 4: 全局最终验证**

```bash
cd sc-tools
grep -rn "CC Switch\|cc-switch\|ccswitch" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.rs" --include="*.html" --include="*.xml" --include="*.yml" --include="*.desktop" --include="*.md" .
```
Expected: 无匹配结果（或仅剩第三方引用如合作伙伴链接）

**Step 5: Commit**

```bash
git add sc-tools/
git commit -m "chore: rename brand in flatpak, docs, and resource files"
```

---

## Task 8: 供应商简化 — 删除预设文件和分类系统

**Files:**
- Delete: `sc-tools/src/config/claudeProviderPresets.ts`
- Delete: `sc-tools/src/config/codexProviderPresets.ts`
- Delete: `sc-tools/src/config/geminiProviderPresets.ts`
- Delete: `sc-tools/src/config/universalProviderPresets.ts`
- Delete: `sc-tools/src/config/opencodeProviderPresets.ts`
- Modify: `sc-tools/src/types.ts`
- Delete: `sc-tools/src/components/providers/forms/hooks/useProviderCategory.ts`

**Step 1: 删除所有预设文件**

```bash
cd sc-tools/src/config
rm -f claudeProviderPresets.ts codexProviderPresets.ts geminiProviderPresets.ts universalProviderPresets.ts opencodeProviderPresets.ts
```

**Step 2: 简化 types.ts 中的 ProviderCategory**

将 `ProviderCategory` 类型从 5 种分类简化为移除分类概念：

```typescript
// 删除 ProviderCategory 类型定义
// 删除: type ProviderCategory = "official" | "cn_official" | "aggregator" | "third_party" | "custom"

// 简化 Provider 接口，移除 category 字段
interface Provider {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  targetCli: 'claude' | 'codex' | 'gemini' | 'opencode';
  modelOverride?: string;
  enabled: boolean;
  sortOrder: number;
  notes?: string;
  icon?: string;
  iconColor?: string;
  meta?: ProviderMeta;
  createdAt?: string;
}
```

**Step 3: 删除 useProviderCategory hook**

```bash
rm sc-tools/src/components/providers/forms/hooks/useProviderCategory.ts
```

**Step 4: 搜索并修复所有引用被删除文件的导入**

```bash
grep -rn "ProviderPreset\|claudeProviderPresets\|codexProviderPresets\|geminiProviderPresets\|universalProviderPresets\|opencodeProviderPresets\|useProviderCategory\|ProviderCategory" --include="*.ts" --include="*.tsx" src/
```

逐个修复所有导入错误。

**Step 5: Commit**

```bash
git add -A sc-tools/
git commit -m "feat: remove all provider presets and category system"
```

---

## Task 9: 供应商简化 — 删除统一供应商（Universal Provider）系统

**Files:**
- Delete: `sc-tools/src/components/universal/` (整个目录)
- Modify: `sc-tools/src-tauri/src/database/dao/universal_providers.rs` (删除或清空)
- Modify: 相关路由和导入

**Step 1: 删除统一供应商前端组件**

```bash
rm -rf sc-tools/src/components/universal/
```

**Step 2: 清理 Rust 后端的 universal_providers DAO**

删除或注释掉 `universal_providers.rs` 中的所有函数，保留空模块。

**Step 3: 搜索并修复所有引用**

```bash
grep -rn "universal\|Universal" --include="*.ts" --include="*.tsx" --include="*.rs" sc-tools/src/ sc-tools/src-tauri/src/
```

移除所有对统一供应商的引用。

**Step 4: Commit**

```bash
git add -A sc-tools/
git commit -m "feat: remove universal provider system"
```

---

## Task 10: 供应商简化 — 重构前端供应商表单

**Files:**
- Modify: `sc-tools/src/components/providers/forms/ProviderForm.tsx`
- Delete: `sc-tools/src/components/providers/forms/ProviderPresetSelector.tsx`
- Modify: `sc-tools/src/components/providers/forms/BasicFormFields.tsx`
- Modify: `sc-tools/src/components/providers/AddProviderDialog.tsx`
- Modify: `sc-tools/src/components/providers/EditProviderDialog.tsx`

**Step 1: 删除预设选择器组件**

```bash
rm sc-tools/src/components/providers/forms/ProviderPresetSelector.tsx
```

**Step 2: 简化 ProviderForm.tsx**

移除预设选择逻辑，改为直接显示：
- 名称输入
- Endpoint URL 输入
- API Key 输入
- 目标 CLI 选择（Claude/Codex/Gemini/OpenCode）
- 模型覆盖（可选）

**Step 3: 简化 AddProviderDialog.tsx**

移除预设相关的 props 和逻辑，直接打开空白表单。

**Step 4: 修复所有编译错误**

```bash
cd sc-tools
npm install
npm run build 2>&1 | head -50
```

逐个修复 TypeScript 编译错误。

**Step 5: Commit**

```bash
git add -A sc-tools/
git commit -m "feat: simplify provider form to custom-only flat list"
```

---

## Task 11: 供应商简化 — 清理 Rust 后端供应商代码

**Files:**
- Modify: `sc-tools/src-tauri/src/provider.rs`
- Modify: `sc-tools/src-tauri/src/provider_defaults.rs`
- Modify: `sc-tools/src-tauri/src/database/dao/providers.rs`
- Modify: `sc-tools/src-tauri/src/commands/provider.rs`

**Step 1: 简化 Provider 结构体**

在 `provider.rs` 中移除 `category` 字段，简化结构体。

**Step 2: 简化 provider_defaults.rs**

移除分类相关的默认值，保留图标映射（仍然有用）。

**Step 3: 更新数据库 DAO**

在 `providers.rs` 中移除 `category` 字段的查询和写入。

**Step 4: 更新 commands**

在 `commands/provider.rs` 中移除分类相关参数。

**Step 5: 验证 Rust 编译**

```bash
cd sc-tools/src-tauri
cargo check 2>&1 | head -50
```
Expected: 无编译错误

**Step 6: Commit**

```bash
git add sc-tools/src-tauri/
git commit -m "feat: simplify Rust provider model (remove category)"
```

---

## Task 12: 供应商简化 — 清理多余的表单组件和 hooks

**Files:**
- 评估并清理: `sc-tools/src/components/providers/forms/hooks/useTemplateValues.ts`
- 评估并清理: `sc-tools/src/components/providers/forms/hooks/useCustomEndpoints.ts`
- 评估并清理: `sc-tools/src/components/providers/forms/hooks/useApiKeyLink.ts`
- 评估并清理: 其他不再需要的 hooks 和组件

**Step 1: 分析哪些 hooks 仍然需要**

保留：
- `useApiKeyState.ts` — API Key 输入状态
- `useBaseUrlState.ts` — Endpoint URL 状态
- `useModelState.ts` — 模型状态
- `useSpeedTestEndpoints.ts` — 端点测速

删除（与预设系统相关）：
- `useTemplateValues.ts` — 模板变量（预设专用）
- `useProviderCategory.ts` — 分类（已删除）
- `useApiKeyLink.ts` — API Key 链接（预设专用）
- `useCommonConfigSnippet.ts` — 通用配置片段（预设专用）

**Step 2: 删除不需要的 hooks**

```bash
cd sc-tools/src/components/providers/forms/hooks
rm -f useTemplateValues.ts useApiKeyLink.ts useCommonConfigSnippet.ts
```

**Step 3: 修复所有引用**

搜索并移除对已删除 hooks 的导入。

**Step 4: 验证前端编译**

```bash
cd sc-tools
npm run build 2>&1 | head -50
```
Expected: 无编译错误

**Step 5: Commit**

```bash
git add -A sc-tools/
git commit -m "feat: clean up unused provider hooks and components"
```

---

## Task 13: 数据库迁移 — 适配简化后的供应商模型

**Files:**
- Modify: `sc-tools/src-tauri/src/database/` (迁移脚本)

**Step 1: 添加数据库迁移**

创建新的 schema 版本，处理：
- `category` 字段可以保留在数据库中但不再使用（向后兼容）
- 或添加迁移脚本将所有 category 设为 "custom"

**Step 2: 更新 schema 版本号**

在数据库初始化代码中更新版本号。

**Step 3: 测试迁移**

确保从旧版数据库升级不会丢失数据。

**Step 4: Commit**

```bash
git add sc-tools/src-tauri/src/database/
git commit -m "feat: add database migration for simplified provider model"
```

---

## Task 14: 新增 SC-API 管理面板 — 前端入口

**Files:**
- Create: `sc-tools/src/components/scapi/ScApiPanel.tsx`
- Create: `sc-tools/src/components/scapi/ScApiConnectionForm.tsx`
- Create: `sc-tools/src/components/scapi/ScApiDashboard.tsx`
- Modify: `sc-tools/src/App.tsx` (添加路由/Tab)

**Step 1: 创建 SC-API 面板入口组件**

```tsx
// ScApiPanel.tsx — 主面板，包含连接配置和仪表板
// 初始版本：显示连接表单（SC-API 地址 + 管理员密钥）
// 连接成功后显示仪表板占位符
```

**Step 2: 创建连接表单**

```tsx
// ScApiConnectionForm.tsx
// 字段：SC-API 服务器地址、管理员 API Key
// 连接测试按钮
// 保存配置到本地
```

**Step 3: 创建仪表板占位符**

```tsx
// ScApiDashboard.tsx
// Phase 1 仅显示占位符：
// - "用户管理" 区域（待 SC-API 开发后实现）
// - "用量统计" 区域（待 SC-API 开发后实现）
// - "上游账号" 区域（待 SC-API 开发后实现）
```

**Step 4: 在 App.tsx 中添加导航入口**

在侧边栏或 Tab 栏添加 "SC-API" 入口。

**Step 5: 添加国际化文本**

在 zh.json、en.json、ja.json 中添加 SC-API 面板相关的翻译。

**Step 6: Commit**

```bash
git add -A sc-tools/
git commit -m "feat: add SC-API management panel placeholder"
```

---

## Task 15: 构建验证和最终清理

**Files:**
- 全项目

**Step 1: 安装依赖**

```bash
cd sc-tools
npm install
```

**Step 2: 前端编译验证**

```bash
npm run build
```
Expected: 无错误

**Step 3: Rust 编译验证**

```bash
cd src-tauri
cargo check
```
Expected: 无错误

**Step 4: 全局品牌搜索最终确认**

```bash
cd sc-tools
grep -rn "CC Switch\|cc-switch\|ccswitch\|cc_switch" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.rs" src/ src-tauri/src/
```
Expected: 无匹配结果

**Step 5: 运行现有测试**

```bash
npm run test 2>&1 | tail -20
cd src-tauri && cargo test 2>&1 | tail -20
```

**Step 6: 最终 Commit**

```bash
cd H:\GitHubproject\SC-Tools
git add -A sc-tools/
git commit -m "feat: SC-Tools Phase 1 complete — brand rename + provider simplification"
```

---

## 任务依赖关系

```
Task 1 (复制项目)
  └── Task 2 (配置文件重命名)
       └── Task 3 (Rust 后端重命名)
            ├── Task 4 (深度链接重命名)
            └── Task 5 (Rust 其余文件重命名)
                 └── Task 6 (前端和国际化重命名)
                      └── Task 7 (Flatpak/文档重命名)
                           └── Task 8 (删除预设和分类)
                                └── Task 9 (删除统一供应商)
                                     └── Task 10 (重构前端表单)
                                          └── Task 11 (清理 Rust 后端)
                                               └── Task 12 (清理 hooks)
                                                    └── Task 13 (数据库迁移)
                                                         └── Task 14 (SC-API 面板)
                                                              └── Task 15 (构建验证)
```

## 进度追踪

| Task | 描述 | 状态 |
|------|------|------|
| 1 | 项目初始化 — 复制并清理代码库 | ✅ 完成 |
| 2 | 品牌重命名 — 核心配置文件 | ✅ 完成 |
| 3 | 品牌重命名 — Rust 后端源代码 | ✅ 完成 |
| 4 | 品牌重命名 — 深度链接模块 | ✅ 完成 |
| 5 | 品牌重命名 — Rust 其余文件 | ✅ 完成 |
| 6 | 品牌重命名 — 前端代码和国际化 | ✅ 完成 |
| 7 | 品牌重命名 — Flatpak、文档和资源 | ✅ 完成 |
| 8 | 供应商简化 — 删除预设和分类系统 | ✅ 完成 |
| 9 | 供应商简化 — 删除统一供应商系统 | ✅ 完成 |
| 10 | 供应商简化 — 重构前端表单 | ✅ 完成（合并到 Task 8-9） |
| 11 | 供应商简化 — 清理 Rust 后端 | ✅ 完成（合并到 Task 8-9） |
| 12 | 供应商简化 — 清理多余 hooks | ✅ 完成（合并到 Task 8-9） |
| 13 | 数据库迁移 | ✅ 完成 |
| 14 | SC-API 管理面板入口 | ✅ 完成 |
| 15 | 构建验证和最终清理 | ✅ 完成 |
