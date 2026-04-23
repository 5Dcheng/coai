# 路线图与策略

这份文档存放 CoAI 的内部产品规划说明，不让这些内容挤占公开 README 的主叙事。

## v1 产品边界

v1 定义为：

- VS Code 插件
- CLI 命令入口
- `.coai` 模板资产
- `coai init` 初始化器
- `coai update` 工作区系统资产更新器
- Git hook 管理
- CoAI 方法论与 skill 来源

v1 不追求：

- 完全替代 VS Code 编辑器交互
- 提供完整项目脚手架生成器
- AST 级自动生成
- 自动触发 AI agent 修复 bug
- 因 CoAI 认知层问题阻断业务提交

## 交付层

- `skill`：教 agent 怎么使用 CoAI
- `.coai/`：记录当前宿主项目的认知层
- `.coai/coai/`：在宿主项目中存放 CoAI 系统资产
- npm 包：分发 CLI、shared core、模板与 skill 来源
- VSIX / VS Code 插件：分发编辑器交互能力

## 命名策略

推荐的公开命名路径：

- 产品名：`CoAI`
- CLI 命令：`coai`
- 近期 npm 包：`@5dc/coai`
- 如果未来可用的长期品牌目标：`@coai/coai`

使用 scoped package 比直接抢占裸包名 `coai` 更稳，因为官方发布者会更清晰。

## 版本路线图

### v1

目标：核心地基、基本可用、能真实测试。

- 双链导航
- Hover 与 Ctrl/Cmd Click
- mapper / node / anchor 结构
- Git 增量 mapper 同步
- bug 日志与 bugRepair 生命周期
- CLI、init、update、hook 管理
- 通过 npm tarball 与 VSIX 做基础分发

### v2

目标：更多真实使用与持续加固。

- 在真实项目里做更多 forward test
- 强化 CoAI skill 行为
- 更好的模板与示例
- 更好的文档与 onboarding
- 设计并实现面向 Python / Flutter / Django 等项目的“无 `package.json` 轻量接入模式”
- 根据真实使用反馈持续优化 v1

### v3

目标：扩展认知与导航能力。

- 超越单跳代码定位的关系导航
- 更丰富的依赖与功能关系视图
- 如果有价值，适配 Obsidian 风格的知识导航
- 在合理前提下扩展更多编辑器 / 运行时集成

### v4

目标：端到端可靠性。

- 端到端集成测试套件
- 跨平台 hook 与 CLI 验证
- 完整 onboarding smoke test
- 发布自动化与回归门禁

## 社区与商业化说明

短期优先级：

1. 先在内部 / 团队项目里稳定跑通
2. 形成可复用的模板接入流程
3. 发布真实案例与演示
4. 在选择商业化路径前，先建立对方法论的信任

潜在商业化方向：

- 项目接入咨询
- 团队模板与方法论包
- 增强版 VS Code 工具
- 私有知识索引或 dashboard
- agent 辅助修复工作流

商业化应建立在“已经有可见案例、明确价值、可重复接入”之后。
