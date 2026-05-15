# CoAI 评估体系

## 1. 评估定位

CoAI 的评估对象不是单纯的 CLI、插件功能或文档格式，而是 **项目认知层**。

核心问题是：

```text
CoAI 能否帮助 agent 和开发者，以更低成本、更高准确度建立、恢复、导航和维持项目认知？
```

这里使用以下命名：

- **Evaluation**：完整评估体系，覆盖工具可用、目标效果、辐射影响与成本。
- **Benchmark**：Evaluation 中的可重复量化测试方法，不等同于完整评估体系。
- **Case**：用于评估的产品案例。
- **Run**：一次具体测试运行。
- **Study**：开发者观察、访谈、自测或模拟研究。

CoAI 的重点评估对象是“认知”：

```text
项目认知质量 -> 影响认知成本 -> 影响认知效果 -> 影响开发行为与长期维护
```

认知成本包括 token、时间、读取文件数、重复解释成本、上下文恢复成本。

认知效果包括 agent 对项目的理解程度、索引能力、注意力稳定性、多轮记忆一致性，以及开发者对项目的掌控力。

## 2. 三层评估框架

CoAI Evaluation 分三层：

1. **工具可靠性**：CoAI 能不能稳定运行。
2. **认知有效性**：CoAI 是否真的提升 agent / 开发者的项目认知。
3. **成本可控性**：CoAI 的使用成本是否可控，长期是否降低总认知成本。

这三层的关系是：

```text
工具可靠性是基础
认知有效性是目标
成本可控性决定能否长期使用
```

## 3. 工具可靠性

### 3.1 评估目标

工具可靠性回答：

```text
CoAI 作为工具是否稳定、可重复、不会破坏宿主项目？
```

这部分主要是工程回归测试，不是 CoAI 产品价值的主要证明。

### 3.2 覆盖范围

应覆盖：

- CLI 初始化与更新
- `--no-package-json` 轻量接入
- VS Code Hover / Click 导航
- mapper 行号同步
- anchor 识别与格式归一
- bug log 生成与流转
- pre-commit fail-open 检查
- hook 安装、卸载与恢复
- `.coai/coai` 系统资产更新

### 3.3 指标

建议指标：

- `initSuccessRate`
- `noPackageJsonInitSuccessRate`
- `mapperLineAccuracy`
- `anchorDetectionAccuracy`
- `bugTypeAccuracy`
- `preCommitPassRate`
- `unexpectedFailureCount`
- `hostProjectMutationSafety`

### 3.4 当前定位

这部分在开发 CoAI 的过程中已经持续验证过。后续应保留为 smoke test / regression test，但不要把它作为 CoAI 有效性的主要证据。

工具可靠性的结论边界：

```text
工具可靠只能证明 CoAI 能运行，不能证明 CoAI 改善了项目认知。
```

## 4. 认知有效性

### 4.1 评估目标

认知有效性是 CoAI 的核心评估层。

它回答：

```text
CoAI 是否作为认知地图，帮助 agent 和开发者更好地理解、定位、修改和维护项目？
```

认知有效性分为：

1. Agent 认知有效性
2. 开发者认知有效性

其中 **agent 是主要评估对象**，因为 agent 行为可以更客观地量化；开发者感受受经验、习惯、工具偏好影响较大，更适合作为补充评估。

## 5. Agent 认知有效性

### 5.1 核心问题

Agent 评估应回答：

- CoAI 是否提升 agent 的索引处理能力？
- CoAI 是否提升 agent 的功能理解能力？
- CoAI 是否降低 agent 的注意力漂移？
- CoAI 是否提升多轮对话后的记忆一致性？
- CoAI 是否帮助新 chat 更快恢复项目上下文？
- CoAI 对不同梯度模型的提效程度是否不同？
- 哪些模型层级适合 CoAI workflow？

### 5.2 模型与 agent 分层

不建议只用最强模型测试。强模型可能掩盖认知层价值。

建议分层：

- 低成本模型：验证 CoAI 是否能补足弱模型的项目理解。
- 中层模型：主要评估对象，验证 CoAI 是否能让可负担模型完成真实开发任务。
- 强模型：少量作为上限基线或 judge，不作为主要测试消耗来源。

### 5.3 上下文条件

每个任务建议至少比较以下条件：

