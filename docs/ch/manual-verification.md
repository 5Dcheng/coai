# 手动验证

## Git 增量维护

目标：

验证 `CoAI: Sync mapper from git changes` 能根据 Git 变更与 `@coai anchor` 重新定位 mapper 行号，并在必要时自动修正非标准 anchor 前缀。

推荐测试方式：

1. 准备一个独立 Git 工作区，并确保 `.coai/project`、`.coai/mapper`、目标代码文件都在同一个仓库内。
2. 在代码文件中插入或删除若干空行，让某个 `@coai anchor` 的真实行号变化。
3. 或故意把某一行写成 `@coai anchor <id>`，制造固定前缀格式问题。
4. 保持对应 `.mapper.json` 中的旧 `line` 不变。
5. 在 Extension Development Host 中打开该 Git 工作区。
6. 执行命令 `CoAI: Sync mapper from git changes`。
7. 打开 `Output -> CoAI Navigation` 查看同步明细。
8. 确认对应 mapper 项的 `line` 与 `lastUpdated` 已更新；若存在固定前缀问题，确认源码已被自动修正为标准格式。
9. 回到功能文档，执行 Ctrl/Cmd + Click，确认能跳到正确代码位置。

预期结果：

- 只扫描 Git 变更文件
- 只处理已存在于 mapper 中的节点
- 行号未变化的节点显示 `Skip`
- 行号变化的节点显示 `Update`
- anchor 前缀不标准时显示 `Fix`
- anchor 缺失、重复、文件缺失或 mapper 非法时显示 `Fail`
- 命中未处理 bug 的代码文件显示 `Freeze`

## 提交前检查

目标：

验证 `CoAI: Run pre-commit CoAI check` 会先执行 changed-files doctor，再执行 git-sync，并根据 open bug 状态给出提交前提示。

步骤：

1. 在当前工作区制造一个会被 git-sync 识别的问题，或保留一个现有 open bug。
2. 可选：制造一个非标准 anchor 前缀。
3. 执行命令 `CoAI: Run pre-commit CoAI check`。
4. 打开 `Output -> CoAI Navigation` 查看执行明细。
5. 若存在 bug，验证命令提示可直接打开第一个 bug 日志。
6. 若没有 bug，验证命令提示“提交前检查通过，可继续提交”。

预期结果：

- Output 中先出现 changed-files doctor 明细，再出现 git-sync 明细
- 有 open bug 时追加 `[PreCommit] pass with warnings: ... open bugs kept in working tree`
- 无 open bug 时追加 `[PreCommit] pass`
- 若本次检查过程中实际规范化了源码中的 anchor 前缀，这些源码文件会被自动加入暂存区
- 若本次检查过程中实际写回了 mapper，则这些 mapper 文件会被自动加入暂存区
- fixed / wont_fix / obsolete bug 被归档到 resolved 后，对应 resolved bug 文件会被自动加入暂存区
- open bug 文件不会被系统自动加入暂存区；如果已被暂存，会被自动退回修改区
- 命令只做提交前检查提示，不直接执行真实 `git commit`

## CLI 与 Hook

目标：

验证终端 CLI 与本地 `pre-commit` hook 都能调用同一条 CoAI 提交前检查能力。

步骤：

1. 在项目根目录执行 `npm run build`。
2. 在终端执行 `npm run coai:pre-commit-check`。
3. 观察终端输出是否包含 doctor 明细、git-sync 明细与 `[PreCommit] pass` / `pass with warnings`。
4. 执行一次 `git commit`，确认本地 `.git/hooks/pre-commit` 会自动调用同一脚本。

预期结果：

- CLI 不依赖 VS Code 命令面板即可独立运行
- hook 会在 `git commit` 前隐式执行 CLI
- CoAI open bug 不阻止宿主项目提交，只输出 warning
- 非标准 anchor 前缀会被自动修正
- mapper 成功维护后会自动暂存
- fixed / wont_fix / obsolete bug 归档到 resolved 后会自动暂存
- open bug 文件如果已暂存，会被自动退回修改区

## Hook 安装

目标：

验证 `install-hook` 能自动把 `./.coai/coai/githooks/pre-commit` 安装到 `.git/hooks/pre-commit`，并在必要时备份旧 hook。

步骤：

1. 执行 `npm run build`。
2. 执行 `npm run coai:install-hook`，或在 VS Code 命令面板执行 `CoAI: Install local pre-commit hook`。
3. 检查 `.git/hooks/pre-commit` 是否已写入 CoAI hook 内容。
4. 若本地原本存在未知 hook，检查是否生成了 `.git/hooks/pre-commit.coai.backup`。

