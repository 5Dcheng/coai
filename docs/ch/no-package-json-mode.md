# 无 `package.json` 模式设计说明

## 目标

这份文档用于定义 CoAI 在非 Node 主工程中的轻量接入方向，避免未来在 Python、Django、Flutter、Java 等项目里重复讨论同一个问题。

当前目标不是立刻实现，而是先把边界、适用场景和后续命令形态定清楚。

## 背景

当前 CoAI v1 的标准接入方式是：

```bash
npm install -D @5dc/coai
npx coai init
```

然后在目标仓库里写入：

- `.coai/`
- `.coai/coai/`
- `package.json` 中的 `coai:*` scripts
- 本地 `pre-commit` hook

这条路径适合：

- 本身已经使用 Node/TypeScript/JavaScript 的项目
- 可以接受在仓库根目录维护一份 Node 工具元数据的项目

但对于下面这类项目，心智负担会更明显：

- Python / Django
- Flutter / Dart
- Java / Spring
- Go
- Rust

这些项目的主工程并不依赖 Node 运行时，开发者可能不希望为了接入 CoAI，在根目录额外维护 `package.json`。

## 为什么需要这条模式

核心原因不是“技术上做不到”，而是“产品接入心智需要更轻”。

如果 CoAI 想成为跨技术栈的项目认知层，就不能默认要求所有宿主项目都接受：

- `package.json`
- `npm run coai:*`
- Node 工具链在仓库根目录可见

因此，未来需要一条轻量模式：

- 仍然允许使用 CoAI CLI
- 仍然允许安装 hook
- 仍然允许维护 `.coai/`
- 但不要求宿主项目根目录必须存在 `package.json`

## 标准模式 vs 轻量模式

### 标准模式

适用场景：

- Node / TypeScript / JavaScript 项目
- 团队可以接受在仓库根目录使用 `npm scripts`

特点：

- 使用 `package.json` 承接 `coai:*` scripts
- 使用 `npm run coai:*`
- 更适合当前 v1 的默认文档与测试链路

优点：

- 命令入口统一
- 文档更直观
- hook 管理更容易对齐

代价：

- 在非 Node 项目里会多出一套工具元数据

### 轻量模式

适用场景：

- Python / Django / Flask
- Flutter / Dart
- Java / Spring
- Go / Rust
- 团队不希望在仓库根目录维护 `package.json`

特点：

- 不依赖 `package.json`
- 不依赖 `npm run coai:*`
- 直接使用 `npx coai ...` 或等价的 CLI 调用

目标优点：

- 不污染宿主项目的主工程工具链心智
- 更适合多语言项目接入
- 让 CoAI 更像一套“外置认知层工具”，而不是强绑定 Node 项目结构

当前代价：

- 命令入口没有标准模式统一
- 初始化与 hook 需要单独设计

## 轻量模式的目标行为

未来轻量模式希望支持：

1. 宿主项目根目录没有 `package.json`
2. 仍然可以执行 CoAI 初始化
3. 仍然可以安装本地 `pre-commit` hook
4. 仍然可以执行：
   - `npx coai init`
   - `npx coai pre-commit-check`
   - `npx coai doctor`
   - `npx coai update`
5. 仍然可以维护：
   - `.coai/project`
   - `.coai/mapper`
   - `.coai/node`
   - `.coai/log/bugs`
   - `.coai/coai`

## 未来命令形态

未来更合理的 CLI 形态可能是：

### 标准模式

```bash
npm install -D @5dc/coai
npx coai init
npm run coai:pre-commit-check
```

### 轻量模式

```bash
npx coai init --no-package-json
npx coai pre-commit-check
npx coai doctor
npx coai update
```

或者：

```bash
npx coai init --lightweight
```

这类参数的职责是：

- 不写入 `package.json`
- 不合并 `coai:*` scripts
- hook 直接调用 CLI，而不是调用 `npm run`

## Hook 设计方向

轻量模式下，hook 不应依赖：

```bash
npm run coai:pre-commit-check
```

而应直接调用：

```bash
npx coai pre-commit-check
```

或未来更稳定的包内可执行入口。

这样可以让 hook 继续存在，但不要求宿主项目显式使用 npm scripts。

## 对宿主项目的影响

### 当前标准模式的影响

在 Python / Flutter / Django 项目里接入当前标准模式：

- 不会破坏主工程运行时
- 不会改变 Python / Dart / Java 的依赖解析
- 但会在仓库根目录增加一套 Node 工具元数据

这属于“工程管理层面影响”，而不是“业务运行层面影响”。

正式边界：

- CoAI 只作用于开发者源码仓库与开发流程
- CoAI 不应作用于宿主项目业务运行时
- CoAI 不应进入宿主项目最终面向用户的分发产物

因此，不论是标准模式还是轻量模式，CoAI 都应被视为“认知层开发资产”，而不是业务发布资产。

### 轻量模式希望降低的影响

轻量模式要降低的是：

- 开发者看到 `package.json` 的心理负担
- 仓库根目录额外工具入口的管理负担
- 非 Node 项目把 CoAI 误解成“必须引入 Node 工具链”的阻力

## 为什么现在先做设计、不做实现

当前更合适的选择是：

- 现在先做设计说明
- 暂不立刻实现

原因：

1. 这会影响初始化器、hook 模板、测试矩阵和文档入口
2. 会给 v1 增加新的接入分支，显著提高当前验证复杂度
3. 当前主线仍然是先把 npm + VSIX + skill 这条标准路径打磨稳定

所以这件事更适合：

- 现在定方向
- 后续进入 v2 实现

## 当前结论

当前正式结论如下：

- `无 package.json 模式` 是有价值的
- 它主要面向 Python / Flutter / Django / Java / Go / Rust 等非 Node 主工程项目
- 它应被定义为 v2 方向，而不是当前 v1 立即实现项
- 当前阶段先保留标准模式：
  - `npm install -D @5dc/coai`
  - `npx coai init`
- 轻量模式的后续目标是：
  - 不依赖 `package.json`
  - 不依赖 `npm run`
  - hook 直接调用 CoAI CLI

## 当前实现进度

目前已落地最小版本：

- `npx coai init --no-package-json`
- 初始化时跳过 `package.json` 创建与 scripts 合并
- hook 可在没有 `package.json` 的情况下直接调用 `npx coai pre-commit-check`

当前仍未实现的部分：

- 更细的轻量模式开关矩阵
- 自动识别宿主项目语言
- 专门面向 Poetry / Flutter pub / Maven / Gradle 的额外接入策略
