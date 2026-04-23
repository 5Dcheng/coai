---
name: asset
description: "Internal CoAI asset sub-skill. Use for creating and updating `.coai` artifacts, using templates/examples correctly, and maintaining `current.md` without polluting feature cognition."
---

# CoAI Asset

## Purpose

Use this file when the task is to create or update CoAI assets after the feature boundary is already known.

English `SKILL.md` is the primary agent-facing version.

Use `SKILL_ch.md` as the Chinese mirror for developer review and wording refinement.

This includes:

- `.coai/project`
- `.coai/mapper`
- `.coai/node`
- `.coai/log/bugs` templates or repair prompts
- `.coai/current.md`

## High-Signal Asset Rules

Keep these rules in working memory before generating any asset:

- create `project` first, then anchors, then mapper, then node, then `.coai/current.md`
- decide `anchor` before implementation starts
- decide `file` before implementation starts when structure is already clear
- let mapper exist as a pre-implementation skeleton instead of a post-implementation reconstruction
- agent owns `anchor` and `file` updates in mapper
- the CoAI system owns `line` maintenance in mapper
- use templates as the default generation source
- use examples only to understand shape, density, and style after templates prove too abstract
- do not copy examples as if they were templates
- do not leave placeholders such as `<module>` or `<feature>` in a real repository
- create only the assets the current task actually requires
- keep `.coai/current.md` as dynamic progress, never as a second feature doc
- module docs such as `.coai/project/<module>.md` are optional and should exist only when module-level semantics or feature relationships need explanation
- keep `.coai` for settled cognition, not for full exploration history
- add trial-and-error lessons only when they have become stable, high-value guidance for future understanding, implementation, or maintenance

## Fast Asset Navigation

Use this map when the next action is already known:

- add a new feature cognition entry: create `.coai/project/<module>/<feature>.md`
- add a module cognition entry when needed: create `.coai/project/<module>.md`
- bind the feature to code: decide `anchor` and mapper skeleton first, write `@coai anchor: <id>` in real code, write `anchor` and `file` back into mapper, then let the system align `line`
- add hover cognition: create `.coai/node/<module>/<feature>/` only for tokens that deserve hover help
- update project progress only: edit `.coai/current.md`
- generate bug/repair support material only when the task explicitly needs bug log templates or repair prompts

## Creation Order

Follow this order unless the task is clearly narrower.

1. Create or update `.coai/project/<module>/<feature>.md`
2. Add anchors in source code when concrete code entry points exist
3. Create or update `.coai/mapper/<module>/<feature>.mapper.json`
4. Create node files under `.coai/node/<module>/<feature>/` only for nodes that need hover cognition
5. Update `.coai/current.md` if the change is meaningful project progress

Do not create mapper entries without a stable anchor id or candidate anchor id.

Do not create node files before you know which tokens actually deserve hover cognition.

Mapper skeleton rule:

- create mapper as a semantic-and-structure skeleton during planning
- keep `anchor` mandatory in the skeleton
- set `file` in the skeleton when source-file ownership is already clear
- if `file` is not clear yet, keep the mapper entry as an anchor-only skeleton and let runtime report it as `Warn`, not `Fail`
- update `anchor` and `file` when implementation makes them real or changes them
- let `line` be aligned later by `git-sync` or `pre-commit`

## What To Create

### Project doc

Create or update a project doc when:

- module-level positioning, feature relationships, or shared data flow needs explanation
- a new feature is added
- feature cognition materially changes
- a major branch/exception rule needs to be documented

### Mapper

Create or update mapper when:

- there are real code entry points
- there are stable anchors or anchor plans already in place

### Node

Create or update node when:

- hover cognition is useful
- the node needs intent / logic / risk / scale explanation

### `.coai/current.md`

Update `.coai/current.md` when:

- a new meaningful feature is created
- a meaningful feature milestone is completed
- runtime/product boundary changes affect the current working context
- the next agent needs a stable resume point

## Template And Example Usage

Use templates first.

Only use examples when templates are too abstract.

Boundary:

- templates are canonical generation skeletons
- examples are illustrative references
- template first, example second
- never treat an example as a drop-in production asset

### Templates

Start from:

- `../references/templates/feature.md`
- `../references/templates/current.md`
- `../references/templates/module.md`
- `../references/templates/mapper.json`
- `../references/templates/node.json`
- `../references/templates/bug-template.json`
- `../references/templates/repair-prompt-template.md`

Chinese mirrors:

- `../references/ch/templates/*`

### Examples

Use only when a concrete example is needed:

- `../references/examples/feature-example.md`
- `../references/examples/mapper-example.json`
- `../references/examples/node-example.json`
- `../references/ch/examples/*`

## Anchor Rules

Use these rules for generated or updated anchors:

- canonical format is `@coai anchor: <id>`
- existing `@coai anchor <id>` may be tolerated while reading
- new edits should normalize to the colon form
- multiple distinct semantic anchors may exist near the same implementation block when several business nodes legitimately point there

Do not try to "repair" semantic anchor problems here. That belongs to runtime + bug-repair or to human/AI semantic decisions.

## `.coai/current.md` Rules

`.coai/current.md` is not a feature doc.

It should:

- record latest project progress
- record current focus
- record current constraints
- help the next agent resume quickly

It should not:

- become another feature cognition document
- carry mapper/node semantics
- duplicate detailed feature docs
- become a replay log of every exploration detour

## CoAI Cognition Boundary

Use this boundary before writing any project-doc content:

- do not default to storing raw exploration traces, direction swings, provisional hypotheses, or unresolved thoughts in `.coai`
- do allow sparing feature-level notes when trial and error produced a stable conclusion or a high-signal tradeoff that still matters later
- keep those notes short, durable, and implementation-relevant
- do not replay the full discovery process inside a feature doc

## Do Not Do These

- do not create placeholder mapper entries with no real anchors
- do not generate nodes for every sentence in a feature doc
- do not put system assets into `.coai/project`, `.coai/mapper`, or `.coai/node`
- do not leave literal placeholders like `<module>` or `<feature>` in a real host repository
- do not leave `.coai/current.md` empty after real progress
- do not overwrite user-authored CoAI assets blindly

## References

Use these:

- `../references/templates/*`
- `../references/examples/*`
- `../references/ch/templates/*`
- `../references/ch/examples/*`

## Constraints

- create only the assets the current task actually requires
- preserve user data
- keep token / node label / mapper key aligned
- follow the boundary decisions already made by `core`
- become a module relationship document

## Module Doc Rules

`.coai/project/<module>.md` is optional.

Create it when:

- the module needs its own positioning statement
- multiple features under the same module need relationship explanation
- module-level data flow or ideal path is useful

Do not create it when:

- a single feature doc already explains everything clearly
- the module name exists only as a folder container with no real semantic value

When it exists:

- keep it focused on module positioning, feature relationships, and major data flow
- keep implementation detail inside feature docs
- link detailed top-level design docs from the bottom when needed
