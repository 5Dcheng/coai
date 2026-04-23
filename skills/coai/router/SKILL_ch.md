# CoAI Router（中文版）

## 作用

这个文件是 `coai` skill 的内部任务分类器。

英文 `SKILL.md` 是给 agent 使用的主版。

`SKILL_ch.md` 是给中文开发者审校、补充和优化措辞的镜像版。

当任务比较宽、比较混合，或者你还没判断清楚用户请求到底属于思考、资产还是运行时问题时，先读它。

它的职责是判断：

- 当前请求主要是思考类、资产维护类，还是运行时执行类
- 是否只需要一个子 skill
- 是否需要像 `core -> asset` 这样的最小执行链

## 一级分类

把请求先分成四种形态。

### 1. 推理优先任务

以下情况只读 `core/SKILL.md`：

- 判断某个能力属于哪个 module / feature
- 判断某个能力是新功能，还是已有功能的一部分
- 判断共享代码应保留多语义 anchor，还是升格成 `utils/common`
- 判断 `.coai` 到底要不要动
- 判断功能结构或源码文件结构如何拆分

### 2. 资产优先任务

当功能归属已经明确，且任务只是创建或更新 CoAI 资产时，只读 `asset/SKILL.md`：

- `.coai/project`
- `.coai/mapper`
- `.coai/node`
- `current.md`

### 3. 运行时任务

当请求是操作类问题时，只读 `runtime/SKILL.md`：

- 怎么运行命令
- VS Code 和 CLI 的区别
- git-sync
- pre-commit
- doctor
- bug-repair
- 标准模式和 `--no-package-json`

### 4. 混合任务

当请求同时涉及：

- 分类判断
- 资产更新
- 运行执行

就使用链式执行。

## 最小执行链

优先使用最小链路，不要默认把所有子 skill 全读一遍。

### `core`

当任务停留在判断或设计层，不需要立刻改 `.coai` 也不需要执行命令时，只读 `core`。

### `core -> asset`

当任务需要：

1. 先判断功能归属或 CoAI 范围
2. 再创建或更新 `.coai`

就走这个链路。

### `runtime`

当任务纯粹是运行、命令、hook、init、git-sync、doctor 这类操作问题时，只读 `runtime`。

### `core -> asset -> runtime`

当任务跨越：

1. 分类判断
2. CoAI 资产维护
3. 命令或流程执行

就走这个链路。

### `runtime -> asset`

只在运行时行为先暴露出问题，随后 `.coai` 需要跟进维护时使用。

### `runtime -> asset -> core`

这是少见路径。只有当运行时问题先暴露，接着资产更新又反过来暴露更深的功能边界问题时才使用。

默认不要走这条链。

## 路由规则

### 规则 1：功能归属不清楚时，不能跳过分类

如果你不确定某件事是否是：

- 一个新功能
- 旧功能的一部分
- 一个值得独立认知的共享能力

那就必须先读 `core`。

### 规则 2：不能先生成资产再补边界判断

不要先创建 `.coai/project`、`.coai/mapper`、`.coai/node`，再回头思考它该归属于哪个 feature。

### 规则 3：runtime 不拥有功能边界决定权

`runtime` 可以解释命令和流程，但不应自行发明或重定义 feature 归属。

### 规则 4：asset 不拥有运行时策略定义权

`asset` 可以生成文件，但不应改写 CLI / hook / VS Code 行为规则。

### 规则 5：尽量少读

不要因为是 CoAI 任务，就默认把 `core + asset + runtime` 全部读一遍。

## 链路中必须传递的上下文

当子 skill 链式调用时，至少保持这些信息稳定：

- module
- feature
- 场景描述
- 当前改动范围
- 宿主项目是标准模式还是 `--no-package-json`
- 宿主项目是不是 Node 主工程

不要在同一任务里反复重新推断已经确定的边界。

## 特殊路由场景

### 共享代码 + 多个业务节点

如果问题是：

- 这些节点要不要抽成一个 common 功能？
- 这段共享实现要不要保留多条语义 anchor？

先读 `core`，判断清楚后，再让 `asset` 更新 mapper / node / feature doc。

### 宿主项目初始化模式

如果问题是：

- 这个项目该用标准初始化，还是 `--no-package-json`？

先读 `runtime`。

如果后面还要改文档或 skill 说明，再链到 `asset` 或 `core`。

### “CoAI 对开发者项目有什么作用”

这类问题通常需要：

- `core` 解释认知层 / 源码层 / 分发层边界
- `runtime` 解释标准模式与轻量模式的操作区别

## 约束

这个文件只是 router。

不要把它重新写成一个新的大一统 monolithic skill。

它的职责是决定下一步读哪个子 skill，而不是复制 `core`、`asset`、`runtime` 的完整内容。
