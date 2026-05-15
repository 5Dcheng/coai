# TeamDesk Lite 测试用例与记录规范

## 1. 目标

这份文档用于记录 TeamDesk Lite 的评估任务、每轮 prompt、数据记录项和评分规则。

评估重点不是单纯比较最终代码好坏，而是观察：

- agent 是否更快找到正确上下文
- agent 是否更少读取无关文件
- agent 是否更好理解功能边界
- agent 是否在多轮开发后保持注意力和记忆一致性
- 项目长期推进时 token、时间和返工成本是否可控

## 2. 实验分组

第一轮建议只固定一个模型，先比较 agent 与上下文条件。

推荐最小组合：

```text
模型：Kimi K2.6
Agent：Trae
条件：baseline / coai
任务：R01-R20
```

扩展组合：

```text
Trae + Kimi K2.6 + baseline
Trae + Kimi K2.6 + coai
Claude Code + Kimi K2.6 + baseline
Claude Code + Kimi K2.6 + coai
```

## 3. 固定任务序列

任务序列必须固定，baseline 与 coai 条件使用同一组任务。

如果一轮未完成当前任务，不进入下一任务，而是继续当前任务并记录 attempt。

### R01 初始化项目结构

目标：

- 创建 Vite + React + TypeScript 前端
- 创建 Express 后端
- 配置基本 npm scripts
- 准备本地 JSON 数据目录

验收：

- `npm install` 成功
- `npm run dev` 能启动项目
- 前端页面可以访问
- 后端健康检查接口可访问

### R02 Ticket 数据模型与 JSON storage

目标：

- 定义 Ticket、StatusHistory、Comment、Activity 类型
- 实现 JSON file storage
- 提供基础读写方法

验收：

- 可以读取和写入 ticket 数据
- JSON 文件不存在时能自动初始化
- 数据结构清晰，不与 UI 强绑定

### R03 工单列表

目标：

- 实现 ticket list 页面
- 从 API 加载 tickets
- 展示 title、status、priority、assignee、tags、updatedAt

验收：

- 列表能展示 ticket
- 空数据时展示空状态
- 加载失败时展示错误状态

### R04 新建工单

目标：

- 实现创建 ticket 页面
- 支持 title、description、priority、assignee、tags
- 新 ticket 默认 status 为 `open`

验收：

- 可以创建 ticket
- 创建后写入 JSON storage
- 创建后生成 `ticket_created` activity
- 创建后能回到列表或进入详情页

### R05 工单详情

目标：

- 实现 ticket detail 页面
- 展示 ticket 基本信息、状态、metadata、comments、activity

验收：

- 可以打开详情页
- 找不到 ticket 时展示 404 或错误状态
- ticket 信息展示完整

### R06 状态流转校验

目标：

- 实现合法状态流转
- 拒绝非法流转
- 提供 transition API

合法路径：

```text
open -> triaged
triaged -> in_progress
in_progress -> resolved
resolved -> closed
resolved -> reopened
reopened -> in_progress
```

验收：

- 合法流转成功
- 非法流转返回 400
- 状态变化更新 ticket

### R07 状态历史与 activity

目标：

- 状态变化写入 status history
- 状态变化写入 `status_changed` activity
- 详情页展示状态历史

验收：

- 每次状态变化都有 history
- 每次状态变化都有 activity
- timeline 顺序稳定

### R08 Metadata 编辑

目标：

- 支持修改 assignee
- 支持修改 priority
- 支持修改 tags

验收：

- metadata 修改成功
- assignee 变化写入 `assignee_changed` activity
- metadata 修改不破坏状态流转

### R09 筛选功能

目标：

- 支持按 status 筛选
- 支持按 priority 筛选
- 支持按 assignee 筛选
- 支持按 tag 筛选
- 支持组合筛选

验收：

- 单条件筛选正确
- 多条件组合筛选正确
- 大小写输入不导致明显错误

### R10 评论功能

目标：

- 实现添加 comment
- 展示 comment 列表
- 添加 comment 时写入 `comment_added` activity

验收：

