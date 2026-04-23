# Distribution

## Audience and usage

- `references/*` is the English primary distribution tree for agent execution.
- `references/ch/*` is the Chinese mirror tree for Chinese developer review and wording refinement.
- Keep package, template, and initialization boundaries aligned across both trees.

## v1 product boundary

CoAI v1 consists of:

- VS Code extension
- CLI entrypoints
- `.coai` template assets
- `coai init` initializer
- Git hook management
- methodology and integration docs

CoAI v1 does not include:

- complex project scaffolding beyond CoAI initialization
- AST-based generation
- automatic AI bug repair execution

## Delivery taxonomy

Treat deliverables as three coordinated layers:

### `coai`

- methodology
- usage guidance
- workflow rules for agents

### `template/.coai` and template assets

- target repository initialization source
- `.coai` project-workspace skeleton
- `.coai/coai/githooks/pre-commit`
- `.coai/coai/package.coai-scripts.json`
- hook policy docs

### `coai` system package

- VS Code extension
- CLI
- hook lifecycle
- shared core logic

## Target repository initialization

Install the CoAI package in the target repository:

```bash
npm install -D @5dc/coai
npx coai init
```

The initializer copies `.coai/`, merges scripts from `.coai/coai/package.coai-scripts.json`, updates `.gitignore`, and installs the local hook.

It writes these scripts into the target `package.json`:

- `coai:pre-commit-check`
- `coai:install-hook`
- `coai:install-hooks`
- `coai:uninstall-hook`
- `coai:restore-hook`
- `coai:init`

## Validation baseline

After initialization, confirm:

1. `npx coai init` succeeds
2. `npm run coai:pre-commit-check` succeeds
3. Hover and Click work in `.coai/project/**/*.md`
4. `git commit` triggers pre-commit CoAI check
