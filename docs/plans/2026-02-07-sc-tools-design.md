# SC-Tools 项目需求与设计文档

> 创建日期：2026-02-07
> 状态：需求确认完成，待实施

---

## 一、项目概述

### 1.1 项目名称
**SC-Tools** — 一个 AI 编码工具配置管理 + API 中转服务生态系统

### 1.2 项目背景
基于两个现有开源项目的优势进行整合设计：
- **CC Switch**（v3.10.3）：Claude Code/Codex/Gemini CLI 配置管理工具
- **Antigravity-Manager**（v4.1.8）：AI 账号管理与 API 协议反代系统

### 1.3 项目目标
构建一个由桌面端和 Web 服务组成的生态系统：
- **SC-Tools（桌面端）**：面向管理员自身，管理本地 CLI 工具配置
- **SC-API（Web 服务）**：面向下游用户，提供 API 中转和用户管理

---

## 二、架构方案选型

### 2.1 备选方案

#### 方案 A：全部集成在 Tauri 桌面应用
- 所有功能打包在一个桌面应用中
- 优点：部署简单，单一入口
- 缺点：API 反代服务依赖桌面应用运行，不适合 7×24 服务器场景

#### 方案 B（已选）：SC-Tools 桌面端 + SC-API 独立 Web 服务
- SC-Tools（Tauri）：专注于 CLI 工具配置管理
- SC-API（Web 服务）：独立的 API 中转 + 用户管理
- SC-Tools 内嵌管理面板连接 SC-API 实例
- 优点：职责清晰，API 服务可独立部署在服务器上 7×24 运行

#### 方案 C：纯 Web 服务
- 放弃 Tauri，全部做成 Web 应用
- 缺点：失去本地文件操作能力，MCP/Skills/Prompts 管理无法实现

### 2.2 最终选择：方案 B

```
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│        SC-Tools (桌面端)          │     │        SC-API (Web 服务)          │
│        Tauri 2 + React           │     │      Rust Axum + React           │
│                                  │     │                                  │
│  ┌───────────┐ ┌───────────┐    │     │  ┌───────────┐ ┌───────────┐    │
│  │ 供应商管理  │ │ MCP 管理   │    │     │  │ API 反代   │ │ 用户Token  │    │
│  │ (简化版)   │ │           │    │     │  │ 协议互转   │ │ 管理      │    │
│  ├───────────┤ ├───────────┤    │     │  ├───────────┤ ├───────────┤    │
│  │ Prompts   │ │ Skills    │    │     │  │ 上游账号   │ │ 用量统计   │    │
│  │ 管理      │ │ 管理      │    │     │  │ 调度      │ │ 与图表    │    │
│  ├───────────┤ ├───────────┤    │     │  ├───────────┤ ├───────────┤    │
│  │ 会话管理   │ │ SC-API   │    │     │  │ 安全监控   │ │ 配额限制   │    │
│  │           │ │ 管理面板  │◄───┼─API─┼──│ IP控制    │ │ IP绑定    │    │
│  └───────────┘ └───────────┘    │     │  └───────────┘ └───────────┘    │
│                                  │     │                                  │
│  本地运行，管理 CLI 工具配置        │     │  服务器部署，7×24 运行            │
│  ~/.claude/ ~/.codex/ ~/.gemini/ │     │  对外提供 API 服务                │
└─────────────────────────────────┘     └─────────────────────────────────┘
```

---

## 三、SC-Tools 桌面端需求

### 3.1 技术栈
- **框架**：Tauri 2（基于 CC Switch）
- **前端**：React + TypeScript + TailwindCSS + shadcn/ui
- **后端**：Rust
- **数据库**：SQLite（SSOT 架构）
- **状态管理**：TanStack Query v5

### 3.2 供应商管理（简化重构）

**删除内容：**
- 所有内置供应商预设文件（claudeProviderPresets、codexProviderPresets 等）
- 供应商分类系统（官方/第三方/聚合/自定义）
- universalProviderPresets 统一预设

**保留并改造：**
- 统一的自定义供应商列表（扁平列表，无分类）
- 拖拽排序、一键切换、导入导出
- 端点速度测试

**数据模型：**
```typescript
interface Provider {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  targetCli: 'claude' | 'codex' | 'gemini' | 'opencode';
  modelOverride?: string;
  enabled: boolean;
  sortOrder: number;
}
```

### 3.3 保留功能（基于 CC Switch 原有功能）

| 功能 | 说明 | 改动 |
|------|------|------|
| MCP 服务器管理 | 跨应用统一管理 MCP 服务器配置（stdio/http/sse） | 不变 |
| Prompts 管理 | 多预设系统提示词（CLAUDE.md/AGENTS.md/GEMINI.md） | 不变 |
| Skills 管理 | GitHub 仓库扫描、一键安装到 ~/.claude/skills/ | 不变 |
| 会话管理 | 查看和管理 CLI 工具历史会话 | 不变 |
| 环境变量管理 | 跨应用配置冲突检测和解决 | 不变 |
| 深度链接 | 一键导入配置 | 协议改为 `sctools://` |

