# Workflows

## Audience and usage

- `references/*` is the English primary workflow tree for agent execution.
- `references/ch/*` is the Chinese mirror tree for Chinese developer review and wording refinement.
- Keep command semantics and workflow order aligned across both trees.

## Runtime modes

### VS Code host

Use for:

- Hover
- Click
- Problems
- command palette actions
- opening bug logs in the editor

Typical files:

- `src/extension.ts`
- `src/navigation.ts`
- `src/bugLog.ts`
- `src/preCommitCheck.ts`
- `src/hookInstaller.ts`

### CLI / Git hook

Use for:

- `npm run coai:pre-commit-check`
- `npm run coai:install-hook`
- `npm run coai:install-hooks`
- `npm run coai:uninstall-hook`
- `npm run coai:restore-hook`
- `npx coai doctor`
- `git commit` implicit pre-commit checks

Typical files:

- `src/cli/coaiCli.ts`
- `src/core/gitSyncCore.ts`
- `src/core/preCommitCore.ts`
- `src/core/hookInstallerCore.ts`
- `.coai/coai/githooks/pre-commit`

## git-sync flow

1. Read Git workspace changed files.
2. Normalize non-canonical anchor prefixes only within changed files.
3. Match them against mapper-referenced code files.
4. Update mapper line numbers when anchors move.
5. Detect `missing-anchor`, `duplicate-anchor`, and `invalid-mapper`.
6. Write bug logs for unresolved semantic issues.

Line maintenance rule:

- treat `mapper.line` as a system-maintained cached location field
- do not use agent hand-editing as the normal way to maintain it
- run `git-sync` after implementation changes when line alignment needs refresh
- let `pre-commit` wrap the same maintenance chain before commit

Anchor parsing rule:

- canonical generated format: `@coai anchor: <id>`
- tolerated legacy / repair format during parsing: `@coai anchor <id>`
- `coai doctor` may normalize the fixed prefix back to `@coai anchor: ` without changing `<id>`
- automatic pre-commit / git-sync doctor should scan only current Git changed files

Repair ownership rule:

- system auto-fix: non-canonical anchor prefix, prefix only, never `<id>`
- system detect only: `missing-anchor`, `duplicate-anchor`, `invalid-mapper`, `missing-node`
- AI / human repair: semantic bugs that require judgment

Interaction recovery rule:

- do not make navigation silently trigger full maintenance by default
- when navigation fails and stale mapping is the likely cause, provide a one-time explicit `git-sync` recovery action
- if sync still fails, continue into bug-repair or mapping diagnosis

## bug-repair flow

1. Keep `open` and `fixed` under AI or human control.
2. Let the system archive `resolved`.
3. Freeze mapper updates for files blocked by open bugs.
4. Reopen resolved bugs when the issue returns.

Repair rule:

- when an issue is fixed, update the bug `status` to `fixed`
- do not manually move files from `open/` to `resolved/` in normal host-project repair flow

## pre-commit flow

1. Run `coai:pre-commit-check` manually or through Git hook.
2. Collect Git changed files and canonicalize non-standard anchor prefixes only within those files.
3. Run git-sync on the same maintenance chain.
4. Stage only source files rewritten by system canonicalization.
5. Stage only mapper files written by the system.
6. Stage only bug files archived to `resolved/` by the system.
7. Keep `open` bug logs in the working tree; if they were staged, unstage them.
8. Do not block host-project commits for CoAI bugs; report warnings and keep context for later repair.
9. Do not stage unrelated user changes.