- `baseline-source`：只提供源码与 README。
- `readme-docs`：提供 README 与普通 docs。
- `full-history`：提供完整历史摘要、日志、详细 spec。
- `coai-map`：提供 README、`.coai/current.md`、相关 feature、contract、mapper、node，必要时再读源码。

`coai-map` 不应一次性读取所有 `.coai` 文件，而应按 CoAI workflow：

```text
current.md -> relevant feature.md -> relevant contract -> mapper -> node if needed -> source only when needed
```

### 5.4 Agent 指标

索引与定位：

- `targetFileHitAt1`：第一次命中的文件是否正确。
- `targetAnchorHit`：是否命中正确 anchor。
- `filesRead`：读取文件数。
- `linesRead`：读取行数。
- `wrongFileVisits`：访问错误文件数。
- `searchCount`：搜索次数。
- `timeToTarget`：找到目标位置耗时。

功能理解：

- `flowEdgeRecall`：关键流程边召回率。
- `flowEdgePrecision`：流程解释准确率。
- `conceptAccuracy`：关键概念准确率。
- `missingKeyPointCount`：遗漏关键点数量。
- `hallucinationCount`：幻觉数量。
- `explanationScore`：人工或 judge 模型给出的解释分。

注意力漂移：

- `scopeDriftCount`：偏离任务范围次数。
- `irrelevantReadRatio`：无关文件读取比例。
- `unnecessaryRefactorCount`：不必要重构次数。
- `forbiddenFileTouchCount`：触碰禁止修改文件次数。
- `planDeviationCount`：执行偏离原计划次数。

多轮一致性：

- `memoryConsistencyRate`：多轮后回答与既定事实一致的比例。
- `contradictionCount`：自相矛盾次数。
- `taskBoundaryRetention`：是否保持任务边界。
- `repeatedContextRequestCount`：重复要求解释上下文次数。
- `staleAssumptionCount`：沿用过期假设次数。

任务结果：

- `taskSuccessRate`
- `testPassRate`
- `patchCorrectness`
- `reviewIssueCount`

### 5.5 新 chat 上下文恢复

这是 CoAI 的重要评估点。

当前常见说法是：

```text
开新 chat 往往比一直在旧 chat 里聊更好。
```

但新 chat 会丢失上下文。如果重新理解大型项目，需要额外消耗大量 token。只读 README 可能认知层次不够；读完整日志、spec 和历史对话又可能太细、太噪。

CoAI 的定位是中间层：

```text
比 README 更具体
比完整历史更干净
比旧 chat 记忆更稳定
比全仓源码扫描更可导航
```

测试条件：

- `long-chat`：持续使用旧 chat。
- `new-chat-readme`：新 chat 只读 README / 普通 docs。
- `new-chat-full-history`：新 chat 读取完整历史、日志、详细 spec。
- `new-chat-coai`：新 chat 通过 CoAI 资产恢复上下文。

上下文恢复指标：

- `rehydrationTokens`
- `rehydrationFilesRead`
- `sourceFilesReadBeforeAction`
- `timeToFirstCorrectPlan`
- `contextPrecision`
- `contextRecall`
- `historyPollutionCount`
- `staleAssumptionCount`
- `taskBoundaryRetention`
- `completionSuccess`

可选综合分：

```text
Context Handoff Score =
  0.30 * contextRecall
+ 0.25 * contextPrecision
+ 0.20 * fileHitRate
+ 0.15 * taskSuccess
- 0.10 * normalizedRehydrationCost
- 0.10 * driftPenalty
```

权重可以后续调整。关键是同时衡量“认知质量”和“认知成本”。

## 6. 开发者认知有效性

### 6.1 定位

开发者评估回答：

```text
CoAI 是否提高开发者对项目的掌控力？
```

但开发者体验高度依赖个人背景、项目经验、编辑器习惯和 AI coding 熟练度。因此，开发者评估应作为认知有效性的补充，不宜在早期作为最硬结论。

### 6.2 评估问题

开发者评估应观察：

- 是否能更快理解项目结构？
- 是否能更快找到功能入口？
- 是否能更准确判断改动影响范围？
- 是否能知道哪些模块不该乱改？
- 是否降低项目黑盒感？
- 是否提升维护信心？

### 6.3 指标

客观指标：

- `orientationTime`
- `navigationSuccessRate`
- `impactPredictionAccuracy`
- `correctEntryFileRate`
- `correctMentalModelScore`
- `changePlanAccuracy`

主观指标：

