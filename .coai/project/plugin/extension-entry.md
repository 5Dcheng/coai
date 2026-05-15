# 🚀 CoAI 插件入口与命令挂载
> 负责插件激活、导航能力挂载，以及系统级命令的统一注册。

## 🎯 功能目标

- 将 VS Code 插件入口与具体导航实现分离
- 统一维护命令注册、Provider 挂载和输出通道生命周期
- 保持 `extension.ts` 作为插件入口层，而不是业务实现层

## ⚙️ 技术约束

- `activate()` 必须是 VS Code 扩展入口
- 导航、git-sync、bug-log 都通过命令或 provider 注册接入
- 入口层只编排能力，不重复实现具体业务逻辑

## ⚠️ 风险边界

- 如果入口层注册遗漏，对应功能会整体失效
- 入口层不处理导航细节，也不处理 git 维护细节
- 命令 ID 变更会影响文档点击、命令面板与调试验证

## 🧭 理想路径
> 最简单、最直接的插件入口执行路径

### 节点流程
[[插件激活]] -> [[导航能力挂载]] -> [[Git同步命令]] -> [[提交前检查命令]] -> [[Hook安装命令]] -> [[Hook卸载命令]] -> [[Hook恢复命令]] -> [[Bug流转命令]]

### 运行流程
1. VS Code 激活扩展。
2. `extension.ts` 创建统一的输出通道。
3. 入口层挂载导航 Provider 与代码跳转命令。
4. 入口层挂载 git-sync、提交前检查、hook 安装/卸载/恢复与 bug-log 命令。

### 技术解释
- `activate()` 只负责组合和注册，不承担导航逻辑实现。
- `CoaiLinkProvider` 与 `openMappedCode()` 从 `navigation.ts` 导入。
- `syncMapperFromGitChanges()` 与 `resolveOpenBugLog()` 分别代表系统维护能力。
- `runPreCommitCoaiCheck()` 作为 git-sync 的提交前检查入口单独注册。
- `installGitHook()` 作为 CLI/hook 能力的安装入口单独注册。
- `uninstallGitHook()` 与 `restoreGitHookBackup()` 作为 hook 生命周期管理入口单独注册。

### 数据流
VS Code activation -> extension.ts -> command/provider registration -> feature modules

## 🌿 分支路径
> 非理想路径但属于合理情况

### 分支场景
- 某个功能模块已拆分，但入口尚未更新注册
- 输出通道需要被多个系统命令复用

### 处理方式
- [[导航能力挂载]] : 入口层只负责挂载，具体逻辑继续在独立模块维护
- [[提交前检查命令]] : 入口层只注册命令，不处理提交检查实现细节
- [[Hook安装命令]] : 入口层只注册命令，不处理 hook 安装实现细节
- [[Hook卸载命令]] : 入口层只注册命令，不处理 hook 卸载实现细节
- [[Hook恢复命令]] : 入口层只注册命令，不处理 hook 恢复实现细节

## 🚨 异常捕获
> 系统异常处理机制

### 异常类型
- 当前没有可用工作区
- 某个命令注册成功但其内部功能执行失败

### 处理机制
- [[插件激活]] : 入口层只完成注册，具体失败由各模块自行提示
- [[Git同步命令]] : git-sync 内部负责错误分类和提示
- [[提交前检查命令]] : 提交前检查内部负责复用 git-sync 并汇总结果
- [[Hook安装命令]] : hook 安装内部负责备份旧 hook 并写入新 hook
- [[Hook卸载命令]] : hook 卸载内部负责校验是否为 CoAI 管理版本
- [[Hook恢复命令]] : hook 恢复内部负责校验备份是否存在
- [[Bug流转命令]] : bug-log 模块内部负责错误处理和状态流转
