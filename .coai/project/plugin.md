# 🚀 plugin 模块
> 负责 CoAI 在当前仓库中的核心产品能力：插件入口、导航、增量维护、bug 修复与 CLI / hook 自动化。

## 🎯 模块定位

- 作为 CoAI 主产品模块，承载 VS Code 交互面与 CLI / Git hook 自动化面的关键能力
- 为功能文档、节点认知、代码映射、git 维护与 bug 修复提供统一的运行骨架
- 让 CoAI 从“静态语义文件”变成“可交互、可维护、可持续演进”的系统

## 🧩 模块内功能

- [extension-entry](E:/c5dc/coai/coai_v1/.coai/project/plugin/extension-entry.md)
- [navigation](E:/c5dc/coai/coai_v1/.coai/project/plugin/navigation.md)
- [git-sync](E:/c5dc/coai/coai_v1/.coai/project/plugin/git-sync.md)
- [bug-repair](E:/c5dc/coai/coai_v1/.coai/project/plugin/bug-repair.md)
- [cli](E:/c5dc/coai/coai_v1/.coai/project/plugin/cli.md)

## 🔗 功能关系

- `extension-entry`：负责插件激活、命令注册与入口装配
- `navigation`：负责 `[[token]]` 的 Hover、Click 与缺失导航时的补救入口
- `git-sync`：负责 mapper 增量维护、anchor 格式规范化与提交前自动维护
- `bug-repair`：负责 bug 检测、记录、Problems 暴露、修复状态流转与归档
- `cli`：负责终端命令、hook 安装与无 VS Code 宿主时的自动化入口

## 🧭 模块理想路径

### 功能链路
[[插件激活]] -> [[Token识别]] -> [[Hover认知展示]] -> [[Mapper代码跳转]] -> [[Git变更收集]] -> [[Mapper回写]] -> [[Bug检测]] -> [[CLI入口]]

### 运行流程
1. `extension-entry` 挂载 VS Code 命令与导航能力。
2. `navigation` 解析功能文档中的 `[[token]]`，提供 Hover 与跳转。
3. `git-sync` 在维护链路中校正 anchor、mapper 与 bug 状态。
4. `bug-repair` 记录认知层异常并在 IDE 中暴露。
5. `cli` 把同一套维护能力扩展到终端与 Git hook。

### 数据流
feature doc token -> navigation -> mapper -> source code -> git-sync -> bug-repair -> cli / hook

## ⚠️ 模块边界

- 模块文档只解释模块下功能的定位、关系与主数据流，不替代各功能文档
- 更详细的顶层设计、路线与方法论留在 `docs/`
- 如果存在更完整的顶层设计文档，可在本文件底部补充链接

## 📚 相关详版

- [README_zh.md](E:/c5dc/coai/coai_v1/README_zh.md)
- [docs/coai-vs-spec.md](E:/c5dc/coai/coai_v1/docs/coai-vs-spec.md)
- [docs/ch/coai-vs-spec.md](E:/c5dc/coai/coai_v1/docs/ch/coai-vs-spec.md)
