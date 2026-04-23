# 模板

## 作用

这个目录提供 CoAI 正式资产的标准模板。

当你要创建或重写真实资产时，优先使用这里的 template。

## 使用边界

- template 用于生成正式项目资产
- template 是骨架，不是完整示例
- 写入真实仓库前，必须替换 `<module>`、`<feature>` 等占位内容
- 不要把 example 当成 template 直接复制

## 推荐顺序

1. 先选择目标资产对应的 template
2. 再按当前任务上下文填充内容
3. 只有当 template 仍然太抽象时，才去看 `../examples/*`

## 文件说明

- `feature.md`：创建 `.coai/project/<module>/<feature>.md`
- `module.md`：创建可选的 `.coai/project/<module>.md`
- `current.md`：更新 `.coai/current.md`
- `mapper.json`：创建 `.coai/mapper/<module>/<feature>.mapper.json`
- `node.json`：创建 `.coai/node/<module>/<feature>/*.node.json`
- `bug-template.json`：创建 bug log JSON
- `repair-prompt-template.md`：创建修复提示
