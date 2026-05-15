# AGENTS.md 组记录

## A00 生成 AGENTS.md

本轮在 baseline R30 维护总结后的长上下文窗口中执行，目标是创建一个单文件项目维护上下文，供新窗口优先读取。

### 产出

- 新建文件：`AGENTS.md`
- 行数：204
- 词数：1065
- 字符数：7961
- 业务代码修改：无

AGENTS.md 覆盖内容：

1. 项目概述
2. 技术栈
3. 目录结构
4. 核心功能地图
5. 核心数据模型
6. API 路由表
7. 核心数据流
8. 高风险维护点
9. 常见修改入口
10. 推荐阅读顺序
11. 已知限制与不确定点
12. 测试与验证命令

### 账单数据

导出文件：`glm-agents-a00-billing.xlsx`

| 指标 | 数值 |
|---|---:|
| requestCount | 9 |
| inputTokensNonCache | 67,300 |
| cacheHitTokens | 632,413 |
| outputTokens | 7,736 |
| totalBilledUsageTokens | 707,449 |
| totalAmountCny | 1.8105794 |

账单中包含两个订单/时间段：

| orderId | requestCount | input | cacheHit | output | billedUsage | amountCny |
|---|---:|---:|---:|---:|---:|---:|
| 811625751 | 3 | 63,304 | 163,923 | 851 | 228,078 | 0.7603154 |
| 811632088 | 6 | 3,996 | 468,490 | 6,885 | 479,371 | 1.0502640 |

### 初步判断

如果这份账单全部属于 A00，则 AGENTS.md 的生成成本明显高于单次 R31 新窗口认知：

- baseline R31：299,655 billed tokens，0.7905314 元
- CoAI R31：174,740 billed tokens，0.508423 元
- AGENTS.md A00：707,449 billed tokens，1.8105794 元

这说明 AGENTS.md 不是“免费上下文”。它把旧窗口的长上下文压缩进单文件时，本身会消耗大量 token，尤其是在旧窗口已经积累大量项目上下文时。

不过 A00 属于一次性资产生成成本，不能只和 R31 使用成本直接比较。更公平的比较方式是：

```text
AGENTS.md 总成本 = A00 生成成本 + R31 使用成本
CoAI 总成本 = C00/C00-FIX 初始化成本 + R31 使用成本
baseline 总成本 = 每个新窗口重新探索成本
```

## R31 使用方式调整建议

AGENTS.md 组的新窗口不应该被严格限制为“只读 AGENTS.md”。CoAI 组也允许在需要验证实现时读取源码，因此 AGENTS.md 组应采用同样规则：

```text
先读 AGENTS.md。
如果 AGENTS.md 信息不足，或需要验证具体实现，再按需读取源码。
不要全局扫描源码。
```

这样才是公平对照：

- baseline：无上下文资产，通常需要较多源码探索
- AGENTS.md：单文件上下文资产 + 按需源码验证
- CoAI：结构化认知资产 + mapper/anchor + 按需源码验证

## R31 使用 AGENTS.md

已执行 `GLM-AGENTS-R31-A1`。

### 探索行为

新窗口按要求优先读取 `AGENTS.md`，随后按需读取 3 个源码文件验证关键实现：

1. `server/routes/transition.ts`
2. `server/db.ts`
3. `src/api.ts`

该行为比“只读 AGENTS.md”更适合作为 CoAI 的公平对照，因为 CoAI 组同样允许必要时读取源码。

### 账单数据

导出文件：`glm-agents-r31-billing.xlsx`

| 指标 | 数值 |
|---|---:|
| requestCount | 3 |
| inputTokensNonCache | 6,623 |
| cacheHitTokens | 52,800 |
| outputTokens | 2,496 |
| totalBilledUsageTokens | 61,919 |
| totalAmountCny | 0.151387 |

### 与 R31 baseline / CoAI 的单次使用成本对比

| 条件 | totalBilledUsageTokens | totalAmountCny | filesRead | sourceFilesRead |
|---|---:|---:|---:|---:|
| baseline R31 | 299,655 | 0.7905314 | 26 | 26 |
| CoAI R31 | 174,740 | 0.508423 | 31 | 8 |
| AGENTS.md R31 | 61,919 | 0.151387 | 4 | 3 |

单看 R31 新窗口使用成本，AGENTS.md 最低。

但如果把 A00 生成成本计入，总成本为：

```text
AGENTS.md A00 + R31 = 707,449 + 61,919 = 769,368 billed tokens
AGENTS.md A00 + R31 = 1.8105794 + 0.151387 = 1.9619664 CNY
```

因此 AGENTS.md 的关键问题是摊销：如果只用一次，不划算；如果后续多次新窗口复用，才可能摊薄生成成本。

## AGENTS.md 不是自行维护的资产

AGENTS.md 组不能被理解为“生成一次后永久有效”。它也需要维护，而且维护方式更依赖人工或 prompt 约束。

更准确的流程是：

```text
项目推进一段时间
  -> 准备开启新 chat
  -> 在旧 chat 中显式要求 agent 更新 AGENTS.md
  -> 新 chat 读取最新 AGENTS.md
```

这意味着 AGENTS.md 也有持续维护成本：

1. 需要人工判断何时更新。
2. 需要在旧窗口额外执行一次“更新 AGENTS.md”任务。
3. 如果忘记更新，新窗口会基于过期认知工作。
4. 如果 AGENTS.md 越写越长，agent 的注意力焦距可能下降。

本实验中的 A00 是“首次生成成本”。后续还应测试：

```text
A01/A02... 增量更新 AGENTS.md 的成本
```

增量更新未必便宜。它可能出现两种成本：

1. 如果旧窗口依赖长上下文更新，旧上下文中可能混入过期信息、探索过程和无关讨论，agent 需要消耗 token 过滤。
2. 如果旧窗口不可信或信息不足，agent 仍可能重新读取大量源码来更新 AGENTS.md。

因此 AGENTS.md 不能只按“新窗口读一次很便宜”来评价。它是一种需要周期性人工触发维护的上下文资产。

## 与 CoAI 的关键差异

AGENTS.md 的优势是简单、便宜地被新窗口读取；但它本质上是一个单文件摘要。

CoAI 的差异不只是“有更多文档”，而是：

1. 按 feature 组织认知，而不是把全部上下文压进一个文件。
2. mapper/anchor 提供关键源码入口，能从功能认知跳到实现位置。
3. 修改后可以把稳定认知回流到对应 feature 文档。
4. 对局部维护任务更容易保持焦距，例如 comment、status-transition、dashboard 分别进入不同认知入口。

因此 AGENTS.md 更像“轻量项目交接摘要”，CoAI 更像“结构化项目认知与源码入口系统”。
