# 🚀 CoAI Navigation 导航主流程
> 负责 `[[token]]` 识别、Hover 认知展示与 Click 跳代码的核心导航能力。

## 🎯 功能目标

- 让开发者先建立功能认知，再进入源码验证
- 将 `.coai/project -> .coai/node/.coai/mapper -> code` 串成稳定导航路径
- 让功能入口与代码定位解耦，避免回到全文搜索工作流
- 将导航实现收敛到 `navigation.ts`，避免入口文件承担业务细节

## ⚙️ 技术约束

- 功能文档必须位于 `.coai/project/`
- mapper 必须与 project 相对路径一一对应
- node 必须位于 `.coai/node/<doc path>/`
- 跳转优先依赖 `line`，精确校正依赖 `anchor`

## ⚠️ 风险边界

- mapper 缺失时只能提示，不能跳转
- node 缺失时 Hover 静默，不做降级解释
- mapper 缺失时如果用户选择“视为 bug”，会进入 bug-repair，而不是继续停留在导航层
- anchor 被删除时只能退回到 mapper line
- 当前主流程不负责插件激活与命令挂载，入口层已拆为独立功能
- 当前主流程不负责后台批量维护，git 增量维护已拆为独立功能

## 🧭 理想路径
> 最简单、最直接的功能导航路径

### 节点流程
[[Token识别]] -> [[Hover认知展示]] -> [[Mapper代码跳转]] -> [[Anchor行号校正]] -> [[CoAI路径解析]]

### 运行流程
1. 开发者在 `.coai/project/*.md` 中写下 `[[token]]`。
2. 导航模块识别当前光标所在 token。
3. Hover 时系统按文档相对路径定位 node 并展示认知信息。
4. Ctrl/Cmd + Click 时系统按 mapper 命中 `file + line`。
5. 打开目标代码后，再用 `anchor` 校正真实行号并按需回写 mapper。

### 技术解释
- `getTokenAtPosition()` 统一完成 token 识别，避免 Hover 与 Click 各写一套解析逻辑。
- `provideHover()` 负责 node 认知展示，`provideDocumentLinks()` + `openMappedCode()` 负责代码跳转。
- `resolveCoaiPaths()` 集中维护 `.coai/project / mapper / node` 的路径推导规则。
- `findAnchorLine()` 与 `updateMapperLine()` 共同构成 `anchor + line` 双机制。

### 数据流
markdown token -> provider -> node/mapper -> vscode api -> code editor

## 🌿 分支路径
> 非理想路径但属于合理情况

### 分支场景
- 当前 token 有 mapper，但没有 node
- 当前 token 所属文档不在 `.coai/project/` 下
- mapper 行号过期，但 anchor 仍然存在
- 跳转失败且更像是 mapper / code 定位已过期

### 处理方式
- [[无node节点]] : 没有 node 时 Hover 静默，保留 Click 跳转能力
- [[非project文档]] : 文档不在 project 目录下时，不做路径解析
- [[过期mapper行号]] : mapper line 过期时，点击打开代码后再执行 anchor 校正
- [[缺失导航节点bug]] : mapper 缺失导致无法跳转时，可选择视为 bug 并接入 bug-repair
- 运行一次 git-sync : 当跳转失败且更像是映射过期时，提供一次显式同步补救，而不是默认偷偷自动刷新

## 🚨 异常捕获
> 系统异常处理机制

### 异常类型
- 当前文件不在工作区内
- mapper 不存在
- 目标代码文件不存在
- anchor 丢失

### 处理机制
- [[缺失mapper映射]] : 对 mapper 缺失使用 VS Code warning message 提示
- [[过期mapper行号]] : 能校正时回写 mapper，不能校正时保留旧 line 作为兜底
- [[无node节点]] : 不阻塞 Click 跳转，只关闭 Hover 认知展示
- [[缺失导航节点bug]] : 用户可在提示中选择“视为 bug”，系统据此生成 `missing-node` bug 文档
- `git-sync` 显式补救 : 当导航失败更像是映射已过期时，先允许用户手动触发一次 `git-sync`，同步后再重试跳转