- 可以添加 comment
- comment 不改变 ticket status
- comment 与 activity 都能展示

### R11 Activity timeline

目标：

- 统一展示 ticket_created、status_changed、assignee_changed、comment_added
- timeline 按时间稳定排序

验收：

- 各类 activity 展示正确
- 排序稳定
- 空 activity 不报错

### R12 Dashboard 状态统计

目标：

- 实现 dashboard 页面
- 按 status 统计 ticket 数量

验收：

- 各状态数量正确
- 空数据时显示空状态

### R13 Dashboard 优先级统计

目标：

- 按 priority 统计 ticket 数量

验收：

- 各 priority 数量正确
- 与筛选逻辑口径一致

### R14 平均解决时间

目标：

- 统计平均解决时间
- 只统计真正 resolved 或 closed 的 ticket

验收：

- 未解决 ticket 不参与平均值
- reopened ticket 不应继续被错误算作 resolved

### R15 修复 reopened 统计问题

目标：

- 人为检查或修复 reopened ticket 仍被统计为 resolved 的问题

验收：

- reopened ticket 不计入 resolved count
- reopened ticket 不计入平均解决时间，除非再次 resolved
- 修复不破坏状态流转

### R16 基础测试

目标：

- 添加状态流转测试
- 添加筛选测试
- 添加统计测试

验收：

- 测试能运行
- 覆盖核心业务规则

### R17 修复筛选大小写问题

目标：

- 修复 urgent / tag / assignee 相关大小写输入问题

验收：

- 用户输入大小写不影响合理筛选
- 不改变原始展示数据

### R18 错误、空状态与 loading

目标：

- 补充错误状态
- 补充空状态
- 补充 loading 状态

验收：

- API 出错时 UI 不崩溃
- 空数据时有明确提示
- 加载中有反馈

### R19 整体回归

目标：

- 运行 build / test
- 修复阻断问题
- 检查主要页面流程

验收：

- build 成功
- test 成功或已说明失败原因
- 核心流程可用

### R20 项目总结与维护入口

目标：

- 总结当前项目结构
- 总结主要业务规则
- 总结后续维护入口

验收：

- 能说明 ticket 创建、状态流转、评论、activity、统计的关键文件
- 能说明哪些模块不应被无关任务随意修改

## 4. 可选 R21-R30 任务

如果继续跑 30 轮，使用以下任务。

- R21：assignee 变化 activity 完善
- R22：状态流转边界调整
- R23：修复 timeline 排序 bug
- R24：最近 7 天新增 / resolved 趋势
- R25：新 chat 上下文恢复任务
- R26：影响范围评估任务
- R27：局部重构 storage
- R28：测试补齐
- R29：项目 README 更新
- R30：最终项目认知总结

## 5. Prompt 模板

### 5.1 Baseline 首轮

```text
请根据 README.md 开发 TeamDesk Lite。

当前任务：R01 初始化项目结构。

请先说明你对当前任务的理解和计划，然后实现。
完成后列出：
1. 你读取的文件
2. 你修改的文件
3. 本轮完成了哪些验收点
4. 是否触碰了与本任务无关的功能
5. 下一轮建议做什么
```

### 5.2 Baseline 后续轮次

```text
当前任务：R02 Ticket 数据模型与 JSON storage。

请基于现有项目继续开发。
请先说明你对当前任务的理解和计划，然后实现。
完成后列出：
1. 你读取的文件
2. 你修改的文件
3. 本轮完成了哪些验收点
4. 是否触碰了与本任务无关的功能
5. 下一轮建议做什么
```

### 5.3 Baseline 未完成继续

```text
当前任务仍然是：R02 Ticket 数据模型与 JSON storage。

上一轮尚未完成，请继续完成 R02。
请先说明当前剩余问题，然后实现。
完成后列出：
1. 你读取的文件
2. 你修改的文件
3. 本轮完成了哪些验收点
4. R02 是否已经完成
5. 是否触碰了与本任务无关的功能
```

### 5.4 CoAI 首轮

