# CoAI 效果分类与指标口径

## 目的

本文用于补充 CoAI evaluation 体系，明确 CoAI 的效果不应只用“是否完成开发任务”衡量。

在 TeamDesk Lite 实验中，baseline agent 已经证明：在 Trae workspace index 和 Kimi K2.6 的条件下，中小型项目可以被顺利开发完成。

因此，CoAI 的核心评估对象应转向：

- 项目认知地图能力
- 开发维护效能
- 新窗口上下文恢复
- 人和 agent 的黑盒感降低

## 效果分类

CoAI 的效果可分为两类。

## 1. 从 0 到 1：项目认知地图能力

### 定义

“从 0 到 1”指的是：

> 在进入具体实现或维护前，agent 或开发者能否快速建立对项目的整体认知。

这里的重点不是立刻修改代码，而是理解：

- 这个项目是什么
- 有哪些核心功能
- 功能之间如何关联
- 前后端和数据层如何组织
- 关键维护入口在哪里
- 哪些地方风险最高
- 哪些问题仍然不确定

### 为什么重要

源码通常按运行结构组织，而人和 agent 的理解通常按功能组织。

例如 TeamDesk Lite 中，“评论功能”横跨：

- `TicketDetail.tsx`
- `src/api.ts`
- `server/routes/comments.ts`
- `server/db.ts`
- `activities.json`
- activity timeline 展示

这些文件组织对程序运行是合理的，但对功能认知不是直接可见的。

CoAI 的 0 到 1 价值在于：把这种隐性功能链路沉淀成显式项目认知地图。

### 适合的测试任务

适合用这些任务测试：

- 新窗口项目接手理解
- 功能地图总结
- 核心数据流说明
- 维护入口推荐
- 风险清单识别
- 新开发者阅读路径推荐

例如：

- R21 / R26：已完成项目维护接手
- R30：维护总结

### 推荐指标

| 指标 | 含义 |
|---|---|
| `featureMapCompleteness` | 是否覆盖主要功能模块 |
| `architectureUnderstandingScore` | 前端、后端、数据层关系是否准确 |
| `coreDataFlowAccuracy` | 核心数据流是否正确 |
| `entryPointAccuracy` | 推荐入口文件是否准确 |
| `riskIdentificationScore` | 是否识别真实维护风险 |
| `uncertaintyQuality` | 不确定点是否真实、有价值 |
| `blackBoxReductionScore` | 开发者主观黑盒感是否下降 |
| `newChatRecoveryCost` | 新窗口恢复项目认知的成本 |

### 当前实验观察

TeamDesk Lite 中：

- baseline2 R26 可以建立高质量项目认知，但读取了大量源码、测试、配置和数据文件。
- post-hoc CoAI R26 也建立了高质量项目认知，源码读取减少，但 `.coai` 文件读取增加。
- CoAI R30 更强调功能认知地图、维护流程和认知回流，而不是只复述源码目录。

当前证据支持：

> CoAI 可以把项目认知显式化，使新窗口 agent 能通过项目资产恢复功能地图。

当前证据不支持：

> CoAI 一定降低总读取文件数或总 token。

## 2. 从 1 到 100：开发维护效能

### 定义

“从 1 到 100”指的是：

> 在已有项目认知的基础上，agent 进行定位、影响分析、小改动、验证和维护总结时的效率与稳定性。

这里评估的是具体维护过程，而不是初次理解项目。

### 为什么重要

长期项目维护中，真正频繁发生的是：

- 定位某个功能的生成点和展示点
- 评估一个规则变更的影响范围
- 做一个小而精确的修改
- 新 chat 接续前一阶段工作
- 避免读错文件、改错范围、忘记同步文档

CoAI 的 1 到 100 价值在于：让 agent 更快进入正确功能链路，并在代码变更后把新的认知回流到项目资产。

### 适合的测试任务

适合用这些任务测试：

- 功能链路定位
- 小维护改动
- 状态规则变更影响评估
- 测试影响分析
- 维护流程总结

例如：

- R27：评论 activity 文案定位
- R28：评论 activity 摘要长度修改
- R29：closed -> reopened 影响评估

### 推荐指标

| 指标 | 含义 |
|---|---|
| `sourceFilesRead` | 读取源码文件数 |
| `sourceLinesRead` | 读取源码行数 |
| `sourceEstimatedTokensRead` | 源码估算 token |
| `coaiFilesRead` | 读取 `.coai` 文件数 |
| `coaiEstimatedTokensRead` | `.coai` 估算 token |
| `wrongFileVisits` | 访问错误或无关文件次数 |
| `scopeDriftCount` | 范围漂移次数 |
| `filesChanged` | 修改文件数 |
| `sourceFilesChanged` | 修改源码文件数 |
| `coaiFilesChanged` | 修改 `.coai` 文件数 |
| `repairRounds` | 返工或修复轮次 |
| `commandFailureCount` | 命令失败次数 |
| `taskSuccess` | 任务是否完成 |
| `verificationDisciplineScore` | 是否运行正确验证 |
| `cognitionBackflowDone` | 代码变更后是否同步更新认知资产 |
| `impactAnalysisCompleteness` | 影响分析是否完整 |

