# CoAI Runtime（中文版）

## 作用

这个文件用于 CoAI 的运行时行为说明。

英文 `SKILL.md` 是给 agent 使用的主版。

`SKILL_ch.md` 是给中文开发者审校、补充和优化措辞的镜像版。

包括：

- VS Code 命令
- CLI 命令
- Git hook 行为
- git-sync
- pre-commit
- doctor
- bug-repair
- 仓库初始化

## 高密度运行规则

在解释或执行 CoAI 运行行为前，先记住这些规则：

- VS Code 负责交互面；CLI 和 Git hook 负责自动化面
- 先判断运行面，再解释或执行行为
- `git-sync` 负责基于 Git 变更文件维护 mapper 对齐
- `mapper line` 是由系统维护的定位字段，不是 agent 常规手写字段
- `doctor` 只规范固定 anchor 前缀，不改语义性的 anchor id
- `pre-commit` 会在变更文件上跑维护链路，只暂存系统写出的 CoAI 维护结果，并对 CoAI 认知层 bug 保持 fail-open
- 系统自动修复只限于非标准 anchor 前缀规范化
- `missing-anchor`、`duplicate-anchor`、`invalid-mapper`、`missing-node` 这类语义问题只检测，不自动修复
- Hover / Click 不能偷偷改源码
- 标准模式和 `--no-package-json` 只影响认知层 / 工具层，不影响宿主项目运行时或最终产物

## 快速运行导航

如果用户问的是“下一步该怎么操作”，用这个导航：

- 编辑器交互、Hover、Click、Problems、命令面板：走 VS Code 宿主
- init、update、doctor、pre-commit、hook 安装 / 卸载 / 恢复：走 CLI / Git hook
- 代码移动后保持 mapper 对齐：运行 `git-sync`
- 对齐或刷新 `mapper line`：运行 `git-sync`，不要默认靠 agent 手工改行号
- 规范当前变更中的 anchor 前缀：运行 `doctor`，或依赖 `git-sync` / `pre-commit` 内置的 changed-files doctor
- 做提交前的 CoAI 维护：运行 `pre-commit-check`
- 处理 open / fixed / resolved 的 bug 生命周期：走 `bug-repair`
- 判断是否允许触碰 `package.json`：选择标准初始化或 `--no-package-json`

## 运行面

先判断运行面，再行动。

### VS Code 宿主

用于：

- Hover
- Ctrl/Cmd Click
- Problems 面板
- 命令面板动作
- 在编辑器里打开 bug 日志

### CLI / Git hook

用于：

- `npx coai init`
- `npx coai init --no-package-json`
- `npx coai update`
- `npx coai doctor`
- `npm run coai:pre-commit-check`
- `npx coai pre-commit-check`
- hook 安装 / 卸载 / 恢复
- `git commit` 时的 pre-commit 行为

不要混着讲。必须明确当前问题是在问 VS Code 交互，还是在问终端 / hook 自动化。

## 标准模式 vs `--no-package-json`

### 标准模式

适用于宿主项目接受把 `package.json` 当成 CoAI 工具入口层的情况。

典型路径：

- `npm install -D @5dc/coai`
- `npx coai init`

行为：

- 创建 `.coai/`
- 创建 `.coai/coai/`
- 创建或更新 `package.json`
- 合并 `coai:*` scripts
- 安装 hook

### 轻量模式

适用于宿主项目不应创建或修改 `package.json` 的情况。

典型路径：

- `npx coai init --no-package-json`

行为：

- 创建 `.coai/`
- 创建 `.coai/coai/`
- 不创建也不修改 `package.json`
- hook 直接回退到 CLI，而不是依赖 `npm run`

### 边界

两种模式都只影响：

- 源码仓库中的认知层和开发流程

它们不应影响：

- 宿主项目业务运行时
- 宿主项目最终分发产物

## git-sync

当前 git-sync 的规则是：

1. 读取 Git 变更文件
2. 只在变更文件范围内自动规范化非标准 anchor 前缀
3. 构建 mapper 反向索引
4. 对命中文件做 anchor 扫描
5. 在需要时更新 mapper 行号
6. 记录未解决的语义 bug

行号维护规则：

- `line` 应被视为系统维护的定位缓存字段
- 不要把 agent 手工改 `line` 当成默认维护方式
- `git-sync` 是 `line` 的标准维护入口
- `pre-commit` 是围绕同一维护链路的提交前封装

### 系统自动修复

系统自动修复包括：

- 非标准 anchor 前缀
- 只修前缀，不动 `<id>`

### 系统只检测不自动修复

系统只检测这些问题：

- `missing-anchor`
- `duplicate-anchor`
- `invalid-mapper`
- `missing-node`

### AI / 人工修复

语义型 bug 修复仍由 AI 或人工负责。

运行关系：

- `doctor` 可以先执行，用于规范化变更文件中的 anchor 前缀
- 然后 `git-sync` 继续更新 mapper 定位并记录未解决的语义 bug
- `pre-commit` 则包裹这条链路，并只暂存系统负责的维护产物

## pre-commit

当前 pre-commit 顺序：

1. 收集 Git 变更文件
2. 只在这些文件内规范化非标准 anchor 前缀
3. 继续进入 git-sync
4. 暂存系统规范化过的源码文件
5. 暂存系统写过的 mapper 文件
6. 暂存系统归档到 `resolved/` 的 bug 变更
7. 把误暂存的 open bug 退回修改区
8. 对 CoAI 认知层 bug 采取 fail-open

### 重要边界

Hover / Click 不应该偷偷改源码。

自动写文件行为只属于：

- `pre-commit-check`
- `Sync mapper from git changes`
- 显式 `doctor`

交互失败补救规则：

- 不要让 Hover / Click 默认偷偷执行完整维护链路
- 如果跳转失败且更像是映射过期，应提供一次显式 `git-sync` 补救入口
- 如果同步后仍失败，再进入 bug-repair 或映射诊断

## doctor

`doctor` 有两种形态：

### 显式全仓库 doctor

- `npx coai doctor`
- `npm run coai:doctor`

用于用户明确想跑一次全仓库规范化。

### 自动 changed-files doctor

用在：

- git-sync
- pre-commit

它应该：

- 只扫描当前 Git 变更文件
- 只规范化固定 `@coai anchor` 前缀
- 规范化后立刻继续维护链路

## bug-repair

当前 bug-repair 规则：

- `open` 与 `fixed` 由 AI 或人工维护
- `resolved` 由系统归档
- open bug 可能冻结相关 code file 的 mapper 自动维护
- 问题复现时可 reopen 已归档 bug

非标准 anchor 前缀不是 bug-repair 项，它属于系统自动修复项。

## 初始化

初始化属于 runtime 行为，不属于单纯 asset 行为。

### 标准初始化

使用：

- `npx coai init`

### 轻量初始化

使用：

- `npx coai init --no-package-json`

初始化只影响宿主仓库中的认知层和 CoAI 工具层。

它不重定义宿主项目业务框架，也不重定义宿主项目发布流程。

## references 边界

使用规则：

- `../references/workflows.md`、`../references/distribution.md` 是英文主版
- `../references/ch/workflows.md`、`../references/ch/distribution.md` 是中文镜像

## 约束

- 不要把 VS Code 交互和 CLI 自动化混为一谈
- 有命令入口时，不要直接手改 hook 文件
- 不要在 runtime 里重定义 feature 归属
- 不要把 CoAI 认知层 bug 当成宿主项目运行时 bug
