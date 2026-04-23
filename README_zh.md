# CoAI

CoAI 是面向 AI coding 的项目认知层。

它让开发者用自然语言描述功能，用 `[[双链节点]]` 表达关键流程，再让 AI agent 把这些语义节点连接到真实代码位置。项目越是由 AI 快速生成，CoAI 越能帮助人和 agent 保持同一份最新、可定位、可维护的项目认知。

CoAI 的目标不是替代 spec、plan 或代码本身，而是在 AI coding 的整个循环中保留“已经沉淀下来的功能理解”：

```text
feature.md 认知对齐 -> mapper 骨架 -> 代码 + anchor -> 系统补 line -> feature.md 认知回流
```

## 为什么需要 CoAI

- AI 可以很快写代码，但项目也很容易变成黑盒。CoAI 把稳定认知沉淀在仓库里，让开发者知道项目“是什么意思”。
- 聊天记录会过时，但 `.coai/` 跟随项目状态更新。下一次打开仓库时，人和 agent 都能从当前认知继续。
- 功能文档不再只是说明文字。`[[用户填写]] -> [[前端提交]] -> [[服务器校验]]` 可以跳到真实代码段落。
- agent 不必全仓库盲扫。`.coai/project`、`.coai/mapper`、`.coai/node` 和 `@coai anchor` 提供高语义密度入口。
- CoAI 会隐式推动更好的功能结构和源码结构，因为每个能力都要归属到清晰的场景事件。
- CoAI 对非专业开发者也友好：用户可以先描述业务流程，再让 agent 生成能指导 coding 的功能文档与实现结构。

一句话：

```text
CoAI 让 AI 写出来的项目，仍然能被人掌控。
```

## 适合什么场景

适合：

- 使用 Codex、Claude Code、Cursor、Trae、Cline 等 AI agent 开发项目
- 新项目从一段 prompt 或一个业务流程开始搭建
- 希望把产品语义、架构理解、功能流程和真实代码连接起来
- 希望 agent 在修改代码前先理解当前项目认知
- 希望长期 AI coding 后，项目仍然可读、可定位、可继续维护

暂不推荐：

- 直接对庞大旧项目做一次性全量重构
- 把 CoAI 当成完整 spec / plan / task 管理系统
- 把 `.coai/` 当成所有探索过程和聊天记录的存档

## 快速开始

### 1. 安装

推荐方式：

```bash
npm install -D @5dc/coai
npm exec coai init
```

如果项目不是 Node 主工程，也可以使用轻量模式：

```bash
npm install -D @5dc/coai
npm exec coai init --no-package-json
```

安装 VS Code 插件：

```bash
code --install-extension coai-0.0.1.vsix --force
```

发布到 VS Code Marketplace 后，也可以直接从市场安装。

### 2. 配置 skill

CoAI 面向 agent 使用，skill 很重要。初始化后建议同步本机 Codex skill：

```bash
npm exec coai skill sync
```

第一次让 agent 使用 CoAI 时，建议明确告诉它：

```text
请先使用 coai skill，阅读并理解当前仓库的 .coai 结构。
之后在讨论功能、开始写代码、以及实现完成回流时，都按 CoAI loop 工作：
feature.md 认知对齐 -> mapper 骨架 -> 代码 + anchor -> mapper 回填 anchor/file -> 系统补 line -> feature.md 认知回流。
前置节点流程只是可修正的语义假设，不是强制实现约束。
```

### 3. 开始使用

如果是新项目，不建议用户手工创建所有 `.coai` 文件。更推荐在 chat 窗口描述目标，让 agent 使用 CoAI 创建项目认知：

```text
我要做一个简易注册功能：
用户填写 -> 前端提交 -> 服务器校验 -> 本地 JSON 存储 -> 返回成功响应
请使用 CoAI 为这个功能建立功能文档、mapper 骨架，并实现代码。
```

如果你已经有项目立项文档、产品 spec 或业务流程，推荐：

1. 先在仓库初始化 CoAI
2. 把 spec 放进本地 repo 的合适位置
3. 让 agent 读取 spec，并使用 CoAI 生成或更新 `.coai/project/<module>/<feature>.md`
4. 让 agent 在写代码时同步维护 mapper 的 `anchor` 与 `file`
5. 让 CoAI 系统通过 git-sync / pre-commit 自动补齐 `line`

