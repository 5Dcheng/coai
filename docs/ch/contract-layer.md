# CoAI Contract 层

## 目的

CoAI contract 层是轻量的结构化认知层。

它不是完整 spec 仓库，也不替代 feature 文档、源码、README 或外部 `spec/` 文档。

文件系统路径：

```text
.coai/contract/
├── object/
├── algorithm/
└── interface/
```

它的目的是沉淀当前项目中已经形成、后续 agent 或开发者需要遵守的约定。这些约定应当具备：

- 结构化
- 低歧义
- 读源码前有帮助
- 对后续实现或维护足够重要

CoAI 应保持为演进式项目认知系统：

```text
功能认知 -> 按需 contract -> 源码入口
```

## 渐进式披露

CoAI 资产必须渐进式读取。

默认认知路径是：

```text
current.md -> project/<module>/<feature>.md -> 按需 contract -> 按需源码
```

feature 文档是第一认知入口。单个 feature 文档应该足够让 agent 或开发者初步理解这个功能的目的、输入输出、约束、理想路径、分支路径、风险和边界。

contract 文件只在任务需要结构化数据、算法或接口约定时读取。

源码仍然是最终实现事实。如果源码表达更清楚，并且已经能通过 feature 认知路径稳定到达，就不要把源码细节复制进 contract。

## 范围

第一阶段 contract 只支持三类：

1. object / 数据结构
2. 算法
3. 通信接口

不要把 contract 层扩展成通用 spec 系统。

## Object Contract

object contract 用于完整记录数据结构。

可以使用 JSON、SQL、宿主语言类型定义或 schema 风格代码块。

不要为了摘要而删减字段或约束，因为数据结构 contract 同时承担样板和实现指引的作用。

适合写入 object contract 的内容，是 agent 和开发者在修改相关功能前应该先理解的核心项目形状。

默认目录：

```text
.coai/contract/object/
```

## 算法 Contract

算法 contract 描述可测试的实现意图。

应包含：

- 目标
- 输入
- 预测输出
- 关键分支行为
- 实现思想
- 必要时给出关键代码块或伪代码

目标是可以从 contract 推导出单元测试。

不要复制完整实现，除非这段代码本身就是最小且最清楚的算法表达。

默认目录：

```text
.coai/contract/algorithm/
```

## 通信接口 Contract

通信接口 contract 记录稳定的请求 / 响应约定。

它应按模块级组织，并对应：

```text
project/<module>.md
```

接口 contract 用于稳定模块边界，不用于记录每个局部 helper 或普通 CRUD 细节。

默认目录：

```text
.coai/contract/interface/
```

## 链接与导航

contract 文件默认使用普通 Markdown 链接和普通文件路径引用。

默认不要在 contract 文件中使用 `[[双链 token]]`。

原因：

- 双链 token 是 feature 认知导航机制
- 当前 mapper 和 node 路径规则围绕 `project/<module>/<feature>.md`
- contract 中使用双链会混淆功能认知与结构化约定的边界

推荐链接方式：

```text
feature.md -> contract：Markdown link
feature.md -> source：双链 + mapper
contract -> feature：Markdown link
contract -> source：文件路径或 Markdown link
```

只有当系统显式支持 contract mapper 语义后，才考虑引入 contract 专用双链行为。

## 与外部 Spec 的关系

如果项目需要详细 PRD、正式 spec 或外部需求资料，应放在 `.coai` 外部，例如：

```text
./spec/
./docs/
./README.md
```

这些文档可以作为 agent 可索引资料。

CoAI contract 只沉淀已经成为当前项目最合理状态、对实现有指导价值、且足够稳定的结构化约定。

## 创建规则

满足以下任一条件时，才创建 contract 文件：

- 数据结构是多个功能的核心骨架
- 算法需要跨迭代保持或需要单元测试约束
- 接口是稳定模块边界
- 约定分散在源码中，agent 容易误读
- 新 chat 需要先理解该结构，否则会读取大量源码

不要创建 contract 文件：

- 只是局部实现细节
- feature 文档加源码入口已经足够清楚
- 仍在探索阶段
- 只是重复源码，没有增加认知价值

## 更新规则

当当前项目约定变化时，更新 contract 文件。

如果只是实现重构，但数据形状、算法行为或接口约定没有变化，不需要更新 contract 文件。

contract 属于 CoAI 的已沉淀认知，不是探索过程回放。
