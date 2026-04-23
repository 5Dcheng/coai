# 仓库结构说明

## 目标

这个仓库同时包含两类内容：

1. VS Code 插件本体
2. 用于验证插件行为的测试样例工作区

为了避免职责混淆，目录约束如下。

## 顶层目录

```text
coai_v1/
├── src/
├── test/workspace/
├── out/
├── docs/
├── package.json
├── tsconfig.json
└── README.md
```

## `src/`

用途：

- 只存放 VS Code 插件源码
- 只放会被 TypeScript 编译到 `out/` 的实现文件

约束：

- 不放测试样例
- 不放演示用 `.coai` 数据
- 不放业务代码镜像

当前入口：

- `src/extension.ts`
- `src/gitSync.ts`

## `test/workspace/`

用途：

- 作为 Extension Development Host 的测试工作区
- 提供最小可运行的 `.coai/project`、`.coai/mapper`、`.coai/node`
- 提供被 mapper 指向的示例代码

约束：

- 所有测试样例都集中在这里
- 不参与插件本体编译

当前内容：

```text
test/workspace/
├── .coai/
│   ├── project/
│   ├── mapper/
│   └── node/
└── src/sample/
```

## `out/`

用途：

- TypeScript 编译输出目录
- VS Code 实际加载的插件运行产物

约束：

- 不手动编辑
- 允许删除后重新构建
- 目录内容应完全由 `npm run build` 生成

当前行为：

- `npm run build` 会先清空 `out/`，再重新编译，避免旧产物残留

## `docs/`

用途：

- 存放仓库维护文档
- 放 README 不适合展开的结构性说明

建议：

- 架构设计继续以 README 为入口
- 仓库约束、目录规范、维护规则放到 `docs/`
- 手动验证流程放到 `docs/manual-verification.md`
