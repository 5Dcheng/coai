# CoAI Repair Prompt Template

你正在修复一个 CoAI 映射异常。

## 异常信息

- 异常类型：`<type>`
- 功能文档：`<project file>`
- mapper 文件：`<mapper file>`
- token：`<token>`
- anchor：`<anchor>`
- 代码文件：`<code file>`

## 系统检测结果

- `<系统检测结果>`

## 你的任务

1. 判断该异常的真实原因
2. 决定是补 anchor、更新 mapper、调整功能文档，还是不修复
3. 若置信度高，直接给出 patch
4. 保持 `.coai` 职责分离

## 输出要求

1. 原因判断
2. 修复方案
3. 可选 patch
