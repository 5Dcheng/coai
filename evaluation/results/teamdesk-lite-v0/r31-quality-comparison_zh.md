# R31 新窗口项目认知质量对比

## 评估对象

本文件评估三种新窗口项目认知方式的输出质量：

1. `GLM-BASE-R31-A1`：无显式上下文资产，直接读源码/README。
2. `GLM-COAI-R31-A1`：优先读 `.coai` 认知资产和 mapper，按需读源码。
3. `GLM-AGENTS-R31-A1`：优先读根目录 `AGENTS.md`，按需读源码。

这里不泛泛评价“回答是否好”，而是评价它是否足以支撑后续项目功能开发和维护。

## 后续维护真正需要的关键项目认知

TeamDesk Lite 后续维护至少需要以下认知：

| 编号 | 认知项 | 为什么关键 |
|---|---|---|
| C1 | 功能地图与功能边界 | 知道 TicketList、TicketNew、TicketDetail、Dashboard、comment、activity、transition 分别负责什么，避免改错位置。 |
| C2 | 前后端结构与入口 | 知道前端路由、API 客户端、Express 路由、JSON 存储入口，才能定位修改点。 |
| C3 | 核心数据模型 | Ticket、StatusHistoryItem、Comment、Activity 是所有功能的契约，新增字段或改语义必须先理解它们。 |
| C4 | 状态流转规则 | `VALID_TRANSITIONS` 是核心业务规则，前后端双份定义，是高风险修改点。 |
| C5 | `resolvedAt` 统计语义 | 状态流转和 Dashboard 统计耦合，改 reopened/closed/resolved 规则时必须理解。 |
| C6 | Activity 生成与展示链路 | 评论、状态流转、指派人变化都会写 Activity；维护 timeline 文案必须知道后端生成、前端展示。 |
| C7 | JSON storage 写入模式 | `db.ts` 的 read-modify-write 无锁，影响并发、数据一致性和未来扩展。 |
| C8 | 测试覆盖与验证命令 | 后续改动必须知道现有测试覆盖边界，以及 `npm test` / `npm run build` 的作用。 |
| C9 | 高风险维护点 | 能不能提前识别双源定义、无事务、无后端路由测试、静态 message 等坑。 |
| C10 | 推荐阅读/修改入口 | 新开发者或新 agent 能否从回答直接进入某类维护任务。 |

## 评分口径

每项 0-5 分：

- 5：准确、具体、能直接指导维护。
- 4：准确但略缺细节。
- 3：大体正确，但需要重新读源码补足。
- 2：泛泛而谈，维护价值有限。
- 1：明显缺漏。
- 0：错误或未覆盖。

## 评分表

| 认知项 | Baseline R31 | CoAI R31 | AGENTS.md R31 |
|---|---:|---:|---:|
| C1 功能地图与边界 | 5 | 5 | 5 |
| C2 前后端结构与入口 | 5 | 5 | 5 |
| C3 核心数据模型 | 4 | 5 | 4 |
| C4 状态流转规则 | 5 | 5 | 5 |
| C5 `resolvedAt` 统计语义 | 5 | 4 | 5 |
| C6 Activity 链路 | 4 | 5 | 4 |
| C7 JSON storage 风险 | 5 | 5 | 5 |
| C8 测试与验证认知 | 5 | 4 | 4 |
| C9 高风险维护点 | 5 | 5 | 5 |
| C10 推荐阅读/修改入口 | 4 | 5 | 5 |
| **平均** | **4.7** | **4.8** | **4.7** |

三者质量都达标，没有明显失败组。差异主要不在“是否知道项目”，而在“认知组织方式”和“后续定位效率”。

## Baseline R31 评审

### 对后续维护有价值的地方

Baseline R31 通过读取大量源码、测试、配置和数据文件建立认知，输出对后续维护有较强可用性：

- 功能地图完整，覆盖列表、新建、详情、状态流转、评论、Activity、Dashboard。
- 能准确描述前端 React/Vite/Router 与后端 Express/JSON storage 结构。
- 能说明创建工单、状态流转、统计看板的核心数据流。
- 能识别关键风险：状态流转规则双源、`resolvedAt` 统计语义、类型双源、JSON 并发写入、API 错误处理脆弱。
- 对测试和数据文件也有感知，适合做一次性项目接手。

### 对具体维护任务的支撑度

| 任务 | 支撑度 | 说明 |
|---|---|---|
| 改评论 activity 文案 | 中高 | 知道 Activity 存在，但 R31 本身没有精准定位到 `comments.ts` 的 message 生成点，需要后续再查。 |
| 改状态流转规则 | 高 | 已明确前后端 `VALID_TRANSITIONS` 双源和 `resolvedAt` 风险。 |
| 改 Dashboard 统计 | 高 | 已说明 stats 读取 tickets 并按 resolved/closed + resolvedAt 统计。 |
| 新增 Ticket 字段 | 中高 | 知道 `src/types.ts` / `server/types.ts` 双源，但没展开表单、列表、详情、API patch 全链路。 |
| 排查 JSON 数据问题 | 高 | 已定位 `server/db.ts` 和 data JSON 文件。 |

