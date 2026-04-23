# 分发与初始化

## 受众与使用方式

- `references/*` 是英文主版分发参考树，优先给 agent 执行时使用。
- `references/ch/*` 是中文镜像分发树，优先给中文开发者审校和优化措辞时使用。
- 两棵树中的包边界、模板边界与初始化边界要保持对齐。

## v1 产品边界

CoAI v1 由以下部分组成：

- VS Code 插件
- CLI 入口
- `.coai` 模板资产
- `coai init` 初始化器
- Git hook 管理
- 方法论文档与集成说明

CoAI v1 不包含：

- 超出 CoAI 初始化范围的复杂项目脚手架
- AST 级生成
- 自动执行 AI bug 修复

## 交付物分类

把交付物看成三层协同结构：

### `coai`

- 方法论
- 使用说明
- 面向 agent 的工作流规则

### `template/.coai` 与模板资产

- 目标仓库初始化来源
- `.coai` 项目工作区骨架
- `.coai/coai/githooks/pre-commit`
- `.coai/coai/package.coai-scripts.json`
- hook 策略文档

### `coai` 系统包

- VS Code 插件
- CLI
- hook 生命周期管理
- shared core 逻辑

## 目标仓库初始化

在目标仓库中安装 CoAI 包：

```bash
npm install -D @5dc/coai
npx coai init
```

初始化器会复制 `.coai/`、合并 `.coai/coai/package.coai-scripts.json` 中的脚本、更新 `.gitignore` 并安装本地 hook。

它会把这些脚本写入目标仓库的 `package.json`：

- `coai:pre-commit-check`
- `coai:install-hook`
- `coai:install-hooks`
- `coai:uninstall-hook`
- `coai:restore-hook`
- `coai:init`

## 最小验证基线

初始化完成后，至少确认：

1. `npx coai init` 成功
2. `npm run coai:pre-commit-check` 成功
3. `.coai/project/**/*.md` 中的 Hover 与 Click 可用
4. `git commit` 会触发 pre-commit CoAI 检查