预期结果：

- 安装命令不依赖手工复制 hook 文件
- 遇到未知旧 hook 时会先备份
- 安装后的 `.git/hooks/pre-commit` 可直接在 `git commit` 时触发 CoAI 检查
- `npx coai init` 可作为目标项目首次初始化入口
- `npm run coai:install-hooks` 与 `npm run coai:init` 可作为初始化后的团队维护入口

## Hook 卸载与恢复

目标：

验证 CoAI 只能卸载自己管理的 hook，并且能从备份恢复旧 hook。

步骤：

1. 先执行一次 `npm run coai:install-hook`。
2. 执行 `npm run coai:uninstall-hook`，或在 VS Code 命令面板执行 `CoAI: Uninstall local pre-commit hook`。
3. 检查 `.git/hooks/pre-commit` 是否已被删除。
4. 如果存在 `.git/hooks/pre-commit.coai.backup`，执行 `npm run coai:restore-hook`，或在 VS Code 命令面板执行 `CoAI: Restore pre-commit hook backup`。
5. 检查 `.git/hooks/pre-commit` 是否已恢复为备份内容。

预期结果：

- 只有 CoAI 管理 hook 才允许被直接卸载
- 没有备份时恢复命令会明确失败
- 存在备份时可恢复旧 hook 内容

## Hover 与 Click 回归

目标：

验证 git-sync 与自动前缀修复接入后，没有破坏原有双链行为。

步骤：

1. 打开 `.coai/project/**/*.md`
2. Hover `[[token]]`，确认 node 信息仍正常显示
3. Ctrl/Cmd + Click `[[token]]`，确认仍能跳到代码

预期结果：

- Hover 正常读取 `.coai/node`
- Click 正常读取 `.coai/mapper`
- 点击后的即时 anchor 校正仍然生效

## 异常样例工作区

以下目录用于稳定复现 git-sync 的异常路径：

- `test/cases/missing-anchor-workspace`
  预期：输出 `anchor missing`，并生成 `.coai/log/bugs/open/missing-anchor__*.json`
- `test/cases/duplicate-anchor-workspace`
  预期：输出 `duplicate anchors`，并生成 `.coai/log/bugs/open/duplicate-anchor__*.json`
- `test/cases/invalid-mapper-workspace`
  预期：输出 `Invalid mapper JSON`，并生成 `.coai/log/bugs/open/invalid-mapper__*.json`

使用方式：

1. 将对应目录单独初始化为 Git 工作区，或复制到独立测试仓库中。
2. 在 Extension Development Host 中直接打开该 case 根目录作为工作区，不要从 `coai_v1` 父目录进入。
3. 对 `src/sample/registerFlow.ts` 做一次保存或修改，制造 Git 变更。
4. 执行 `CoAI: Sync mapper from git changes`。
5. 在 `Output -> CoAI Navigation` 中确认是否出现预期错误。
6. 对 `missing-anchor`、`duplicate-anchor` 与 `invalid-mapper`，再确认 `.coai/log/bugs/open/` 下是否写出了对应 bug 文件。
7. 再确认 `Problems` 面板中是否出现对应 bug 日志项。

## Bug 状态流转

目标：

验证 open bug 能被显式流转到 `resolved/`。

步骤：

1. 在工作区内先制造一个 open bug 文件
2. 执行命令 `CoAI: Resolve open bug log`
3. 选择目标 bug
4. 选择 `fixed`、`wont_fix` 或 `obsolete`
5. 输入本次流转说明

预期结果：

- 原文件从 `.coai/log/bugs/open/` 移走
- 新文件写入 `.coai/log/bugs/resolved/`
- bug JSON 中的 `status` 与 `resolution` 已更新
- `Problems` 面板中的对应问题被移除

## Bug Reopen

目标：

验证 resolved bug 能重新退回 open。

步骤：

1. 先准备一个位于 `.coai/log/bugs/resolved/` 的 bug 文件
2. 执行命令 `CoAI: Reopen resolved bug log`
3. 选择目标 bug
4. 输入 reopen 原因

预期结果：

- 原文件从 `.coai/log/bugs/resolved/` 移走
- 新文件写入 `.coai/log/bugs/open/`
- bug JSON 中的 `status` 变回 `open`
- `Problems` 面板重新出现对应问题