- `blackBoxFeeling`：1 到 7，越低越好。
- `maintenanceConfidence`：1 到 7，越高越好。
- `perceivedNavigationClarity`：1 到 7，越高越好。
- `changeConfidence`：1 到 7，越高越好。

如果没有真实开发者样本，自测或模拟数据必须标注：

```text
SIMULATED_DATA
```

模拟数据不能表述为真实开发者研究结论。

## 7. 成本可控性

### 7.1 评估目标

成本可控性回答：

```text
CoAI 引入的认知层维护成本，是否能在长期开发中被收益抵消？
```

CoAI 可能在前期增加 token 和操作成本，因为 agent 需要读取 `.coai`，并维护 feature、mapper、anchor 与 node。

需要验证的假设：

```text
H1：前 1-5 轮，CoAI 可能增加上下文与维护成本。
H2：10 轮后，CoAI 开始减少重复解释、盲扫源码和上下文恢复成本。
H3：20 / 30 轮后，项目越复杂，CoAI 的累计认知成本优势越明显。
H4：如果 CoAI 资产维护不及时，成本优势会下降甚至反转。
```

### 7.2 分阶段成本曲线

建议记录：

- 10 轮
- 20 轮
- 30 轮

每轮记录：

- `inputTokens`
- `outputTokens`
- `totalTokens`
- `coaiFilesRead`
- `sourceFilesRead`
- `docsFilesRead`
- `repeatedExplanationTokens`
- `contextRehydrationTokens`
- `timeToFirstCorrectPlan`
- `timeToPatch`
- `coaiMaintenanceTime`
- `coaiMaintenanceTokens`

### 7.3 成本判断

不要只看 token 降低。

一个低 token 但理解错误的 run 不是更好的 run。

成本可控性应结合：

```text
总 token
总时间
任务成功率
理解准确率
注意力漂移
上下文恢复质量
CoAI 资产维护成本
```

推荐报告：

```text
Cost Effectiveness =
  cognitive quality / cognitive cost
```

其中 cognitive quality 可以由任务成功率、理解准确率、定位准确率、漂移惩罚组成。

## 8. 推荐评估案例

### 8.1 不使用 coai_v1 本体

不建议用 `coai_v1` 本体作为主要测试对象。

原因：

- 它是 CoAI 自身，容易产生自指偏差。
- agent 可能过度贴合 CoAI 设计语言。
- 工具实现细节会干扰产品案例评估。

应使用一个外部产品案例。

### 8.2 推荐案例：TeamDesk Lite

推荐产品：

```text
TeamDesk Lite：轻量团队工单 / 缺陷 / 需求流转系统
```

它比 Todo app 更真实，但又不至于让中层模型做不动。

适合原因：

- 有清晰业务流程，适合 CoAI feature / node / mapper。
- 有状态机，能测功能理解和边界保持。
- 有评论、活动流、筛选、统计，能测跨功能影响。
- 能自然展开 10 / 20 / 30 轮任务。
- 能设计新 chat 上下文恢复任务。
- 能设计 bug 修复与需求变更。

建议技术栈：

```text
Vite + React + TypeScript
Express API
JSON file storage
```

第一版避免引入过重框架，防止测试结果变成“模型会不会用框架”，而不是“CoAI 是否改善认知”。

### 8.3 阶段验收

Stage 0：基础工单

- 工单列表
- 工单详情
- 新建工单
- JSON 持久化

验收：

- 用户可以创建工单。
- 列表可以展示工单。
- 刷新或重启后数据仍在。

Stage 1：状态流转

- `open -> triaged -> in_progress -> resolved -> closed`
- `resolved -> reopened`
- 状态历史

验收：

- 非法状态跳转被拒绝。
- 状态变化写入 history。
- 详情页展示状态历史。

Stage 2：元数据与筛选

- assignee
- priority：`low / medium / high / urgent`
- tags
- 按 status / assignee / priority / tag 筛选

验收：

- 筛选结果正确。
- 修改 metadata 不破坏状态流转。

Stage 3：评论与活动流

- 用户评论
- 创建、状态变化、指派变化的系统 activity
- 时间线展示

验收：

- 评论不会改变状态。
- 状态变化会写 activity。
- 时间线排序稳定。

Stage 4：统计看板

- 按状态统计
- 按优先级统计
- 平均解决时间
- 最近新增 / 解决趋势

验收：