### 当前实验观察

TeamDesk Lite 中：

- baseline2 R27 读取 4 个源码/测试文件即可定位评论文案。
- CoAI R27 读取 4 个 `.coai` 文件和 1 个源码文件即可定位评论文案。
- baseline2 R28 只读/改 1 个源码文件，成本非常低。
- CoAI R28 读 2 个 `.coai` 文件和 1 个源码文件，改 1 个源码文件和 1 个 `.coai` 文档。
- baseline2 R29 和 CoAI R29 总读取文件数相同，但 CoAI 减少了源码读取。

当前证据支持：

> CoAI 可以减少具体维护任务中的源码探索，并促成代码变更后的认知回流。

当前证据不支持：

> CoAI 对同一 chat 内的极小改动一定更省。

## 文件数指标的局限

当前实验大量使用 `filesRead` 和 `sourceFilesRead`。

这是可记录、可比较的粗粒度指标，但它有明显局限。

### 1. 文件数不等于 token 数

一个源码文件可能有几百行，一个 `.coai` 文档可能只有几十行。

因此：

```text
1 个源码文件 != 1 个 .coai 文件
```

如果只看文件数，可能低估源码阅读成本，也可能高估 `.coai` 阅读成本。

### 2. agent 可能不是全量阅读文件

IDE agent 可能通过：

- workspace index
- 搜索命中
- symbol 定位
- 片段读取
- 文件摘要

来理解项目。

这意味着“读取了某文件”不一定代表完整消耗该文件的全部 token。

### 3. `.coai` 文件读取通常更浓缩

`.coai` 文档如果设计得好，应该比源码更短、更功能导向。

因此 CoAI 组即使读取更多 `.coai` 文件，真实 token 成本也可能低于读取多个源码文件。

但这需要 token 或行数数据支持，不能只凭推断。

## 更严谨的成本记录方案

后续实验建议在 `runs.csv` 中增加以下字段。

### 文件与行数

```text
sourceLinesRead
coaiLinesRead
totalLinesRead
```

### token 估算

如果没有真实 token，可以使用近似值：

```text
estimatedTokens = ceil(charCount / 4)
```

字段：

```text
sourceEstimatedTokensRead
coaiEstimatedTokensRead
totalEstimatedTokensRead
```

### 读取模式

每个文件可标注读取模式：

```text
full       完整阅读
partial    只读相关片段
search-hit 通过搜索或索引命中
summary    只读摘要或认知文档
```

这样可以区分：

- 真正通读源码
- 通过索引命中片段
- 通过 `.coai` 快速恢复功能认知

## 推荐记录模板

每轮结束时，让 agent 额外列出：

```text
## Read Detail

| file | type | readMode | purpose |
|---|---|---|---|
| src/pages/TicketDetail.tsx | source | partial | verify activity timeline render |
| .coai/project/ticket/comment.md | coai | full | understand comment feature |
```

如果可行，再由人工或脚本补充：

```text
lineCount
charCount
estimatedTokens
```

## 当前实验的谨慎结论

基于 TeamDesk Lite 当前数据，最稳妥的结论是：

> CoAI 没有证明总文件读取或总 token 一定下降；但它已经显示出把源码探索转移到显式认知资产、减少源码读取、支持认知回流的效果。

更进一步的结论需要：

- 更大项目
- 更长维护周期
- token 或 line 级别记录
- 多次重复实验
- 不同模型/agent 对照

## 项目规模与 CoAI 效果

CoAI 的效果预计会随项目规模增大而更明显。

原因：

- 大项目入口更多
- 功能链路更长
- 代码组织更偏运行结构
- README 难以覆盖实现细节
- 新 chat 重新理解项目的源码成本更高
- 错误文件访问和注意力漂移概率更高

TeamDesk Lite 是中小型项目，baseline agent 已经很强。

在更大的项目中，CoAI 的优势更可能体现在：

- 更低的新窗口恢复成本
- 更稳定的功能链路定位
- 更少的源码探索
- 更低的开发者黑盒感
- 更好的多人/多 agent 接手能力

## 评估表述建议

不建议表述为：

> CoAI 让 agent 读得更少。

当前证据不足以支持这个笼统结论。

建议表述为：

> CoAI 把源码中的隐性项目认知沉淀为显式、可复用、可迁移的项目认知地图。它的收益分为两类：一是帮助新 agent 或新开发者快速从 0 建立项目整体认知；二是在后续维护中减少源码探索、降低上下文重建成本，并让代码变更后的认知回流到项目资产中。
