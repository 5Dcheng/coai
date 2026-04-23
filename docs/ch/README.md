# 中文文档索引

这个目录是 CoAI 中文文档入口。README 只保留产品介绍与最快开始路径，细节统一沉到这里。

## 使用说明

- [CLI 运行链路](cli-runtime-flow.md)：解释包管理层、工作区本地运行层、联网边界与 hook 触发链路
- [运行模式](runtime-modes.md)：解释 VS Code 宿主、CLI、Git hook 的职责边界
- [模板接入协议](template-integration-protocol.md)：解释新仓库如何接入 `.coai`
- [无 package.json 模式](no-package-json-mode.md)：解释 Python / Flutter / Django 等非 Node 主工程如何接入
- [升级路径](upgrade-paths.md)：解释包升级、`.coai/coai` 同步与 skill 同步
- [手动验证](manual-verification.md)：解释 Hover / Click / git-sync / pre-commit 的验证流程

## 技术文档

- [功能与源码文件划分规则](feature-boundary-rules.md)：解释功能颗粒度、源码文件边界与 shared code 规则
- [CoAI 与 Spec 类系统的区别](coai-vs-spec.md)：解释 CoAI、spec、plan、coding agent 的职责分工
- [Skill 来源](skill-source.md)：解释 CoAI skill 的结构、同步方式与后续分发策略
- [Hook 策略](hook-policy.md)：解释团队级 hook 策略、安装、卸载与恢复
- [仓库结构说明](structure.md)：解释当前仓库与发布资产结构
- [路线图与策略](roadmap-and-strategy.md)：解释版本演进、影响力与商业化优先级

## 开源与发布

- [预热期开源策略草案](pre-open-source-strategy.md)：解释分阶段公开、issue / PR 协作与 skill 升级策略

## 维护原则

- 使用说明面向“怎么用”
- 技术文档面向“为什么这样设计”
- README 面向“为什么值得试、如何最快开始”
