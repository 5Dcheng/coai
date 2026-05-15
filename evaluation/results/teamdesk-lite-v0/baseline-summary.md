# TeamDesk Lite Baseline Summary

## Scope

- Condition: baseline
- Agent: Trae SOLO Coder
- Model: Kimi K2.6
- IDE context: Trae built-in workspace index enabled
- Project: TeamDesk Lite
- Main development rounds: R01-R20 plus one repair round
- New-window maintenance rounds: R21-R25
- Human acceptance: core functionality basically implemented and manual testing passed

This baseline is not a raw LLM baseline. It includes Trae's workspace indexing and agent tooling.

## Executive Conclusion

The baseline successfully completed the TeamDesk Lite project.

This means the CoAI evaluation should not frame the question as whether AI coding can finish this kind of project. In this case, `Trae + Kimi K2.6 + workspace index` can finish it.

The meaningful CoAI question is whether CoAI improves the development and maintenance process:

- lower context reconstruction cost
- fewer broad exploratory reads
- fewer repair rounds
- less scope drift
- better feature-oriented navigation
- better new-window continuity
- lower black-box feeling for humans and agents after the codebase exists

## R01-R20 Development Result

The project reached practical completion:

- ticket creation, list, detail, and filtering work
- state transition rules are implemented
- status history and activity timeline are implemented
- comments are implemented
- metadata editing is implemented
- dashboard statistics are implemented
- build and tests pass
- manual testing confirmed the core functionality basically works

The final product is functional, but the development path included early instability and several scope-control signals.

## Quantitative Snapshot

Development rounds, including the repair round:

- rounds counted: 21
- total files read: 146
- total files changed: 62
- scope drift count: 6
- command failure count: 17
- repair rounds: 1 explicit repair round after R05

New-window maintenance rounds:

- rounds counted: 5
- total files read: 37
- total files changed: 1
- R21 initial new-window understanding files read: 21
- R22-R25 follow-up maintenance files read: 16 total

The key pattern is that new-window recovery has a high first-round cost, then the same chat can reuse context efficiently.

## Development Pattern

### Early Phase: R01-R05

The agent moved quickly and completed a lot of work, but also over-implemented future functionality.

Important observations:

- R02 implemented many later backend features early.
- R03 implemented list, new, detail, and dashboard placeholder together.
- R05 expanded into metadata editing, status transitions, history, comments, and activity timeline.
- Build/test/runtime issues were only caught during manual validation.

The R01-R05 manual check found blocking issues:

- TypeScript build failed.
- Test command failed because no tests existed.
- Backend crashed because `addActivity` was missing in comments route.
- Express route parameter typing errors existed.

### Repair Phase: R05-FIX

The repair round fixed the blockers and restored build/test/dev viability.

This round is important as a cost signal: the baseline could recover, but the project needed a dedicated repair pass after several feature rounds.

### Stabilized Phase: R06-R20

After the repair round, the agent became more disciplined.

Strong examples:

- R06 added transition tests without changing product behavior.
- R09 implemented filtering with focused changes.
- R16 expanded meaningful test coverage.
- R17 fixed case-insensitive filtering with a small, targeted change.
- R19 performed pure regression validation with no code changes.
- R20 produced a broad maintenance inventory with no edits.

Remaining scope-control signals:

- R12 covered R13/R14 dashboard concerns early.
- R14 recognized average resolution time was already done but changed navigation instead.
- R15 recognized reopened stats were already correct but cleared data JSON files.

## New-Window Maintenance Result

R21-R25 were run in a new window to test project cognition recovery and maintenance context.

### R21: Initial Recovery

The agent produced a high-quality project understanding summary, but read 21 files.

This is the strongest baseline signal for CoAI:

> without an explicit feature cognition layer, a new-window agent can recover understanding, but it does so by broadly reading source/config/test files.

### R22-R23: Feature Chain Localization

After R21, the agent localized cross-file feature chains efficiently:

- R22 comment chain: 6 files read
- R23 state transition impact: 7 files read

Both answers were accurate and feature-oriented.

### R24: Small Maintenance Change

The agent made a precise small change:

- files read: 2
- files changed: 1
- tests passed
- build passed

The change only affected newly generated `comment_added` activity messages.

### R25: Maintenance Summary

The agent reused accumulated R21-R24 context and only rechecked one file.

This shows that a normal chat can maintain context once it has paid the initial reconstruction cost. The CoAI comparison should test whether CoAI reduces that initial cost when opening a fresh window.

## Human Black-Box Observation

The user manually tested the final project and confirmed that the core functionality basically works.

At the same time, the user reported a maintenance black-box feeling:

- the project is functional, but feature cognition is not directly visible
- behavior is spread across runtime-oriented source files
- even knowing how to start from entry points, manually reconstructing the feature map feels tedious
- this affects developer willingness and confidence when maintaining the project

This is central to the CoAI evaluation.

The code organization is correct for execution, but not sufficient as a human/agent feature-navigation layer.

## What Baseline Already Does Well

The baseline is strong.

- It can build a medium-small product.
- It can recover from build/runtime errors.
- It can perform focused maintenance once context is built.
- It can produce accurate feature-chain explanations.
- It can run build and test verification.

This raises the standard for CoAI: CoAI should not merely show that the agent can complete tasks.

## Expected CoAI Advantage

CoAI should be evaluated against these specific expected improvements:

### 1. New-Window Context Recovery

Expected improvement:

- fewer files read in R21-style project understanding
- faster feature-map reconstruction
- less need to inspect every route/page/test

Primary comparison:

- baseline R21 read 21 files
- CoAI R21 should ideally read `.coai` cognition artifacts first and then selectively verify source

### 2. Feature-Oriented Navigation

Expected improvement:

- direct jump to feature chains such as comment, transition, stats, activity
- fewer irrelevant files read
- clearer mapping between frontend, API, backend route, storage, tests

Primary comparison:

- R22/R23 files read
- correctness of chain explanation
- missing or uncertain links

### 3. Scope Control

Expected improvement:

- fewer cases like R14 and R15 where the agent recognizes the target is complete but still edits adjacent concerns
- smaller diffs for small maintenance tasks

Primary comparison:

- scopeDriftCount
- filesChanged
- overImplementedFutureTasks

### 4. Repair and Verification Discipline

Expected improvement:

- fewer late-discovered blockers
- earlier detection of build/runtime risks
- clearer relationship between feature completion and validation

Primary comparison:

- commandFailureCount
- repair rounds
- human verification failures

### 5. Developer Cognition

Expected improvement:

- reduced black-box feeling
- clearer maintenance entry points
- higher confidence when changing a feature

This is partly subjective, but it can be recorded as a supplementary evaluation dimension.

## Recommended CoAI Test Setup

Use the same TeamDesk Lite task sequence and run a CoAI condition.

For the main development sequence:

- run R01-R20 with the same prompts
- prefix with `$coai-skill` where appropriate
- record the same metrics in `runs.csv`
- do not change the product README/spec

For the new-window sequence:

- start a fresh chat after the project exists
- run R21-R25
- in the CoAI condition, allow reading `.coai/project`, `.coai/mapper`, and `.coai/node`
- compare against baseline R21-R25

The most important CoAI evidence will come from R21-R25, not from proving that the project can be built.

## Current Baseline Verdict

Baseline verdict:

> Strong enough to complete the product, but still exposes cognitive cost, early repair cost, and feature-map black-box issues.

CoAI opportunity:

> Improve project cognition, maintenance navigation, and new-window context continuity rather than basic task completion.