```text
请使用 coai skill，根据 README.md 开发 TeamDesk Lite。

当前任务：R01 初始化项目结构。

请先说明你对当前任务的理解和计划，然后实现。
开发过程中请按 CoAI workflow 维护项目认知层。
完成后列出：
1. 你读取的文件
2. 你修改的文件
3. 本轮完成了哪些验收点
4. 本轮新增或更新了哪些 CoAI 认知资产
5. 是否触碰了与本任务无关的功能
6. 下一轮建议做什么
```

### 5.5 CoAI 后续轮次

```text
请使用 coai skill，基于当前项目继续开发 TeamDesk Lite。

当前任务：R02 Ticket 数据模型与 JSON storage。

请先通过 CoAI 认知层恢复当前项目上下文，再说明你的理解和计划，然后实现。
完成后列出：
1. 你读取的文件
2. 你修改的文件
3. 本轮完成了哪些验收点
4. 本轮新增或更新了哪些 CoAI 认知资产
5. 是否触碰了与本任务无关的功能
6. 下一轮建议做什么
```

### 5.6 CoAI 未完成继续

```text
请使用 coai skill。

当前任务仍然是：R02 Ticket 数据模型与 JSON storage。

上一轮尚未完成，请先通过 CoAI 认知层恢复当前项目上下文，再继续完成 R02。
完成后列出：
1. 你读取的文件
2. 你修改的文件
3. 本轮完成了哪些验收点
4. 本轮新增或更新了哪些 CoAI 认知资产
5. R02 是否已经完成
6. 是否触碰了与本任务无关的功能
```

## 6. Attempt 规则

如果一个任务一轮没有完成，不进入下一轮任务。

记录方式：

```text
R02-A1：第一次尝试
R02-A2：继续完成未完成部分
R02-A3：修复 R02 的构建或测试问题
```

汇总 R02 时：

- token = A1 + A2 + A3
- 时间 = A1 + A2 + A3
- success = 最后是否完成
- attempts = 任务完成所需尝试次数

`attempts` 是重要指标。CoAI 如果有效，可能减少 attempt、返工和重复解释。

## 7. 每轮 CSV 记录项

建议维护 `runs.csv`：

```csv
runId,round,attempt,condition,agent,model,totalTokens,durationMin,filesRead,sourceFilesRead,coaiFilesRead,filesChanged,wrongFileVisits,scopeDriftCount,implementationScore,cognitionScore,scopeControlScore,taskSuccess,notes
```

字段说明：

- `runId`：唯一编号，例如 `KIMI-TRAE-BASE-R02-A1`
- `round`：任务编号，例如 `R02`
- `attempt`：同一任务第几次尝试
- `condition`：`baseline` 或 `coai`
- `agent`：`Trae`、`Claude Code` 等
- `model`：模型名称
- `totalTokens`：本轮 token 总量
- `durationMin`：本轮耗时
- `filesRead`：读取文件数
- `sourceFilesRead`：读取源码文件数
- `coaiFilesRead`：读取 `.coai` 文件数，baseline 填 0
- `filesChanged`：修改文件数
- `wrongFileVisits`：明显无关文件访问次数
- `scopeDriftCount`：偏离任务范围次数
- `implementationScore`：实现质量 1-5
- `cognitionScore`：理解质量 1-5
- `scopeControlScore`：范围控制 1-5
- `taskSuccess`：本 attempt 后任务是否完成
- `notes`：简短备注

## 8. Raw 记录模板

每次 run 保存一份 markdown 原始记录。

```md
# KIMI-TRAE-BASE-R02-A1

## Metadata

- date:
- condition:
- agent:
- model:
- round:
- attempt:
- durationMin:
- inputTokens:
- outputTokens:
- totalTokens:

## Prompt

粘贴本轮原始 prompt。

## Agent Plan

粘贴 agent 的计划。

## Files Read

- README.md
- src/...

## Files Changed

- package.json
- src/...

## CoAI Files Read

baseline 填 none。

## CoAI Assets Changed

baseline 填 none。

## Acceptance

- [ ] 验收点 1
- [ ] 验收点 2

## Final Answer

粘贴 agent 最终回答。

## Human Review

- 成功点：
- 问题：
- 是否偏离范围：
- wrongFileVisits:
- scopeDriftCount:
- implementationScore:
- cognitionScore:
- scopeControlScore:
- taskSuccess:
- notes:
```

