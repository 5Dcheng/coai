# 🚀 CoAI BugRepair 闭环
> 负责 bug 检测、记录、显示、修复流转与归档这一整条连续场景事件。

## 🎯 功能目标

- 将 CoAI 异常从“被检测到”推进到“可修复、可追踪、可归档”
- 让 bug 生命周期成为一个连续闭环，而不是分散在多个孤立机制里
- 为 AI 修复与人工修复提供统一问题入口

## ⚙️ 技术约束

- 当前版本由 `git-sync` 触发 bug 检测
- bug 统一写入 `.coai/log/bugs/open/`
- 未处理 bug 需要显式进入 Problems 面板
- Problems 面板需要跟随 open bug 文件创建、修改、删除自动刷新
- 当前版本不自动触发 AI agent，只生成日志、提示与流转入口

## ⚠️ 风险边界

- bug 状态误标会影响 git-sync 的冻结判断
- open bug 未及时处理会长期冻结相关 mapper
- 当前已支持 `resolved -> reopen` 命令闭环
- 外部 Git hook 对 bug 文件做 rename/delete 时，VS Code 文件事件可能存在延迟或丢失，需要刷新兜底

## 🧩 职责划分

- 系统自动修复：
  - 非标准 anchor 前缀
  - 只修固定前缀，不动 `<id>`
- 系统检测但不自动修复：
  - `missing-anchor`
  - `duplicate-anchor`
  - `invalid-mapper`
  - `missing-node`
- AI / 人工修复：
  - 需要语义判断的 bug
  - anchor 缺失、重复、映射错误、文档缺失等

## 🧭 理想路径
> 最简单、最直接的 bug 生命周期闭环

### 节点流程
[[Bug检测]] -> [[Bug记录]] -> [[问题面板显示]] -> [[问题面板刷新]] -> [[Bug修复流转]] -> [[Bug归档]]

### 运行流程
1. `git-sync` 检测到 `missing-anchor`、`duplicate-anchor` 或 `invalid-mapper`，或 `navigation` 在点击失败时记录 `missing-node`。
2. 系统写入 open bug 文件，并生成 `repairPrompt`。
3. 系统通过提示和 Problems 面板暴露待处理 bug。
4. 开发者或 AI 完成修复后，执行 `CoAI: Resolve open bug log`。
5. bug 被标记为 `fixed`、`wont_fix` 或 `obsolete`，并归档到 `resolved/`。
6. 如果问题复现，可执行 `CoAI: Reopen resolved bug log` 将其退回 `open`。
7. 再次执行 git-sync 时，已解决 bug 被清理，未解决 bug 继续阻止相关 mapper 的自动维护。
8. VS Code 宿主通过文件监听和定时兜底刷新 Problems 面板，减少外部 git hook 修改 bug 文件后的状态残留。

### 技术解释
- `core/bugStore.ts` 负责 bug 文件读写、prompt 生成与 open bug 读取。
- `bugLog.ts` 负责 Problems 面板诊断与 VS Code 提示包装。
- `extension.ts` 负责挂载 bug 文件 watcher，并用防抖与定时兜底刷新 Problems。
- `repair.ts` 负责状态流转与 reopen 的 VS Code 入口包装。
- `core/repairStore.ts` 负责无 VS Code 依赖的归档动作。
- `git-sync` 与 `cli` 会在各自场景中调用这些 bugRepair 核心能力。

### 数据流
git-sync detection -> bug log -> diagnostics/prompt -> repair flow -> resolved archive

## 🌿 分支路径
> 非理想路径但属于合理情况

### 分支场景
- 当前工作区已存在未处理 bug
- 当前变更文件命中了 open bug
- open 目录里存在已标记解决但尚未归档的 bug
- resolved bug 修复后再次复现
- 外部 git commit / hook 迁移 bug 文件后，Problems 面板没有立即刷新

