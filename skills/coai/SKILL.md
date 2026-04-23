---
name: coai
description: "Use this before discussing a feature, before writing code, and after finishing code for a CoAI-tracked project. It guides the CoAI loop by aligning cognition with feature.md, preparing a mapper skeleton with candidate anchor ids, implementing with real anchors, writing new or changed anchor and file data back into mapper, letting the system update mapper line locations, and writing improved cognition back into feature.md. Early node flow is a revisable semantic hypothesis, not a hard implementation constraint. This file must remain at skills/coai/SKILL.md so Codex can discover the `coai` skill."
---

# CoAI Skill

## Purpose

This root file is the stable discovery entry for the `coai` skill.

Do not delete this file while the skill should remain discoverable as `coai`.

Language policy:

- the English `SKILL.md` files are the primary agent-facing rule set
- the `*_ch.md` files are Chinese mirrors for Chinese developers to review and refine
- keep behaviorally equivalent content across the English main files and Chinese mirrors
- when a rule changes, update the English primary file first, then mirror it into the Chinese file

Use it as a lightweight router that decides which internal CoAI sub-skill to read next:

- `router/SKILL.md`
- `core/SKILL.md`
- `asset/SKILL.md`
- `runtime/SKILL.md`

## High-Signal Rules

Keep these rules in working memory even before reading deeper files:

- CoAI changes the cognition layer first, not the host project's runtime layer.
- Feature boundaries follow scenario-event continuity, not source-file count.
- Source-file boundaries follow implementation isolation, not feature-doc shape.
- `.coai` lives at the workspace root as `./.coai`.
- AI adds new CoAI assets, the system maintains deterministic mapping, and AI or humans make semantic repair decisions.
- `project` explains feature meaning, `node` explains hover cognition, `mapper` points to code, and `current.md` tracks only dynamic progress.
- Shared code may keep multiple semantic anchors; do not promote it to `utils/common` unless the shared capability itself becomes a cognition entry point.
- Use VS Code for interaction surfaces and CLI / Git hook for automation surfaces.
- CoAI stores settled cognition, not the full exploration trail.
- Stable lessons earned through trial and error may be written sparingly into the relevant feature doc; raw exploration history should stay out of `.coai`.
- `anchor id` should be decided before implementation starts.
- `mapper file` should usually be decided before implementation starts.
- `mapper line` must be maintained after implementation by the system.
- mapper should exist as an implementation-time skeleton, not as a post-hoc reconstruction after code is finished.

## Minimal Agent Flow

Use this minimal sequence when implementing or materially changing a CoAI-tracked feature:

1. confirm module / feature ownership
2. read the current `feature.md` together with the user goal to align cognition before coding
3. confirm source-file ownership before implementation
4. update or create `.coai/project/<module>/<feature>.md`
5. decide `anchor id` and mapper skeleton before writing code
6. write code and add `@coai anchor: <id>` at the same time
7. write new or changed `anchor` and `file` data back into mapper while implementing
8. let the system update mapper line data through `git-sync` or `pre-commit`
9. write the improved cognition back into `feature.md` after the implementation is validated

Canonical loop:

`feature.md (cognition alignment + feature semantics) -> mapper skeleton (anchor ids first) -> src (implement and place anchors) -> agent writes anchor/file back into mapper -> system updates mapper line -> feature.md cognition backflow`

## Special Attention

Pay extra attention to these distinctions:

- decide `anchor` before implementation; do not invent it after code is already finished
- decide `file` before implementation when structure is clear; only defer it when file ownership is still genuinely unresolved
- never wait until the end to build mapper from scratch
- treat mapper as a semantic-and-structure skeleton first, then let the system fill location details
- treat early node flow as a revisable semantic hypothesis, not a hard implementation contract
- do not force a node flow when the feature does not yet have a stable semantic flow that can survive implementation
- if the early node flow and real code anchors diverge, prefer revising `feature.md` after implementation instead of forcing mapper to fit an outdated flow
- use `core/SKILL.md` for boundary judgment, `asset/SKILL.md` for skeleton creation, and `runtime/SKILL.md` for deterministic maintenance

## Routing

This file stays minimal on purpose. Use it as the stable entry and route immediately:

- broad, mixed, or still-unclear task: `router/SKILL.md`
- feature boundary, source-file ownership, shared-code/common judgment, or whether `.coai` should change: `core/SKILL.md`
- `.coai/project`, `.coai/mapper`, `.coai/node`, `current.md`, templates, or examples: `asset/SKILL.md`
- VS Code vs CLI, init, update, doctor, git-sync, pre-commit, bug-repair, or hook behavior: `runtime/SKILL.md`

## References

Shared stable references remain under:

- `references/methodology.md`
- `references/distribution.md`
- `references/workflows.md`
- `references/templates/*`
- `references/examples/*`
- `references/ch/*`

Reference boundary:

- `references/*` is the English primary reference tree
- `references/ch/*` is the Chinese mirror reference tree
- do not mix Chinese-only operational rules into the English primary files unless they are also reflected in English
- use `references/*` for agent execution rules and `references/ch/*` for Chinese developer review and wording refinement

Read only what is necessary for the current task.