### 3.4 新增：SC-API 管理面板

- 配置远程 SC-API 地址和管理员密钥
- 嵌入式仪表板：用户列表、用量概览、实时请求日志
- Token 管理：创建/禁用用户 Token、设置配额
- 上游账号状态监控

---

## 四、SC-API Web 服务需求

### 4.1 技术栈
- **后端**：Rust + Axum（参考 Antigravity-Manager）
- **前端**：React + TypeScript（管理面板）
- **数据库**：SQLite（rusqlite）
- **异步运行时**：Tokio
- **HTTP 客户端**：Reqwest

### 4.2 API 协议反代

**三种入口端点：**
```
POST /v1/chat/completions      → OpenAI 格式入口
POST /v1/messages              → Anthropic 格式入口
POST /v1/gemini/*              → Gemini 格式入口
```

**协议转换矩阵（全格式互转）：**

| 入口格式 | 上游格式 | 转换器 |
|---------|---------|--------|
| OpenAI | OpenAI | 直通 |
| OpenAI | Anthropic | openai_to_anthropic |
| OpenAI | Gemini | openai_to_gemini |
| Anthropic | OpenAI | anthropic_to_openai |
| Anthropic | Anthropic | 直通 |
| Anthropic | Gemini | anthropic_to_gemini |
| Gemini | OpenAI | gemini_to_openai |
| Gemini | Anthropic | gemini_to_anthropic |
| Gemini | Gemini | 直通 |

**关键特性：**
- 完整支持 SSE 流式响应
- Thinking 模型支持（thinking_budget 注入）
- 自动重试（429/401 错误时切换账号）

### 4.3 上游账号管理

**三种账号类型（通用化设计）：**

```rust
enum UpstreamAccount {
    // 标准 API Key 账号（官方 API、第三方中转站等）
    ApiKey {
        name: String,
        endpoint: String,
        api_key: String,
        format: ApiFormat,  // OpenAI/Anthropic/Gemini
    },
    // 网页 Session 账号（Google AI Studio、Claude.ai 等）
    WebSession {
        name: String,
        session_data: SessionData,
        format: ApiFormat,
    },
    // 自定义认证（Bearer Token、自定义 Header 等）
    Custom {
        name: String,
        endpoint: String,
        auth_header: String,
        auth_value: String,
        format: ApiFormat,
    },
}
```

**调度策略（参考 Antigravity-Manager）：**
- P2C 负载均衡（Power of Two Choices）
- 自动故障转移和熔断器
- 配额监控和自动跳过低配额账号
- 粘性会话支持

**备选调度方案（已记录）：**
- 方案一：多账号智能调度（已选）
- 方案二：单账号模式
- 方案三：多 Key 简单轮询

### 4.4 用户 Token 管理

**Token 分发：**
- 为用户生成 `sk-sc-xxxx` 格式的 API Key
- 支持启用/禁用/删除 Token
- 支持设置 Token 有效期

**用量统计：**
- 按用户、模型、时间维度统计 Token 用量
- Recharts 图表展示（小时/天/周/月）
- 导出统计数据

**配额限制：**
- 每日/每月 Token 用量上限
- 超出配额自动拒绝请求
- 配额预警通知

**IP 绑定：**
- 可选绑定用户 IP
- 防止 Token 泄露滥用
- 支持 IP 白名单模式

### 4.5 安全监控

- IP 黑白名单管理
- 完整的请求日志记录
- 访问统计（按 IP、Token、账号）
- AES-GCM 加密敏感数据

### 4.6 数据库设计

