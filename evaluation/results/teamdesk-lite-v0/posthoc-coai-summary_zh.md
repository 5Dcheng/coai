# TeamDesk Lite Post-hoc CoAI 汇总

## 范围

- 条件组：posthoc-coai
- Agent：Trae SOLO Coder
- 模型：Kimi K2.6
- 项目状态：基于已完成的 TeamDesk Lite 项目接入 CoAI
- Bootstrap 轮次：C00 + C00-FIX
- 维护轮次：R26-R30
- 对照组：baseline R21-R25

这组实验回答的问题不是“从零开发时 CoAI 是否更好”，而是：

> 已有项目接入 CoAI 后，是否能改善后续维护接手、功能定位和认知回流？

## 关键结论

Post-hoc CoAI 有明确初始化成本，但在后续具体维护任务中开始体现价值。

最重要的结果：

- C00 + C00-FIX 初始化成本较高，且第一轮出现 19 个 missing-anchor bug。
- 修复后，CoAI 资产可用，`coai doctor` 显示 `no anchor format issues found`。
- R26 初始新窗口接手时，CoAI 降低了源码读取数，但因为读取 `.coai` 文件，总读取数更高。
- R27/R28 这类具体功能定位和小维护任务中，CoAI 明显减少源码探索。
- R28 体现了 CoAI 的关键价值：代码变更后同步更新认知资产。
- R30 输出了按功能认知组织的维护流程，而不是简单复述源码目录。

## 量化对比

### Baseline R21-R25

- 轮次：5
- 总读取文件数：37
- 源码读取文件数：36
- `.coai` 读取文件数：0
- 修改文件数：1
- 范围漂移：0
- 命令失败：0

### Post-hoc CoAI Bootstrap: C00 + C00-FIX

- 轮次：2
- 总读取文件数：55
- 源码读取文件数：24
- `.coai` 读取文件数：23
- 修改文件数：60
- 产出：
  - 11 个 project cognition 文档
  - 10 个 mapper 文件
  - 39 个 anchors
  - 19 个 missing-anchor bug 被发现并修复

这部分是 `coaiBootstrapCost`，不能直接算作维护收益。

### Post-hoc CoAI R26-R30

- 轮次：5
- 总读取文件数：56
- 源码读取文件数：21
- `.coai` 读取文件数：35
- 修改文件数：2
- 范围漂移：0
- 命令失败：0

相比 baseline R21-R25：

- 总读取文件数：37 -> 56，上升
- 源码读取文件数：36 -> 21，下降约 42%
- `.coai` 文件读取数：0 -> 35
- 修改文件数：1 -> 2，其中多出的 1 个是 CoAI cognition 回流

解释：

CoAI 没有减少总阅读量，因为它引入了显式认知资产读取。但它把一部分源码探索转移到了 `.coai` 认知资产上，并减少了源码读取。

## Bootstrap 成本分析

### C00：初始化

C00 创建了较完整的 CoAI 认知资产：

- `ticket` module
- 10 个 feature cognition
- 10 个 mapper
- 39 个源码 anchors

但第一轮资产质量不完全合格：

- JSX 中使用 `{/* @coai anchor: ... */}`，系统未识别。
- 部分 mapper anchor id 与源码实际 anchor 不一致。
- 产生 19 个 `missing-anchor` bug。

产品测试通过，但 CoAI 资产完整性失败。

### C00-FIX：修复

C00-FIX 修复了：

- JSX anchor 注释格式问题
- mapper/source anchor id 不一致问题
- 19 个 bug 从 open 移至 resolved

这说明 post-hoc 初始化是可行的，但需要把 bug-repair 作为真实成本记录。

## R26-R30 维护收益分析

### R26：新窗口维护接手

R26 读取：

- `.coai` 文件：14
- 源码文件：13

对比 baseline R21：

- baseline R21 源码读取约 20 个
- CoAI R26 源码读取 13 个

收益：

- 源码探索减少。
- 输出仍然准确。
- 功能地图更偏 feature cognition，而不是只按目录结构描述。

限制：

- agent 仍然读取了较多源码进行验证。
- 总读取数高于 baseline。
- 说明 agent 尚未完全信任 `.coai`，或者 `.coai` 资产粒度仍偏分散。

### R27：评论 activity 文案定位

R27 读取：

- `.coai` 文件：4
- 源码文件：1

它准确定位：

- 后端文案生成点：`server/routes/comments.ts`
- 前端展示路径：`TicketDetail.tsx` activity timeline
- 修改风险：历史数据、新旧文案、i18n、无批量迁移接口

这是目前最清楚的 CoAI 收益样本之一。

### R28：小维护改动