### 处理方式
- [[问题面板显示]] : 未处理 bug 持续保留在 Problems 面板中
- [[问题面板刷新]] : 监听 bug 文件变化，并用定时刷新兜底清理残留 diagnostics
- [[Bug检测]] : 命中 open bug 的代码文件时冻结相关 mapper
- [[Bug归档]] : git-sync 启动时顺带清理已解决 bug
- [[Bug重新打开]] : 已归档 bug 可以退回 open 并重新进入 Problems 面板
- [[问题面板刷新]] : 监听 `.coai/log/bugs/**/*.json`，并增加定时刷新兜底

## 🚨 异常捕获
> 系统异常处理机制

### 异常类型
- bug 日志目录不存在
- bug JSON 非法
- 当前没有 open bug
- 当前没有 resolved bug
- `missing-node` 需要从功能文档、mapper 与 node 期望路径反推修复入口
- VS Code 没有及时收到外部进程产生的文件事件

### 处理机制
- [[Bug记录]] : 写入前自动创建目录
- [[问题面板显示]] : 非法 bug 文件只跳过，不阻断其他问题展示
- [[问题面板刷新]] : watcher 事件使用防抖刷新，外加短周期兜底刷新，避免状态残留
- [[Bug修复流转]] : 没有 open bug 时直接提示并退出
- [[Bug重新打开]] : 没有 resolved bug 时直接提示并退出

## 📝 补充说明

- `[[Bug重新打开]]` 的含义不是“自动重新检测到 bug”，而是当一个已经归档到 `resolved/` 的 bug 后续再次复现，开发者可以手动执行 `CoAI: Reopen resolved bug log`。
- 该命令会从 `.coai/log/bugs/resolved/` 中选择目标 bug，写入 reopen 原因，把其 `status` 改回 `open`，再迁移回 `.coai/log/bugs/open/`。
- 迁回 `open/` 后，这个 bug 会重新进入 Problems 面板，并再次参与 git-sync 的冻结判断。

## 📌 状态与提交规则

- `open` 与 `fixed` 状态由 AI 或人工维护，不由系统自动判定。
- `resolved` 由系统在后续 `git-sync` 中执行归档迁移。
- `git-sync` 只对 git 增量文件做验证扫描，不会因为“当前没有增量”而自动关闭 bug。
- 即使代码已经提交，只要 `open bug` 仍存在，该问题就仍然保留在 bugRepair 流程里。
- 当 AI 或人工把 bug 状态改成 `fixed` 后，后续如果相关修复文件再次进入 git 增量范围，系统会先归档该 bug，再对目标文件重新扫描验证。
- 若重新扫描后仍有问题，系统会再次生成或刷新 open bug 文档。
- `git-sync` 同时承担“基于 git 增量维护 mapper”和“检查当前 bug 状态并刷新 Problems 面板”两类职责，因此没有 git 增量也不代表没有 bug 提示。
- `missing-node` 属于导航侧主动上报的 bug 类型，不依赖 git 增量检测；它由用户在导航失败提示中明确选择后进入 bugRepair。
- 非标准 anchor 前缀不再进入 bugRepair；它属于系统自动修复项，在 `git-sync` / `pre-commit-check` 前置阶段直接规范化。
- commit 前可以触发一次 `git-sync` 作为提交前检查。
- bug 文档默认保留在工作区修改中，不由系统自动加入暂存区。
- 已修复 bug 从 `open/` 迁移到 `resolved/` 时，Git 需要同时提交 open 旧路径删除与 resolved 新路径新增。
- pre-commit 会对本次归档涉及的旧路径和新路径执行 `git add -A`，确保删除记录与新增记录一起进入暂存区。
- 如果检查后仍存在 bug，用户可以自行决定继续提交已暂存内容，或取消本次提交继续处理问题。
- 如果用户绕过 bugRepair 手动修改 bug 文件或强行提交，系统不负责防作弊；但后续再次命中相关代码文件或相关双链能力时，问题仍会重新进入 bugRepair 流程。
