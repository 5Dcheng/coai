# Baseline2 vs Post-hoc CoAI 直接对照汇总

## 范围

本报告只比较两组直接对照：

- baseline2 R26-R30：无 `.coai`、无 CoAI skill、干净 baseline 项目、新 chat
- post-hoc CoAI R26-R30：已有 `.coai` 资产、使用 CoAI skill、新 chat

不包含：

- baseline R01-R20 从零开发成本
- baseline R21-R25 第一组维护测试
- CoAI C00/C00-FIX bootstrap 成本

bootstrap 成本应单独看；本报告只看 `.coai` 已存在后的维护阶段表现。

## 量化对照

| 指标 | baseline2 R26-R30 | post-hoc CoAI R26-R30 |
|---|---:|---:|
| 轮次 | 5 | 5 |
| 总读取文件数 | 47 | 56 |
| 源码/配置/测试/数据读取数 | 46 | 21 |
| `.coai` 文件读取数 | 0 | 35 |
| 修改文件数 | 1 | 2 |
| 范围漂移 | 0 | 0 |
| 命令失败 | 0 | 0 |

核心现象：

- CoAI 没有降低总读取文件数。
- CoAI 显著降低源码读取数：46 -> 21。
- CoAI 通过读取 35 个 `.coai` 文件替代了一部分源码探索。
- 两组回答质量都高，任务都完成。
- baseline2 在同一 chat 后续小任务中非常高效。
- CoAI 多出的修改文件主要来自认知资产回流。

## 分轮对照

### R26：已完成项目维护接手

| 指标 | baseline2 R26 | CoAI R26 |
|---|---:|---:|
| 总读取 | 28 | 27 |
| 源码读取 | 27 | 13 |
| `.coai` 读取 | 0 | 14 |
| 修改文件 | 0 | 0 |

结论：

R26 是 CoAI 对新窗口接手最清晰的收益点之一。

两组总读取几乎相同，但 CoAI 把一半左右的源码读取替换成了 `.coai` 认知资产读取。回答质量都高。

解释：

- baseline2 通过大范围读取 README、源码、测试、配置、数据来重建项目认知。
- CoAI 先读项目认知资产，再少量验证源码。

### R27：评论 activity 文案定位

| 指标 | baseline2 R27 | CoAI R27 |
|---|---:|---:|
| 总读取 | 4 | 5 |
| 源码读取 | 4 | 1 |
| `.coai` 读取 | 0 | 4 |
| 修改文件 | 0 | 0 |

结论：

CoAI 明显减少源码定位成本，但总读取数略高。

两组都准确定位了：

- 文案生成点：`server/routes/comments.ts`
- 展示点：`TicketDetail.tsx`
- 修改风险：历史数据、新旧文案不一致、i18n、message 静态存储

差异：

- baseline2 通过源码链路定位。
- CoAI 通过 `comment.md`、`activity-timeline.md` 和 mapper 定位，只打开 1 个源码文件验证。

### R28：小维护改动

| 指标 | baseline2 R28 | CoAI R28 |
|---|---:|---:|
| 总读取 | 1 | 3 |
| 源码读取 | 1 | 1 |
| `.coai` 读取 | 0 | 2 |
| 修改文件 | 1 | 2 |

结论：

baseline2 在同一 chat 已经有上下文时更轻。

但 CoAI R28 做了 baseline2 没有做的事：

- 修改代码：`comments.ts` 30 -> 50
- 同步更新认知资产：`comment.md` 30 -> 50

所以这轮不能说 CoAI 更省。更准确是：

> CoAI 付出额外认知维护成本，换取项目认知资产保持同步。

这是 CoAI 的认知回流价值。

### R29：状态流转规则变更影响评估

| 指标 | baseline2 R29 | CoAI R29 |
|---|---:|---:|
| 总读取 | 10 | 10 |
| 源码/测试/文档读取 | 10 | 5 |
| `.coai` 读取 | 0 | 5 |
| 修改文件 | 0 | 0 |

结论：

两组总读取相同，回答质量都很高。

两组都抓住了关键点：

- 前后端 `VALID_TRANSITIONS` 要同步。
- `closed -> reopened` 需要考虑 `resolvedAt`。
- 推荐清除 `resolvedAt`。
- stats 虽然按 status 排除 reopened，但保留 `resolvedAt` 会造成语义混乱。
- tests 和 README 需要同步更新。