R28 读取：

- `.coai` 文件：2
- 源码文件：1

修改：

- `server/routes/comments.ts`: preview 30 -> 50
- `.coai/project/ticket/comment.md`: 同步更新认知文档

测试通过。

这是关键样本，因为它体现了 CoAI 的认知回流：

> 代码变了，项目认知也同步更新。

baseline R24 也能完成类似小改动，但不会自然留下可复用认知资产。

### R29：状态规则变更影响评估

R29 读取：

- `.coai` 文件：5
- 源码/测试文件：5

它准确识别了：

- 前后端 `VALID_TRANSITIONS` 同步点
- `closed -> reopened` 的规则变更点
- `resolvedAt` 是否清除是核心业务决策
- stats 中 reopened 不应计入 resolved/closed 解决统计
- transition tests 和 stats tests 的影响

收益：

- 影响分析按 feature 风险组织，而不是只列文件。
- 对数据语义风险识别较好。

### R30：维护总结

R30 读取：

- `.coai` 文件：10
- 源码文件：1

它输出了：

- 功能认知地图
- 风险清单
- 推荐维护流程
- 哪些信息应该沉淀到 `.coai`

这轮体现的是可迁移的维护方法论，而不是单次代码定位。

## 与 Baseline 的关系

Baseline R21-R25 很强。

尤其是 R22-R25，在同一新窗口建立上下文后，baseline 也能低成本完成定位和总结。

所以不能说：

> CoAI 让 agent 从不能维护变成能维护。

更准确的结论是：

> CoAI 把原本存在于 chat 上下文里的项目理解，沉淀成可复用的项目资产；后续 agent 可以通过读取这些资产减少源码探索，并在修改后回流新的认知。

这也是为什么 R26 的总读取数没有下降，但 R27/R28 的源码读取数明显下降。

## 当前证据支持什么

当前证据支持：

- Post-hoc CoAI 可以接入已有项目。
- CoAI 资产能帮助 agent 进行 feature-oriented 定位。
- CoAI 能减少具体维护任务中的源码读取。
- CoAI 能把代码变更同步回认知文档。
- CoAI 能让维护总结更偏功能地图和风险地图。

当前证据不支持：

- CoAI 总成本一定更低。
- CoAI 初始化阶段更省 token。
- CoAI 在项目接入第一轮就比 baseline 更少读文件。
- CoAI 可以替代源码验证。

## 主要问题和改进方向

### 1. 初始化成本高

C00 + C00-FIX 修改/创建文件很多，并需要修复资产 bug。

改进方向：

- 提供更强的 post-hoc init guide。
- 明确 TSX anchor 注释格式。
- 初始化后自动运行 doctor / pre-commit-check。
- 让 agent 先创建少量高价值 feature，而不是一次覆盖 10 个 feature。

### 2. `.coai` 文件读取偏多

R26/R30 读取了很多 `.coai` 文件。

改进方向：

- 增加更强的 module-level summary。
- 给 `ticket.md` 提供更浓缩的 feature index。
- 在 mapper 中让关键入口更容易被快速定位。
- 对维护任务推荐“先读 module summary，再读 1-2 个 feature doc”的策略。

### 3. Agent 仍需源码验证

这是合理的，但可以更有边界。

改进方向：

- prompt 中明确“只验证关键点，不要通读实现”。
- `.coai` 文档中标注 confidence / last verified。
- 通过 doctor/pre-commit-check 提供 asset health 信号。

## 建议下一步实验

### 1. 再跑 baseline R26-R30

为了更公平地比较 post-hoc CoAI R26-R30，建议在同一个 R25 项目状态上开一个 baseline 新窗口，跑同样 R26-R30，但不使用 CoAI。

这样可以避免用 baseline R21-R25 和 CoAI R26-R30 做不完全等价对比。

### 2. 汇总 R26-R30 对照表

重点比较：

- sourceFilesRead
- coaiFilesRead
- filesChanged
- scopeDriftCount
- cognitionScore
- 修改后是否更新认知资产

### 3. 暂缓 CoAI-native R01-R20

CoAI-native 从零开发很有价值，但成本高，且 LLM 随机性会导致项目结构差异。

建议在 post-hoc 组与 baseline R26-R30 对照完成后，再决定是否值得跑。

## 当前 Post-hoc CoAI 判定

当前判定：

> Post-hoc CoAI 接入已有项目是可行的，但有真实 bootstrap 成本；接入完成后，在具体维护定位和小改动中能减少源码探索，并能把代码变更回流为可复用的项目认知。

更短的产品化表达：

> CoAI 不会免费消除理解成本，而是把一次理解沉淀成后续可复用的维护地图。
