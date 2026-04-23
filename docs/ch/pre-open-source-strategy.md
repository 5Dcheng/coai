# 预热期开源策略草案

## 目标

这份草案用于定义 CoAI 在预热阶段的分层开源策略，适用于：

- 直播真实项目测试
- 文章与视频发布
- 早期反馈收集
- 在公开产品层的同时，保护高价值认知资产

## 开源分层

把 CoAI 分成三层看待，并分别决定公开强度：

### 1. 公开产品层

适合优先公开：

- `src/`
- `skills/coai/`
- `template/.coai/`
- `docs/`
- `README.md`
- `README_zh.md`
- npm 包 / tarball
- VSIX 包
- demo 仓库或最小示例

### 2. 系统资产层

通常也适合较早公开，但最好先审一遍：

- `.coai/coai/` 模板资产
- hook 模板
- metadata
- skill 参考材料

### 3. 项目认知层

建议延后公开，或只做部分公开：

- `.coai/project/`
- `.coai/current.md`
- `.coai/mapper/`
- `.coai/node/`
- 真实 bug log
- 与当前 CoAI 仓库强绑定的内部长期认知文档

## 现在建议公开什么

预热阶段建议公开：

- 包、扩展、CLI、模板、docs、skill
- 当前仓库完整 `.coai/project/` 暂不公开
- 如果需要对外解释，可只放精选 `.coai` 示例

## 建议延后公开什么

建议延后公开：

- 当前 CoAI 仓库自己的完整 `.coai/project/`
- `.coai/current.md`
- `.coai/log/bugs/open/`
- `.coai/log/bugs/resolved/`
- 当前仓库完整 mapper/node 认知网络

## Issue / PR 协作策略

预热期更适合的问题驱动协作，而不是默认代码驱动协作。

### 建议鼓励

- bug 报告
- 最小复现步骤
- 接入反馈
- 文档问题
- 功能建议
- 真实项目测试案例

### 建议谨慎接收

- 直接改核心行为的 PR
- 直接改方法论或 feature 粒度规则的 PR
- 未讨论就直接改 `.coai` 协议的 PR

### 建议写法

- 重大功能或方法论变更，请先开 Issue 讨论。
- 预热阶段的核心能力改动，通常由维护者在完成问题判断后结合 AI 协助实现。
- 欢迎反馈、复现样例和文档改进建议。

## skill 升级策略

当前最实用的策略：

- 仓库内 `skills/coai/` 是源码真源
- 本机安装到 Codex 的 skill 是同步副本
- 使用 `coai skill sync` 把仓库中的最新版 skill 同步到本机 Codex skill 目录

## 包与命令策略

建议统一成下面这套：

- 初始化工作区：`npx coai init`
- 检查包更新：`npx coai check-update`
- 同步当前项目 `.coai/coai/` 系统资产：`npx coai update` 或 `npx coai coai sync`
- 同步本机 Codex skill：`npx coai skill sync`

重要边界：

- CoAI 包本身升级仍然属于包管理器职责
- 使用 `npm install -D @5dc/coai@latest` 更新包版本

## 对外定位建议

- 公开系统层、方法层、模板层、demo 层
- 延后公开当前项目内部认知层
- 社区协作以 issue-first、维护者判断、AI 辅助实现为主
