# 中文文档索引

这个目录是 CoAI 中文文档入口。README 只保留产品介绍与最快开始路径，细节统一沉到这里。

## 使用说明

- [CLI 运行链路](cli-runtime-flow.md)：解释包管理层、工作区本地运行层、联网边界与 hook 触发链路
- [运行模式](runtime-modes.md)：解释 VS Code 宿主、CLI、Git hook 的职责边界
- [模板接入协议](template-integration-protocol.md)：解释新仓库如何接入 `.coai`
- [无 package.json 模式](no-package-json-mode.md)：解释 Python / Flutter / Django 等非 Node 主工程如何接入
- [升级路径](upgrade-paths.md)：解释包升级、`.coai/coai` 同步与 skill 同步
- [手动验证](manual-verification.md)：解释 Hover / Click / git-sync / pre-commit 的验证流程
- [Benchmark 与有效性验证](benchmark.md)：解释系统可靠性、agent 认知效率与模拟开发者感知数据的测试框架
- [CoAI 有效性测试结果](effectiveness.md)：整理 TeamDesk Lite 实测结果、AGENTS.md 对照与 CoAI 产品结论边界

## 技术文档

- [功能与源码文件划分规则](feature-boundary-rules.md)：解释功能颗粒度、源码文件边界与 shared code 规则
- [Contract 层](contract-layer.md)：解释 `.coai/contract` 的渐进式披露、三类结构化约定和链接边界
- [CoAI 与 Spec 类系统的区别](coai-vs-spec.md)：解释 CoAI、spec、plan、coding agent 的职责分工
- [Skill 来源](skill-source.md)：解释 CoAI skill 的结构、同步方式与后续分发策略
- [Hook 策略](hook-policy.md)：解释团队级 hook 策略、安装、卸载与恢复
- [仓库结构说明](structure.md)：解释当前仓库与发布资产结构
- [路线图与策略](roadmap-and-strategy.md)：解释版本演进、影响力与商业化优先级

## 开源与发布

- [预热期开源策略草案](pre-open-source-strategy.md)：解释分阶段公开、issue / PR 协作与 skill 升级策略

## 作品集附件

- [CoAI 项目说明：AI Coding 项目认知层产品设计与验证](../portfolio/coai-project-case_zh.md)：面向面试官的项目背景、方案、指标和产品经理贡献说明

## 维护原则

- 使用说明面向“怎么用”
- 技术文档面向“为什么这样设计”
- README 面向“为什么值得试、如何最快开始”
