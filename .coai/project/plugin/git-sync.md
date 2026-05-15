# 🚀 Git 增量维护
> 根据 git 变更增量维护 mapper，同时与 buglog / repair 协同处理异常与冻结逻辑。

## 🎯 功能目标

- 让 mapper 维护从纯手工更新变成可控半自动更新
- 将扫描范围收敛到真实 git 变更文件，避免每次都做全量扫描
- 在不自动生成 mapper 的前提下，提高跳转行号的稳定性

## ⚙️ 技术约束

- v1 只处理已有 mapper 项，不自动新增映射
- v1 只支持手动命令触发
- 语义异常只检测、记录、提示，不自动修复
- 非标准 anchor 前缀属于系统级固定格式问题，会自动规范化
- open bug 会进入 Problems 面板
- 命中 open bug 的代码文件对应 mapper 需要冻结
- 提交前检查默认 fail-open：CoAI bug 只提示和记录，不阻断宿主项目提交

## ⚠️ 风险边界

- 当前目录不是 git 仓库时无法执行
- mapper JSON 非法时不会自动修复，只会生成 bug 日志
- anchor 缺失或重复时不会自动修复，只会生成 bug 日志
- 命中未处理 bug 的代码文件不会继续维护 mapper
- open bug 文件不会被自动加入暂存区；如果已被误暂存，会被退回修改区
- 当前实现按单工作区假设执行，不处理复杂 multi-root 策略

## 🧭 理想路径
> 最简单、最直接的同步流程

### 节点流程
[[提交前检查命令]] -> [[手动同步命令]] -> [[Git变更收集]] -> [[Anchor前缀自动修复]] -> [[Mapper反向索引]] -> [[Anchor批量扫描]] -> [[Mapper回写]] -> [[提交前暂存源码]] -> [[提交前暂存mapper]] -> [[提交前暂存resolved bug]] -> [[提交前退回open bug]] -> [[同步结果输出]]

### 运行流程
1. 开发者可直接执行 `CoAI: Sync mapper from git changes`，也可先执行 `CoAI: Run pre-commit CoAI check`。
2. 若走提交前检查入口，则系统先进入 git-sync 维护链路，再汇总当前 open bug 状态。
3. 系统确认当前工作区处于 git 仓库内，并先归档已解决的 open bug。
4. 读取当前 open bug，刷新 Problems 面板。
5. 读取 git 变更文件列表，至少覆盖已修改与未跟踪文件。
6. 先只对本次变更文件执行 anchor 固定前缀规范化；若发现非标准写法，则自动改成 `@coai anchor: <id>`，但不修改 `<id>`。
7. 若本次确实发生 anchor 前缀规范化，则继续在同一轮流程内重新进入 git-sync 扫描，不要求用户手动再跑一次。
8. 扫描 `.coai/mapper/**/*.mapper.json`，建立 `代码文件 -> mapper 项` 的反向索引。
9. 只对命中的变更代码文件做 anchor 扫描并区分唯一命中、缺失、重复。
10. 若当前文件命中未处理 bug，则冻结 mapper；若命中新 bug，则写入 bug 日志并提示。
11. 若行号变化则回写 mapper，同时更新 `lastUpdated`。
12. 若是提交前检查，则把本次系统实际规范化过的源码文件、写过的 mapper 文件与已归档 resolved bug 文件加入暂存区。
13. 若存在 open bug，则确保 open bug 文件保持在修改区，不随本次提交进入暂存区。
14. 通过通知和 Output Channel 输出同步结果；若仍有 open bug，则输出 warning，但不阻断宿主项目提交。

### 技术解释
- `runGitSyncCore()` 负责无 VS Code 依赖的同步核心。
- `syncMapperFromGitChanges()` 负责 VS Code 命令入口与提示包装。
- `runPreCommitCoaiCheck()` 负责 VS Code 中的提交前检查入口。
- `runPreCommitCheckCore()` 负责 CLI / hook 可复用的提交前检查核心。
- 提交前检查只会暂存本次系统实际写过的 mapper 文件与本次 bug 归档变更，不会擅自改动其他暂存区内容。
- bug 归档变更包含 `open/` 旧路径删除和 `resolved/` 新路径新增，使用 `git add -A` 一次性纳入暂存区。
- open bug 属于 CoAI 认知系统待处理项，不等同宿主项目工程 bug，因此默认不会阻断提交。
- `archiveResolvedOpenBugs()` 与 `refreshOpenBugDiagnostics()` 负责在同步开始前清理并暴露 bug 状态。
- `ensureGitWorkspace()` 与 `getChangedGitFiles()` 负责获取增量输入。
- `runAnchorDoctorOnFiles()` 负责对当前 git 变更文件做固定前缀规范化。
- `buildMapperReverseIndex()` 负责把 mapper 从 token 视角转换到代码文件视角。
- `findAnchorLinesInText()` 负责识别 anchor 缺失、重复或唯一命中。
- `findBlockingBugForCodeFile()` 负责决定某个变更文件是否需要冻结。
- 只有行号变化且未被冻结时才写回 mapper 文件，降低无效写入。
- 非标准 anchor 前缀属于系统自动修复，不进入 bugRepair。

### 数据流
git status -> open bug check -> changed files -> mapper index -> anchor scan -> bug log / mapper write

## 🌿 分支路径
> 非理想路径但仍属于合理情况

