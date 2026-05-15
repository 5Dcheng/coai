# Bug 生命周期说明

## 目标

这个目录用于记录 CoAI 在 git 增量维护与 bugRepair 流程中产生的 bug 生命周期文件。

## 目录结构

```text
.coai/log/bugs/
├── open/
├── resolved/
├── bug-template.json
└── repair-prompt-template.md
```

## 文件语义

- `open/`：当前待处理 bug
- `resolved/`：已归档 bug
- `bug-template.json`：bug 记录结构模板
- `repair-prompt-template.md`：交给 AI 的修复 prompt 模板

## 生命周期规则

- `open` 与 `fixed` 由 AI 或人工维护
- `resolved` 由系统在后续 `git-sync` 中归档
- 不建议直接删除 bug 文件，优先通过状态流转保留上下文
- `missing-node` 可以由导航点击失败时主动上报，不依赖 git 增量扫描
