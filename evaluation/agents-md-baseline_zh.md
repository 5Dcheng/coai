# AGENTS.md 上下文持久化对照方案

## 背景

除了 CoAI，还有一种常见做法：

> 在旧窗口或长上下文窗口中生成一个 `AGENTS.md`，把项目理解、维护规则和上下文记录进去；新窗口先读取 `AGENTS.md` 再继续工作。

这个方案值得测试。

它可以作为第三种条件组：

- baseline：无显式上下文资产，只读源码/README
- AGENTS.md baseline：单文件上下文总结
- CoAI：结构化 `.coai` 认知资产 + mapper + anchors

## 为什么值得测

`AGENTS.md` 方案具有现实意义：

- 很多 agent 工具天然会读取 `AGENTS.md`
- 它成本低，容易生成
- 它能把旧窗口上下文带到新窗口
- 它不需要 mapper、anchor 或 CoAI 初始化

因此它是 CoAI 必须面对的强 baseline。

## 预期优势

AGENTS.md 可能在以下方面表现很好：

- 新窗口快速读取一个文件即可获得项目概要
- 总文件读取数可能少
- token 成本可能低
- 使用成本低，不需要安装 CoAI
- 对小项目足够有效

## 预期局限

AGENTS.md 也可能存在问题：

- 单文件容易过长。
- 信息层次容易混杂：架构、功能、风险、历史、操作规则都堆在一起。
- 缺少 mapper，不能精确定位代码 anchor。
- 不能自然表达多 feature 的边界和代码映射。
- 内容更新依赖人工或 agent 自觉，容易过期。
- 大项目里可能变成“压缩版 README”，焦距不如 CoAI 精准。
- 它不是自行维护的资产。项目推进一段时间后，如果准备开启新 chat，需要在旧 chat 中显式要求 agent 更新 `AGENTS.md`。
- 它对开发者可读，但未必包含 agent 维护任务真正需要的高语义结构，例如 feature 目标、边界、约束、核心入口和按功能组织的认知路径。

用户的预判是合理的：

> AGENTS.md 可能能保存上下文，但 agent 的焦距未必像 CoAI 一样合适，因为上下文被放进一个大文件中。

## 推荐实验设计

### 条件组

```text
baseline2 R26-R30
AGENTS-md R26-R30
posthoc-CoAI R26-R30
```

### AGENTS.md 生成轮

在已完成项目的旧窗口中执行：

```text
当前任务：A00 生成 AGENTS.md 项目维护上下文。

请基于当前 TeamDesk Lite 项目，生成一个适合新 agent 接手的 AGENTS.md。

要求：
1. 不修改产品代码。
2. AGENTS.md 应包含项目功能地图、核心数据流、高风险维护点、推荐阅读路径、常见修改入口。
3. 不要写冗长探索过程，只保留后续维护真正需要的稳定认知。
4. 不要使用 CoAI。

完成后列出：
1. 你读取的文件
2. 你创建的文件
3. AGENTS.md 包含哪些内容
4. 哪些信息没有覆盖
```

记录为：

```text
GLM-AGENTS-A00-A1
```

### AGENTS.md 新窗口 R31

开新窗口后执行：

```text
当前任务：R31 新窗口项目认知 token 测试。

请先读取 AGENTS.md，然后基于当前 TeamDesk Lite 项目，说明：
1. 项目的核心功能地图
2. 前后端结构
3. 核心数据流
4. 高风险维护点
5. 新开发者最应该先读哪些文件

只有在 AGENTS.md 信息不足时，才读取源码验证。

请不要修改代码。
请不要实现新功能。

完成后列出：
1. 你读取的 AGENTS.md 内容
2. 你读取的源码文件
3. 功能地图
4. 核心数据流
5. 高风险维护点
6. 推荐阅读文件
7. 仍然不确定的地方
```

记录为：

```text
GLM-AGENTS-R31-A1
```

## 对照指标

