# CoAI Asset（中文版）

## 作用

当功能边界已经明确，接下来需要创建或更新 CoAI 资产时，使用这个文件。

英文 `SKILL.md` 是给 agent 使用的主版。

`SKILL_ch.md` 是给中文开发者审校、补充和优化措辞的镜像版。

它负责：

- `.coai/project`
- `.coai/mapper`
- `.coai/node`
- `.coai/log/bugs` 的模板类资产
- `.coai/current.md`

## 高密度资产规则

在真正开始生成资产前，先记住这些规则：

- 默认顺序是 `project -> anchor -> mapper -> node -> .coai/current.md`
- `anchor` 应在正式实现前确定
- 当结构已经清楚时，`file` 也应在正式实现前确定
- mapper 应作为实现前骨架存在，而不是实现后再从零补建
- agent 负责在 mapper 中写入或更新 `anchor` 与 `file`
- CoAI 系统负责维护 mapper 的 `line`
- template 是默认生成源
- example 只在 template 太抽象时，用来理解长相、信息浓度和风格
- 不要把 example 当成 template 直接落地
- 不要把 `<module>`、`<feature>` 这类占位符留在真实仓库里
- 只创建当前任务真正需要的资产
- `.coai/current.md` 只记录动态进展，不能变成第二份功能文档
- `.coai/project/<module>.md` 是可选模块文档，只有模块定位、功能关系或模块级数据流值得单独说明时才创建
- `.coai` 只承载已沉淀认知，不承载完整探索历史
- 试错后形成的稳定高价值经验，只有在仍然影响后续理解、实现或维护时，才克制地写入功能文档

## 快速资产导航

如果下一步已经很明确，用这个导航：

- 新增一个功能认知入口：创建 `.coai/project/<module>/<feature>.md`
- 需要模块级认知入口时：创建 `.coai/project/<module>.md`
- 把功能绑定到代码：先确定 `anchor` 和 mapper 骨架，再在真实代码入口写入 `@coai anchor: <id>`，由 agent 把 `anchor` 与 `file` 回写到 mapper，最后让系统对齐 `line`
- 增加 Hover 认知：只为真正值得 Hover 提示的 token 创建 `.coai/node/<module>/<feature>/`
- 只更新项目进展：编辑 `.coai/current.md`
- 只有任务明确需要 bug log 模板或 repair prompt 时，才生成对应支持资产

## 创建顺序

除非任务已经非常窄，否则默认按这个顺序：

1. 创建或更新 `.coai/project/<module>/<feature>.md`
2. 当存在明确代码入口时，在源码中补 anchor
3. 创建或更新 `.coai/mapper/<module>/<feature>.mapper.json`
4. 只为真正需要 Hover 认知的节点创建 `.coai/node/<module>/<feature>/`
5. 如果这是一次有意义的项目进展，再更新 `.coai/current.md`

不要在没有稳定 anchor id 或候选 anchor id 时创建 mapper entry。

不要在还没判断哪些 token 真的需要 Hover 时，就先批量生成 node。

mapper 骨架规则：

- 在规划阶段就把 mapper 建成“语义层 + 结构层”骨架
- 骨架中 `anchor` 必须存在
- 如果源码文件归属已经明确，骨架中也应写入 `file`
- 如果 `file` 还不明确，可以保留只有 `anchor` 的 mapper 骨架；runtime 应将其报告为 `Warn`，而不是 `Fail`
- 当真实实现新增或修改了 `anchor` / `file` 时，应由 agent 同步回写到 mapper
- `line` 留给 `git-sync` 或 `pre-commit` 在后续维护

## 各类资产的创建条件

### project 文档

以下情况应创建或更新功能文档：

- 模块定位、功能关系或模块级主数据流需要解释
- 新增功能
- 功能认知发生实质变化
- 某个重要分支/异常规则需要沉淀到功能文档

### mapper

以下情况应创建或更新 mapper：

- 已有真实代码入口
- anchor 已存在，或至少已有稳定 anchor 计划

