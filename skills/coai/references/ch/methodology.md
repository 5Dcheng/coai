# 方法论

## 受众与使用方式

- `references/*` 是英文主版参考树，优先给 agent 执行时使用。
- `references/ch/*` 是中文镜像参考树，优先给中文开发者审校和优化措辞时使用。
- 两棵树中的稳定规则要保持对齐。

## 功能边界规则

- 功能边界按“场景事件的逻辑连续性”定义。
- 一个功能可以跨多个源码文件。
- 只有当目标、触发时机、处理链路明显分离时，才拆成新功能。

当前功能集合：

- `extension-entry`
- `navigation`
- `git-sync`
- `bug-repair`
- `cli`

## 源码文件规则

- 源码文件边界按“实现职责隔离”定义。
- 先判断功能归属，再判断源码文件归属。
- 当某个变更会反复扰动稳定模块时，就应拆出新源码文件。
- 当结构已经明确时，应在正式实现前先确定源码文件归属。

## 实现前规划规则

- 不要把 CoAI 资产当成“代码写完后的事后文档”。
- `anchor id` 应在正式实现前确定。
- 当源码文件归属已经清楚时，`file` 也应在正式实现前确定。
- mapper 应先作为“语义层 + 结构层”骨架存在。
- `line` 由系统在后续维护。

推荐 loop：

`feature.md（认知对齐 + 功能语义） -> mapper.json（骨架，先定 anchor id） -> src/（实现并同步落 anchor） -> agent 回写 mapper 的 anchor/file -> 系统补完 mapper 的 line -> feature.md（回流优化）`

也就是说，`feature.md` 在 coding 前用于对齐认知，在 coding 后用于吸收真实实现带来的更优认知。

loop 中的职责划分：

- agent 负责把本轮新增或修改的 `anchor` 与 `file` 回写到 mapper
- CoAI 系统通过 `git-sync` 或 `pre-commit` 负责维护 mapper 的 `line`

不要把第一次写下来的节点流程当成最终真相。

## 共享代码与多语义 anchor 规则

- 当多个业务节点命中同一段共享实现时，默认允许在同一代码段附近维护多条不同的语义 anchor。
- 不要因为代码位于 `utils`、`common` 或共享目录，就自动把它升格为公共功能文档。
- 只有当“共享能力本身”已经成为开发者需要单独理解的认知入口时，才新增 `utils/common` 级功能文档。
- 是否升格为公共功能，取决于认知需求，而不是取决于源码目录名。

触发时机：

- agent 准备新增或修改 mapper 条目时
- agent 准备在共享代码里新增 `@coai anchor` 时
- agent 准备把业务功能抽象成 `utils/common` 功能文档时

默认决策：

- 如果共享代码只是多个业务功能复用的实现细节，保留业务功能节点，并允许多条不同 anchor 指向同一代码段。
- 如果共享代码本身已经需要被开发者直接理解，再补独立的公共功能文档；这属于新增一层认知入口，而不是替代原业务节点。

## `.coai` 职责

- AI 负责新增 CoAI 资产。
- 系统负责维护确定性的 mapper 更新和 bug 检测。
- AI 负责语义修复判断。

层级职责：

- `project`：功能认知与规格
- `contract`：结构化数据结构、核心算法、模块级通信接口；仅在这些约定足够稳定、能指导后续开发时写入
- `node`：Hover 认知
- `mapper`：代码定位
- `code`：实际实现
- `.coai/current.md`：只记录动态进展
- `log/bugs`：bug 生命周期记录

## Contract 层

contract 层是可选层，必须保持轻量。

只有当当前项目约定具备结构化、高语义、读源码前有帮助这三个特征时，才写入 `.coai/contract`。第一阶段 contract 只覆盖：

- object / 数据结构：用 JSON、SQL 或宿主语言类型结构完整记录，不做删减，作为样板或实现指引，存放于 `.coai/contract/object`
- 算法：记录核心算法的实现思想、关键代码块、输入与预测输出，目标是可以据此设计单元测试，存放于 `.coai/contract/algorithm`
- 通信接口：按模块级组织，与 `project/<module>.md` 对应，记录稳定请求 / 响应约定，存放于 `.coai/contract/interface`

不要把 contract 变成完整 spec 仓库。

如果某些细节已经可以通过 feature token、mapper 或 anchor 稳定跳到源码，且源码表达更清楚，就不要重复写入 contract。

contract 文件默认使用普通 Markdown 链接和文件路径。不要在 contract 文件中使用 `[[双链 token]]`，除非系统显式支持 contract mapper 语义。

contract 应随项目演进。当数据结构、算法或接口已经成为当前最合理约定时写入；当实现改变该约定时修订。

## CoAI 沉淀边界

- CoAI 不是“探索过程中所有想法的容器”，而是“已沉淀的项目认知层”。
- 不要把原始探索轨迹、方向摇摆、阶段性假设或尚未收敛的思路默认写进 `.coai/`。
- 试错后形成的稳定高语义经验，如果仍然有助于后续理解、实现或维护，可以克制地写入对应功能文档。
- 保留的是稳定结论和关键 tradeoff，不是完整试错过程的回放。

## 新增 `project/<module>/<feature>`

最短顺序：

1. 按稳定业务域或技术域选择 `<module>`
2. 按一个连续场景选择 `<feature>`
3. 当结构已经明确时，在正式实现前先确定源码文件归属
4. 创建 `.coai/project/<module>/<feature>.md`
5. 先确定 `anchor id` 并建立 mapper 骨架
6. 在写真实代码入口时同步写入 `@coai anchor: <id>`
7. 只有真正值得 Hover 认知的 token，才创建 `.coai/node/<module>/<feature>/`
8. 只有项目进展发生了有意义变化时，才更新 `.coai/current.md`

## 节点流程规则

- 只有当某个功能确实存在稳定的语义流动时，才写节点流程。
- 不要为 field、对象结构、普通实现细节强行生成节点流程；这些内容如果没有真实的数据、状态或控制流传递，就不应节点化。
- 如果前置节点流程与最终代码 anchor 出现明显断层，应优先在实现后回写优化 `feature.md`，而不是强行让 mapper 贴合旧节点流程。
- 在项目早期、实现仍不稳定时，可以先写功能目标、技术约束、风险边界与技术解释，等真实 anchor 落下后再补稳定节点流程。

## 不可协商的规则

- `.coai` 必须位于工作区根目录，即 `./.coai`
- `.coai/current.md` 不能承载 mapper / node 语义
- `.coai/project/<module>.md` 只在模块级语义、功能关系或模块主数据流值得解释时才创建
- 功能文档按场景连续性维护，而不是按源码文件数量维护
