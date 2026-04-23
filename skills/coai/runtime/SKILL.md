---
name: runtime
description: "Internal CoAI runtime sub-skill. Use for operational behavior: VS Code vs CLI vs hook, standard vs no-package-json init, git-sync, pre-commit, doctor, and bug-repair."
---

# CoAI Runtime

## Purpose

Use this file for operational CoAI behavior.

English `SKILL.md` is the primary agent-facing version.

Use `SKILL_ch.md` as the Chinese mirror for developer review and wording refinement.

This includes:

- VS Code commands
- CLI commands
- Git hook behavior
- git-sync
- pre-commit
- doctor
- bug-repair
- repository initialization

## High-Signal Runtime Rules

Keep these rules in working memory before explaining or running CoAI operations:

- VS Code owns interaction surfaces; CLI and Git hook own automation surfaces
- choose the runtime surface first, then explain or execute behavior
- `git-sync` maintains mapper alignment from Git-changed files
- `mapper line` is a system-maintained location field, not a normal agent-authored field
- `doctor` normalizes only the fixed anchor prefix and does not rewrite semantic anchor ids
- `pre-commit` runs the maintenance chain on changed files, stages only system-written CoAI maintenance outputs, and stays fail-open for CoAI cognition-layer bugs
- system auto-fix is limited to non-canonical anchor prefix normalization
- semantic issues such as `missing-anchor`, `duplicate-anchor`, `invalid-mapper`, and `missing-node` are detected, not auto-repaired
- Hover / Click must not silently rewrite source files
- standard mode and `--no-package-json` change only the cognition/tooling layer, not the host project's runtime or final artifact

## Fast Runtime Navigation

Use this map when the user is asking for the next operational step:

- editor interaction, Hover, Click, Problems, command palette: VS Code host
- init, update, doctor, pre-commit, hook install/uninstall/restore: CLI / Git hook
- keep mapper aligned after code movement: run `git-sync`
- align or refresh `mapper line`: run `git-sync`, not manual agent line editing
- normalize anchor prefix format across current changes: run `doctor` or rely on the automatic changed-files doctor inside `git-sync` / `pre-commit`
- prepare commit-time CoAI maintenance: run `pre-commit-check`
- handle open/fixed/resolved bug lifecycle: follow `bug-repair`
- decide whether `package.json` may be touched: choose standard init vs `--no-package-json`

## Runtime Surfaces

Choose the runtime surface first.

### VS Code host

Use for:

- Hover
- Ctrl/Cmd Click
- Problems panel
- command palette actions
- opening bug logs in the editor

### CLI / Git hook

Use for:

- `npx coai init`
- `npx coai init --no-package-json`
- `npx coai update`
- `npx coai doctor`
- `npm run coai:pre-commit-check`
- `npx coai pre-commit-check`
- hook installation / uninstall / restore
- `git commit` pre-commit behavior

Do not mix runtime explanations carelessly. Be explicit about which surface the user is asking about.

## Standard Mode vs `--no-package-json`

### Standard mode

Use when the host project is Node-friendly or accepts `package.json` as a CoAI tool entry layer.

Typical path:

- `npm install -D @5dc/coai`
- `npx coai init`

Behavior:

- `.coai/` is created
- `.coai/coai/` is created
- `package.json` is created or updated
- `coai:*` scripts are merged
- hook is installed

### Lightweight mode

Use when the host project should not create or modify `package.json`.

Typical path:

- `npx coai init --no-package-json`

Behavior:

- `.coai/` is created
- `.coai/coai/` is created
- `package.json` is not created or modified
- hook falls back to direct CLI usage instead of relying on `npm run`

### Boundary

Both modes affect only:

- source-repo cognition and development workflow

They should not affect:

- host-project business runtime
- host-project final distribution artifact

## git-sync

Current git-sync rules:

1. read Git changed files
2. auto-normalize non-canonical anchor prefixes only within changed files
3. build mapper reverse index
4. scan matched files for anchors
5. update mapper line numbers when needed
6. record unresolved semantic bugs

Line-maintenance rule:

- treat `line` as a cached location field maintained by the system
- do not use agent hand-editing as the default way to align `line`
- use `git-sync` as the normal maintenance entry
- use `pre-commit` as the commit-time maintenance wrapper around the same chain

### System auto-fix

System auto-fix includes:

- non-canonical anchor prefix
- prefix only, never `<id>`

### System detect only

System detects but does not auto-fix:

- `missing-anchor`
- `duplicate-anchor`
- `invalid-mapper`
- `missing-node`

### Human / AI repair

Semantic bug repair stays with AI or human decisions.

Operational relation:

- `doctor` may run first to canonicalize changed-file anchor prefixes
- `git-sync` then updates mapper locations and records unresolved semantic bugs
- `pre-commit` wraps this same chain and stages only system-owned maintenance outputs

## pre-commit

Current pre-commit order:

1. collect Git changed files
2. canonicalize non-standard anchor prefixes only within changed files
3. continue into git-sync
4. stage canonicalized source files written by the system
5. stage mapper files written by the system
6. stage resolved bug archive changes written by the system
7. unstage any open bug files that were mistakenly staged
8. fail-open for CoAI cognition-layer bugs

### Important boundary

Hover / Click should not auto-write source files.

Automatic write behavior belongs only in:

- `pre-commit-check`
- `Sync mapper from git changes`
- explicit `doctor`

Interaction-failure recovery rule:

- do not make Hover / Click silently run full maintenance by default
- if navigation fails and the likely cause is stale mapping, offer a one-time explicit `git-sync` recovery action
- if sync still does not fix navigation, continue into bug-repair or mapping diagnosis

## doctor

`doctor` has two forms:

### Explicit full-workspace doctor

- `npx coai doctor`
- `npm run coai:doctor`

Use when the user wants a full normalization pass.

### Automatic changed-files doctor

Use inside:

- git-sync
- pre-commit

This form should:

- scan only current Git changed files
- normalize only the fixed `@coai anchor` prefix
- continue the maintenance chain immediately

## bug-repair

Current bug-repair rule:

- AI or human maintains `open` and `fixed`
- system archives `resolved`
- open bugs may freeze mapper maintenance for affected code files
- resolved bugs may be reopened when the issue returns

Non-canonical anchor prefixes are not bug-repair items. They are system auto-fix items.

## Initialization

Initialization is runtime behavior, not asset-only behavior.

### Standard init

Use:

- `npx coai init`

### Lightweight init

Use:

- `npx coai init --no-package-json`

Initialization affects the host repository's cognition layer and CoAI tool layer only.

It does not redefine the host project's business framework or release pipeline.

## References

Use:

- `../references/workflows.md`
- `../references/ch/workflows.md`
- `../references/distribution.md`
- `../references/ch/distribution.md`

## Constraints

- do not confuse VS Code interaction with CLI automation
- do not directly edit hook files when command paths exist
- do not redefine feature ownership here
- do not treat CoAI cognition-layer bugs as host-project runtime bugs
