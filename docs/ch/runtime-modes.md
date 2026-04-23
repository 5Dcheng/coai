# 运行模式

## 目标

这份文档用于明确 CoAI v1 当前存在三层运行关系：

1. VS Code 宿主交互层
2. CLI 包管理层
3. 工作区本地运行层

它们共享同一套 core，但触发时机、依赖环境和用户可见行为不同。

## 一、VS Code 宿主交互层

这类能力依赖 VS Code 扩展宿主。

### 典型能力

- `[[token]]` Hover
- `[[token]]` Ctrl/Cmd + Click
- Problems 面板诊断展示
- 命令面板里的 CoAI 命令
- 编辑器内直接打开 bug 日志

### 依赖条件

- 扩展被 VS Code 正常加载
- `extension.ts` 已执行 `activate()`
- 对应 Provider / Command 已注册
- 当前文档位于可识别的工作区中

### 特点

- 负责交互
- 有 Hover、Click、消息提示、Problems 面板
- 不负责包安装与系统资产分发

## 二、CLI 包管理层

这类能力负责“从已安装 CoAI 包把系统资产与本地 runtime 落到当前项目”。

### 理想路径

```text
[[包安装]] -> [[包初始化执行]] -> [[版本信息输出]] -> [[更新检查执行]] -> [[系统资产更新]]
```

### 典型命令

- `npm exec coai init`
- `npm exec coai version`
- `npm exec coai check-update`
- `npm exec coai update`

### 依赖条件

- 当前项目已经安装 CoAI 包，或当前命令能从本地 tarball / npm registry 找到 CoAI 包
- 本机可用 `node`、`npm`
- 当前项目根目录可写

### 特点

- 负责初始化与更新
- 负责把 `.coai/coai/`、`.coai/coai/runtime/`、`.coai/coai/skills/coai/` 同步到工作区
- `check-update` 会访问 npm registry
- `init` / `version` / `update` 在本地已安装包存在时，不要求联网

## 三、工作区本地运行层

这类能力负责“初始化完成后，直接从当前项目 `./.coai/coai/runtime` 执行维护动作”。

### 理想路径

```text
[[本地Runtime入口]] -> [[Anchor格式修复]] -> [[提交前检查转发]] -> [[Hook状态检测]] -> [[Hook安装执行]] -> [[Hook卸载执行]] -> [[Hook备份恢复]] -> [[Skill同步执行]]
```

### 典型命令

- `npm run coai:doctor`
- `npm run coai:pre-commit-check`
- `npm run coai:install-hook`
- `npm run coai:install-hooks`
- `npm run coai:uninstall-hook`
- `npm run coai:restore-hook`

这些命令在当前项目里实际执行的是：

```text
node ./.coai/coai/runtime/cli/coaiCli.js ...
```

### 依赖条件

- 当前项目已经完成 `init` 或 `update`
- `./.coai/coai/runtime/cli/coaiCli.js` 存在
- 本机可用 `node`
- 如果涉及提交前维护，还要求当前目录是有效 Git 工作区

### 特点

- 负责本地维护
- 不依赖 VS Code
- 不需要再从 npm registry 拉取 CLI
- 适合作为 git hook 的直接执行目标

## 四、git hook 与 VS Code command 的关系

这两个入口调用的是同一套 core，只是入口不同。

### git hook 触发链路

```text
git commit
-> .git/hooks/pre-commit
-> node ./.coai/coai/runtime/cli/coaiCli.js pre-commit-check
-> preCommitCore
-> gitSyncCore / bugRepair / stage / unstage
```

### VS Code command 触发链路

```text
CoAI: Run pre-commit CoAI check
-> extension command registration
-> preCommitCheck.ts
-> preCommitCore
-> gitSyncCore / bugRepair / stage / unstage
```

结论：

- `git commit` 会通过 git hook 隐式触发 CoAI pre-commit 检查
- VS Code command 是同一能力的显式入口
- 两者是两个入口，不是两套不同逻辑

## 五、什么时候依赖宿主

以下情况依赖 VS Code 宿主：

- 需要双链 Hover
- 需要双链 Click 跳转
- 需要编辑器内查看 node 信息
- 需要 Problems 面板展示 unresolved bug
- 需要在命令面板里点选 CoAI 命令

一句话：

- 只要涉及“编辑器交互”，就依赖宿主

## 六、什么时候不依赖宿主

以下情况不依赖 VS Code 宿主：

- 终端手动执行包管理层命令
- 终端手动执行本地 runtime 命令
- `git commit` 时由 `pre-commit` 隐式触发检查
- hook 管理命令
- doctor / git-sync / pre-commit 输出终端结果

一句话：

- 只要是“终端执行 / Git 执行 / hook 执行”，就不依赖宿主

## 七、当前架构关系

```text
VS Code 宿主交互层
  ├── extension.ts
  ├── navigation.ts
  ├── bugLog.ts
  ├── preCommitCheck.ts
  └── hookInstaller.ts

CLI 包管理层
  ├── cli/coaiCli.ts
  ├── core/initCore.ts
  ├── core/updateCore.ts
  └── npm package / tarball

工作区本地运行层
  ├── .coai/coai/runtime/cli/coaiCli.js
  ├── .coai/coai/runtime/core/*
  └── .git/hooks/pre-commit

共享核心层
  ├── core/gitSyncCore.ts
  ├── core/preCommitCore.ts
  ├── core/hookInstallerCore.ts
  ├── core/bugStore.ts
  └── core/repairStore.ts
```

结论：

- VS Code 宿主交互层负责交互
- CLI 包管理层负责初始化与更新
- 工作区本地运行层负责日常维护与 hook 执行
- 共享核心层负责真正的可复用能力
