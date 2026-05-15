# CoAI 系统资产

这个目录记录当前项目里 CoAI 系统本身需要的资产，而不是当前项目自己的业务语义文件。

## 关系

- `skill`：教 agent 怎么做
- `./.coai/`：记录当前项目在做什么
- `./.coai/coai/`：记录当前项目里 CoAI 系统本身需要什么

## VS Code 命令

在已安装 CoAI VS Code 插件的前提下，可通过命令面板执行以下命令：

- `CoAI: Open mapped code`
- `CoAI: Sync mapper from git changes`
- `CoAI: Run pre-commit CoAI check`
- `CoAI: Install local pre-commit hook`
- `CoAI: Uninstall local pre-commit hook`
- `CoAI: Restore pre-commit hook backup`
- `CoAI: Resolve open bug log`
- `CoAI: Reopen resolved bug log`

## CLI 命令

首次接入宿主项目时，推荐先安装 CoAI npm 包，再执行初始化：

```bash
npm install -D @5dc/coai
npx coai init
```

初始化后，也可以在宿主项目根目录执行 npm scripts：

```bash
npm run coai:init
npm run coai:version
npm run coai:check-update
npm run coai:update
npm run coai:doctor
npm run coai:pre-commit-check
npm run coai:install-hook
npm run coai:install-hooks
npm run coai:uninstall-hook
npm run coai:restore-hook
```

## 使用原则

- VS Code 命令用于 Hover、Click、Problems 面板与命令面板交互。
- CLI 命令用于终端、Git hook 与提交前自动化。
- `npx coai init` 用于首次初始化宿主项目，并会写入 `.coai/`、合并 `coai:*` scripts、安装本地 hook。
- `npx coai update` 用于更新 `.coai/coai/` 系统资产，不覆盖宿主项目语义层。
- `npx coai check-update` 用于检查 npm 包是否有新版本。
- `npx coai doctor` 用于扫描并修正非标准的 anchor 前缀格式，只归一固定前缀，不修改 `<id>`。
- `npm run coai:pre-commit-check` 可手动模拟一次提交前检查。
