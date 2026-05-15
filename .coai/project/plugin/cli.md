# 🚀 CoAI CLI
> 负责在脱离 VS Code 扩展宿主的情况下提供终端可调用入口，并提供初始化、更新、hook 检测、安装、卸载与恢复能力。

## 🎯 功能目标

- 为 CoAI 提供可直接在终端执行的命令入口
- 让目标项目通过 npm 包安装后，直接执行 `npx coai init` 完成初始化
- 让非 Node 主工程项目通过 `npx coai init --no-package-json` 完成轻量初始化
- 让已接入项目通过 `npx coai update` 更新 `.coai/coai/` 系统资产
- 让用户通过 `npx coai version` 与 `npx coai check-update` 理解当前版本与可升级状态
- 为 `git commit` 前的 hook 提供可调用的稳定检查能力
- 提供 hook 的安装、卸载、恢复与冲突处理能力
- 将命令解析、核心转发与 hook 管理统一收敛到一个独立功能场景

## ⚙️ 技术约束

- CLI 不依赖 VS Code API
- CLI 当前聚焦 `init`、`version`、`check-update`、`update`、`doctor`、`pre-commit-check`、`install-hook`、`uninstall-hook`、`restore-hook`、`skill sync` 与 `coai sync`
- `install-hooks` 作为团队初始化别名，语义上等同于 `install-hook`
- CLI 只负责命令解析与核心转发，不重复实现 git-sync 与 bugRepair 逻辑
- Git hook 模板位于 `.coai/coai/githooks/pre-commit`
- `init --no-package-json` 只跳过 `package.json` 读写与 scripts 合并，不改变其他初始化逻辑
- 安装命令会检测现有 hook 是否由 CoAI 管理
- 遇到未知旧 hook 时会优先备份，再安装 CoAI 版本
- 提供卸载命令与恢复备份命令
- `skill sync` 默认从当前安装包内部的 `skills/coai/` 读取；开发仓库场景可显式使用 `--dev` 改为从当前工作区 `./skills/coai/` 读取

## ⚠️ 风险边界

- CLI 当前未覆盖所有未来 CoAI 子命令
- hook 运行依赖本地 Node、npm 与 git 环境
- CLI 输出面向终端，不承担 Problems 面板这类 UI 展示
- `update` 只允许覆盖 `.coai/coai/` 系统资产，不覆盖 `.coai/project`、`.coai/mapper`、`.coai/node` 或 open bug 日志

## 🧭 理想路径
> 最简单、最直接的 CLI 与 hook 执行路径

### 节点流程
包管理层：[[CLI入口]] -> [[包初始化执行]] -> [[版本信息输出]] -> [[更新检查执行]] -> [[系统资产更新]]
工作区本地运行层：[[本地Runtime入口]] -> [[Anchor格式修复]] -> [[提交前检查转发]] -> [[Hook状态检测]] -> [[Hook安装执行]] -> [[Hook卸载执行]] -> [[Hook备份恢复]] -> [[Skill同步执行]] -> [[Git Hook示例]]

