# CoAI Skill（中文版）

## 作用

这个根文件是 `coai` skill 的稳定发现入口。

它应该在这些时机被优先使用：

- 开始讨论某个功能怎么做时
- 开始正式写代码前
- 某轮代码实现完成、准备把认知回流到项目中时

它引导的不是“强制按初版节点流程实现”，而是：

- 先用 `feature.md` 做认知对齐
- 再准备 mapper 骨架与候选 anchor id
- 按真实实现写代码并落 anchor
- 由 agent 把新增或修改的 `anchor` 和 `file` 回写到 mapper
- 再让系统补完 mapper 的 `line`
- 最后把优化后的认知回写到 `feature.md`

只要你希望 Codex 继续把这个 skill 识别为 `coai`，就**不能删除**：

- `skills/coai/SKILL.md`

正确做法是把它保留为一个轻量 router，然后把重内容拆到内部子 skill：

- `router/SKILL.md`
- `core/SKILL.md`
- `asset/SKILL.md`
- `runtime/SKILL.md`

## 高语义主规则

即便还没进入子 skill，也要先记住这些最高优先级规则：

- CoAI 首先改变的是认知层，不是宿主项目的业务运行时。
- 功能边界按场景事件连续性划分，不按源码文件数量划分。
- 源码文件边界按实现职责隔离划分，不按功能文档长相划分。
- `.coai` 必须位于工作区根目录，即 `./.coai`。
- AI 负责新增 CoAI 资产，系统负责确定性维护，AI 或人工负责语义修复判断。
- `project` 负责功能语义，可选的 `contract` 负责结构化数据 / 算法 / 接口约定，`node` 负责 Hover 认知，`mapper` 负责代码定位，`current.md` 只负责动态进展。
- 共享代码允许多语义 anchor；不要因为代码在共享目录里，就直接升格成 `utils/common`。
- VS Code 负责交互面，CLI / Git hook 负责自动化面。
- CoAI 记录的是已沉淀的项目认知，不是全部探索过程。
- CoAI 资产遵循渐进式披露：先读 `current.md`，再读相关 feature 文档；只有任务需要结构化数据、算法或接口约定时才读 contract；只有需要实现事实时才读源码。
- contract 文件默认使用普通 Markdown 链接和文件路径，不使用 `[[双链 token]]`；除非系统显式支持 contract mapper 语义。
- 试错后沉淀出的稳定高语义经验，可以克制地写入对应功能文档；原始探索轨迹不要默认进入 `.coai/`。
- `anchor id` 应在正式实现前确定。
- `mapper file` 原则上应在正式实现前确定。
- `mapper line` 必须在实现后由系统维护。
- mapper 不应等代码完成后再从零补建，而应以前置骨架 + 后置补齐的方式存在。

## 最小 Agent 流程

当任务是“实现或显著修改一个被 CoAI 跟踪的功能”时，最短流程是：

1. 先确认 module / feature 归属
2. 开始 coding 前，先结合 `feature.md` 与用户目标做一次认知对齐
3. 在正式实现前先确认源码文件归属
4. 更新或创建 `.coai/project/<module>/<feature>.md`
5. 在写代码前先确定 `anchor id` 和 mapper 骨架
6. 写代码时同步写入 `@coai anchor: <id>`
7. 由 agent 把本轮新增或修改的 `anchor` 与 `file` 回写到 mapper
8. 让 `git-sync` 或 `pre-commit` 维护 mapper 的 `line`
9. 当本轮实现通过验证后，把优化后的认知写回 `feature.md`

标准 loop：

`feature.md（认知对齐 + 功能语义） -> mapper.json（骨架，先定 anchor id） -> src/（实现并同步落 anchor） -> agent 回写 mapper 的 anchor/file -> 系统补完 mapper 的 line -> feature.md（回流优化）`

## 特别关注

这里最容易漂，必须额外注意：

- `anchor` 要先定，不能等代码写完后再补想
- `file` 在结构清楚时也应先定；只有真的还没收敛时，才允许后补
- 不要等到最后再从零补建 mapper
- mapper 应先作为语义层 + 结构层骨架存在，再由系统补齐定位层
- 前置节点流程只是可修正的语义假设，不是强制实现契约
- 不要为了形式完整而强行写节点流程；只有真的存在稳定语义流动时才写
- 如果前置节点流程和真实 anchor 落点出现明显断层，应优先回写优化 `feature.md`，而不是强行让 mapper 贴合旧节点流程
- 功能边界判断看 `core/SKILL.md`，骨架生成看 `asset/SKILL.md`，确定性维护看 `runtime/SKILL.md`

## 路由

根 skill 要保持精简，只作为稳定入口，随后立刻分流：

- 任务宽泛、混合、还没分类：`router/SKILL.md`
- 功能边界、源码文件归属、共享代码/common 判断、`.coai` 是否要动：`core/SKILL.md`
- `.coai/project`、`.coai/contract`、`.coai/mapper`、`.coai/node`、`current.md`、template、example：`asset/SKILL.md`
- VS Code 与 CLI、init、update、doctor、git-sync、pre-commit、bug-repair、hook：`runtime/SKILL.md`

## references 边界

稳定参考材料继续放在：

- `references/methodology.md`
- `references/distribution.md`
- `references/workflows.md`
- `references/templates/*`
- `references/examples/*`
- `references/ch/*`

使用规则：

- `references/*` 是英文主版参考树，优先给 agent 执行时使用
- `references/ch/*` 是中文镜像参考树，优先给中文开发者审校和优化措辞时使用
- 按需读取，不要整包全读