CoAI 的优势是分析路径更 feature-oriented，源码/文档读取更少。

### R30：维护总结

| 指标 | baseline2 R30 | CoAI R30 |
|---|---:|---:|
| 总读取 | 4 | 11 |
| 源码读取 | 4 | 1 |
| `.coai` 读取 | 0 | 10 |
| 修改文件 | 0 | 0 |

结论：

baseline2 在同一 chat 上下文中更省文件读取。

CoAI R30 读取更多 `.coai` 文件，但输出更强调：

- 功能认知地图
- 风险清单
- CoAI 维护流程
- 哪些信息应回流到认知资产

这说明 CoAI 的优势不一定体现在同一 chat 内更省，而体现在把维护认知显式化、可迁移化。

## 直接结论

### 1. CoAI 没有在总文件读取上获胜

baseline2 R26-R30 总读取 47。

CoAI R26-R30 总读取 56。

因此不能说：

> 使用 CoAI 后 agent 读文件总数更少。

当前数据不支持这个结论。

### 2. CoAI 显著减少源码探索

baseline2 源码/配置/测试/数据读取 46。

CoAI 源码读取 21。

因此可以说：

> CoAI 将一部分源码探索转移到了项目认知资产读取上，使维护任务中的源码读取明显减少。

### 3. Baseline2 在同一 chat 中也很强

R27-R30 中，baseline2 通过 R26 建立了上下文后，表现非常好。

尤其：

- R28 只读改 1 个源码文件。
- R30 只读 4 个文件就能完成总结。

这说明普通 agent 的 chat context 本身已经是强 baseline。

### 4. CoAI 的价值不是替代 chat context，而是让 cognition 跨窗口持久化

baseline2 的上下文主要存在于当前 chat。

CoAI 的上下文存在于项目资产中：

- `.coai/project`
- `.coai/mapper`
- anchors
- `current.md`

所以 CoAI 的价值更准确地说是：

> 把一次性的 chat 理解变成可复用、可检查、可维护的项目认知资产。

### 5. CoAI 需要付出认知维护成本

CoAI R28 多改了 `comment.md`。

这不是浪费，而是把代码变更同步回功能认知。

但它确实是成本。

因此应明确表达为：

> CoAI 用额外认知维护成本，换取后续可复用的项目理解。

## 当前证据支持的产品主张

可以支持：

- CoAI 有助于减少维护任务中的源码探索。
- CoAI 让项目功能地图显式化。
- CoAI 能在代码变更后维护认知资产一致性。
- CoAI 对新窗口接手、功能定位、影响分析有帮助。
- CoAI 尤其适合长期维护、多轮接手、多人/多 agent 协作场景。

不应支持：

- CoAI 一定降低总 token。
- CoAI 一定降低总文件读取。
- CoAI 初始化后立刻更省。
- CoAI 可以替代源码验证。
- CoAI 对一次性小改动一定更便宜。

## 对 CoAI 的改进建议

### 1. 降低 `.coai` 读取成本

R26/R30 读取 `.coai` 文件偏多。

建议：

- 提供更浓缩的 module summary。
- 在 `ticket.md` 中增加 feature index 和风险索引。
- 让 agent 先读 1 个 module summary，再按任务读 1-2 个 feature docs。

### 2. 改善 post-hoc 初始化

C00 产生 19 个 missing-anchor bug。

建议：

- 在 init 指南中明确 TSX anchor 注释格式。
- 创建 mapper 后立即运行 doctor。
- 大规模 post-hoc 初始化时先覆盖核心 3-5 个 feature，而不是一次覆盖 10 个。

### 3. 强化 cognition backflow 规则

R28 的认知回流很好。

建议：

- 对每个代码变更任务明确要求：如果实现规则变化，必须更新对应 feature doc。
- 在 summary 中突出“代码变更后 `.coai` 是否同步”作为核心指标。

## 最终判定

最保守、最可信的结论：

> 在 TeamDesk Lite post-hoc 维护测试中，CoAI 没有降低总文件读取成本，但显著减少了源码探索，并把维护理解从临时 chat 上下文转化为可复用的项目认知资产。对于长期维护、新窗口接手和功能影响分析，CoAI 表现出明确价值；对于同一 chat 内的小改动，强 baseline agent 仍可能更轻。

一句话版本：

> CoAI 不是让 agent 少思考，而是让思考结果留在项目里。