### 运行流程
1. 用户在目标项目安装 CoAI npm 包后执行 `npm exec coai init`，或在非 Node 主工程中执行 `npm exec coai init --no-package-json`。
2. 包管理层把模板资产复制到宿主项目，并同步 `.coai/coai/runtime/` 与 `.coai/coai/skills/coai/`。
3. 标准模式合并 `coai:*` scripts；轻量模式跳过 `package.json` 写入，但仍写入本地 runtime 与 hook。
4. 用户可执行 `npm exec coai version` 查看包版本、工作区系统资产版本与 VS Code 扩展兼容提示。
5. 用户可执行 `npm exec coai check-update` 检查 npm registry 是否存在更新版本。
6. npm 包升级后，用户执行 `npm exec coai update` 覆盖 `.coai/coai/` 系统资产、同步本地 runtime，并重装 hook。
7. 用户可执行 `npm run coai:doctor`，直接通过 `.coai/coai/runtime/cli/coaiCli.js` 进入工作区本地运行层。
8. `doctor` 只修改固定前缀 `@coai anchor: `，不会改写 `<id>`。
9. 用户可执行 `npm run coai:pre-commit-check` 手动验证，也可直接 `git commit`。
10. git hook 在 `git commit` 前隐式调用 `.coai/coai/runtime/cli/coaiCli.js pre-commit-check`，最终进入同一条 pre-commit 检查核心。
11. CLI 检测当前 `.git/hooks/pre-commit` 是否存在，以及是否由 CoAI 管理。
12. 若存在未知旧 hook，则先备份；若已是 CoAI 管理版本，则执行更新而不是重复覆盖。
13. 用户可继续执行 `npm run coai:install-hook`、`npm run coai:uninstall-hook` 或 `npm run coai:restore-hook` 管理本地 hook。
14. 用户可执行 `npm exec coai skill sync`，默认从当前安装包内部的 `skills/coai/` 同步到本机 Codex skill 目录。
15. 如果当前就在 CoAI 自己的开发仓库中工作，用户可执行 `npm exec coai skill sync --dev`，改为从当前工作区的 `./skills/coai/` 取源。
16. 如果需要自定义来源路径，用户也可执行 `npm exec coai skill sync --source-dir <dir>`。

## 📝 补充说明

- CLI 现在应被理解成两层：包管理层负责“把 CoAI 带进项目”，工作区本地运行层负责“初始化后在项目里持续运行”。
- `init` 是目标项目首次接入 CoAI 的主入口。
- `init --no-package-json` 是面向 Python / Flutter / Django / Java 等非 Node 主工程项目的轻量入口。
- `version` 用于查看当前 npm 包、工作区系统资产与 VS Code 扩展兼容提示。
- `check-update` 只检查 npm registry，不修改本地文件。
- `update` 用于更新 `.coai/coai/` 系统资产与本地 runtime，不覆盖宿主项目语义层。
- `coai sync` 当前仍是 `update` 的语义化别名，用于强调“同步当前项目的 CoAI 系统资产”，不是 git-sync 的别名。
- `doctor`、`pre-commit-check`、hook 管理都应优先走工作区本地运行层。
- `skill sync` 当前仍默认读取当前安装包内部的 `skills/coai/`；只有在 CoAI 开发仓库内联调时，才建议显式使用 `--dev`。
- 升级链路要统一成三步：先升级包，再执行 `npm exec coai update`，最后执行 `npm exec coai skill sync`。
- `version` 与 `check-update` 不只负责报告状态，还要顺手提示这两条后续动作，降低用户自己拼升级流程的成本。
- `doctor` 用于修正 anchor 固定前缀格式，不修改 `<id>`，也不生成新 anchor。
- `install-hooks` 是面向团队初始化的语义化别名，底层仍复用 `install-hook` 的同一套安装逻辑。

### 技术解释
- `src/cli/coaiCli.ts` 负责命令解析与终端入口。
- `src/core/initCore.ts` 负责复制模板、合并 scripts、同步本地 runtime、写入 `.gitignore` 与安装 hook。
- `src/core/updateCore.ts` 负责版本读取、npm registry 更新检查与 `.coai/coai/` 系统资产更新。
- `src/core/localRuntimeCore.ts` 负责把 `out/` 与 `skills/coai/` 同步到工作区本地运行层。
- `src/core/anchorCore.ts` 负责 anchor 识别与固定前缀格式归一。
- `src/core/hookInstallerCore.ts` 负责状态检测、安装、卸载与恢复本地 hook。
- `src/core/preCommitCore.ts` 负责无 VS Code 依赖的 pre-commit 检查核心。
- `.coai/coai/githooks/pre-commit` 与本地 `.git/hooks/pre-commit` 负责在 Git 提交前调用工作区本地 runtime。

