# 当前项目进展

## 当前状态

- 项目类型：VS Code 插件 + CLI + `.coai` 模板系统 + CoAI skill
- 当前正在推进的模块：发布与分发
- 当前正在做的功能：公开发布前的 README 收口、文档索引整理与开源节奏确认
- 当前测试工作区：`siliconseed_v0.0.5`

## 最近已完成

- 已将 git-sync 对 anchor-only mapper skeleton 的处理从异常失败调整为 `Warn`
- 已明确 mapper 骨架阶段允许只有 `anchor`，`file` 可在实现落地后由 agent 回填
- 已重新打包 npm tarball 与 VSIX，并确认 VSIX 不再包含根目录 `.coai/`
- 已将中文 README 从产品说明书收口为发布页结构
- 已将 `docs/ch/README.md` 按使用说明、技术文档、开源与发布重新分类
- 已新增 benchmark 与有效性验证文档，明确系统可靠性、agent 认知效率与 `SIMULATED_DATA` 开发者感知模拟数据的边界
- 已将 `evaluation/evaluation.md` 改写为中文评估体系文档，将 CoAI 评估对象收敛为项目认知、认知成本、认知效果、上下文管理与工具使用成本
- 已新增 `evaluation/test_cases_zh.md` 与 `evaluation/test_cases_en.md`，记录 TeamDesk Lite 固定任务序列、prompt 模板、attempt 规则、CSV 字段与 raw run 模板
- 已补充外部 agent 反馈粘贴格式、反馈分析口径与 `evaluation/results/README.md`，用于记录 Trae / Claude Code 实验原始反馈和结构化评审
- 已记录 TeamDesk Lite `KIMI-TRAE-BASE-R01-A1` 至 `KIMI-TRAE-BASE-R05-A1` 的 baseline 实验结果，包括 raw、review 与 `runs.csv`
- 已新增 Stage 0 人工验收记录，确认 R01-R05 baseline 项目可部分打开和创建，但 build/test 失败、comments route 存在 `addActivity` 运行时崩溃
- 已记录 `KIMI-TRAE-BASE-R05-FIX-A1` repair 轮次，修复 R01-R05 人工验收发现的 build/test/runtime 阻断问题，并作为 baseline 返工成本信号
- 已记录 R05-FIX 后人工复验，确认 baseline 项目 install/build/test/dev 通过，工单列表、创建、详情、状态流转、历史与活动流基本可用
- 已记录 `KIMI-TRAE-BASE-R06-A1`，该轮识别已有状态流转实现并只补充测试，表现出较好的范围控制和验证纪律
- 已记录 `KIMI-TRAE-BASE-R07-A1`，该轮补充 activity timeline 测试且验证通过，但存在最终回答声明修改 tickets route 与可见变更摘要不一致
- 已记录 `KIMI-TRAE-BASE-R08-A1`，该轮补齐 metadata 编辑的 assignee_changed activity 与前端刷新，验证通过且范围控制良好
- 已记录 `KIMI-TRAE-BASE-R09-A1`，该轮只修改 TicketList 筛选功能并验证通过，范围控制良好
- 已记录 `KIMI-TRAE-BASE-R10-A1`，该轮识别评论功能已有实现并只补充测试，验证通过且范围控制良好
- 已记录 Trae baseline 实验环境说明，明确该 baseline 包含 Trae 工作区索引能力，不是裸 LLM baseline
- 已记录 `KIMI-TRAE-BASE-R11-A1`，该轮只优化 Activity timeline 展示并验证通过，范围控制良好
- 已记录 `KIMI-TRAE-BASE-R12-A1`，该轮实现 Dashboard 前端统计展示并验证通过，但范围覆盖到 R13/R14 指标
- 已记录 `KIMI-TRAE-BASE-R13-A1`，该轮识别优先级统计已有实现并补充 stats 测试，验证通过但测试覆盖延伸到 R14
- 已记录 `KIMI-TRAE-BASE-R14-A1`，该轮识别平均解决时间已有实现，但改动转向全局导航，作为 off-task improvement 记录
- 已记录 `KIMI-TRAE-BASE-R15-A1`，该轮识别 reopened 统计逻辑已有实现，但清空 data JSON 文件并添加注释，作为 destructive/off-task validation action 记录
- 已记录 `KIMI-TRAE-BASE-R16-A1`，该轮补充 API、ticket model 与 filter 测试，26 个测试通过且未改业务逻辑
- 已记录 `KIMI-TRAE-BASE-R17-A1`，该轮定向修复筛选大小写问题并补充测试，28 个测试通过，读取与修改范围都较小
- 已记录 `KIMI-TRAE-BASE-R18-A1`，该轮统一列表、详情与 Dashboard 的 loading/error/empty 状态展示，验证通过但未做人工浏览器复验
- 已记录 `KIMI-TRAE-BASE-R19-A1`，该轮未改代码，完成 tsc、vitest、build、dev、API 与前端 HTML 回归验证；记录了端口冲突和 PowerShell curl alias 的命令成本
- 已记录 `KIMI-TRAE-BASE-R20-A1`，该轮作为项目总结与维护入口盘点，广泛读取源码、配置和测试文件，未改代码，build/test 通过
- 已记录 R01-R20 baseline 最终人工验收：用户确认功能基本实现并通过测试；同时记录维护认知层面仍有黑盒感，功能散落在运行时源码结构中，不利于按功能组织索引
- 已记录 `KIMI-TRAE-BASE-R21-A1` 新窗口接手理解任务：回答质量高、未改代码，但为恢复项目认知读取 21 个文件，作为 baseline 上下文重建成本信号
- 已记录 `KIMI-TRAE-BASE-R22-A1` 评论功能链路定位任务：未改代码，读取 6 个相关文件并准确还原前端表单、API、后端持久化、activity 写入和 timeline 刷新链路
- 已记录 `KIMI-TRAE-BASE-R23-A1` 状态流转影响分析任务：未改代码，读取 7 个相关文件并准确识别规则重复、前后端触发/校验、history/activity 写入、resolvedAt 与 reopened 统计影响
- 已记录 `KIMI-TRAE-BASE-R24-A1` 小维护改动任务：读取 2 个文件，只修改 comments route 中 comment_added activity message 生成，test/build 通过，范围控制良好
- 已记录 `KIMI-TRAE-BASE-R25-A1` 新窗口维护总结任务：仅复查 comments route，复用 R21-R24 上下文形成维护功能地图、风险清单与新开发者阅读路径
- 已新增 `evaluation/results/teamdesk-lite-v0/baseline-summary.md`，汇总 R01-R25 baseline：项目可完成，但存在早期返工、范围漂移、新窗口初始认知重建成本和维护黑盒感；CoAI 对比重点应转向认知成本、上下文恢复和功能导航
- 已新增 `evaluation/results/teamdesk-lite-v0/baseline-summary_zh.md`，作为 baseline 汇总中文版，便于中文评估和后续 CoAI 条件组设计
- 已记录 post-hoc CoAI `KIMI-TRAE-COAI-C00-A1`：在已完成 TeamDesk Lite 项目上创建 11 个 project docs、10 个 mapper、39 个 anchors，产品测试通过，但产生 19 个 missing-anchor bug
- 已记录 post-hoc CoAI `KIMI-TRAE-COAI-C00-FIX-A1`：修复 JSX anchor 注释不被识别和 mapper/source anchor 不一致问题，19 个 bug 移至 resolved，产品测试通过；这两轮合计作为 CoAI bootstrap cost
- 已记录 post-hoc CoAI `KIMI-TRAE-COAI-R26-A1` 新窗口维护接手：agent 先读 `.coai` 再读源码，输出准确维护地图；源码读取从 baseline R21 的约 20 个降至 13 个，但总读取因 14 个 `.coai` 文件升至 27 个；用户补充 doctor 显示 no anchor format issues found
- 已记录 post-hoc CoAI `KIMI-TRAE-COAI-R27-A1` 评论 activity 文案定位：agent 读取 4 个 `.coai` 文件和 1 个源码文件，即定位后端 message 生成点与前端展示路径，形成较清晰的 CoAI 源码探索减少信号
- 已记录 post-hoc CoAI `KIMI-TRAE-COAI-R28-A1` 小维护改动：agent 读取 2 个 `.coai` 文件和 1 个源码文件，将评论 activity preview 从 30 改为 50，并同步更新 comment feature cognition，测试通过
- 已记录 post-hoc CoAI `KIMI-TRAE-COAI-R29-A1` 状态规则变更影响评估：agent 读取 5 个 `.coai` 文件和 5 个源码/测试文件，准确识别 closed -> reopened 对前后端规则、resolvedAt、统计、测试和数据语义的影响
- 已记录 post-hoc CoAI `KIMI-TRAE-COAI-R30-A1` 维护总结：agent 读取 10 个 `.coai` 文件和 1 个源码文件，形成按功能认知组织的维护地图、风险清单、维护流程与认知回流建议
- 已新增 `evaluation/results/teamdesk-lite-v0/posthoc-coai-summary_zh.md`，汇总 post-hoc CoAI：C00/C00-FIX 初始化成本较高，但 R27/R28 等具体维护任务显示源码探索减少和认知回流价值
- 已记录 baseline2 `KIMI-TRAE-BASE2-R26-A1`：在无 CoAI 的干净 R25 项目新窗口中，agent 读取约 28 个文档/源码/测试/配置/数据文件形成维护接手总结，作为 post-hoc CoAI R26 的直接对照
- 已记录 baseline2 `KIMI-TRAE-BASE2-R27-A1`：无 CoAI 新窗口中，agent 读取 4 个源码/测试文件准确定位评论 activity 文案生成与展示点；对比 CoAI R27，baseline2 总读取更少但源码读取更多
- 已记录 baseline2 `KIMI-TRAE-BASE2-R28-A1`：无 CoAI 新窗口中，agent 复用 R27 上下文只读/改 comments route 一处并通过测试；对比 CoAI R28，baseline2 文件成本更低但无认知资产回流
- 已记录 baseline2 `KIMI-TRAE-BASE2-R29-A1`：无 CoAI 新窗口中，agent 读取 10 个源码/测试/文档/数据文件，准确分析 closed -> reopened 对前后端规则、resolvedAt、统计、测试和 README 的影响；对比 CoAI R29，总读相同但源码/文档读取更多
- 已记录 baseline2 `KIMI-TRAE-BASE2-R30-A1`：无 CoAI 新窗口中，agent 复用 R26-R29 chat 上下文，只读 4 个源码/入口文件形成实用维护总结；对比 CoAI R30，baseline2 同窗口成本更低但缺少显式认知资产持久化
- 已新增 `evaluation/results/teamdesk-lite-v0/baseline2-vs-posthoc-coai-summary_zh.md`，直接对照 baseline2 R26-R30 与 post-hoc CoAI R26-R30：CoAI 未降低总读取，但将源码读取从 46 降至 21，并体现认知资产持久化与认知回流价值
- 已新增 `evaluation/effect-taxonomy_zh.md`，将 CoAI 效果分为 0->1 项目认知地图能力与 1->100 开发维护效能，并补充文件数指标局限、line/token 估算方案和更谨慎的评估表述
- 已记录 GLM baseline token 测试 `GLM-BASE-R31-A1`：新窗口项目认知任务读取 26 个项目文件，智谱账单明细显示非缓存输入 40,200 tokens、缓存命中 252,873 tokens、输出 6,582 tokens、总 billed usage 299,655 tokens、费用 0.7905314 元；新增 `token-r31.csv`
- 已记录 GLM CoAI token 测试 `GLM-COAI-R31-A1`：新窗口项目认知任务读取 23 个 `.coai` 文件和 8 个源码文件，智谱账单明细显示非缓存输入 33,134 tokens、缓存命中 136,302 tokens、输出 5,304 tokens、总 billed usage 174,740 tokens、费用 0.508423 元；与 baseline R31 相比 billed usage 与费用均下降
- 已新增 `evaluation/results/teamdesk-lite-v0/r31-token-comparison_zh.md`，明确 R31 账单口径：截图为月度累计，第二份 xlsx 为 CoAI 单次明细；本次 CoAI R31 相比 baseline total billed usage 下降约 41.69%，费用下降约 35.69%，源码读取下降约 69.23%
- 已新增 `evaluation/results/teamdesk-lite-v0/r31-quality-comparison_zh.md`，记录 R31 新窗口生成质量对比：baseline 更像源码探索报告，CoAI 更像项目认知地图，二者质量都高但 CoAI 在相近质量下源码读取和账单成本更低
- 已新增 `evaluation/agents-md-baseline_zh.md`，将 AGENTS.md 作为第三种上下文持久化对照方案：轻量单文件摘要 vs CoAI 结构化认知资产，并设计 A00/R31 token 测试口径
- 已记录 `GLM-AGENTS-A00-A1`：在 baseline R30 长上下文窗口生成根目录 AGENTS.md。账单为非缓存输入 67,300 tokens、缓存命中 632,413 tokens、输出 7,736 tokens、总 billed usage 707,449 tokens、费用 1.8105794 元；该成本属于上下文资产生成成本，不应直接等同于 R31 使用成本。已明确 AGENTS.md R31 应允许按需读源码，而不是强制只读 AGENTS.md。
- 已记录 `GLM-AGENTS-R31-A1`：新窗口优先读取 AGENTS.md，并按需读取 3 个源码文件验证 transition/db/api；账单为非缓存输入 6,623 tokens、缓存命中 52,800 tokens、输出 2,496 tokens、总 billed usage 61,919 tokens、费用 0.151387 元。单看 R31 使用成本 AGENTS.md 最低，但若计入 A00 生成，总成本为 769,368 billed tokens / 1.9619664 元。
- 已重写 `r31-quality-comparison_zh.md`：将质量评估从泛泛回答质量改为面向后续功能开发/维护的 10 项关键认知评分，包括功能边界、入口结构、数据模型、状态机、resolvedAt 统计语义、Activity 链路、JSON storage、测试覆盖、风险识别和修改入口。当前评分：baseline R31 4.7、CoAI R31 4.8、AGENTS.md R31 4.7。
- 已补充 AGENTS.md 对照的解释边界：AGENTS.md 不是自行维护的资产，项目推进后开新 chat 前需要旧 chat 显式更新；CoAI 的核心差异应表述为 feature cognition + mapper/anchor 的可定位源码入口，而不是简单文档数量。后续方向应谨慎，避免做过重的代码索引，优先考虑 agent 可调用的 feature->anchor/source entry 能力。
- 已新增 `evaluation/results/teamdesk-lite-v0/coai-effectiveness-conclusion_zh.md`，重新收口 TeamDesk Lite 的 CoAI 有效性结论：baseline、AGENTS.md、CoAI 三者分别定位为源码重建、单文件上下文资产、结构化功能认知与源码入口系统；明确 AGENTS.md 的生成/更新/污染成本，避免只按 R31 单次使用成本得出误导性结论。
- 已将 TeamDesk Lite 初步有效性证据整理进产品文档：更新 `README.md` / `README_zh.md` 的 Benchmark 段落，新增 `docs/effectiveness.md` 与 `docs/ch/effectiveness.md`，并在 benchmark 文档和中文文档索引中链接。当前口径保持克制：CoAI 支撑长期维护中的 feature-oriented cognition、source-locatable entry 与 cognition backflow，不宣称所有场景都更省 token。
- 已重写 `docs/portfolio/coai-project-case_zh.md` 为更偏 CoAI 产品化包装的简历/面试附件：突出项目认知地图作为核心新增能力，强调功能目标、输入输出、关键流程、约束边界、源码入口与认知回流；重新定位 AGENTS.md 为 baseline 上额外生成的手动上下文资产，而非 CoAI 替代品。
- 已补充 AGENTS.md 对照解释：R31 的 `AGENTS.md 使用阶段` 只代表已有新鲜 AGENTS.md 的新窗口读取成本，不能视为完整方案成本；文档现已明确 AGENTS.md 生命周期成本 = 首次生成 + 新窗口读取 + 项目推进后的更新成本，并对比 CoAI 的 feature-level 认知回流维护方式。
- 已明确 contract 层第一阶段只覆盖结构化数据结构、核心算法与模块级通信接口，避免扩展成重型 spec；evaluation 与 skill methodology 已同步该方法论边界。
- 已新增 `docs/contract-layer.md` 与 `docs/ch/contract-layer.md`，正式固化 contract 层的渐进式披露、三类结构化约定、普通 Markdown 链接边界和创建/更新规则。

