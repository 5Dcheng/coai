# Methodology

## Audience and usage

- `references/*` is the English primary reference tree for agent execution.
- `references/ch/*` is the Chinese mirror tree for Chinese developer review and wording refinement.
- Keep stable rules aligned across both trees.

## Feature boundary rules

- Define feature boundaries by scenario-event continuity.
- Allow a feature to span multiple source files.
- Split into a new feature only when goal, trigger, and processing chain clearly diverge.

Current feature set:

- `extension-entry`
- `navigation`
- `git-sync`
- `bug-repair`
- `cli`

## Source file rules

- Define source file boundaries by implementation isolation.
- Decide feature ownership first.
- Split source files when a change would otherwise keep destabilizing a stable module.
- Decide source-file ownership before implementation starts whenever structure is already clear.

## Implementation planning rule

- Do not treat CoAI assets as post-hoc documentation after code is already finished.
- Decide `anchor id` before implementation starts.
- Decide `file` before implementation starts when source-file ownership is already clear.
- Let mapper exist first as a semantic-and-structure skeleton.
- Let `line` be maintained later by the system.

Recommended loop:

`feature.md (cognition alignment + feature semantics) -> mapper skeleton (anchor ids first) -> src (implement and place anchors) -> agent writes anchor/file back into mapper -> system updates mapper line -> feature.md cognition backflow`

Use `feature.md` before coding to align understanding, then use it again after coding to absorb the improved cognition produced by the real implementation.

Responsibility split inside the loop:

- agent decides and writes new or changed `anchor` and `file` data into mapper
- the CoAI system maintains `line` through `git-sync` or `pre-commit`

Do not assume the first draft of the node flow is the final truth.

## Shared code and multi-semantic anchor rule

- When several business nodes map to the same implementation block, allow multiple distinct semantic anchors by default.
- Do not promote shared code into `utils/common` only because the file lives in `utils`, `common`, or another shared directory.
- Promote into `utils/common` only when the shared capability itself becomes a direct cognition entry point developers need to understand.

Trigger timing:

- before adding or changing mapper entries for shared code
- before adding or changing anchors in shared code
- before creating a `utils/common` feature doc

Default decision:

- if the shared code is only reused implementation, keep business-feature nodes and allow multiple semantic anchors near the same code block
- if the shared capability itself must be understood directly, add a common feature doc as an additional cognition layer

## `.coai` responsibilities

- AI adds new CoAI assets.
- The system maintains deterministic mapper updates and bug detection.
- AI handles semantic repair decisions.

Layer responsibilities:

- `project`: feature cognition and specification
- `contract`: structured data structures, core algorithms, and module-level communication interfaces when they are stable enough to guide future development
- `node`: Hover cognition
- `mapper`: code location
- `code`: actual implementation
- `.coai/current.md`: dynamic progress only
- `log/bugs`: bug lifecycle records

## Contract layer

The contract layer is optional and should stay lightweight.

Use `.coai/contract` only for current project agreements that are structured, high-signal, and useful before reading source code. The initial contract scope is limited to:

- object / data structures: complete JSON, SQL, or host-language type shapes that act as templates or implementation guidance, stored under `.coai/contract/object`
- algorithms: implementation idea, key code block, input, and expected output, so unit tests can be derived, stored under `.coai/contract/algorithm`
- communication interfaces: module-level request / response agreements aligned with `project/<module>.md`, stored under `.coai/contract/interface`

Do not turn contract into a full spec store.

Do not duplicate details that are already clearer in source code and reachable through feature tokens, mapper, or anchors.

Contract files should use normal Markdown links and file paths by default. Do not use `[[double-link tokens]]` in contract files unless contract mapper semantics are explicitly supported.

Contract should evolve with the project. Write it when a structure, algorithm, or interface has become the current reasonable agreement, and revise it when the implementation changes that agreement.

## CoAI cognition boundary

- CoAI is not a container for every thought generated during exploration; it stores settled project cognition.
- Do not default to writing raw exploration trails, direction changes, provisional hypotheses, or unresolved thinking into `.coai`.
- After trial and error, stable high-signal lessons may be added sparingly to the relevant feature doc when they still help later understanding, implementation, or maintenance.
- Preserve durable conclusions and meaningful tradeoffs, not the full replay of the search process.

## Add `project/<module>/<feature>`

Use this minimal order:

1. choose `<module>` by stable business or technical domain
2. choose `<feature>` by one continuous scenario
3. decide source-file ownership before implementation when structure is already clear
4. create `.coai/project/<module>/<feature>.md`
5. decide `anchor id` and create mapper skeleton
6. add `@coai anchor: <id>` while writing real code entry points
7. create `.coai/node/<module>/<feature>/` only for tokens that deserve hover cognition
8. update `.coai/current.md` only when project progress meaningfully changed

## Node-flow rule

- Write a node flow only when the feature has a real semantic flow that is stable enough to survive implementation.
- Do not force node flows for fields, object structures, or implementation details that do not meaningfully transfer data, state, or control.
- If the early node flow and the final code anchors diverge, prefer revising `feature.md` after implementation instead of forcing mapper to match an outdated flow.
- In early unstable phases, it is acceptable to write goals, constraints, and technical explanation first, then let real anchors help finalize the node flow later.

## Non-negotiable rules

- Keep `.coai` at the workspace root as `./.coai`.
- Keep `.coai/current.md` out of mapper/node semantics.
- Use `.coai/project/<module>.md` only when module-level semantics or feature relationships need explanation.
- Maintain feature docs by scenario continuity, not by source-file count.
