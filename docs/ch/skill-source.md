# Skill 来源

## 目标

这份文档用于把 CoAI v1 已稳定的方法论整理成后续 skill 的输入源。当前先做内容定稿，不在此文档中定义具体 skill 格式。

## 一、系统目标

- 从功能理解快速进入正确代码位置
- 让 `.coai` 成为项目认知层，而不是业务代码污染层
- 用 Git 增量维护 mapper，用 bugRepair 保留修复上下文

## 二、交付物边界

当前交付物分成三类：

- `coai`：CoAI 系统使用方法与软件开发方法论
- `template/.coai` 与其中的模板资产：目标仓库初始化模板
- `coai` 系统包：VS Code 插件、CLI、Git hook 与共享核心

当前还新增了版本锚点：

- `./.coai/coai/metadata/version.json`

当前目录定位：

- `skill`：教 agent 怎么做
- `./.coai/`：记录当前项目在做什么
- `./.coai/coai/`：记录当前项目里 CoAI 系统本身需要什么

## 三、核心原则

- 功能文档是权威认知源
- 代码是唯一实现真相
- 文档负责导航，不替代代码理解
- 跳转优先走 `mapper -> file + line`
- 变更后再用 `anchor` 校正 line，不在点击时全量扫描

## 四、功能划分规则

- 功能边界按“场景事件的逻辑连续性”定义
- 一个功能可以跨多个代码文件
- 只有场景目标、触发时机、处理链路明显不同，才升级为新功能

当前主功能：

- `extension-entry`
- `navigation`
- `git-sync`
- `bug-repair`
- `cli`

## 五、源码文件划分规则

- 源码文件边界按实现职责隔离定义
- 先判功能归属，再判源码文件归属
- 即使归属旧功能，也允许新建源码文件来降低耦合

## 六、`.coai` 维护规则

- 新增 CoAI：由 AI 负责
- 维护 CoAI：由系统负责
- 修复 CoAI：由 AI 负责

层级职责：

- `project`：功能认知与规格
- `node`：Hover 认知
- `mapper`：代码定位
- `code`：实际实现
- `current.md`：动态进展
- `log/bugs`：bug 生命周期记录

## 七、运行模式

- VS Code 宿主能力：Hover、Click、Problems、命令面板
- CLI / Git hook 能力：终端执行、提交前检查、hook 管理
- core 层：供宿主层和 CLI / hook 层共享复用

## 八、CLI 命令清单

- `npx coai init`
- `npx coai version`
- `npx coai check-update`
- `npx coai update`
- `npx coai coai sync`
- `npx coai skill sync`
- `npx coai doctor`
- `npm run coai:pre-commit-check`
- `npm run coai:install-hook`
- `npm run coai:install-hooks`
- `npm run coai:uninstall-hook`
- `npm run coai:restore-hook`
- `npm run coai:init`

## 九、典型工作流

### 功能理解

1. 打开 `.coai/project/**/*.md`
2. Hover 查看 node
3. Click 跳转 mapper 对应代码

### 日常维护

1. 修改代码
2. 执行 `git-sync`
3. 系统更新 mapper 或记录 bug

### 提交前检查

1. 执行 `npm run coai:pre-commit-check` 或直接 `git commit`
2. 系统先执行 changed-files doctor，再执行 pre-commit 检查
3. 若通过，只暂存本次系统实际更新过的源码、mapper 与 resolved bug
4. 若失败，进入 bugRepair 流程

### bugRepair

1. 系统检测 bug
2. 写入 `.coai/log/bugs/open/*.json`
3. Problems 面板提示
4. AI 或人工修复并维护状态
5. 后续 `git-sync` 根据 `fixed` 做归档验证

## 十、v1 边界

v1 接受这些现实边界：

- 编辑器交互依赖 VS Code
- 自动化依赖 CLI / Git hook
- 新仓库初始化依赖 npm 包提供的 `npx coai init`

v1 不做：

- 复杂项目脚手架生成器
- 自动 AI 修复执行

## 十一、正式 skill 位置

当前仓库中的正式 skill 源码位于：

```text
skills/coai/
```

这个目录是版本化维护的源码版 skill。后续如需让本机 Codex 自动发现，可再复制或安装到：

```text
C:\\Users\\c5che\\.codex\\skills\\coai
```

当前更推荐直接执行：

```bash
npx coai skill sync
```

默认情况下，它会从当前安装包内部的 `skills/coai/` 读取并同步到本机 Codex skill 目录。

如果当前就是在 CoAI 自己的开发仓库里工作，可执行：

```bash
npx coai skill sync --dev
```

这时会改为从当前工作区的 `./skills/coai/` 读取。

如果需要指定任意来源路径，也可以执行：

```bash
npx coai skill sync --source-dir <dir>
```

## 十二、后续可抽取方向

- 将本文件收敛为 skill 的目标、原则、命令与工作流部分
- 再根据执行环境补充具体的调用方式与约束