### node

以下情况应创建或更新 node：

- Hover 认知确实有价值
- 某个节点需要 intent / logic / risk / scale 说明

### `.coai/current.md`

以下情况应更新 `.coai/current.md`：

- 新增了一个有意义的功能
- 完成了一个重要功能里程碑
- 运行时 / 产品边界发生了影响当前工作上下文的变化
- 下一个 agent 需要一个稳定 resume 点

## 模板与示例使用规则

先用模板。

只有在模板太抽象时，才看示例。

边界：

- template 是正式生成骨架
- example 是说明性参考
- 先 template，后 example
- 不要把 example 当成可直接落地的正式资产

### 模板

优先从这些开始：

- `../references/templates/feature.md`
- `../references/templates/current.md`
- `../references/templates/module.md`
- `../references/templates/mapper.json`
- `../references/templates/node.json`
- `../references/templates/bug-template.json`
- `../references/templates/repair-prompt-template.md`

中文镜像：

- `../references/ch/templates/*`

### 示例

只有在需要具体样例时，再读取：

- `../references/examples/feature-example.md`
- `../references/examples/mapper-example.json`
- `../references/examples/node-example.json`
- `../references/ch/examples/*`

## anchor 规则

生成或修改 anchor 时遵守：

- 标准格式是 `@coai anchor: <id>`
- 读取时可以兼容 `@coai anchor <id>`
- 新改动要归一到带冒号格式
- 当多个业务节点确实命中同一段共享实现时，允许在同一代码段附近存在多条不同语义 anchor

不要在这个文件里尝试“修复语义型 anchor 问题”。那属于 runtime + bug-repair，或 AI / 人工的语义修复判断。

## `.coai/current.md` 规则

`.coai/current.md` 不是功能文档。

它应该：

- 记录最新项目进展
- 记录当前关注点
- 记录当前限制
- 帮助下一个 agent 快速恢复上下文

它不应该：

- 变成另一份功能认知文档
- 承载 mapper / node 语义
- 重复详细功能文档内容
- 变成“每次试错都记一笔”的探索日志
- 变成模块关系说明文档

## 模块文档规则

`.coai/project/<module>.md` 是可选文档。

以下情况应创建：

- 模块本身需要定位说明
- 同一模块下多个功能之间的关系需要解释
- 模块级理想路径或主数据流值得沉淀

以下情况不必创建：

- 单个功能文档已经足够表达
- `<module>` 只是目录分组，没有独立语义价值

如果创建：

- 只解释模块定位、功能关系与主数据流
- 具体实现细节继续放在功能文档里
- 如有更完整的顶层设计详版，可在文档底部用 Markdown 链接到 `docs/`

## CoAI 沉淀边界

在写任何 project 文档前，先检查这条边界：

- 不要把原始探索轨迹、方向摇摆、阶段性假设或未收敛思路默认写进 `.coai/`
- 如果试错后沉淀出了仍然有效的稳定结论，或会长期影响实现判断的高语义 tradeoff，可以克制地补到对应功能文档
- 这类补充必须短、稳、耐用
- 不要在功能文档中回放完整探索过程

## 不要这样做

- 不要创建没有真实 anchor 的占位 mapper
- 不要给功能文档中的每一句话都生成 node
- 不要把系统资产写进 `.coai/project`、`.coai/mapper`、`.coai/node`
- 不要把 `<module>`、`<feature>` 这种字面占位符留在真实宿主项目里
- 不要在已经有真实进展后，仍然让 `.coai/current.md` 为空
- 不要盲目覆盖用户已经维护的 CoAI 资产

## references 边界

使用规则：

- `../references/templates/*`、`../references/examples/*` 是英文主版
- `../references/ch/templates/*`、`../references/ch/examples/*` 是中文镜像

按需读取，不要模板和示例整包都读。

## 约束

- 只创建当前任务真正需要的资产
- 保护用户已有数据
- 保持 token / node label / mapper key 一致
- 遵守 `core` 已经做出的边界判断