### 分支场景
- 变更文件存在，但没有命中任何 mapper
- 变更文件命中了 mapper，但对应行号没有变化
- 多个 mapper 项指向同一个代码文件
- 变更文件命中了尚未处理的 bug
- 提交前检查后仍存在 open bug
- 提交前检查通过，但本次没有 mapper 需要暂存
- 变更文件包含非标准 anchor 前缀，但 `<id>` 本身有效
- mapper entry 仍处于骨架阶段，只有 `anchor`，暂时没有 `file`
- fixed / wont_fix / obsolete bug 被系统归档到 resolved
- open bug 文件被用户或 agent 误加入暂存区

### 处理方式
- [[未命中mapper]] : 没有命中 mapper 时直接输出“无可同步项”
- [[行号未变化]] : 行号未变化时记为 `Skip`，不写文件
- [[同文件多节点]] : 同一文件内的多个 mapper 项在一次扫描中一起处理
- [[Anchor前缀自动修复]] : 命中非标准 anchor 前缀时，系统直接修正为标准格式后继续同步
- [[Mapper骨架待落地]] : mapper 只有 `anchor`、暂缺 `file` 时记为 `Warn` 并跳过反向索引，不视为异常失败
- [[冻结mapper]] : 当 open bug 指向某个 codeFile 时，只冻结该 codeFile 对应 mapper entry 的自动行号维护；不阻止源码修改与提交
- [[提交前检查命令]] : 若检查后仍有 open bug，则提示用户存在 CoAI bug，但提交继续
- [[提交前暂存源码]] : 仅在检查通过后，自动暂存本次系统规范化过的源码文件
- [[提交前暂存mapper]] : 仅在检查通过后，自动暂存本次系统写过的 mapper 文件
- [[提交前暂存resolved bug]] : 仅在检查通过后，自动暂存本次系统归档产生的 open 删除与 resolved 新增
- [[提交前退回open bug]] : 如果 open bug 文件已被暂存，则自动退回修改区，其他暂存内容不动

### 事件行为说明
> 用描述性语言说明“发生什么、系统怎么处理、最终结果是什么”，避免只列分支但没有结果。

1. 通过检测并完成同步
   git-sync 检测通过，且 mapper 可以正常维护时，系统会先对本次变更文件执行 anchor 固定前缀规范化，再更新发生行号偏移的 mapper，并刷新 `lastUpdated`。如果本次确实写过源码或 mapper，pre-commit 会自动把这些系统改动加入暂存区。随后提交正常继续。

2. 检测不通过但提交继续
   如果出现缺失 anchor、重复 anchor、非法 mapper，或某个 codeFile 命中尚未处理的 open bug，系统会生成或保留 buglog。buglog 留在修改区，不会自动加入暂存区。对应 codeFile 的 mapper entry 自动维护会被冻结，但开发者源码文件、业务改动和其他已暂存内容不受影响。pre-commit 默认 fail-open，提交继续。

3. buglog 已修复并归档
   如果 open bug 已由 AI 或人工标记为 `fixed`、`wont_fix` 或 `obsolete`，git-sync 会先把 buglog 从 `open/` 迁移到 `resolved/`。pre-commit 会把 open 旧路径删除与 resolved 新路径新增一起加入暂存区。如果后续 mapper 同步也成功，mapper 修改同样会自动暂存。随后提交正常继续。

4. open bug 被误加入暂存区
   如果 open bug 仍未修复，但已经被用户或 agent 加入暂存区，pre-commit 会把该 open bug 文件退回修改区。其他已暂存内容不动，仍然可以提交。这样可以保证未处理的 CoAI bug 继续留在工作区和 Problems 面板中，方便后续修复。

5. 仅存在固定格式问题
   如果本次变更文件里只是出现了非标准 anchor 前缀，例如漏写冒号，但 `<id>` 本身有效，系统不会生成 buglog，而是直接规范化前缀并继续同步。这样既降低 AI/人工维护噪音，也避免把固定格式问题提升成语义修复问题。

6. mapper 仍处于骨架阶段
   如果某个 mapper entry 只有 `anchor`，暂时没有 `file`，系统认为它是“实现前骨架”或“尚未落地映射”。git-sync 会输出 `Warn` 并跳过该 entry 的反向索引，不生成 buglog，不计为同步失败。后续由 agent 在真实实现或确认源码归属后补回 `file`，再由系统维护 `line`。

## 🚨 异常捕获
> 系统异常处理机制

### 异常类型
- git 不可用或当前目录不是 git 仓库
- mapper JSON 非法
- mapper 指向文件不存在
- anchor 缺失或重复
- anchor 前缀不符合标准格式
- mapper entry 仍处于骨架阶段，暂缺 `file`
- 当前工作区存在未处理 bug

### 处理机制
- [[非git工作区]] : 使用通知和 Output Channel 给出错误原因
- [[非法mapper]] : 对非法 mapper 统一记为 `Fail`
- [[Anchor前缀自动修复]] : 非标准固定前缀由系统直接修正后继续流程
- [[Mapper骨架待落地]] : 对暂缺 `file` 的 mapper 骨架统一记为 `Warn`，不生成 buglog，不阻断同步
- [[缺失anchor]] : 对缺失 anchor 统一记为 `Fail`
- [[重复anchor]] : 对重复 anchor 统一记为 `Fail`，不继续更新该项
- [[冻结mapper]] : 对命中未处理 bug 的 codeFile，只冻结其 mapper entry 自动维护，等待修复完成后再维护
- [[提交前退回open bug]] : open bug 只保留为后续修复线索，不跟随业务提交进入暂存区