### 数据流
包管理层：npm exec coai -> init/update/version core -> workspace assets / local runtime / hook
工作区本地运行层：git hook or npm run -> .coai/coai/runtime/cli/coaiCli.js -> doctor / pre-commit / hook core

## 🌿 分支路径
> 非理想路径但仍属于合理情况

### 分支场景
- 用户直接在终端手动执行包管理层 CLI
- 用户从 npm 包安装后首次执行 `npm exec coai init`
- 用户从 npm 包安装后首次执行 `npm exec coai init --no-package-json`
- 用户升级 npm 包后执行 `npm exec coai update`
- 用户检查当前版本或 npm 最新版本
- 用户发现仓库中存在非标准 `@coai anchor` 前缀
- Git hook 自动调用工作区本地 runtime
- CLI 参数不合法
- 本地已存在未知 pre-commit hook
- 本地已存在 CoAI 管理 hook
- 用户希望卸载 CoAI hook 或恢复旧 hook

### 处理方式
- [[CLI入口]] : 手动终端执行时直接输出检查结果
- [[包初始化执行]] : 首次接入时复制 `.coai`、合并 scripts、安装 hook
- [[包初始化执行]] : 轻量模式下跳过 `package.json`，但仍写入工作区本地 runtime 与 hook
- [[版本信息输出]] : 输出 npm 包版本、工作区系统资产版本与 VS Code 扩展兼容提示
- [[更新检查执行]] : 查询 npm registry 的 latest version，只提示不修改
- [[系统资产更新]] : 覆盖 `.coai/coai/` 系统资产，同步本地 runtime，合并 scripts 并重装 hook
- [[本地Runtime入口]] : 日常维护优先从 `.coai/coai/runtime/cli/coaiCli.js` 进入
- [[Anchor格式修复]] : 扫描并归一非标准 anchor 前缀，只修改固定前缀，不改 `<id>`
- [[Hook状态检测]] : 先判断当前 hook 是缺失、CoAI 管理还是外部脚本
- [[Hook安装执行]] : 安装时若检测到未知旧 hook，先备份再覆盖
- [[Hook卸载执行]] : 只允许卸载 CoAI 管理 hook
- [[Hook备份恢复]] : 只在存在备份时恢复旧 hook
- [[Skill同步执行]] : 默认从当前安装包读取 `skills/coai/` 同步到本机 Codex
- [[Git Hook示例]] : `git commit` 时隐式调用同一条工作区本地 runtime 能力

## 🚨 异常捕获
> 系统异常处理机制

### 异常类型
- 当前目录不是 git 工作区
- CLI 参数缺失或不合法
- 工作区中存在非标准 anchor 前缀
- hook 环境缺少 Node 或 npm
- 工作区本地 runtime 缺失
- 安装 hook 时目标位置已有未知旧脚本
- 卸载时当前 hook 不是 CoAI 管理版本
- 恢复时不存在备份文件

### 处理机制
- [[提交前检查转发]] : CoAI bug 默认 fail-open；检查结果通过 warning 与 Output 暴露，不阻断宿主项目提交
- [[CLI入口]] : 参数错误时输出 usage 并退出
- [[Anchor格式修复]] : 非标准前缀可由 `doctor` 自动修正到标准格式
- [[本地Runtime入口]] : 本地 runtime 缺失时，提示先执行包管理层 `init` 或 `update`
- [[Hook状态检测]] : 先分类当前 hook 状态，再决定后续动作
- [[Hook安装执行]] : 先备份未知旧 hook，再安装 CoAI hook
- [[Hook卸载执行]] : 非 CoAI 管理 hook 时拒绝直接卸载
- [[Hook备份恢复]] : 没有备份时拒绝恢复
- [[Git Hook示例]] : hook 调用工作区本地 runtime 后始终 fail-open，异常只输出明显提示，不阻断提交
