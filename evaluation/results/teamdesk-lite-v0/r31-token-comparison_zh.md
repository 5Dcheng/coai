# R31 新窗口项目认知 Token 对照

## 范围

- 任务：R31 新窗口项目认知 token 测试
- 模型：`glm-5-turbo`
- 数据来源：智谱 BigModel 费用明细 xlsx 导出 + 费用账单截图
- baseline：不使用 CoAI
- CoAI：使用 `$coai-skill`，优先读取 `.coai` 认知资产

## 账单口径说明

截图中的费用页是月度累计视图。

两次测试后截图显示总额约：

```text
1.298954 = 0.7905314 + 0.508423
```

其中：

- `0.7905314` 是 baseline R31
- `0.508423` 是 CoAI R31

第二份 xlsx `智谱AI开放平台费用明细2026-05_1777963463302 (1).xlsx` 包含的是 CoAI R31 单次明细，而不是两次合计明细。

## 核心对照

| 指标 | GLM baseline R31 | GLM CoAI R31 | 变化 |
|---|---:|---:|---:|
| requestCount | 11 | 7 | -4 |
| non-cache input tokens | 40,200 | 33,134 | -7,066 |
| cache-hit tokens | 252,873 | 136,302 | -116,571 |
| output tokens | 6,582 | 5,304 | -1,278 |
| total billed usage tokens | 299,655 | 174,740 | -124,915 |
| amount CNY | 0.7905314 | 0.508423 | -0.2821084 |
| filesRead | 26 | 31 | +5 |
| sourceFilesRead | 26 | 8 | -18 |
| coaiFilesRead | 0 | 23 | +23 |

## 百分比变化

| 指标 | 下降比例 |
|---|---:|
| non-cache input tokens | 17.58% |
| cache-hit tokens | 46.10% |
| output tokens | 19.42% |
| total billed usage tokens | 41.69% |
| amount CNY | 35.69% |
| sourceFilesRead | 69.23% |

## 解释

R31 是目前最直接的 token 证据。

它显示：

- CoAI R31 总读取文件数更多：26 -> 31。
- 但 CoAI R31 源码读取明显更少：26 -> 8。
- CoAI R31 读取了 23 个 `.coai` 文件。
- GLM 后台账单显示 CoAI R31 的 billed usage 和费用都更低。

这说明在这个新窗口项目认知任务中，CoAI 的 `.coai` 认知资产确实替代了一部分源码探索，并且这次替代反映到了 token/费用下降上。

## 谨慎点

这个结论仍然需要谨慎解释：

- 这是单次样本，不是多次平均。
- 两次运行可能受缓存策略影响。
- 费用明细是账单聚合，不是逐工具调用 token 日志。
- agent 输出长度、探索路径、后台 cache hit 都会影响总 token。

因此当前最稳妥的说法是：

> 在 R31 单次 GLM 新窗口项目认知测试中，CoAI 条件相比 baseline 减少了源码读取，并在智谱账单中表现为 total billed usage 和实际费用下降。

不应扩大为：

> CoAI 在所有场景下一定降低 token。

## 与前面文件数实验的关系

前面的 baseline2 vs post-hoc CoAI 对照显示：

- CoAI 不一定降低总文件读取。
- CoAI 会把源码读取转移为 `.coai` 认知资产读取。

R31 补充了更关键的信息：

- `.coai` 文件虽然增加了文件数，但其 token 成本可能低于大量源码探索。
- 在这次 GLM 账单中，CoAI 的总 billed usage 下降。

这修正了只用 `filesRead` 衡量成本的不足。

## 当前可支持的结论

当前证据支持：

- CoAI 可以减少新窗口项目认知中的源码读取。
- CoAI 可能降低新窗口项目认知的 token/费用成本。
- CoAI 的收益在项目认知恢复场景中比在同一 chat 的小改动中更明显。

当前证据仍不支持：

- CoAI 总是降低 token。
- CoAI 初始化成本可以忽略。
- CoAI 可以替代源码验证。

## 后续建议

如果要加强结论，建议：

- R31 baseline / CoAI 各重复 2-3 次。
- 每次导出费用明细并记录到 `token-r31.csv`。
- 分别比较 non-cache input、cache-hit、output、total billed usage 和 CNY amount。
- 保留 answerQualityScore，避免只比较成本不比较质量。

## 补充：AGENTS.md R31

新增第三组 `GLM-AGENTS-R31-A1`：

| 指标 | baseline R31 | CoAI R31 | AGENTS.md R31 |
|---|---:|---:|---:|
| requestCount | 11 | 7 | 3 |
| inputTokensNonCache | 40,200 | 33,134 | 6,623 |
| cacheHitTokens | 252,873 | 136,302 | 52,800 |
| outputTokens | 6,582 | 5,304 | 2,496 |
| totalBilledUsageTokens | 299,655 | 174,740 | 61,919 |
| totalAmountCny | 0.7905314 | 0.508423 | 0.151387 |
| filesRead | 26 | 31 | 4 |
| sourceFilesRead | 26 | 8 | 3 |

单看 R31 新窗口使用成本，AGENTS.md 明显最低。原因是它把项目认知压缩进一个单文件上下文，新窗口只需读取 `AGENTS.md` 并少量验证源码。

但这不是 AGENTS.md 方案的完整成本。AGENTS.md 是 baseline 和 CoAI 之间的中间态：它不像 baseline 每次完全重新探索源码，但也不像 CoAI 那样有 feature cognition、mapper/anchor 和认知回流流程。它需要在项目推进一段时间后、开新 chat 前由用户显式要求旧窗口更新。

但 AGENTS.md 需要额外计算 A00 生成成本：

| 成本项 | billed tokens | amount CNY |
|---|---:|---:|
| AGENTS.md A00 生成 | 707,449 | 1.8105794 |
| AGENTS.md R31 使用 | 61,919 | 0.151387 |
| 合计 | 769,368 | 1.9619664 |

因此 AGENTS.md 的结论应分两层：

1. **使用成本**：新窗口 R31 很低，甚至低于 CoAI。
2. **总成本**：若只使用一次，A00 生成成本很高；如果多次新窗口复用，才可能摊薄。
3. **维护成本**：每次项目推进后，AGENTS.md 都可能需要更新；更新可能需要读取大量源码或依赖旧 chat 长上下文，而旧上下文本身可能包含过期信息和无关污染。

所以不能用 `AGENTS.md R31` 单次新窗口消耗作为 AGENTS.md 方案优于 CoAI 的结论。更合理的比较是：

```text
baseline = 每次新 chat 重新探索源码
AGENTS.md = 手动维护的单文件上下文资产
CoAI = 结构化 feature cognition + mapper/anchor + cognition backflow
```

R31 说明 AGENTS.md 是强 baseline，但也说明 CoAI 需要强调其结构化维护价值，而不是只比较单次总结任务的 token。
