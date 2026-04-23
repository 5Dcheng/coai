# 升级路径

这份文档只回答三件事：

1. CoAI 包怎么升级
2. 当前项目里的 `.coai/coai` 系统资产怎么同步
3. 本机 Codex skill 怎么同步

## 1. 升级 CoAI 包

CoAI 包本身的升级，仍然交给包管理器。

推荐命令：

```bash
npm install -D @5dc/coai@latest
```

如果你只是想先看有没有新版本，可先执行：

```bash
npx coai check-update
```

说明：

- `check-update` 只检查版本，不修改本地文件
- 真正升级包版本，仍然使用 `npm install`
- `version` 与 `check-update` 都会顺手提示升级后的常见下一步动作

## 2. 同步 `.coai/coai` 系统资产

当包升级后，当前项目中的 CoAI 系统资产不会自动全部改写。

推荐命令：

```bash
npx coai update
```

或使用语义化别名：

```bash
npx coai coai sync
```

这两个命令等价，都会同步当前项目中的：

- `.coai/coai/`
- `package.coai-scripts.json` 对应的 scripts 合并
- CoAI hook 安装状态

它不会覆盖：

- `.coai/project/`
- `.coai/mapper/`
- `.coai/node/`
- `.coai/log/bugs/open/`

也就是说，它更新的是“系统资产层”，不是“项目认知层”。

如果你刚刚升级过包，通常下一步就应该执行这一条。

## 3. 同步本机 Codex skill

如果仓库中的 `skills/coai/` 已经更新，而你希望本机 Codex 立刻用上最新版 skill，可以执行：

```bash
npx coai skill sync
```

它会把仓库中的：

```text
skills/coai/
```

同步到本机 Codex skill 目录：

```text
%USERPROFILE%/.codex/skills/coai
```

说明：

- 当前安装包中的 `skills/coai/` 是默认同步来源
- 本机 Codex 目录里的 skill 是同步副本
- 如果当前就在 CoAI 开发仓库中工作，可使用 `npx coai skill sync --dev`
- 执行 `skill sync` 后，建议新开一个 Codex 会话，确保加载的是最新版 skill

## 推荐升级顺序

如果你已经在一个项目里接入了 CoAI，推荐按这个顺序升级：

1. 升级包

```bash
npm install -D @5dc/coai@latest
```

2. 同步当前项目系统资产

```bash
npx coai update
```

3. 同步本机 Codex skill

```bash
npx coai skill sync
```

## 状态查看入口

如果你不确定当前该不该升级，或想先确认本地状态，可执行：

```bash
npx coai version
npx coai check-update
```

这两个命令都会顺手提示常见后续动作：

- `npx coai update`
- `npx coai skill sync`

## 最简记忆

- 包升级：`npm install -D @5dc/coai@latest`
- 项目系统资产同步：`npx coai update`
- 本机 skill 同步：`npx coai skill sync`