### 主要不足

- 它更像“源码探索后的项目报告”，而不是可复用的功能索引。
- 如果换一个新窗口，仍要重新扫描源码。
- 对局部 feature 的代码定位没有 mapper/anchor，只能靠文件名和再次搜索。

## CoAI R31 评审

### 对后续维护有价值的地方

CoAI R31 的回答更像“项目认知地图”，不是简单目录总结：

- 直接按 feature 组织：`ticket-list`、`ticket-create`、`ticket-detail`、`ticket-meta-edit`、`status-transition`、`comment`、`activity-timeline`、`dashboard`、`json-storage`、`api-routing`。
- 能把业务功能和代码层次连接起来，不只是列文件。
- 高风险点更贴近维护经验：双源状态机、JSON 无锁、类型双源、`TicketDetail` 膨胀、全量加载、Activity message 硬编码。
- 推荐阅读路径包含 `.coai/project/ticket.md` 和对应 feature doc，适合后续按功能定位。

### 对具体维护任务的支撑度

| 任务 | 支撑度 | 说明 |
|---|---|---|
| 改评论 activity 文案 | 高 | 能通过 comment/activity-timeline feature 和 mapper 快速定位，后续 R27/R28 已验证只需少量源码。 |
| 改状态流转规则 | 高 | 能先读 status-transition feature，再按 mapper 定位前后端规则。 |
| 改 Dashboard 统计 | 高 | dashboard feature 与 stats route 关系清楚。 |
| 新增 Ticket 字段 | 高 | 能通过 ticket module、meta-edit、create/detail/list 多 feature 识别影响面。 |
| 排查 JSON 数据问题 | 高 | json-storage feature 把存储层作为独立认知节点。 |

### 主要不足

- 如果 `.coai` 资产过期，会把 agent 带偏，所以仍需源码抽样验证。
- R31 读取 `.coai` 文件较多，说明当前资产有些分散。
- 对“源码事实”的精确行号和测试覆盖细节不如 baseline 全量扫描直接。

## AGENTS.md R31 评审

### 对后续维护有价值的地方

AGENTS.md R31 表现非常强，尤其适合“新窗口快速恢复项目认知”：

- 只读 `AGENTS.md` 加 3 个源码文件，就输出了完整功能地图。
- 能准确解释状态流转、评论创建、统计计算三条核心数据流。
- 能识别和 CoAI/baseline 基本一致的高风险点：状态机双源、`resolvedAt`、类型双源、JSON 无锁、Activity 静态文案、缺少后端路由测试。
- 推荐阅读文件非常实用：`AGENTS.md`、types、db、api、transition、TicketDetail。
- 回答对后续维护足够具体，不只是泛泛总结。

### 对具体维护任务的支撑度

| 任务 | 支撑度 | 说明 |
|---|---|---|
| 改评论 activity 文案 | 中高 | 已知道 comment activity 截取 50 字预览，但未精确指出生成文件位置；需要再读 comments route。 |
| 改状态流转规则 | 高 | 读取了 `transition.ts`，能准确描述规则和 `resolvedAt`。 |
| 改 Dashboard 统计 | 中高 | 说明了 stats 计算方式，但没有读取 `stats.ts` 验证细节。 |
| 新增 Ticket 字段 | 中高 | 知道类型和 API 契约，但影响面不如 CoAI feature map 展开得自然。 |
| 排查 JSON 数据问题 | 高 | 读取 `db.ts`，风险判断准确。 |

### 主要不足

- 它依赖单个 `AGENTS.md` 的质量；如果文件过长或过期，agent 很难知道哪一段最相关。
- 缺少 mapper/anchor，局部维护时仍需要靠搜索或再读源码定位。
- 它适合 R31 这种整体认知任务，但对 R27/R28 这种局部定位任务，未必比 CoAI 稳。
- 它不是自行维护的资产。项目推进后，如果准备开启新 chat，需要在旧 chat 中显式要求 agent 更新 `AGENTS.md`，否则新窗口会读取过期上下文。
- 它对开发者可读，但缺少 CoAI feature doc 中更适合 agent 使用的高语义信息，例如目标、边界、约束、核心入口、风险和按功能组织的维护路径。

## 成本与质量结合

| 条件 | 平均质量分 | totalBilledUsageTokens | totalAmountCny | sourceFilesRead |
|---|---:|---:|---:|---:|
| baseline R31 | 4.7 | 299,655 | 0.7905314 | 26 |
| CoAI R31 | 4.8 | 174,740 | 0.508423 | 8 |
| AGENTS.md R31 | 4.7 | 61,919 | 0.151387 | 3 |