| 指标 | baseline | AGENTS.md | CoAI |
|---|---:|---:|---:|
| totalBilledUsageTokens |  |  |  |
| inputTokensNonCache |  |  |  |
| cacheHitTokens |  |  |  |
| outputTokens |  |  |  |
| totalAmountCny |  |  |  |
| sourceFilesRead |  |  |  |
| contextFilesRead |  |  |  |
| answerQualityScore |  |  |  |
| featureMapCompleteness |  |  |  |
| riskIdentificationScore |  |  |  |
| entryPointAccuracy |  |  |  |

其中：

- AGENTS.md 的 `contextFilesRead` 通常是 1。
- CoAI 的 `contextFilesRead` 是 `.coai` 文件数。

## 对 CoAI 的公平比较方式

不能只比较“新窗口 R31”的成本。

需要分别记录：

```text
AGENTS.md 总成本 = A00 生成成本 + R31 使用成本
CoAI 总成本 = C00/C00-FIX 初始化成本 + R31 使用成本
```

同时也要看长期维护：

```text
AGENTS.md 是否会随代码变化更新？
CoAI 是否会随代码变化回流 cognition？
```

AGENTS.md 的维护触发点建议单独记录：

```text
项目推进一段时间 -> 准备新开 chat -> 旧 chat 先更新 AGENTS.md -> 新 chat 再读取 AGENTS.md
```

因此 AGENTS.md 的真实成本不只是 A00 首次生成，还包括后续 A01/A02 的增量维护成本。

增量维护也不一定低成本：

- 依赖旧 chat 长上下文时，可能被过期信息和无关上下文污染。
- 依赖重新扫描源码时，可能接近一次小型项目重读。
- AGENTS.md 越长，越可能从“高信号交接文件”退化为“压缩版 README + 历史摘要”。

所以 AGENTS.md 应视为 baseline 与 CoAI 之间的中间态，而不是 CoAI 的完全替代。

## 当前预期

可能结果：

- AGENTS.md 在 R31 单次项目认知中非常便宜。
- CoAI 在具体 feature 定位、mapper 跳转、代码变更后认知回流上更强。
- AGENTS.md 更适合小项目和轻量接手。
- CoAI 更适合大项目、长期维护、多 feature、多 agent 协作。

## 已观察到的 A00 成本

已在 baseline R30 长上下文窗口执行 A00，生成根目录 `AGENTS.md`。

记录：

- runId：`GLM-AGENTS-A00-A1`
- 产物：`AGENTS.md`
- 行数：204
- 词数：1065
- 字符数：7961
- requestCount：9
- inputTokensNonCache：67,300
- cacheHitTokens：632,413
- outputTokens：7,736
- totalBilledUsageTokens：707,449
- totalAmountCny：1.8105794

初步判断：

AGENTS.md 生成本身并不便宜。它把旧窗口的长上下文压缩成一个单文件资产时，会消耗大量上下文 token。因此后续比较时必须区分：

```text
生成成本：A00 生成 AGENTS.md
使用成本：新窗口 R31 读取 AGENTS.md 后完成项目认知
```

AGENTS.md 组的新窗口 R31 不应被限制为只读 `AGENTS.md`。为了与 CoAI 组公平对照，应允许：

```text
先读 AGENTS.md；如需验证实现，再按需读取少量源码；不要全局扫描源码。
```

## 建议结论口径

如果 AGENTS.md 表现很好，不应视为否定 CoAI。

更合理的定位是：

> AGENTS.md 是轻量级上下文摘要，CoAI 是结构化项目认知系统。

两者关系可以是递进的：

- 小项目：AGENTS.md 可能已经足够
- 中大型项目：CoAI 提供 feature 拆分、mapper、anchor 和认知回流
- 长期项目：CoAI 更适合维持多轮、多窗口、多 agent 的一致项目认知

CoAI 的关键差异不是“比 AGENTS.md 多写几份文档”，而是 mapper/anchor 提供了从 feature cognition 到关键源码入口的连接。AGENTS.md 可以让 agent 知道项目大概是什么；CoAI 更适合让 agent 围绕某个 feature 保持焦距，并定位到相关实现入口。
