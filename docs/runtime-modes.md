# Runtime Modes

## 目标

这份文档用于明确 CoAI v1 当前有两套运行面：

1. VS Code 宿主能力
2. CLI / Git hook 能力

它们共享部分核心逻辑，但触发方式、依赖环境和可见行为并不相同。

## 一、VS Code 宿主能力

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

### 典型文件

- `src/extension.ts`
- `src/navigation.ts`
- `src/bugLog.ts`
- `src/preCommitCheck.ts`
- `src/hookInstaller.ts`

### 特点

- 负责交互
- 有 UI 提示、Hover、Click、Problems 面板
- 可以直接打开文档与代码位置
- 不适合直接用于 Git hook

## 二、CLI / Git hook 能力

这类能力不依赖 VS Code 扩展宿主。

### 典型能力

- `npm run coai:pre-commit-check`
- `npm run coai:install-hook`
- `npm run coai:install-hooks`
- `npm run coai:uninstall-hook`
- `npm run coai:restore-hook`
- `git commit` 时由 `pre-commit` hook 隐式触发 CoAI 检查

### 依赖条件

- 当前目录是有效 Git 工作区
- 本机可用 `node`、`npm`、`git`
- 已执行构建，CLI 产物存在
- `.git/hooks/pre-commit` 已安装 CoAI hook

### 典型文件

- `src/cli/coaiCli.ts`
- `src/core/gitSyncCore.ts`
- `src/core/preCommitCore.ts`
- `src/core/hookInstallerCore.ts`
- `.coai/coai/githooks/pre-commit`

### 特点

- 负责自动化
- 可以脱离 VS Code 单独运行
- 直接依赖退出码控制成功/失败
- 不提供 Hover、Click、Problems 面板这类编辑器交互

## 三、什么时候依赖宿主

以下情况依赖 VS Code 宿主：

- 需要双链 Hover
- 需要双链 Click 跳转
- 需要编辑器内查看 node 信息
- 需要 Problems 面板展示 unresolved bug
- 需要在命令面板里点选 CoAI 命令

一句话：

- 只要涉及“编辑器交互”，就依赖宿主

## 四、什么时候不依赖宿主

以下情况不依赖 VS Code 宿主：

- 终端手动执行 `npm run coai:pre-commit-check`
- 终端手动执行 hook 管理命令
- `git commit` 时由 `pre-commit` 隐式触发检查
- CLI 输出检查结果与退出码

一句话：

- 只要是“终端执行 / Git 执行 / hook 执行”，就不依赖宿主

## 五、为什么当前仓库没开双链也会触发 CoAI

因为当前仓库如果已经安装了：

```text
.git/hooks/pre-commit
```

那么执行：

```bash
git commit
```

时，Git 会自动运行该 hook。

这个过程走的是：

```text
git commit -> pre-commit hook -> CLI -> CoAI core
```

而不是：

```text
VS Code -> extension host -> Hover/Click/Command
```

所以：

- 当前仓库没有打开 VS Code 宿主中的双链能力
- 仍然可以在 `git commit` 时触发 CoAI

这是正常现象。

## 六、当前架构关系

```text
VS Code 宿主层
  ├── extension.ts
  ├── navigation.ts
  ├── bugLog.ts
  ├── preCommitCheck.ts
  └── hookInstaller.ts

CLI / Hook 层
  ├── cli/coaiCli.ts
  └── .coai/coai/githooks/pre-commit

共享核心层
  ├── core/gitSyncCore.ts
  ├── core/preCommitCore.ts
  ├── core/hookInstallerCore.ts
  ├── core/bugStore.ts
  └── core/repairStore.ts
```

结论：

- VS Code 宿主层负责交互
- CLI / Hook 层负责自动化执行
- 共享核心层负责真正的可复用能力
- 当前仓库是 CoAI 的开发与分发仓库，目标仓库才是被接入的宿主工作区