- 统计与工单数据一致。
- reopened 不应被错误算作 resolved。

Stage 5：Bug 修复与变更

人为设计 bug：

- reopened 工单仍被统计为 resolved。
- urgent 筛选漏掉 uppercase 输入。
- 删除评论后 activity 时间线错乱。

验收：

- agent 能定位根因。
- 修复范围准确。
- 不破坏无关功能。

### 8.4 Contract 准备

CoAI case 应优先准备轻量 contract，而不是全量 spec。

第一阶段 contract 只覆盖三类：

- 数据结构：使用 JSON、SQL 或宿主语言类型结构完整记录，不做删减；它是开发者和 agent 先读 CoAI 时的样板与指引。
- 算法：记录核心算法的实现思想、关键代码块、输入与预测输出；目标是可以据此设计单元测试。
- 通信接口：按模块级组织，与 `project/<module>.md` 对应，用于记录稳定请求 / 响应约定。

contract 不应替代 feature 文档，也不应复制所有源码细节。能由双链稳定跳到源码并且源码表达最清楚的信息，可以继续由源码承载。

## 9. 测试任务设计

### 9.1 索引任务

示例：

- 找到创建工单的入口和存储写入路径。
- 找到状态流转校验逻辑。
- 找到 reopened 如何影响统计。
- 找到 activity timeline 的生成位置。

Gold answer 应包含：

- 目标文件
- 目标 anchor
- 目标 feature 文档
- 不应读取或不应修改的无关模块

### 9.2 理解任务

示例：

- 解释完整状态流转。
- 解释 comment 与 activity 的区别。
- 解释为什么统计依赖 status history，而不只是 current status。
- 解释筛选逻辑与 metadata 的关系。

Gold answer 应包含：

- 必要概念
- 关键流程边
- 常见错误假设

### 9.3 修改任务

示例：

- 新增 priority 值，但不修改状态流转。
- 修复 urgent 筛选大小写问题。
- assignee 变化时新增 activity。
- 修复 reopened 统计问题。

Gold answer 应包含：

- 预期修改文件
- 不应修改的功能边界
- 预期测试

### 9.4 上下文恢复任务

示例：

- 10 轮后开新 chat，继续状态流转增强。
- 20 轮后开新 chat，修复统计 bug。
- 30 轮后开新 chat，先评估影响范围再做需求变更。

Gold answer 应包含：

- 必要项目认知
- 必要任务上下文
- 无关历史细节
- 不应复活的废弃方案

## 10. 测试结果记录模板

每次 run 建议记录：

```json
{
  "case": "teamdesk-lite",
  "caseVersion": "v0.1",
  "stage": "round-10",
  "taskId": "status-reopened-stats-fix",
  "condition": "new-chat-coai",
  "agent": "trae",
  "model": "mid-tier-model-name",
  "resultType": "MEASURED",
  "metrics": {
    "inputTokens": 0,
    "outputTokens": 0,
    "totalTokens": 0,
    "filesRead": 0,
    "sourceFilesRead": 0,
    "coaiFilesRead": 0,
    "targetFileHitAt1": false,
    "targetAnchorHit": false,
    "wrongFileVisits": 0,
    "scopeDriftCount": 0,
    "memoryConsistencyRate": 0,
    "taskSuccess": false,
    "developerBlackBoxFeeling": null,
    "developerMaintenanceConfidence": null
  },
  "notes": ""
}
```

结果类型：

- `MEASURED`：真实测试结果。
- `SIMULATED_DATA`：模拟数据或自测估算。
- `NOT_YET_MEASURED`：计划项，尚未执行。

## 11. 报告规则

报告必须分开呈现：

- 工具可靠性
- Agent 认知有效性
- 开发者认知有效性
- 新 chat 上下文恢复
- 10 / 20 / 30 轮成本曲线

不要混合真实数据和模拟数据。

不要用开发者主观感受替代 agent 客观指标。

不要只用 token 下降证明 CoAI 有效。

更准确的主张是：

```text
CoAI 通过提供项目认知地图，降低 agent 和开发者查找、恢复、保持任务相关认知的成本，并提高项目理解与修改的准确性。
```

## 12. 结果记录区

当前尚未记录正式外部案例测试结果。

后续每次测试应追加：

- 日期
- case 与版本
- 阶段
- agent / model
- 上下文条件
- 任务类型
- 量化指标
- 失败案例
- 结论边界
