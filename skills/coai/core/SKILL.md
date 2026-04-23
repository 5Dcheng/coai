---
name: core
description: "Internal CoAI core sub-skill. Use for feature-boundary reasoning, module/feature classification, shared-code cognition rules, and deciding whether `.coai` must change."
---

# CoAI Core

## Purpose

Use this file for thinking tasks, not operational tasks.

English `SKILL.md` is the primary agent-facing version.

Use `SKILL_ch.md` as the Chinese mirror for developer review and wording refinement.

Its job is to decide:

- which module / feature owns a change
- whether a capability belongs to an existing feature or a new one
- whether `.coai` should be created or updated
- whether shared code should remain under business-feature cognition or be promoted into a `utils/common` cognition entry

## High-Signal Core Rules

Keep these rules in working memory before making any boundary decision:

- decide feature ownership before asset generation and before implementation
- decide source-file ownership after feature ownership, not before it
- define feature by one continuous scenario, not by file name, helper name, or implementation fragment
- define source file by implementation isolation, not by feature-doc shape
- shared code does not become `utils/common` by directory location alone
- promote shared code into `utils/common` only when the shared capability itself becomes a direct cognition entry point
- update `.coai` only when cognition changed, not for every internal refactor
- stabilize module / feature -> source file -> node semantics -> `anchor id` -> mapper skeleton before writing code

## Fast Core Navigation

Use this map when the next judgment is already clear:

- decide whether this is an old feature or a new feature: use the feature boundary chain
- decide whether code stays in the current file or moves into a new file: use the source-file ownership chain
- decide whether shared code stays under business features or becomes `utils/common`: use the shared-code promotion chain
- decide whether `.coai` needs changes at all: use the `.coai` change checklist

## Feature Boundary Chain

Use this shortest judgment chain:

1. identify the scenario the change serves
2. check whether goal, trigger timing, and processing chain still match an existing feature
3. if they still match, keep the change inside that feature
4. only create a new feature when those three dimensions clearly diverge

## Source-File Ownership Chain

Use this shortest judgment chain:

1. confirm feature ownership first
2. check whether the implementation can stay in the current file without destabilizing a stable module
3. if yes, keep it in the current file
4. if no, split into a new file by implementation isolation

## Shared-Code Promotion Chain

Use this shortest judgment chain:

1. check whether the code is merely shared implementation reused by business features
2. if yes, keep business-feature cognition and allow multiple semantic anchors when needed
3. check whether the shared capability itself has become something developers must understand directly
4. only then add or promote a `utils/common` cognition entry

## Feature Boundary Rules

Use these rules first.

- Feature boundaries are defined by scenario-event continuity.
- A feature may span multiple source files.
- Create a new feature only when goal, trigger timing, and processing chain clearly diverge.

Current main feature families in this repository are:

- `extension-entry`
- `navigation`
- `git-sync`
- `bug-repair`
- `cli`

## Source File Rules

Use these rules after feature ownership is known.

- Source-file boundaries are defined by implementation isolation.
- Decide feature ownership before deciding file ownership.
- Split source files when leaving the code in the current file would keep destabilizing a stable module.
- Decide source-file ownership before implementation starts whenever structure is already clear.

Feature boundary and source-file boundary are related, but they are not the same thing.

## Implementation Planning Rule

Before writing code, stabilize these decisions in order:

1. module / feature ownership
2. source-file ownership
3. node semantics
4. `anchor id`
5. mapper skeleton ownership

Use this rule to prevent CoAI assets from becoming post-hoc reconstruction work.

## Module / Feature Classification

### Module

Choose a module by stable business or technical domain.

Examples:

- `auth`
- `order`
- `plugin`
- `common`

Do not choose a module purely from a file path if the cognition domain is broader or narrower than the path.

### Feature

Choose a feature by one continuous scenario, not by:

- source-file name
- implementation detail
- one isolated helper function

Good examples:

- `register`
- `checkout`
- `git-sync`
- `bug-repair`

Bad examples:

- `utils`
- `controller`
- `api-helper`

unless the shared capability itself has become a direct cognition target.

## Shared Code And Multi-Semantic Anchor Rule

This is a mandatory reasoning checkpoint.

When several business nodes map to the same implementation block:

- default to allowing multiple distinct semantic anchors near the same code block
- do not promote the code into a `utils/common` feature only because it lives in a shared directory
- promote into a `utils/common` feature only when the shared capability itself has become a cognition entry point developers need to understand directly

### Trigger Timing

Apply this rule before:

- adding a new mapper entry for shared code
- adding or changing anchors in shared code
- creating a new `utils/common` feature doc
- collapsing multiple business nodes into one common cognition entry

### Default Decision

If the shared code is only reused implementation:

- keep the business-feature nodes
- allow multiple semantic anchors near the same implementation block

If the shared code itself must be understood directly:

- add a separate `utils/common` feature doc
- keep the business-feature nodes if they still matter
- treat the common feature as an added cognition layer, not a replacement by default

## `.coai` Change Decision

Use this checklist to decide whether `.coai` must change.

Update `.coai` when:

- feature intent changed
- module / feature ownership changed
- anchor semantics changed
- mapper targets changed
- node cognition changed
- a new feature was added
- `current.md` should reflect meaningful project progress

Do not update `.coai` just because:

- internal code was refactored without changing functional cognition
- a file moved but the feature cognition stayed equivalent and deterministic maintenance will recover the mapping
- a shared helper changed but no feature-level meaning changed

## `.coai` Responsibility Rule

Keep these responsibilities clear:

- AI adds new CoAI assets
- the system maintains deterministic mapper updates and bug detection
- AI or humans handle semantic repair decisions

Layer responsibilities:

- `project`: feature cognition and specification
- `node`: hover cognition
- `mapper`: code location
- `current.md`: dynamic progress only
- `log/bugs`: bug lifecycle context

## Host Project Role Boundary

When reasoning about a CoAI-enabled host project, keep this model:

- cognition output: `.coai/`
- source output: the host project's real code, in any language/framework
- distribution output: the host project's own release artifact

CoAI changes the cognition layer.

It should not redefine the host project's language/framework choice and should not become the host project's runtime or final distribution artifact.

## References

Read these when needed:

- `../references/methodology.md`
- `../references/ch/methodology.md`
- `../references/distribution.md`
- `../references/ch/distribution.md`

Do not improvise a boundary rule when a stable repository rule already exists.

## Constraints

- Do not classify features by source-file count.
- Do not promote shared code into common cognition by reflex.
- Do not create `.coai` assets before feature ownership is clear.
- Do not confuse cognition-layer changes with runtime-layer changes.
