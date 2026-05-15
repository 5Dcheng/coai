# CoAI 有效性测试结论

## 结论摘要

基于 TeamDesk Lite 的 baseline、AGENTS.md、post-hoc CoAI 三组实验，当前最可信的结论是：

> CoAI 的有效性不在于让 agent 每次都少读文件、少花 token，而在于把项目理解从临时 chat 上下文转化为按功能组织、可定位源码入口、可维护回流的项目认知资产。

更具体地说：

1. baseline 能完成任务，但每个新窗口都需要重新建立项目认知。
2. AGENTS.md 能显著降低新窗口读取成本，但它是手动维护的单文件上下文资产，生成和更新成本可能很高。
3. CoAI 引入初始化和维护成本，但提供 feature cognition、mapper/anchor、认知回流，更适合长期维护和局部功能变更。

因此，CoAI 的产品价值应表述为：

> 为 AI coding agent 提供可复用、可定位、可维护的项目功能认知层，降低长期维护中的源码探索和上下文重建成本。

而不应表述为：

> CoAI 在任何任务中都一定更省 token 或更少读文件。

## 三组条件的定位

| 条件 | 本质 | 优势 | 主要成本/风险 |
|---|---|---|---|
| baseline | 每个新窗口直接读源码/README | 无初始化成本，源码事实最直接 | 新窗口认知重建成本高，理解只存在 chat 中 |
| AGENTS.md | 单文件上下文摘要 | 新窗口使用成本低，简单易用 | 生成/更新成本高，需人工触发维护，易过期或被长上下文污染 |
| CoAI | 结构化 feature cognition + mapper/anchor | 按功能组织、能定位源码入口、可认知回流 | 初始化成本、资产维护成本、仍需源码验证 |

AGENTS.md 不是“无成本 CoAI”。它是 baseline 与 CoAI 之间的中间态：比 baseline 多了外化上下文，比 CoAI 少了结构化 feature 边界、mapper/anchor 和认知回流机制。

## R31 token 结果的正确解释

R31 是“新窗口项目认知”任务，三组单次使用成本如下：

| 条件 | billed tokens | 费用 CNY | filesRead | sourceFilesRead |
|---|---:|---:|---:|---:|
| baseline R31 | 299,655 | 0.7905314 | 26 | 26 |
| CoAI R31 | 174,740 | 0.508423 | 31 | 8 |
| AGENTS.md R31 | 61,919 | 0.151387 | 4 | 3 |

单看新窗口 R31 使用成本：

- AGENTS.md 最低。
- CoAI 次之。
- baseline 最高。

但这不是最终优劣排序，因为 AGENTS.md 和 CoAI 都有资产生成/维护成本。

AGENTS.md A00 首次生成成本：

| 成本项 | billed tokens | 费用 CNY |
|---|---:|---:|
| AGENTS.md A00 生成 | 707,449 | 1.8105794 |
| AGENTS.md R31 使用 | 61,919 | 0.151387 |
| 合计 | 769,368 | 1.9619664 |

所以 AGENTS.md 的正确结论是：

1. 如果已有一份新鲜、高质量 AGENTS.md，新窗口使用非常便宜。
2. 如果只使用一次，生成成本很高，总成本并不低。
3. 如果项目持续推进，每次开新 chat 前还需要更新 AGENTS.md，后续 A01/A02 成本需要继续测。

CoAI R31 的正确结论是：

1. CoAI 相比 baseline 降低了源码读取：26 -> 8。
2. CoAI 相比 baseline 降低了本次 billed usage：299,655 -> 174,740。
3. CoAI 通过读取 `.coai` 资产替代一部分源码探索。
4. CoAI 并未在总文件读取上最低，因为它读取了 23 个 `.coai` 文件。

## 质量结果的正确解释

三组 R31 输出都能支撑基本项目接手：

