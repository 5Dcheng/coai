# CoAI Repair Prompt Template

你正在修复一个 CoAI 映射异常。

## 异常信息

- 异常类型：`<missing-anchor | duplicate-anchor | invalid-mapper | other>`
- 功能文档：`<.coai/project/...>`
- mapper 文件：`<.coai/mapper/...>`
- token：`<token>`
- anchor：`<anchor>`
- 代码文件：`<code file>`

## 系统检测结果

- `<系统发现了什么>`
- `<系统已经阻止了什么>`
- `<当前没有自动修复>`

## 你的任务

1. 判断该异常产生的真实原因
2. 判断是应该补 anchor、更新 mapper、调整功能文档，还是标记为不应修复
3. 若能高置信度修复，直接给出 patch
4. 若不能高置信度修复，给出修复建议，不要盲目修改
5. 保持 `.coai/project`、`.coai/mapper`、`.coai/node` 的职责分离

## 输出要求

1. 先给出原因判断
2. 再给出修复方案
3. 如有高置信度，直接提供 patch
4. 如修复会影响 mapper / node / project，请明确列出应同步更新的文件
