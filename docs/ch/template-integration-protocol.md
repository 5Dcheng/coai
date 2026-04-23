# 模板接入协议

## 目标

这份文档定义 CoAI v1 在目标仓库中的 npm 包初始化协议。目标是让接入过程不依赖口头说明，也不需要每次自行判断。

## 适用前提

目标仓库应满足：

- 使用 Git 管理
- 本机可用 `node`、`npm`、`git`
- 目标仓库接受在根目录维护 `.coai/`
- 团队已决定该仓库是“必须启用”或“推荐启用” CoAI hook

## 初始化方式

在目标仓库根目录安装 CoAI 包并执行初始化：

```bash
npm install -D @5dc/coai
npx coai init
```

本地 tarball 测试时可用：

```bash
npm install -D ./5dc-coai-0.0.1.tgz
npx coai init
```

初始化器会复制包内 `template/.coai/` 到目标仓库 `./.coai/`。

如果目标仓库不是 Node 主工程，且不希望创建或修改 `package.json`，可使用轻量初始化：

```bash
npx coai init --no-package-json
```

轻量初始化同样会复制 `./.coai/`，但不会创建或修改 `package.json`，也不会合并 `coai:*` scripts。

## `package.json` scripts 合并规则

初始化器会把 `./.coai/coai/package.coai-scripts.json` 中的脚本合并到目标仓库 `package.json`：

- `coai:pre-commit-check`
- `coai:version`
- `coai:check-update`
- `coai:update`
- `coai:doctor`
- `coai:install-hook`
- `coai:install-hooks`
- `coai:uninstall-hook`
- `coai:restore-hook`
- `coai:init`

合并原则：

- 保留目标仓库原有 scripts
- 写入或更新 CoAI scripts
- 不依赖宿主项目自己的 `build` 脚本

## 初始化后的第一步

`npx coai init` 会：

1. 复制 `.coai` 初始化资产
2. 合并 `coai:*` scripts
3. 确保 `.gitignore` 至少包含 `node_modules/`
4. 安装本地 CoAI `pre-commit` hook

## 更新方式

目标仓库已经接入 CoAI 后，更新分两步：

1. 更新 npm 包：

```bash
npm update @5dc/coai
```

2. 更新工作区系统资产：

```bash
npx coai update
```

`coai update` 只更新 `.coai/coai/`，并合并最新 `coai:*` scripts、重装 CoAI hook。它不会覆盖 `.coai/project/`、`.coai/mapper/`、`.coai/node/`、`.coai/log/bugs/open/`。

## 目标仓库中的角色分工

- VS Code 插件：负责 Hover、Click、Problems、命令面板
- CLI / hook：负责终端与提交前自动化
- `.coai/` 顶层：负责当前项目自己的功能认知、节点认知、映射、bug 日志
- `.coai/coai/`：负责当前项目中 CoAI 系统本身需要的 hook、scripts 与系统说明

从开发者项目视角看，接入 CoAI 后会同时存在三层产出：

- 认知层产出：`.coai/`
- 源码层产出：宿主项目自己的业务代码，可使用任意语言和框架
- 分发层产出：宿主项目自己的包、镜像、二进制或发布产物

CoAI 只负责认知层，不替代源码层和分发层。

正式边界：

- CoAI 只作用于开发者源码仓库与开发流程
- CoAI 不应作用于宿主项目的业务运行时
- CoAI 不应进入宿主项目最终面向用户的分发产物

如果使用标准模式，`package.json` 只承担 CoAI 工具层入口，不代表宿主项目主工程必须转为 Node 项目。

## 启用策略

接入后应按 `docs/ch/hook-policy.md` 判定该仓库属于：

- 必须启用
- 推荐启用
- 可不启用

结论应写入目标仓库自己的 README 或 onboarding 文档。

## 最小验收

接入完成后至少验证：

1. `npx coai init` 成功
2. 标准模式下 `npm run coai:pre-commit-check` 成功，轻量模式下 `npx coai pre-commit-check` 成功
3. 在 VS Code 中能 Hover / Click `.coai/project/**/*.md`
4. `git commit` 时 `pre-commit` hook 会触发 CoAI 检查

## 当前边界

v1 的初始化器仍保持最小边界，不做：

- 自动生成新仓库的功能文档
- 自动安装 VS Code 插件
- 自动处理复杂 monorepo / workspace 策略
- 自动干预宿主项目自己的业务打包链路