```sql
-- 用户 Token
CREATE TABLE user_tokens (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    ip_binding TEXT,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用量记录
CREATE TABLE token_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_id TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    upstream_account_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 配额配置
CREATE TABLE token_quotas (
    token_id TEXT PRIMARY KEY,
    daily_limit INTEGER,
    monthly_limit INTEGER
);

-- 上游账号
CREATE TABLE upstream_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL,  -- api_key/web_session/custom
    config_json TEXT NOT NULL,
    format TEXT NOT NULL,        -- openai/anthropic/gemini
    enabled BOOLEAN DEFAULT TRUE,
    health_status TEXT DEFAULT 'unknown'
);

-- 请求日志
CREATE TABLE request_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_id TEXT,
    upstream_account_id TEXT,
    method TEXT,
    path TEXT,
    status_code INTEGER,
    input_tokens INTEGER,
    output_tokens INTEGER,
    latency_ms INTEGER,
    client_ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- IP 规则
CREATE TABLE ip_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT NOT NULL,
    rule_type TEXT NOT NULL,  -- whitelist/blacklist
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 五、两个项目可互相借鉴的优点

### 5.1 从 Antigravity-Manager 借鉴到 SC-API

| 特性 | 具体内容 | 参考代码位置 |
|------|---------|-------------|
| 协议转换引擎 | OpenAI/Anthropic/Gemini 格式互转 | `proxy/mappers/` |
| 流式响应处理 | SSE 流式输出 + 错误恢复 | `proxy/handlers/` |
| P2C 负载均衡 | 智能账号调度算法 | `modules/scheduler.rs` |
| 用户 Token 系统 | Token 分发、配额、IP 绑定 | `user_token_db.rs` |
| 安全监控 | IP 黑白名单、访问日志 | `security_db.rs` |
| Token 统计 | 多维度用量统计和图表 | `token_stats.rs` |
| Thinking 模型支持 | thinking_budget 注入和签名缓存 | `proxy/handlers/claude.rs` |
| 熔断器机制 | 自动检测和隔离故障账号 | `proxy/upstream/` |
| AES-GCM 加密 | 敏感数据加密存储 | `utils/crypto.rs` |

### 5.2 从 CC Switch 借鉴到 SC-Tools

| 特性 | 具体内容 | 参考代码位置 |
|------|---------|-------------|
| SSOT 架构 | SQLite 单一数据源 + 双向同步 | `database/` |
| 原子写入 | 临时文件 + 重命名防损坏 | `lib/utils/` |
| 深度链接 | 协议一键导入 | `deeplink/` |
| MCP 管理 | 跨应用 MCP 服务器统一管理 | `commands/mcp.rs` |
| Prompts 预设 | Markdown 编辑器 + 跨应用同步 | `commands/prompt.rs` |
| Skills 生态 | GitHub 仓库扫描 + 一键安装 | `commands/skill.rs` |
| 配置迁移 | Schema 版本管理 + 自动迁移 | `database/migrations/` |
| TanStack Query | 前端数据缓存和同步策略 | `lib/query/` |
| shadcn/ui | 现代化 UI 组件库 | `components/ui/` |

### 5.3 共同优秀实践（SC-Tools 应继承）

- Tauri 2 桌面端架构
- SQLite 数据库 + Rust 后端
- React + TypeScript 前端
- 多语言国际化支持
- 系统托盘集成
- 自动更新机制

---

## 六、项目仓库结构

```
SC-Tools/                          # Monorepo
├── sc-tools/                      # 桌面端项目
│   ├── src/                       # React 前端
│   ├── src-tauri/                 # Rust Tauri 后端
│   ├── package.json
│   └── Cargo.toml
├── sc-api/                        # Web 服务项目
│   ├── frontend/                  # React 管理面板
│   │   ├── src/
│   │   └── package.json
│   ├── src/                       # Rust Axum 后端
│   │   ├── handlers/              # API 处理器
│   │   ├── mappers/               # 协议转换器
│   │   ├── middleware/            # 中间件
│   │   ├── models/                # 数据模型
│   │   ├── scheduler/             # 调度器
│   │   └── db/                    # 数据库
│   ├── Cargo.toml
│   └── Dockerfile
├── shared/                        # 共享代码（可选）
│   └── protocol-mappers/          # 协议转换器共享库
└── docs/
    └── plans/
```

---

## 七、部署方式

### 7.1 SC-Tools 桌面端
- Windows：MSI 安装包
- macOS：DMG / Homebrew
- Linux：AppImage / DEB / RPM
- 自动更新：tauri-plugin-updater

### 7.2 SC-API Web 服务
- Docker 容器部署（推荐）
- 直接二进制部署
- 支持 x86_64 和 ARM64
- 前端静态文件内嵌到 Axum 服务中

---

## 八、实施路径

### Phase 1：SC-Tools 桌面端（基于 CC Switch 改造）
- 去除供应商预设，简化供应商管理
- 保留 MCP/Prompts/Skills/会话管理
- 品牌重命名（CC Switch → SC-Tools）
- 深度链接协议改为 `sctools://`

### Phase 2：SC-API 核心（API 反代）
- Axum 服务器框架搭建
- 协议转换引擎（复用 Antigravity-Manager 代码）
- 上游账号管理和调度（三种账号类型）

### Phase 3：SC-API 用户管理
- 用户 Token 分发和认证
- 用量统计和配额限制
- IP 绑定和安全监控
- Web 管理面板

### Phase 4：联动集成
- SC-Tools 内嵌 SC-API 管理面板
- 端到端测试
- Docker 部署配置
- 文档编写

---

## 九、设计决策记录

| 决策项 | 选择 | 备选方案 |
|--------|------|---------|
| 整体架构 | 方案 B：桌面端 + Web 服务 | A: 全集成 / C: 纯 Web |
| 供应商管理 | 全面简化，无预设无分类 | 保留框架 / 保留部分预设 |
| SC-API 技术栈 | Rust + Axum + React | Node.js / Python FastAPI |
| 联动方式 | 内嵌管理面板 | 完全独立 / 仅配置同步 |
| 协议转换 | 全格式互转（3×3） | 统一 OpenAI 入口 / OpenAI+Anthropic |
| Token 管理 | 全功能（分发+统计+配额+IP） | — |
| 上游账号 | 多账号智能调度 | 单账号 / 简单轮询 |
| 上游类型 | API Key + Web Session + 自定义 | 仅 API Key |
