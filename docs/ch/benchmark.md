# Benchmark 与有效性验证

## 目标

CoAI 的有效性验证分成三层：

1. 系统可靠性：证明 CLI、mapper、anchor、bug log 与 hook 机制稳定可用。
2. Agent 认知效率：对比有无 CoAI 时，agent 从功能语义定位到代码的成本。
3. 开发者感知模拟：用明确标注的模拟数据表达未来用户研究框架，不把模拟结果当成真实开发者证据。

默认测试工作区位于：

```text
E:\c5dc\coai\benchmark-workspaces
```

`coai_v1` 仓库内只保存方案、脚本与报告模板；临时 case workspace 不应写入当前代码仓库。

## 系统可靠性测试

系统测试使用可运行 case 验证 CoAI 自身行为。首批 case：

- `init-standard`：标准 Node 项目执行 `coai init`，验证 `.coai`、scripts 与 hook 安装。
- `init-no-package-json`：非 Node 主工程执行 `coai init --no-package-json`。
- `git-sync-line-shift`：源码行号变化后，mapper `line` 自动更新。
- `git-sync-line-unchanged`：anchor 未移动时，mapper 项保持 skip。
- `anchor-prefix-fix`：非标准 `@coai anchor <id>` 被归一为标准前缀。
- `missing-anchor`：mapper 指向不存在 anchor 时生成 open bug。
- `duplicate-anchor`：同一 anchor 出现多次时生成 duplicate bug。
- `invalid-mapper`：非法 mapper JSON 生成 invalid mapper bug。
- `open-bug-freeze`：存在 open bug 时，对应代码文件的 mapper 更新被冻结。
- `pre-commit-pass-warning`：存在 open bug 时，pre-commit 以 warning 方式 fail-open。

核心指标：

- `passRate`
- `durationMs`
- `changedFiles`
- `matchedFiles`
- `updatedEntries`
- `skippedEntries`
- `failedEntries`
- `bugsCreated`
- `mapperLineAccuracy`
- `bugTypeAccuracy`

## Agent 认知效率测试

Agent benchmark 使用 A/B 对比：

- baseline：只提供源码与普通 README。
- CoAI：提供源码、`.coai/project`、`.coai/mapper` 与 `.coai/node`。

任务类型：

- 找到指定功能的入口文件。
- 解释指定功能的完整链路。
- 判断某个 `[[token]]` 对应的真实代码位置。
- 在修改某功能前列出需要读取的文件。

量化指标：

- 目标文件命中率
- anchor 命中率
- 读取文件数
- 读取行数
- 功能链路解释准确度
- 错误假设数
- 任务成功率

这层测试的目标不是证明 CoAI 能替代 agent 判断，而是证明 CoAI 能降低 agent 从功能语义走到正确代码入口的探索成本。

当前产品层面的实测证据整理在 [CoAI 有效性测试结果](effectiveness.md)。

TeamDesk Lite 实验目前能支持的克制结论是：

- CoAI 能减少新窗口和功能维护任务中的重复源码探索。
- CoAI 将一部分项目理解转移为按功能组织的认知资产。
- CoAI 仍然存在初始化与认知维护成本。
- CoAI 不替代源码验证。

## 开发者感知模拟数据

在没有真实开发者样本前，开发者黑盒感只能使用模拟数据表达测试框架。所有模拟数据必须标注：

```text
SIMULATED_DATA
```

模拟指标：

- `blackBoxFeeling`
- `maintenanceConfidence`
- `perceivedNavigationClarity`
- `understandingTimeMinutes`
- `changeConfidence`

报告中必须明确说明：

```text
The developer perception section uses simulated data only.
It is not evidence from real developer participants.
```

这部分数据只用于展示未来真实研究会如何收集、比较和呈现，不得写成“开发者已经证明 CoAI 有效”。

## 后续脚本计划

后续实现自动化时，新增：

```text
scripts/run-benchmark.js
benchmark/report-template.md
benchmark/simulated-developer-study.sample.json
```

建议 npm script：

```json
{
  "benchmark": "npm run build && node ./scripts/run-benchmark.js --workspace-root E:\\c5dc\\coai\\benchmark-workspaces"
}
```

脚本运行流程：

1. 创建或清理 `E:\c5dc\coai\benchmark-workspaces` 下的 case 目录。
2. 每个 case 使用独立 Git repo。
3. 写入 fixture 文件并创建初始 commit。
4. 制造目标变更。
5. 执行 CoAI CLI 命令。
6. 读取 stdout、mapper、bug log 与 git status。
7. 断言预期结果。
8. 生成 `benchmark/report.json` 与 `benchmark/report.md`。

脚本不得修改 `coai_v1` 的 `.coai`、源码或真实 Git 状态，除非用户明确要求保存报告结果。

## 报告边界

报告结论分成三类：

- Measured：来自真实 benchmark 执行的数据。
- Simulated：明确标注的模拟开发者感知数据。
- Not yet measured：需要真实开发者参与后才能证明的结论。

公开表达应优先使用可测指标，例如代码定位时间、读取文件数、mapper 行号准确率、bug 类型命中率和任务成功率。主观黑盒感只能在真实用户研究完成后作为证据使用。
