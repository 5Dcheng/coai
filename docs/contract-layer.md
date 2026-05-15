# CoAI Contract Layer

## Purpose

The CoAI contract layer is a lightweight structured cognition layer.

It is not a full spec store and does not replace feature docs, source code, README, or external `spec/` documents.

Filesystem path:

```text
.coai/contract/
├── object/
├── algorithm/
└── interface/
```

Its purpose is to preserve the current project agreements that are:

- structured
- low ambiguity
- useful before reading source code
- important enough for future agents or developers to follow

CoAI should remain an evolutionary project cognition system:

```text
feature cognition -> optional contract -> source entry
```

## Progressive Disclosure

CoAI assets must be read progressively.

The default cognition path is:

```text
current.md -> project/<module>/<feature>.md -> contract only if needed -> source only if needed
```

The feature doc is the first cognition entry. A single feature doc should let an agent or developer understand the feature's purpose, inputs and outputs, constraints, ideal path, branch paths, risks, and boundaries at a first-pass level.

Contract files are read only when the task needs structured data, algorithm, or interface agreements.

Source code remains the final implementation truth. CoAI should not copy source details into contract when the source code is clearer and already reachable from the feature cognition path.

## Scope

The first contract iteration only supports three contract types:

1. object / data structures
2. algorithms
3. communication interfaces

Do not expand the contract layer into a general-purpose spec system.

## Object Contracts

Object contracts record complete data structures.

They may use JSON, SQL, host-language type definitions, or schema-like code blocks.

They should not summarize away fields or constraints, because they act as templates and implementation guidance.

Use object contracts for core project shapes that agents and developers should understand before editing related features.

Default directory:

```text
.coai/contract/object/
```

## Algorithm Contracts

Algorithm contracts describe implementation intent in a testable way.

They should include:

- goal
- input
- expected output
- key branch behavior
- implementation idea
- key code block or pseudocode when useful

The goal is that unit tests can be derived from the contract.

Do not copy the full implementation unless the code block itself is the clearest and smallest expression of the algorithm.

Default directory:

```text
.coai/contract/algorithm/
```

## Communication Interface Contracts

Communication interface contracts record stable request / response agreements.

They should be organized at module level and aligned with:

```text
project/<module>.md
```

Use interface contracts for stable module boundaries, not every local helper or trivial CRUD path.

Default directory:

```text
.coai/contract/interface/
```

## Links And Navigation

Contract files should default to normal Markdown links and plain file path references.

Do not use `[[double-link tokens]]` in contract files by default.

Reason:

- double-link tokens are the feature cognition navigation mechanism
- mapper and node path rules are currently centered on `project/<module>/<feature>.md`
- using double-links in contract would blur the boundary between feature cognition and structured agreements

Recommended link usage:

```text
feature.md -> contract: Markdown link
feature.md -> source: double-link + mapper
contract -> feature: Markdown link
contract -> source: file path or Markdown link
```

Only introduce contract-specific double-link behavior after the system explicitly supports contract mapper semantics.

## External Spec Relationship

If a project needs detailed PRD, formal spec, or external requirements, keep them outside `.coai`, for example:

```text
./spec/
./docs/
./README.md
```

Those documents can be indexed by agents as source material.

CoAI contact stores only the structured agreements that have become current, useful, and stable enough to guide implementation.

## Creation Rule

Create a contract file only when at least one condition is true:

- the data structure is core to multiple features
- the algorithm must be tested or preserved across iterations
- the interface is a stable module boundary
- the agreement is easy for agents to misread from scattered source code
- a new chat needs this structure before reading many source files

Do not create a contract file when:

- the detail is local implementation only
- the feature doc plus source entry is already clear enough
- the agreement is still exploratory
- the content would duplicate source code without adding cognition value

## Update Rule

Update contract files when the current project agreement changes.

Do not update contract files for every implementation refactor if the data shape, algorithm behavior, or interface agreement remains equivalent.

Contract is part of CoAI's settled cognition, not a replay log.