## CoAI 怎么工作

CoAI 由三部分组成：

- `.coai/`：当前项目的语义认知层，记录功能、节点、映射、当前进展和 CoAI bug
- npm 包 `@5dc/coai`：提供 CLI、初始化、更新、本地 runtime、模板和 skill 源
- VS Code 插件：提供 Hover、Ctrl/Cmd Click、Problems 面板和命令面板交互

典型结构：

```text
.coai/
├── current.md        # 当前项目最新进展
├── project/          # 模块文档与功能文档
├── mapper/           # token 到代码位置的映射
├── node/             # Hover 节点说明
├── log/bugs/         # CoAI bug 生命周期记录
└── coai/             # 当前工作区中的 CoAI 系统资产与本地 runtime
```

关键文件职责：

- `project/<module>/<feature>.md`：解释功能目标、技术约束、理想路径、分支路径和异常边界
- `mapper/<module>/<feature>.mapper.json`：把 `[[token]]` 映射到 `anchor/file/line`
- `node/<module>/<feature>/*.node.json`：提供 Hover 时的简洁节点说明
- `current.md`：记录当前项目最新进展，不替代功能文档

## 双链效果

在功能文档中写：

```md
[[用户填写]] -> [[前端提交]] -> [[服务器校验]] -> [[本地JSON存储]] -> [[返回成功响应]]
```

在代码中写：

```ts
// @coai anchor: auth.register.validate.001
```

然后：

- Hover `[[服务器校验]]` 可以看到 node 说明
- Ctrl/Cmd Click `[[服务器校验]]` 可以跳到真实代码段落
- git-sync / pre-commit 可以根据 `@coai anchor` 自动维护 mapper 的 `line`

## 与 spec / plan 的关系

CoAI 不替代 spec 驱动开发。

更准确的关系是：

```text
CoAI 负责沉淀项目认知与代码定位
spec / plan 负责组织具体开发过程
coding agent 负责执行实现
```

在实际 AI coding 中，CoAI 更像是开发前后的“认知对齐与回流层”：

```text
CoAI -> spec / plan / agent coding -> CoAI
```

它不记录所有过程细节，只保留仍然有效的功能语义、关键决策、实现入口和维护线索。

## 命令入口

常用命令：

```bash
npm exec coai init
npm exec coai update
npm exec coai skill sync
npm run coai:pre-commit-check
```

命令分两层：

- 包管理层：`init`、`version`、`check-update`、`update`
- 工作区本地运行层：`doctor`、`pre-commit-check`、hook 管理

详细说明见 [CLI 运行链路](docs/ch/cli-runtime-flow.md)。

## 文档索引

使用说明：

- [CLI 运行链路](docs/ch/cli-runtime-flow.md)
- [运行模式](docs/ch/runtime-modes.md)
- [模板接入协议](docs/ch/template-integration-protocol.md)
- [无 package.json 模式](docs/ch/no-package-json-mode.md)
- [升级路径](docs/ch/upgrade-paths.md)
- [手动验证](docs/ch/manual-verification.md)

技术文档：

- [功能与源码文件划分规则](docs/ch/feature-boundary-rules.md)
- [CoAI 与 Spec 类系统的区别](docs/ch/coai-vs-spec.md)
- [Skill 来源](docs/ch/skill-source.md)
- [Hook 策略](docs/ch/hook-policy.md)
- [仓库结构说明](docs/ch/structure.md)
- [路线图与策略](docs/ch/roadmap-and-strategy.md)

开源与发布：

- [预热期开源策略草案](docs/ch/pre-open-source-strategy.md)

## 当前状态

CoAI v0.0.1 面向早期公开测试：

- VS Code 双链 Hover / Click
- CLI 初始化与更新
- Git 增量 mapper 行号维护
- pre-commit fail-open 检查
- CoAI bug log 与 Problems 面板
- skill 与模板资产

当前仍处于快速迭代阶段，建议优先在新项目或可控项目中试用。

## License

MIT
