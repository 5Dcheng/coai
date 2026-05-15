# TeamDesk Lite

TeamDesk Lite 是一个轻量团队工单系统，用于记录、分流、处理和复盘团队内部的缺陷、需求和支持请求。

项目目标是做一个可本地运行的小型 Web 应用，让团队可以用统一流程管理工单状态、指派负责人、记录评论和查看基础统计。

## 产品目标

- 团队成员可以创建工单，并描述问题、需求或支持请求。
- 负责人可以查看待处理工单，并按状态、优先级、标签和指派人筛选。
- 工单可以按照明确状态流转，避免随意修改状态造成流程混乱。
- 工单详情页可以展示评论、系统活动和状态历史。
- 团队可以通过统计看板了解当前工单分布和处理效率。

## 技术栈

建议使用：

- Vite
- React
- TypeScript
- Node.js
- Express
- JSON file storage

第一版不需要数据库、登录系统、权限系统或外部服务。数据可以保存在本地 JSON 文件中，方便开发和验证。

## 运行方式

建议提供以下命令：

```bash
npm install
npm run dev
npm run build
npm run test
```

开发模式应同时启动前端和后端，或在 README 中明确说明前后端分别如何启动。

## 核心概念

### Ticket

Ticket 是系统的核心对象，代表一个缺陷、需求或支持请求。

字段建议：

```ts
type TicketStatus = "open" | "triaged" | "in_progress" | "resolved" | "closed" | "reopened";
type TicketPriority = "low" | "medium" | "high" | "urgent";

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
};
```

### Status History

每次状态变化都应记录历史。

字段建议：

```ts
type StatusHistoryItem = {
  id: string;
  ticketId: string;
  from: TicketStatus;
  to: TicketStatus;
  createdAt: string;
  note?: string;
};
```

### Comment

Comment 是用户手动写入的讨论内容，不应直接改变 ticket 状态。

字段建议：

```ts
type Comment = {
  id: string;
  ticketId: string;
  body: string;
  author: string;
  createdAt: string;
};
```

### Activity

Activity 是系统自动记录的事件，例如创建工单、状态变化、指派人变化。

字段建议：

```ts
type Activity = {
  id: string;
  ticketId: string;
  type: "ticket_created" | "status_changed" | "assignee_changed" | "comment_added";
  message: string;
  createdAt: string;
};
```

## 功能范围

### 1. 工单列表

列表页应展示：

- 标题
- 状态
- 优先级
- 指派人
- 标签
- 更新时间

列表页应支持筛选：

- status
- priority
- assignee
- tag

筛选条件可以组合使用。

### 2. 新建工单

用户可以创建 ticket。

必填字段：

- title
- description
- priority

可选字段：

- assignee
- tags

新建 ticket 的默认状态为 `open`。

创建成功后：

- ticket 写入本地 JSON 存储。
- 创建一条 `ticket_created` activity。
- 页面跳转到详情页，或在列表中展示新 ticket。

### 3. 工单详情

详情页应展示：

- ticket 基本信息
- 当前状态
- 状态历史
- 评论列表
- activity timeline

详情页应支持：

- 修改优先级
- 修改指派人
- 添加标签
- 添加评论
- 执行合法状态流转

### 4. 状态流转

状态流转必须受到校验。

合法路径：

```text
open -> triaged
triaged -> in_progress
in_progress -> resolved
resolved -> closed
resolved -> reopened
reopened -> in_progress
```

非法状态跳转应被拒绝，并返回清晰错误信息。

状态变化时：

- 更新 ticket 当前状态。
- 写入 status history。
- 写入 `status_changed` activity。
- 当状态变为 `resolved` 时写入 `resolvedAt`。
- 当状态从 `resolved` 变为 `reopened` 时，应清除或重新解释 `resolvedAt`，避免统计错误。

### 5. 评论与活动流

用户可以在 ticket 详情页添加评论。

添加评论时：

- 写入 comment。
- 写入 `comment_added` activity。
- 不改变 ticket status。

Activity timeline 应按时间正序或倒序稳定展示，同一页面内保持一致。

### 6. 统计看板

统计看板应展示：

- 按状态统计 ticket 数量。
- 按优先级统计 ticket 数量。
- 最近 7 天新增 ticket 数量。
- 最近 7 天 resolved ticket 数量。
- 平均解决时间。

注意：

- reopened ticket 不应继续被统计为已解决。
- 平均解决时间应基于真正处于 resolved 或 closed 的 ticket。
- 如果没有可统计数据，页面应展示空状态，而不是报错。

## API 建议

可以使用以下 API 形态：

```text
GET    /api/tickets
POST   /api/tickets
GET    /api/tickets/:id
PATCH  /api/tickets/:id
POST   /api/tickets/:id/transition
GET    /api/tickets/:id/comments
POST   /api/tickets/:id/comments
GET    /api/stats
```

`POST /api/tickets/:id/transition` 请求体示例：

```json
{
  "to": "resolved",
  "note": "Fixed and verified locally."
}
```

非法状态流转应返回 400。

找不到 ticket 应返回 404。

## 页面建议

建议页面：

- `/`：跳转到 ticket list
- `/tickets`：工单列表
- `/tickets/new`：新建工单
- `/tickets/:id`：工单详情
- `/dashboard`：统计看板

UI 不需要复杂设计，但应清晰、可用、信息密度适中。

## 阶段计划

### Stage 0：基础工单

实现：

- 工单列表
- 新建工单
- 工单详情
- JSON 持久化

验收：

- 可以创建 ticket。
- 列表能展示 ticket。
- 刷新或重启后数据仍在。

### Stage 1：状态流转

实现：

- 合法状态流转校验
- status history
- 状态变化 activity

验收：

- 合法状态可以流转。
- 非法状态被拒绝。
- 详情页能看到状态历史。

### Stage 2：元数据与筛选

实现：

- assignee
- priority
- tags
- 多条件筛选

验收：

- 筛选结果正确。
- 修改 metadata 不破坏状态流转。

### Stage 3：评论与活动流

实现：

- 添加评论
- comment activity
- activity timeline

验收：

- 评论不会改变状态。
- timeline 稳定展示。

### Stage 4：统计看板

实现：

- 按状态统计
- 按优先级统计
- 最近 7 天新增 / resolved 趋势
- 平均解决时间

验收：

- 统计数据与 ticket 数据一致。
- reopened 不会被错误统计为 resolved。

### Stage 5：质量完善

实现：

- 基础测试
- 错误状态展示
- 空状态展示
- 简单 loading 状态

验收：

- 主要功能有测试覆盖。
- 常见异常不会导致页面崩溃。

## 非目标

第一版不做：

- 登录和权限
- 多租户
- 邮件通知
- 文件上传
- 外部数据库
- 实时协作
- 移动端专项适配

## 验收清单

项目完成时应满足：

- 用户能创建、查看、筛选和更新 ticket。
- 状态流转受规则保护。
- 评论、activity 和状态历史能正确展示。
- 统计看板能反映当前 ticket 数据。
- JSON 数据结构清晰，重启后不丢失。
- 基础测试能覆盖状态流转、筛选和统计逻辑。
