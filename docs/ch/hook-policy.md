# Hook 策略

## 目标

这份文档定义 CoAI v1 `pre-commit` hook 在团队协作中的使用边界，避免每个仓库都临时决定。

## 结论

### 必须启用

以下仓库应默认启用 CoAI hook：

- 已把 `.coai/` 作为正式协作层使用的仓库
- 依赖 `mapper` 精确跳转来辅助开发认知的仓库
- 需要在提交前稳定校正 `.coai/mapper` 与发现 open bug 的仓库
- 团队已经把 CoAI 文档与代码导航纳入日常开发流程的仓库

### 推荐启用

以下仓库建议启用 CoAI hook：

- 正在试点 CoAI，但还没有纳入强制流程的仓库
- 文档与代码映射关系较频繁变化的仓库
- 主要开发者已习惯使用 CoAI 导航，但团队尚未完全统一的仓库

### 可不启用

以下仓库可以不强制启用：

- 不维护 `.coai/` 的普通仓库
- 一次性实验仓库、临时 demo 仓库
- 团队明确不依赖 CoAI mapper 与 bugRepair 流程的仓库

## 推荐流程

### 新仓库初始化

推荐在仓库初始化后执行：

```bash
npm install -D @5dc/coai
npx coai init
```

这个初始化器会：

1. 复制 `.coai` 初始化资产
2. 合并 `coai:*` scripts
3. 安装本地 `pre-commit` hook

### 已存在仓库接入

如果仓库已经在用 CoAI，但本地还没装 hook，推荐执行：

```bash
npm run coai:install-hooks
```

## 团队约束建议

- 如果仓库被定义为“必须启用”，应把 `npx coai init` 纳入本地开发初始化说明
- 如果仓库被定义为“推荐启用”，应至少在 README 或 onboarding 文档中明确提供安装方式
- 不建议绕过 `npx coai init` 直接手工复制模板和安装 hook
- 不建议在团队未统一规则前，把 hook 安装做成强制覆盖外部脚本
- 旧 hook 如非 CoAI 管理版本，必须优先备份，再决定是否切换

## 当前仓库建议

对于当前 `coai_v1` 仓库，建议视为：

- `必须启用`

原因：

- 这个仓库本身就在开发 CoAI 导航、git-sync、bugRepair 与 CLI/hook 管理能力
- 如果不在本仓库内持续使用这套流程，就很难稳定验证其真实行为
