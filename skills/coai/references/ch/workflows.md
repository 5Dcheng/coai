# 工作流

## 受众与使用方式

- `references/*` 是英文主版工作流参考树，优先给 agent 执行时使用。
- `references/ch/*` 是中文镜像工作流树，优先给中文开发者审校和优化措辞时使用。
- 两棵树中的命令语义与流程顺序要保持对齐。

## 运行模式

### VS Code 宿主

用于：

- Hover
- Click
- Problems
- 命令面板动作
- 在编辑器里打开 bug 日志

典型文件：

- `src/extension.ts`
- `src/navigation.ts`
- `src/bugLog.ts`
- `src/preCommitCheck.ts`
- `src/hookInstaller.ts`

### CLI / Git hook

用于：

- `npm run coai:pre-commit-check`
- `npm run coai:install-hook`
- `npm run coai:install-hooks`
- `npm run coai:uninstall-hook`
- `npm run coai:restore-hook`
- `npx coai doctor`
- `git commit` 时隐式执行 pre-commit 检查

典型文件：

- `src/cli/coaiCli.ts`
- `src/core/gitSyncCore.ts`
- `src/core/preCommitCore.ts`
- `src/core/hookInstallerCore.ts`
- `.coai/coai/githooks/pre-commit`

## git-sync 流程

1. 读取 Git 工作区变更文件。
2. 只在变更文件范围内规范化非标准 anchor 前缀。
3. 将这些文件与 mapper 引用到的代码文件做匹配。
4. 当 anchor 发生偏移时更新 mapper 行号。
5. 检测 `missing-anchor`、`duplicate-anchor`、`invalid-mapper`。
6. 为未解决的语义问题写入 bug 日志。

行号维护规则：

- `mapper.line` 应视为系统维护的定位缓存字段
- 不要把 agent 手工改 `line` 当成常规维护方式
- 实现完成后如需刷新定位，应运行 `git-sync`
- 提交前则由 `pre-commit` 包裹同一条维护链路

anchor 解析规则：

- 标准生成格式：`@coai anchor: <id>`
- 读取时兼容旧格式 / 修复式：`@coai anchor <id>`
- `coai doctor` 可以把固定前缀规范化回 `@coai anchor: `，但不修改 `<id>`
- 自动 pre-commit / git-sync doctor 只扫描当前 Git 变更文件

修复职责规则：

- 系统自动修复：非标准 anchor 前缀，只修前缀，不动 `<id>`
- 系统只检测不自动修复：`missing-anchor`、`duplicate-anchor`、`invalid-mapper`、`missing-node`
- AI / 人工修复：需要语义判断的 bug

交互补救规则：

- 不要让双链导航默认偷偷触发完整维护链路
- 当跳转失败且更像是映射过期时，应提供一次显式 `git-sync` 补救入口
- 如果同步后仍失败，再进入 bug-repair 或映射诊断

## bug-repair 流程

1. `open` 与 `fixed` 状态由 AI 或人工维护。
2. `resolved` 归档由系统维护。
3. 命中 open bug 的文件会冻结 mapper 自动维护。
4. 当问题再次出现时，可 reopen 已归档 bug。

修复规则：

- 问题修好后，把 bug 的 `status` 改成 `fixed`
- 在正常宿主项目修复流程里，不要手工把文件从 `open/` 挪到 `resolved/`

## pre-commit 流程

1. 手动执行 `coai:pre-commit-check`，或通过 Git hook 自动触发。
2. 收集 Git 变更文件，并只在这些文件内规范化非标准 anchor 前缀。
3. 在同一条维护链路里继续执行 git-sync。
4. 只暂存系统规范化过的源码文件。
5. 只暂存系统写过的 mapper 文件。
6. 只暂存系统归档到 `resolved/` 的 bug 文件。
7. `open` bug 日志保留在工作区；若被暂存则退回修改区。
8. CoAI bug 不阻断宿主项目提交，只输出 warning 并保留后续修复上下文。
9. 不擅自暂存无关的用户改动。
