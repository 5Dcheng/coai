# CoAI Effectiveness Evidence

## Scope

This document summarizes the current measured evidence for CoAI from the TeamDesk Lite experiment.

It is product evidence, not a final academic benchmark. The current data is enough to support an early product claim:

> CoAI helps AI coding agents preserve and reuse project cognition, reduce repeated source exploration in maintenance tasks, and keep feature understanding connected to real code entry points.

It should not be used to claim:

> CoAI always reduces token usage, always reads fewer files, or replaces source-code verification.

## What Was Tested

The test project, TeamDesk Lite, is a lightweight ticket management app built with:

- Vite + React + TypeScript frontend
- Express + TypeScript backend
- local JSON file storage
- ticket list, create, detail, metadata edit, status transition, comments, activity timeline, and dashboard stats

Three conditions were compared:

| Condition | Description |
|---|---|
| Baseline | A new chat reads source files, README, tests, and project files directly. |
| AGENTS.md | A long-context chat creates a single `AGENTS.md`; a new chat reads it first, then verifies source as needed. |
| CoAI | A new chat reads `.coai` feature cognition and mapper assets first, then verifies source as needed. |

## Key Result

The most reliable conclusion is:

> CoAI is not the cheapest single-shot project summary method. Its value is a structured, feature-oriented, source-locatable project cognition layer that can be reused and updated during long-term maintenance.

## New-Chat Project Cognition: R31

R31 tested how much it costs a new chat to understand the completed TeamDesk Lite project.

Measured via GLM-5-turbo billing exports:

| Condition | Billed tokens | Cost CNY | Files read | Source files read |
|---|---:|---:|---:|---:|
| Baseline R31 | 299,655 | 0.7905314 | 26 | 26 |
| CoAI R31 | 174,740 | 0.508423 | 31 | 8 |
| AGENTS.md R31 | 61,919 | 0.151387 | 4 | 3 |

Interpretation:

- Baseline rebuilt project cognition by reading source broadly.
- CoAI reduced source-file reading from 26 to 8 and lowered billed usage in this run.
- AGENTS.md had the lowest new-chat usage cost after the file already existed and was still fresh.

However, AGENTS.md R31 measures only the usage phase, not the full lifecycle cost. AGENTS.md has at least three cost components:

```text
AGENTS.md lifecycle cost =
  initial generation cost
  + new-chat read cost
  + update cost after project changes
```

The initial generation cost was measured; future incremental update cost has not yet been measured.

AGENTS.md generation cost in the long baseline chat:

| Asset cost | Billed tokens | Cost CNY |
|---|---:|---:|
| AGENTS.md A00 generation | 707,449 | 1.8105794 |
| AGENTS.md R31 usage | 61,919 | 0.151387 |
| Total for first use | 769,368 | 1.9619664 |

So AGENTS.md should be interpreted as a strong middle condition:

- cheaper to use once it is fresh and available
- not free to create
- not automatically maintained
- potentially expensive to update after the project changes
- often dependent on either stale long-chat context or another broad source scan
- different from CoAI, whose maintenance cost exists but is scoped around feature-level cognition backflow rather than rewriting a whole-project handoff file

## Maintenance Task Evidence

The stronger CoAI signal appears in feature-level maintenance tasks, not in the one-time project summary.

In the direct baseline2 vs post-hoc CoAI comparison for R26-R30:

| Metric | Baseline2 R26-R30 | CoAI R26-R30 |
|---|---:|---:|
| Total files read | 47 | 56 |
| Source/config/test/data files read | 46 | 21 |
| `.coai` files read | 0 | 35 |

Interpretation:

- CoAI did not reduce total file reads.
- CoAI reduced source exploration by shifting part of cognition recovery into `.coai` assets.
- This matters because source files are lower-level, larger, and more fragmented than feature cognition docs.

Examples:

| Task | CoAI behavior |
|---|---|
| Locate comment activity wording | Read comment/activity cognition and mapper, then verified one source file. |
| Change comment preview length | Changed source code and updated the related feature cognition document. |
| Analyze `closed -> reopened` status rule | Used `status-transition` cognition to identify frontend, backend, stats, tests, and data semantics. |

## Why This Supports CoAI

The current evidence supports these claims:

1. CoAI can reduce repeated source exploration in new-chat and maintenance scenarios.
2. CoAI stores project understanding by feature, not only by file tree.
3. CoAI mapper and anchors connect feature meaning to real source entry points.
4. CoAI supports cognition backflow: when code changes, stable feature understanding can be updated with it.
5. CoAI is especially relevant for long-running AI coding projects, multi-chat work, and feature-level maintenance.

## What CoAI Is Not Claiming

Current evidence does not support these stronger claims:

- CoAI always reduces total token usage.
- CoAI always reads fewer files.
- CoAI initialization cost is negligible.
- CoAI replaces source-code verification.
- CoAI is always cheaper than a fresh `AGENTS.md` for a single project-summary task.

## AGENTS.md vs CoAI

`AGENTS.md` is useful and should be treated as a strong baseline.

But it is not the same product category as CoAI.

| Aspect | AGENTS.md | CoAI |
|---|---|---|
| Shape | One file | Structured cognition assets |
| Maintenance | Manual, usually before a new chat | Part of the feature change loop |
| Code location | Descriptive | Mapper/anchor based |
| Feature boundaries | Usually summarized | Explicit feature cognition |
| Update risk | Can become stale or polluted by old chat context | Still needs maintenance, but has a defined cognition backflow loop |

AGENTS.md helps a new chat know what the project is.

CoAI helps an agent know which feature it is touching, where to enter the code, and which cognition should be updated after the change.

## Product Positioning

CoAI should be positioned as:

> A project cognition layer for AI coding agents.

More specifically:

> CoAI turns project understanding into repository-local, feature-oriented, source-locatable cognition assets that survive across chats and maintenance cycles.

This is useful when:

- a project is developed over many AI coding sessions
- new chats need to resume without re-reading the whole source tree
- developers want feature meaning connected to real source locations
- agents need to make localized changes without losing feature boundaries
- project cognition should improve after code changes instead of staying trapped in chat history

## Current Limitations

The current experiment is preliminary:

- single main test project
- small to medium codebase
- small sample count for GLM token measurements
- post-hoc CoAI initialization, not yet CoAI-native from R01
- AGENTS.md update cost beyond A00 not yet measured
- no real developer user-study data yet

These limits should remain visible in public messaging.

## Recommended Next Measurements

If more time is available, the next highest-value tests are:

1. Run feature-level tasks across baseline, AGENTS.md, and CoAI:
   - change comment activity wording
   - change status transition rules
   - change dashboard stats semantics
   - add a Ticket field across frontend/backend/tests
2. Measure AGENTS.md update cost after several feature changes.
3. Repeat R31 token tests 2-3 times to reduce run variance.
4. Test a larger project where source exploration cost is naturally higher.
