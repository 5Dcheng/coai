# AGENTS.md — TeamDesk Lite 项目维护上下文

## 1. 项目概述

TeamDesk Lite 是一个轻量团队工单管理系统，支持工单创建、状态流转、评论、活动流和统计看板，使用 JSON 文件本地存储，无需数据库。

## 2. 技术栈

- **前端**: React 18 + TypeScript + Vite + React Router 6
- **后端**: Node.js + Express 4 + TypeScript (tsx)
- **存储**: JSON 文件 (data/*.json)
- **测试**: Vitest
- **开发**: concurrently (同时启动前后端)

## 3. 目录结构

```
src/                          # 前端源码
  App.tsx                     # 路由配置 + 导航布局
  main.tsx                    # React 入口
  api.ts                      # 前端 API 调用层 (所有后端请求)
  types.ts                    # 前端类型定义
  pages/
    TicketList.tsx             # 工单列表页 (含前端筛选)
    TicketNew.tsx              # 新建工单页
    TicketDetail.tsx           # 工单详情页 (最复杂, 含状态流转/评论/活动流)
    Dashboard.tsx              # 统计看板页
  *.test.ts                   # 前端逻辑测试 (7 个文件)

server/                       # 后端源码
  index.ts                    # Express 入口 + 路由挂载
  db.ts                       # JSON 文件读写抽象层
  utils.ts                    # generateId(), now()
  types.ts                    # 后端类型定义 (与 src/types.ts 内容相同)
  routes/
    tickets.ts                # 工单 CRUD + ticket_created activity
    transition.ts             # 状态流转校验 + resolvedAt 处理
    comments.ts               # 评论 CRUD + comment_added activity
    stats.ts                  # 实时内存统计
    activities.ts             # Activity 查询 (只读)
    history.ts                # StatusHistory 查询 (只读)

data/                         # JSON 数据文件 (运行时生成)
  tickets.json                # Ticket 数组
  statusHistory.json          # 状态变更历史
  comments.json               # 评论
  activities.json             # 系统活动流
```

## 4. 核心功能地图

| 功能 | 前端页面 | 后端路由 | 说明 |
|------|----------|----------|------|
| 工单列表 | `/tickets` → TicketList.tsx | `GET /api/tickets` | 前端筛选 (状态/优先级/指派人/标签) |
| 新建工单 | `/tickets/new` → TicketNew.tsx | `POST /api/tickets` | 默认状态 open, 自动生成 ticket_created activity |
| 工单详情 | `/tickets/:id` → TicketDetail.tsx | `GET /api/tickets/:id` | 含元数据编辑/状态流转/评论/活动流 |
| 编辑元数据 | TicketDetail.tsx | `PATCH /api/tickets/:id` | 修改优先级/指派人/标签, 自动生成 assignee_changed activity |
| 状态流转 | TicketDetail.tsx | `POST /api/tickets/:id/transition` | 受 VALID_TRANSITIONS 规则约束 |
| 评论 | TicketDetail.tsx | `POST /api/tickets/:id/comments` | 自动生成 comment_added activity |
| 统计看板 | `/dashboard` → Dashboard.tsx | `GET /api/stats` | 实时内存计算, 不持久化 |

## 5. 核心数据模型

```typescript
type TicketStatus = "open" | "triaged" | "in_progress" | "resolved" | "closed" | "reopened"
type TicketPriority = "low" | "medium" | "high" | "urgent"

type Ticket = {
  id: string; title: string; description: string;
  status: TicketStatus; priority: TicketPriority;
  assignee?: string; tags: string[];
  createdAt: string; updatedAt: string; resolvedAt?: string;
}

type StatusHistoryItem = {
  id: string; ticketId: string;
  from: TicketStatus; to: TicketStatus;
  createdAt: string; note?: string;
}

type Comment = {
  id: string; ticketId: string;
  body: string; author: string; createdAt: string;
}

type Activity = {
  id: string; ticketId: string;
  type: "ticket_created" | "status_changed" | "assignee_changed" | "comment_added";
  message: string; createdAt: string;
}
```

类型定义在 `src/types.ts` 和 `server/types.ts` 中各有一份, 内容完全相同, 修改时必须同步。

## 6. API 路由表

| 方法 | 路径 | 处理文件 | 说明 |
|------|------|----------|------|
| GET | `/api/health` | server/index.ts | 健康检查 |
| GET | `/api/tickets` | server/routes/tickets.ts | 获取全部工单 |
| POST | `/api/tickets` | server/routes/tickets.ts | 创建工单 (必填: title, description, priority) |
| GET | `/api/tickets/:id` | server/routes/tickets.ts | 获取单个工单 |
| PATCH | `/api/tickets/:id` | server/routes/tickets.ts | 更新工单元数据 |
| POST | `/api/tickets/:id/transition` | server/routes/transition.ts | 状态流转 (body: { to, note? }) |
| GET | `/api/tickets/:id/comments` | server/routes/comments.ts | 获取评论列表 |
| POST | `/api/tickets/:id/comments` | server/routes/comments.ts | 添加评论 (body: { body, author }) |
| GET | `/api/tickets/:id/activities` | server/routes/activities.ts | 获取活动流 |
| GET | `/api/tickets/:id/history` | server/routes/history.ts | 获取状态历史 |
| GET | `/api/stats` | server/routes/stats.ts | 获取统计数据 |

前端通过 Vite proxy (`/api` → `http://localhost:3000`) 转发到后端。

## 7. 核心数据流

### 状态流转 (最关键的数据流)

```
用户点击状态按钮 (TicketDetail.tsx)
  → transitionTicket(id, to, note) (src/api.ts)
  → POST /api/tickets/:id/transition (server/routes/transition.ts)
  → 校验 VALID_TRANSITIONS[from] 是否包含 to
  → 更新 ticket.status
  → 如果 to === 'resolved': 设置 resolvedAt = now()
  → 如果 from === 'resolved' && to === 'reopened': 清除 resolvedAt
  → 写入 statusHistory.json
  → 写入 activities.json (type: 'status_changed')
  → 返回更新后的 ticket
```

### 评论创建

```
用户提交评论 (TicketDetail.tsx)
  → addComment(id, body, author) (src/api.ts)
  → POST /api/tickets/:id/comments (server/routes/comments.ts)
  → 写入 comments.json
  → 生成 activity message: `${author} 添加了评论："${preview}"`
    (preview = body 前 50 字符, 超长截断加 '...')
  → 写入 activities.json (type: 'comment_added')
```

### 统计计算

```
Dashboard.tsx → getStats() → GET /api/stats (server/routes/stats.ts)
  → 全量读取 tickets.json
  → 内存中实时计算:
    - byStatus / byPriority: 遍历计数
    - createdLast7Days: createdAt 在近 7 天内
    - resolvedLast7Days: status 为 resolved/closed 且 resolvedAt 在近 7 天内
    - avgResolutionTime: 仅统计 status 为 resolved/closed 的工单
  → 注意: reopened 状态的工单不计入已解决统计
```

## 8. 高风险维护点

### H1: 前后端状态流转规则不同步

`VALID_TRANSITIONS` 在两处独立定义:
- 前端: `src/pages/TicketDetail.tsx` 第 43-50 行
- 后端: `server/routes/transition.ts` 第 6-13 行

修改状态流转规则时必须同时修改两边, 否则会出现前端显示按钮但后端拒绝 (或反之)。

当前规则:
```
open → triaged → in_progress → resolved → closed
                          ↘ reopened → in_progress
```

### H2: resolvedAt 统计语义耦合

`resolvedAt` 的设置/清除逻辑在 `server/routes/transition.ts` 第 33-38 行:
- 状态变为 `resolved` 时设置
- `resolved` → `reopened` 时清除
- `closed` → `reopened` 时未处理 (当前 closed 不可流转到 reopened)

`server/routes/stats.ts` 第 31 行依赖 `resolvedAt` 做统计:
```typescript
if ((t.status === 'resolved' || t.status === 'closed') && t.resolvedAt)
```

新增流转路径时必须考虑 resolvedAt 的处理, 否则统计数据会失真。

### H3: 前后端类型镜像

`src/types.ts` 和 `server/types.ts` 内容完全相同但各自独立维护。修改类型时必须同步两边。

### H4: JSON 文件并发写入无锁

`server/db.ts` 每次操作都是 `read → modify → write`, 无文件锁。多用户同时操作可能丢数据。当前单机场景风险低, 但扩展时致命。

### H5: Activity 文案是静态存储

Activity 的 `message` 字段在创建时生成并写入 JSON, 之后不会更新。修改文案生成逻辑只影响新记录, 不影响已有数据。

### H6: 无后端路由测试

所有测试 (`src/*.test.ts`) 都是前端逻辑测试。`server/routes/` 下无任何测试文件。`transition.ts` 中的 resolvedAt 处理逻辑没有直接测试覆盖。

## 9. 常见修改入口

| 修改类型 | 需要修改的文件 |
|----------|---------------|
| 状态流转规则 | `src/pages/TicketDetail.tsx` + `server/routes/transition.ts` + `src/transition.test.ts` |
| 评论 activity 文案 | `server/routes/comments.ts` 第 39-44 行 |
| 状态标签中文映射 | `src/pages/TicketList.tsx` + `src/pages/TicketDetail.tsx` + `src/pages/Dashboard.tsx` (各页面独立定义) |
| 统计逻辑 | `server/routes/stats.ts` + `src/stats.test.ts` |
| 新增 API 接口 | `server/routes/*.ts` + `server/index.ts` (挂载路由) + `src/api.ts` (前端调用) |
| 新增页面 | `src/pages/*.tsx` + `src/App.tsx` (路由) |
| 修改数据模型 | `src/types.ts` + `server/types.ts` (必须同步) |
| 筛选逻辑 | `src/pages/TicketList.tsx` 第 65-79 行 + `src/filter.test.ts` |

## 10. 推荐阅读顺序

新 agent 接手项目时, 按以下顺序阅读可最快建立上下文:

1. `AGENTS.md` (本文件) — 项目全貌
2. `README_zh.md` — 产品需求与设计意图
3. `src/types.ts` — 核心数据模型 (读一个即可, 前后端相同)
4. `server/db.ts` — 数据持久化方式
5. `src/api.ts` — 前后端契约 (所有 API 接口)
6. `server/routes/transition.ts` — 最核心的业务规则 (状态流转 + resolvedAt)
7. `src/pages/TicketDetail.tsx` — 最复杂的页面 (涵盖所有交互)

## 11. 已知限制与不确定点

- 无用户/权限体系: `author` 和 `assignee` 是自由文本输入
- 无工单删除功能
- 无评论删除功能
- 无文件上传
- JSON 文件存储不支持并发写入
- `data/` 目录是否纳入版本控制未明确
- `dist/` 目录存在于仓库中, 是否应被 .gitignore 排除未明确
- 统计时间窗口固定为"近 7 天", 不可配置
- 前端所有样式为内联 style, 无 CSS 框架
- 状态标签函数 (`statusLabel`, `priorityLabel`) 在多个页面中重复定义

## 12. 测试与验证命令

```bash
npm install          # 安装依赖
npm run dev          # 同时启动前端 (5173) 和后端 (3000)
npm run dev:client   # 仅启动前端
npm run dev:server   # 仅启动后端
npm run build        # TypeScript 编译 + Vite 构建
npm run test         # 运行全部测试 (vitest run, 28 个测试)
npm run test:watch   # 监听模式运行测试
```

测试文件:
- `src/transition.test.ts` — 状态流转校验 (3 个测试)
- `src/filter.test.ts` — 筛选逻辑 (9 个测试)
- `src/stats.test.ts` — 统计计算 (7 个测试)
- `src/ticket.test.ts` — Ticket 数据模型 (3 个测试)
- `src/comment.test.ts` — 评论功能 (2 个测试)
- `src/activity.test.ts` — Activity 排序 (2 个测试)
- `src/api.test.ts` — API 基础 (2 个测试)