| 条件 | 面向维护的平均质量分 |
|---|---:|
| baseline R31 | 4.7 |
| CoAI R31 | 4.8 |
| AGENTS.md R31 | 4.7 |

这说明：

- baseline 的强度很高，不能低估普通 agent + workspace 的能力。
- AGENTS.md 是强 baseline，整体项目认知任务上表现很好。
- CoAI 的优势不是“R31 总结质量压倒性更高”，而是认知组织和后续定位方式更适合长期维护。

面向后续开发，真正需要的项目认知包括：

1. 功能边界：列表、新建、详情、评论、状态流转、Activity、Dashboard 的职责。
2. 代码入口：前端页面、API client、Express route、DB layer 的对应关系。
3. 核心数据模型：Ticket、Comment、Activity、StatusHistoryItem。
4. 状态机：`VALID_TRANSITIONS` 前后端双源定义。
5. `resolvedAt` 统计语义：状态流转与 Dashboard 的耦合。
6. Activity 链路：后端生成 message，前端 timeline 展示。
7. JSON storage：read-modify-write 无锁风险。
8. 测试边界：现有测试偏前端逻辑，缺少后端 route 测试。
9. 修改入口：不同 feature 对应哪些文件。
10. 高风险点：双源、无事务、静态文案、过期认知资产。

CoAI 在这些认知项中的主要优势，是把它们按 feature 存放，并通过 mapper/anchor 指向关键源码入口。

## AGENTS.md 的重新定位

AGENTS.md 应被视为强 baseline，而不是 CoAI 的替代品。

它的价值：

- 快速让新窗口获得项目概要。
- 使用成本低。
- 对小项目或轻量接手非常有效。

它的限制：

- 不是自动维护的资产。
- 每次项目推进后，开新 chat 前都需要显式更新。
- 更新可能需要依赖旧 chat 长上下文，而旧上下文可能包含过期信息和无关污染。
- 如果不信任旧上下文，更新 AGENTS.md 又可能需要重新扫描大量源码。
- 单文件难以承载按 feature 组织的目标、边界、约束、关键入口和风险。
- 缺少 mapper/anchor，局部维护仍要靠搜索或重新读源码。

因此，AGENTS.md 的生命周期成本应写成：

```text
AGENTS.md 生命周期成本 =
  首次生成成本
  + 每次准备开新 chat 前的更新成本
  + 新窗口读取成本
  + 过期/污染导致的返工成本
```

这使它成为 CoAI 的强对照组，而不是反驳 CoAI 的证据。

## CoAI 的有效性证据

当前实验支持以下 CoAI 有效性判断。

### 1. CoAI 减少源码探索

在 baseline2 vs post-hoc CoAI R26-R30 对照中：

| 指标 | baseline2 R26-R30 | CoAI R26-R30 |
|---|---:|---:|
| 总读取文件数 | 47 | 56 |
| 源码/配置/测试/数据读取数 | 46 | 21 |
| `.coai` 文件读取数 | 0 | 35 |

CoAI 没有减少总读取文件数，但显著减少源码读取。

这个结论比“更省文件”更准确：

> CoAI 把一部分源码探索转移为读取高密度项目认知资产。

### 2. CoAI 提供 feature-oriented 项目认知

baseline 和 AGENTS.md 都能给出项目总结。

CoAI 的不同在于它按 feature 组织：

- `ticket-list`
- `ticket-create`
- `ticket-detail`
- `ticket-meta-edit`
- `status-transition`
- `comment`
- `activity-timeline`
- `dashboard`
- `json-storage`
- `api-routing`

这更接近后续维护任务的真实切入方式，因为开发者通常不是“修改某个目录”，而是“修改某个功能”。

### 3. CoAI mapper/anchor 提供源码入口

CoAI 的关键差异不是文档数量，而是 mapper/anchor 的可定位性。

AGENTS.md 可以告诉 agent：

```text
评论 activity 可能在 comments route 和 TicketDetail timeline 附近。
```

