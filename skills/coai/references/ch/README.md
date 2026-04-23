# CoAI References（中文版）

这个目录提供 `skills/coai/references/` 的中文版镜像。

定位是：

- 给中文开发者快速理解 CoAI 方法论与结构
- 给中文开发者审校、补充、压缩表述
- 作为英文主版 `references/*` 的中文镜像，而不是独立规则源

使用规则：

- agent 执行任务时，优先以英文主版 `references/*` 为准
- 中文开发者审校、收敛措辞、补充中文解释时，优先看 `references/ch/*`
- 如果中文镜像与英文主版不一致，应先修英文主版，再把稳定规则镜像到中文

## 核心参考

- [方法论](methodology.md)
  负责功能边界、源码文件边界、共享代码多语义 anchor 规则、`.coai` 职责分工。
- [分发与初始化](distribution.md)
  负责 CoAI 交付物边界、初始化方式、目标仓库接入方式。
- [工作流](workflows.md)
  负责 VS Code / CLI / hook 运行面、git-sync、pre-commit、doctor、bug-repair。

## 模板

- [功能文档模板](templates/feature.md)
  用于创建新的 `.coai/project/<module>/<feature>.md`。
- [项目进展模板](templates/current.md)
  用于维护 `.coai/current.md`。
- [mapper 模板](templates/mapper.json)
  用于创建 `.coai/mapper/<module>/<feature>.mapper.json`。
- [node 模板](templates/node.json)
  用于创建 `.coai/node/<module>/<feature>/*.node.json`。
- [bug 模板](templates/bug-template.json)
  用于创建 bug log JSON。
- [repair prompt 模板](templates/repair-prompt-template.md)
  用于生成 AI / 人工修复提示。

模板使用边界：

- template 用于“生成新的正式资产”
- template 是骨架，不是完整示例
- 不要把 example 直接复制成正式项目文件
- 不要把 template 原样留在真实项目中不替换 `<module>`、`<feature>` 等占位内容

## 示例

- [功能文档示例](examples/feature-example.md)
  用于理解功能文档写法和信息浓度。
- [mapper 示例](examples/mapper-example.json)
  用于理解 mapper 字段与节点对齐方式。
- [node 示例](examples/node-example.json)
  用于理解 node 的 Hover 内容写法。

示例使用边界：

- example 用于“理解长相和风格”
- example 不作为正式资产模板源
- 当 template 太抽象时，再去看 example
- 先 template，后 example，不要反过来

## 推荐读取顺序

1. 先看 [方法论](methodology.md)，判断功能归属与 `.coai` 是否要动
2. 再看 [工作流](workflows.md)，判断这是 VS Code、CLI、hook 还是 git-sync / bug-repair 问题
3. 涉及初始化或分发时，看 [分发与初始化](distribution.md)
4. 真正创建资产时，先看 `templates/`
5. 模板不够具体时，再看 `examples/`