## 当前关注点

- 第一周公开时可以同步公开 `src/`，但仍不建议直接公开真实根 `.coai/`
- README 应强调 AI coding 场景、agent 使用流程与快速开始，而不是承载全部命令细节
- 文档细节应沉到 `docs/ch/` 与 `docs/`
- Benchmark 临时工作区应放在 `E:\c5dc\coai\benchmark-workspaces`，避免污染 `coai_v1` 代码仓库
- Evaluation 应优先围绕 agent / developer 的项目认知地图效果，而不是只围绕 CLI 运行可靠性
- Contract 应作为 `.coai` 中克制的结构化认知层：数据结构完整记录，算法面向单元测试，通信接口按模块级组织。

## 当前限制

- 英文 README 仍需按中文发布页结构回译对齐
- 公开仓库前仍需检查 source map、VSIX、npm tarball 的公开内容边界
- VS Code Marketplace publisher ID 仍需最终确认
- 目前 benchmark 仍停留在设计文档阶段，尚未实现自动化 runner 或真实开发者 study
- 目前 Evaluation 只记录评估体系和测试案例设计，尚未记录真实外部产品测试结果
- Contract 层还没有模板、初始化资产和 runtime 支持，目前只是方法论决策。

## 下一步建议

- 将英文 `README.md` 按 `README_zh.md` 的结构压缩重写
- 决定发布包是否保留 `.js.map`
- 完成 npm 与 VS Code Marketplace 发布前最终检查清单
- 实现 `scripts/run-benchmark.js`，并把真实测量结果与模拟开发者感知数据分区输出到报告
- 使用 TeamDesk Lite 这类外部产品案例验证 CoAI 对新 chat 上下文恢复、agent 注意力稳定和长期 token 成本的影响
- 按 `evaluation/test_cases_zh.md` 先跑 Kimi K2.6 + Trae 的 baseline / CoAI 两组长程开发记录
- 后续为 `.coai/contract` 补充轻量模板，优先覆盖 object、algorithm、interface 三类。