单看 R31 使用成本：

- AGENTS.md 最低。
- CoAI 次之。
- baseline 最高。

但 AGENTS.md 有 A00 生成成本：

| 成本项 | billed tokens | amount CNY |
|---|---:|---:|
| AGENTS.md A00 生成 | 707,449 | 1.8105794 |
| AGENTS.md R31 使用 | 61,919 | 0.151387 |
| AGENTS.md A00 + R31 | 769,368 | 1.9619664 |

所以 AGENTS.md 的真实价值取决于复用次数和维护频率。如果只用一次，它总成本不低；如果在多个新窗口中复用，它的新窗口使用成本很有优势。

更完整的成本口径应为：

```text
AGENTS.md 生命周期成本 =
  首次生成成本
  + 每次准备开新 chat 前的更新成本
  + 新窗口读取成本
  + 因文档过期/污染导致的返工成本
```

其中“每次准备开新 chat 前的更新成本”不能忽略。AGENTS.md 不会自动维护，项目推进一段时间后，必须由用户显式要求旧窗口更新，否则新窗口会读取旧认知。

## 面向后续开发维护的结论

### 如果目标是“已有新鲜 AGENTS.md 后快速让新窗口理解项目”

AGENTS.md 当前表现最好，但前提很强：

- 文件最少
- token 最低
- 质量足够
- 不需要在新窗口初始化 CoAI

这个结论只适用于“已有一份新鲜、高质量、刚更新过的 AGENTS.md”的使用阶段。它不包含：

1. 旧窗口生成或更新 AGENTS.md 的成本。
2. 判断 AGENTS.md 是否过期的人工成本。
3. AGENTS.md 因长上下文污染、过时信息或信息堆叠导致的认知偏移风险。

因此不能把 `AGENTS.md R31` 的低成本直接解释为 AGENTS.md 方案整体优于 CoAI。AGENTS.md 更准确地说是 baseline 与 CoAI 之间的中间态：它把一部分 chat 上下文外化为单文件资产，但没有 CoAI 的 feature boundary、mapper、anchor 和 cognition backflow 机制。

### 如果目标是“持续维护某个功能”

CoAI 更有优势：

- feature 边界更清楚
- mapper/anchor 能把认知连接到源码
- 修改后可以回流 feature cognition
- 对局部任务更容易保持焦距

这里的重点不是 CoAI 文档更多，而是 mapper/anchor 让认知具备“可定位性”：agent 可以先从功能语义进入，再落到关键源码入口。AGENTS.md 只能告诉 agent “大概去哪里”，CoAI mapper 可以把 feature cognition 绑定到具体实现位置。

对后续功能开发而言，这个差异比 R31 成本更关键。真实维护任务通常不是“请总结项目”，而是：

- 修改 comment activity 文案。
- 改 closed/reopened 状态规则。
- 新增 Ticket 字段并同步列表、新建、详情、API、测试。
- 修改 Dashboard 统计口径。

这些任务要求 agent 快速确认 feature 边界、关键入口、约束和影响面。AGENTS.md 可以给背景，但仍可能需要重新搜索；CoAI 通过 feature doc + mapper/anchor 给出更明确的局部入口。

### 如果目标是“一次性全面审计项目”

baseline 仍有价值：

- 源码事实验证最充分
- 不依赖任何外部认知资产
- 更适合检查文档/认知资产是否过期

## 对后续实验的建议

R31 说明 AGENTS.md 是强 baseline，后续不应只比较 baseline vs CoAI。

建议固定三组：

```text
baseline：直接读源码
AGENTS.md：先读 AGENTS.md，必要时读源码
CoAI：先读 .coai + mapper，必要时读源码
```

下一步最值得测的不是 R31，而是局部维护任务，例如：

1. 定位并修改 comment activity 文案。
2. 评估 closed -> reopened 状态流转。
3. 新增 Ticket 字段并同步前后端。
4. 修改 Dashboard 统计口径。

这些任务更能体现 AGENTS.md 和 CoAI 的差异：单文件上下文是否足够聚焦，还是结构化 feature cognition + mapper 更稳。

## 对 CoAI 后续方向的谨慎判断

CoAI 目前还没有进一步做完整代码索引。这个边界是合理的：如果再做一层重型索引，容易和 IDE、语言服务器、代码搜索、workspace index 等工具重叠。

更适合的方向可能不是“再做一张更大的代码地图”，而是给 agent 提供可调用能力，例如：

```text
给定 feature -> 返回 feature cognition + mapper anchor + 关键源码入口
给定 anchor -> 跳转到对应源码位置
给定变更目标 -> 返回应更新的 feature docs / mapper / source files
```

也就是说，CoAI 的价值应保持在“agent 可用的功能认知与源码入口层”，而不是替代 IDE 的完整索引系统。
