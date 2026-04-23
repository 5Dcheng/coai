# CLI 运行链路

## 目标

这份文档只讲一件事：CoAI CLI 现在不是单层命令集合，而是分为：

- 包管理层
- 工作区本地运行层

这样做的目的，是让初始化后的项目在日常维护时尽量只依赖本地 `.coai/coai/runtime`，而不是每次都重新回到 npm 入口。

## 一、两层节点流程

```text
包管理层：[[包安装]] -> [[包初始化执行]] -> [[版本信息输出]] -> [[更新检查执行]] -> [[系统资产更新]]
工作区本地运行层：[[本地Runtime入口]] -> [[Anchor格式修复]] -> [[提交前检查转发]] -> [[Hook状态检测]] -> [[Hook安装执行]] -> [[Hook卸载执行]] -> [[Hook备份恢复]] -> [[Skill同步执行]]
```

解释：

- 包管理层负责把 CoAI 带进项目，并把系统资产同步到 `.coai/coai/`
- 工作区本地运行层负责项目初始化后真正的日常维护

## 二、包管理层

### 负责什么

- 安装后的首次接入
- 查看包版本与工作区系统资产版本
- 检查 npm 最新版本
- 更新 `.coai/coai/` 系统资产与本地 runtime

### 命令

```bash
npm exec coai init
npm exec coai version
npm exec coai check-update
npm exec coai update
```

### 结果

- `init` 会创建 `.coai/`、合并 scripts、安装 hook，并把本地 runtime 同步到 `.coai/coai/runtime/`
- `update` 会刷新 `.coai/coai/`、`.coai/coai/runtime/` 与 `.coai/coai/skills/coai/`

## 三、工作区本地运行层

### 负责什么

- doctor
- pre-commit 检查
- hook 管理
- 本地维护链路

### 命令

```bash
npm run coai:doctor
npm run coai:pre-commit-check
npm run coai:install-hook
npm run coai:install-hooks
npm run coai:uninstall-hook
npm run coai:restore-hook
```

### 实际执行目标

```text
node ./.coai/coai/runtime/cli/coaiCli.js ...
```

### 特点

- 初始化完成后不需要再从 npm registry 拉 CLI
- 只依赖当前工作区已经存在的 `.coai/coai/runtime`
- 更适合 hook 和日常本地维护

## 四、git commit 的真实触发链路

你直接执行：

```bash
git commit
```

当前链路是：

```text
git commit
-> .git/hooks/pre-commit
-> node ./.coai/coai/runtime/cli/coaiCli.js pre-commit-check
-> preCommitCore
-> gitSync / bugRepair / stage / unstage
```

所以：

- `git commit` 会触发 git hook
- git hook 会触发 CoAI pre-commit-check
- 这条链路和 VS Code 命令面板触发的是同一套 core

## 五、VS Code command 与 git hook 的关系

VS Code 命令面板里的：

- `CoAI: Run pre-commit CoAI check`

调用的是：

```text
VS Code command
-> preCommitCheck.ts
-> preCommitCore
```

git hook 调用的是：

```text
git hook
-> .coai/coai/runtime/cli/coaiCli.js
-> preCommitCore
```

所以它们的关系是：

- 命令入口不同
- core 相同
- 行为目标相同

## 六、当前建议的心智模型

可以把 CLI 理解成两句话：

- 包管理层：把 CoAI 带进项目，并把系统资产与 runtime 同步到工作区
- 工作区本地运行层：项目初始化后，尽量都从 `.coai/coai/runtime` 执行维护动作

这比“所有命令都默认走 npm / npx”更稳定，也更符合 CoAI 作为项目本地认知基础设施的定位。

## 七、哪些情况会联网

先给结论：

- 不是所有 `npm` 命令都会联网
- 只有“需要安装包”或“主动检查 registry”时，才需要联网

### 一定或大概率会联网的情况

- `npm install -D @5dc/coai`
- `npm install -D @5dc/coai@latest`
- `npm update @5dc/coai`
- `npm exec coai check-update`
- 在当前项目没有安装 CoAI 包时，直接执行 `npx coai ...`

解释：

- `install` / `update` 的职责本来就是和 npm registry 交互
- `check-update` 会主动查询 registry 上的 latest version
- `npx coai ...` 在本地没有可用包时，可能尝试从 registry 拉取或解析

### 默认不需要联网的情况

- 当前项目已经安装 CoAI 包时执行 `npm exec coai init`
- 当前项目已经安装 CoAI 包时执行 `npm exec coai version`
- 当前项目已经安装 CoAI 包时执行 `npm exec coai update`
- 执行 `npm run coai:doctor`
- 执行 `npm run coai:pre-commit-check`
- 执行 `npm run coai:install-hook`
- 执行 `npm run coai:install-hooks`
- 执行 `npm run coai:uninstall-hook`
- 执行 `npm run coai:restore-hook`
- 直接执行 `git commit` 触发 CoAI hook

解释：

- `npm exec coai ...` 在当前项目已安装 CoAI 包时，会直接使用本地 `node_modules` 中的 CoAI CLI
- `npm run coai:*` 在当前设计下，要么调用本地已安装包，要么直接调用 `./.coai/coai/runtime/cli/coaiCli.js`
- git hook 触发的是当前项目 `.coai/coai/runtime/cli/coaiCli.js pre-commit-check`
- 这些链路都不依赖再次访问 npm registry

## 八、命令到底从哪里取能力

可以按三种来源理解：

### 1. 从 npm registry 取

适用场景：

- 安装 CoAI 包
- 升级 CoAI 包
- 检查 npm 最新版本

典型命令：

```bash
npm install -D @5dc/coai
npm install -D @5dc/coai@latest
npm exec coai check-update
```

### 2. 从当前项目已安装的 CoAI 包取

适用场景：

- 首次初始化
- 查看当前包版本
- 更新当前项目 `.coai/coai/`
- 同步 skill

典型命令：

```bash
npm exec coai init
npm exec coai version
npm exec coai update
npm exec coai skill sync
```

解释：

- 这些命令会从当前项目 `node_modules` 中已安装的 CoAI 包读取模板、runtime、skill 源
- 重点不是“联网”，而是“读取当前项目已经安装好的 CoAI 包”

### 3. 从当前项目 `.coai` 本地资产取

适用场景：

- doctor
- pre-commit-check
- hook 管理
- git hook 自动触发

典型命令：

```bash
npm run coai:doctor
npm run coai:pre-commit-check
npm run coai:install-hooks
git commit
```

这些命令最终都会落到：

```text
./.coai/coai/runtime/cli/coaiCli.js
```

也就是说：

- 它们不是再去“找 npm 包在哪里”
- 而是直接读取当前项目已经同步好的 CoAI 本地 runtime