## 9. 评分规则

### implementationScore

- 5：完整正确，能运行，结构合理
- 4：基本正确，有小问题
- 3：可运行但结构或边界有明显缺陷
- 2：局部完成，核心逻辑不可靠
- 1：失败或严重跑偏

### cognitionScore

- 5：准确理解任务、业务规则和影响范围
- 4：理解基本正确，少量遗漏
- 3：能完成任务，但解释不完整或有误解
- 2：对核心流程有明显误解
- 1：理解错误或大量幻觉

### scopeControlScore

- 5：只读/改必要范围，边界清晰
- 4：少量额外读取或小范围额外修改
- 3：有明显无关读取，但未造成严重影响
- 2：修改了不相关功能或引入不必要重构
- 1：严重偏离任务范围

## 10. 最小记录要求

如果时间紧，至少记录：

- `totalTokens`
- `durationMin`
- `filesRead`
- `filesChanged`
- `attempt`
- `scopeDriftCount`
- `implementationScore`
- `cognitionScore`
- `scopeControlScore`
- `taskSuccess`

token 只能代表成本，不能单独证明认知效果。必须记录文件读取和范围漂移，因为 CoAI 的关键价值是帮助 agent 更快定位相关上下文、少读无关文件，并保持任务边界。

## 11. 外部 agent 反馈粘贴格式

可以直接把 Trae、Claude Code 或其他 agent 的每轮反馈粘贴给评审者分析。为了减少遗漏，建议每轮粘贴时包含：

```text
runId:
round:
attempt:
condition:
agent:
model:
workspace:
prompt:

agent tool trace:
粘贴工具调用、搜索、终端命令、文件读取、文件修改摘要。

agent final answer:
粘贴 agent 最终回答。

optional human notes:
你自己观察到的问题、运行结果或疑问。
```

如果 token 数不可见，可以先留空。不要因为 token 不可得中断实验。

## 12. 反馈分析口径

评审者从粘贴内容中提取：

- `filesRead`
- `sourceFilesRead`
- `coaiFilesRead`
- `filesChanged`
- `searchMissCount`
- `commandFailureCount`
- `wrongFileVisits`
- `scopeDriftCount`
- `overImplementedFutureTasks`
- `agentVerificationStatus`
- `humanVerificationStatus`
- `implementationScore`
- `cognitionScore`
- `scopeControlScore`
- `taskSuccess`

建议增加以下字段：

```csv
searchMissCount,commandFailureCount,agentVerificationStatus,humanVerificationStatus,overImplementedFutureTasks
```

验证状态可使用：

- `not_run`：未运行验证命令。
- `passed_observed`：看到了明确通过日志。
- `failed_observed`：看到了明确失败日志。
- `claimed_pass_not_observed`：agent 声称通过，但粘贴内容没有证据。
- `partial`：只验证了一部分。

注意：

- 搜索 `README.md` 失败但实际读取 `README_zh.md`，应记录为 `searchMissCount = 1`，不算 `wrongFileVisits`。
- agent 读取明显无关文件才算 `wrongFileVisits`。
- agent 提前实现未来轮次功能，应记录 `overImplementedFutureTasks`，并影响 `scopeControlScore`。
- agent 声称测试通过但日志中只有失败，应记录为 `claimed_pass_not_observed` 或 `failed_observed`。

## 13. 推荐结果目录

建议将真实实验数据放在：

```text
evaluation/results/teamdesk-lite-v0/
├── runs.csv
├── raw/
│   ├── KIMI-TRAE-BASE-R01-A1.md
│   └── KIMI-TRAE-BASE-R02-A1.md
└── reviews/
    ├── KIMI-TRAE-BASE-R01-A1.review.md
    └── KIMI-TRAE-BASE-R02-A1.review.md
```

`raw/` 保存原始粘贴内容，`reviews/` 保存结构化分析。`runs.csv` 保存可汇总的数据。