CoAI 可以让 agent：

```text
先读 comment feature cognition
再通过 mapper 找到 comment_added 的后端生成点和 timeline 展示入口
最后只读少量源码验证
```

这在 R27/R28 中已经体现：

- CoAI R27：4 个 `.coai` + 1 个源码文件，定位评论 activity 文案。
- CoAI R28：2 个 `.coai` + 1 个源码文件，完成 30 -> 50 修改，并同步认知文档。

### 4. CoAI 支持认知回流

R28 是关键样本：

- 代码变更：`server/routes/comments.ts` preview 30 -> 50
- 认知资产变更：`.coai/project/ticket/comment.md` 同步 30 -> 50

baseline 能完成代码修改，但不会自然留下可复用的认知更新。

CoAI 的价值是：

> 代码变化后，稳定项目理解也随之更新。

### 5. CoAI 更适合局部维护和影响分析

R29 closed -> reopened 影响评估中，CoAI 准确覆盖：

- 前端 `VALID_TRANSITIONS`
- 后端 `VALID_TRANSITIONS`
- `resolvedAt` 清除逻辑
- stats 统计口径
- transition tests
- README 文档同步

这种任务比 R31 总结更接近真实维护。

CoAI 的 feature cognition 能让 agent 从 `status-transition` 出发，而不是先从目录和关键词探索。

## CoAI 不能过度声明的地方

当前数据不支持以下说法：

- CoAI 总是降低 token。
- CoAI 总是降低总文件读取。
- CoAI 初始化成本可以忽略。
- CoAI 可以替代源码验证。
- CoAI 一定优于 AGENTS.md 的单次项目总结。
- CoAI 对同一 chat 内的小改动一定更便宜。

更可信的说法是：

> CoAI 在长期维护、新窗口接手、功能定位、影响分析和认知回流上有明确价值；它用显式认知维护成本，换取可复用、可定位、可持续更新的项目理解。

## 对 CoAI 产品方向的建议

### 保持克制：不要做重型代码索引

CoAI 不应简单变成另一个 workspace index。

IDE、语言服务器、代码搜索、Trae workspace index 已经能做大量源码检索。

CoAI 更适合保留在“agent 可用的功能认知与源码入口层”：

```text
feature -> cognition -> mapper/anchor -> source entry
```

### 更适合做 agent 可调用能力

后续可以考虑提供更明确的 agent-facing function：

```text
getFeatureCognition(feature)
getFeatureAnchors(feature)
getSourceEntries(feature)
getChangeImpact(goal)
updateCognitionAfterChange(feature, changeSummary)
```

这比再做一张更大的代码地图更轻，也更不容易和现有 IDE/index 能力重叠。

### 降低 `.coai` 读取成本

当前 CoAI R31 读取 23 个 `.coai` 文件，R30 读取 10 个 `.coai` 文件，说明资产检索还有优化空间。

建议：

- module summary 更强。
- feature index 更明确。
- current.md 只放动态状态，不承载过多历史。
- mapper 能快速暴露关键 source entry。
- prompt/skill 引导 agent 不要一次读取所有 `.coai` 文件。

## 最终结论

当前 TeamDesk Lite 证据可以支撑 CoAI 有效，但必须用正确口径：

> CoAI 不是最低成本的单次项目总结工具；AGENTS.md 在单次 R31 使用上更便宜。

但：

> AGENTS.md 是需要人工定期更新的单文件上下文资产，生成和维护成本不低，且缺少 feature-level 组织、mapper/anchor 精准入口和认知回流。

因此：

> CoAI 的有效性主要体现在长期维护：它把项目理解组织成按功能边界划分、可映射到源码入口、可随代码变更回流更新的认知资产，从而减少后续维护中的源码探索和上下文重建。

一句话：

> AGENTS.md 让新窗口快速知道项目是什么；CoAI 让 agent 围绕某个功能知道该读哪里、改哪里、更新哪份认知。

