---
name: router
description: "Internal CoAI router sub-skill. Use from the root coai skill to classify a task and choose the minimal execution chain across core, asset, and runtime."
---

# CoAI Router

## Purpose

This file is the internal task classifier for the `coai` skill.

English `SKILL.md` is the primary agent-facing version.

Use `SKILL_ch.md` only as the Chinese mirror for developer review and wording refinement.

Use it when the request is broad, mixed, or still ambiguous.

Its job is to decide:

- whether the request is mostly about thinking, asset maintenance, or runtime execution
- whether one sub-skill is enough
- whether the task needs a chained execution order such as `core -> asset`

## Primary Classification

Classify the request into one of these four shapes.

### 1. Reasoning-first task

Use only `core/SKILL.md` when the user is mainly asking:

- which module / feature something belongs to
- whether a capability is a new feature or part of an existing feature
- whether shared code should stay as multiple semantic anchors or be promoted into a `utils/common` feature
- whether `.coai` needs to change at all
- how to split a feature or source file

Typical examples:

- "Which feature should own this capability?"
- "Should this shared capability become a common feature?"
- "Should this stay in the current source file or move into a new file?"

### 2. Asset-only task

Use only `asset/SKILL.md` when feature ownership is already known and the user is clearly asking to create or update CoAI assets such as:

- `.coai/project`
- `.coai/mapper`
- `.coai/node`
- `current.md`

Typical examples:

- "Add the mapper for this feature."
- "Create the node file for this token."
- "Update current.md."

### 3. Runtime-only task

Use only `runtime/SKILL.md` when the request is operational:

- how to run a command
- VS Code vs CLI differences
- git-sync
- pre-commit
- doctor
- bug-repair
- standard init vs `--no-package-json`

Typical examples:

- "How do I start it?"
- "How do I use pre-commit?"
- "What is the difference between standard mode and no-package-json?"

### 4. Mixed task

Use a chained flow when the request crosses thinking, asset change, and execution.

This is the most common real CoAI task shape.

## Execution Chains

Use the smallest chain that fully covers the request.

### `core`

Use only `core` when the task stops at judgment or design and does not yet require asset edits or command execution.

### `core -> asset`

Use this when the request requires:

1. deciding feature ownership or CoAI scope
2. then creating or updating `.coai` artifacts

Typical examples:

- add a new feature doc after deciding module / feature
- decide whether a shared implementation should stay multi-anchor, then update mapper / node / docs
- decide whether a change belongs to an existing feature, then update that feature's `.coai`

### `runtime`

Use only `runtime` when the task is purely operational and does not require feature-boundary reasoning or asset generation.

### `core -> asset -> runtime`

Use this when the request spans:

1. classification
2. CoAI asset maintenance
3. command or workflow execution

Typical examples:

- create a new CoAI feature and then initialize or verify it
- change feature boundaries, update `.coai`, then run git-sync / pre-commit
- decide init mode, update docs / assets, then validate runtime behavior

### `runtime -> asset`

Use this only when runtime behavior surfaces a problem first, and then `.coai` needs follow-up maintenance.

Typical examples:

- bug-repair reveals that docs, mapper, or node semantics must be updated
- git-sync detects a problem that requires a CoAI asset correction after the operational diagnosis

### `runtime -> asset -> core`

This is rare. Use it only when a runtime problem forces asset updates and those updates expose a deeper feature-boundary question.

Do not use this path by default.

## Routing Rules

Follow these rules every time.

### Rule 1: Never skip classification when feature ownership is unclear

If you are not sure whether something is:

- a new feature
- part of an existing feature
- a shared capability that deserves its own cognition entry

then start with `core`.

### Rule 2: Never jump into asset generation before boundary judgment

Do not create `.coai/project`, `.coai/mapper`, or `.coai/node` first and reason later.

### Rule 3: Runtime does not own feature-boundary decisions

`runtime` can operate commands and explain workflows, but it should not invent or redefine feature ownership by itself.

### Rule 4: Asset does not own runtime policy

`asset` can create files and maintain `.coai`, but it should not redefine CLI / hook / VS Code behavior.

### Rule 5: Prefer the minimal chain

Do not read all sub-skills by reflex.

Use only what the request actually needs.

## Context That Must Be Carried Forward

When chaining sub-skills, keep these stable:

- module
- feature
- scenario description
- current change scope
- whether the host project is standard mode or `--no-package-json`
- whether the project language is Node or non-Node

Do not repeatedly re-infer the same boundary if it has already been established in the same task.

## Special CoAI Routing Cases

### Shared code with multiple business nodes

Route to `core` first if the question is:

- should these nodes share one common feature?
- should we keep multiple semantic anchors on the same implementation block?

Only after that should `asset` update mapper / node / feature docs.

### Host project initialization mode

Route to `runtime` first if the question is:

- should this repo use standard init or `--no-package-json`?

If the user also wants docs or skill wording updated afterward, then chain into `asset` or `core` as needed.

### Developer-project product role questions

If the question is about what CoAI changes in a host project, route to:

- `core` for conceptual role boundaries
- `runtime` for standard vs lightweight operational differences

Use both if necessary.

## Constraint

This file is only a router.

Do not let it become another heavy monolithic skill.

Its job is to decide where to go next, not to duplicate the full contents of `core`, `asset`, or `runtime`.
