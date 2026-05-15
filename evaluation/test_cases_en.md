# TeamDesk Lite Test Cases and Recording Guide

## 1. Goal

This document defines the TeamDesk Lite evaluation tasks, prompts, recording fields, and scoring rules.

The goal is not only to compare final code quality. The evaluation should observe:

- whether the agent finds the right context faster
- whether the agent reads fewer irrelevant files
- whether the agent understands feature boundaries better
- whether the agent keeps attention and memory consistency over multiple rounds
- whether token, time, and rework costs stay controlled during long-running development

## 2. Experiment Groups

For the first pass, keep the model fixed and compare agents / context conditions.

Minimum recommended setup:

```text
Model: Kimi K2.6
Agent: Trae
Conditions: baseline / coai
Tasks: R01-R20
```

Expanded setup:

```text
Trae + Kimi K2.6 + baseline
Trae + Kimi K2.6 + coai
Claude Code + Kimi K2.6 + baseline
Claude Code + Kimi K2.6 + coai
```

## 3. Fixed Task Sequence

The task sequence must be fixed. Baseline and coai conditions should use the same tasks.

If one round does not finish the current task, do not move to the next task. Continue the same task and record another attempt.

### R01 Initialize Project Structure

Goal:

- create Vite + React + TypeScript frontend
- create Express backend
- configure basic npm scripts
- prepare local JSON data directory

Acceptance:

- `npm install` succeeds
- `npm run dev` starts the project
- frontend page is reachable
- backend health endpoint is reachable

### R02 Ticket Data Model and JSON Storage

Goal:

- define Ticket, StatusHistory, Comment, and Activity types
- implement JSON file storage
- provide basic read/write methods

Acceptance:

- ticket data can be read and written
- missing JSON files are initialized automatically
- data structure is clear and not tightly coupled to UI

### R03 Ticket List

Goal:

- implement ticket list page
- load tickets from API
- show title, status, priority, assignee, tags, and updatedAt

Acceptance:

- list shows tickets
- empty state is displayed when no data exists
- error state is displayed when loading fails

### R04 Create Ticket

Goal:

- implement create ticket page
- support title, description, priority, assignee, and tags
- default new ticket status to `open`

Acceptance:

- ticket can be created
- ticket is persisted to JSON storage
- `ticket_created` activity is created
- user returns to list or navigates to detail page

### R05 Ticket Detail

Goal:

- implement ticket detail page
- show ticket metadata, status, comments, and activity

Acceptance:

- detail page opens
- missing ticket shows 404 or error state
- ticket information is complete

### R06 Status Transition Validation

Goal:

- implement valid status transitions
- reject invalid transitions
- provide transition API

Valid transitions:

```text
open -> triaged
triaged -> in_progress
in_progress -> resolved
resolved -> closed
resolved -> reopened
reopened -> in_progress
```

Acceptance:

- valid transitions succeed
- invalid transitions return 400
- status changes update the ticket

### R07 Status History and Activity

Goal:

- write status history on status change
- write `status_changed` activity
- show status history on detail page

Acceptance:

- every status change has history
- every status change has activity
- timeline order is stable

### R08 Metadata Editing

Goal:

- support assignee updates
- support priority updates
- support tag updates

Acceptance:

- metadata updates succeed
- assignee changes create `assignee_changed` activity
- metadata updates do not break status lifecycle

### R09 Filtering

Goal:

- filter by status
- filter by priority
- filter by assignee
- filter by tag
- support combined filters

Acceptance:

- single-condition filtering is correct
- combined filtering is correct
- case differences do not cause obvious filtering errors

### R10 Comments

Goal:

- add comments
- show comment list
- create `comment_added` activity when a comment is added

Acceptance:

- comments can be added
- comments do not change ticket status
- comments and activities are displayed

### R11 Activity Timeline

Goal:

- show ticket_created, status_changed, assignee_changed, and comment_added in one timeline
- keep timeline sorted consistently by time

Acceptance:

- all activity types are displayed correctly
- sort order is stable
- empty activity list does not crash

### R12 Dashboard Status Stats

Goal:

- implement dashboard page
- count tickets by status

Acceptance:

- status counts are correct
- empty state is shown when no data exists

### R13 Dashboard Priority Stats

Goal:

- count tickets by priority

Acceptance:

- priority counts are correct
- counting semantics match filtering semantics

### R14 Average Resolution Time

Goal:

- compute average resolution time
- only include truly resolved or closed tickets

Acceptance:

- unresolved tickets are excluded
- reopened tickets should not continue to be incorrectly counted as resolved

### R15 Fix Reopened Statistics

Goal:

- inspect or fix the issue where reopened tickets are still counted as resolved

Acceptance:

- reopened tickets are excluded from resolved count
- reopened tickets are excluded from average resolution time unless resolved again
- fix does not break status lifecycle

### R16 Basic Tests

Goal:

- add status transition tests
- add filtering tests
- add statistics tests

Acceptance:

- tests can run
- core business rules are covered

### R17 Fix Filter Case Sensitivity

Goal:

- fix case-sensitivity issues for urgent / tag / assignee filtering

Acceptance:

- reasonable uppercase/lowercase input does not break filtering
- original display data is not changed unnecessarily

### R18 Error, Empty, and Loading States

Goal:

- add error states
- add empty states
- add loading states

Acceptance:

- API errors do not crash the UI
- empty data has clear messaging
- loading states have feedback

### R19 Full Regression

Goal:

- run build / tests
- fix blocking issues
- check core page flows

Acceptance:

- build succeeds
- tests succeed, or failures are explained
- core flows are usable

### R20 Project Summary and Maintenance Entry Points

Goal:

- summarize current project structure
- summarize main business rules
- summarize future maintenance entry points

Acceptance:

- can explain key files for ticket creation, status lifecycle, comments, activity, and statistics
- can explain which modules should not be modified by unrelated tasks

## 4. Optional R21-R30 Tasks

If running 30 rounds, use these tasks:

- R21: improve assignee change activity
- R22: adjust status lifecycle boundaries
- R23: fix timeline sorting bug
- R24: add created / resolved trend for the last 7 days
- R25: new-chat context recovery task
- R26: impact analysis task
- R27: local storage refactor
- R28: test coverage pass
- R29: project README update
- R30: final project cognition summary

## 5. Prompt Templates

### 5.1 Baseline First Round

```text
Develop TeamDesk Lite according to README.md.

Current task: R01 Initialize Project Structure.

First explain your understanding and plan for this task, then implement it.
After completion, list:
1. files you read
2. files you modified
3. acceptance points completed in this round
4. whether you touched unrelated functionality
5. suggested next task
```

### 5.2 Baseline Later Rounds

```text
Current task: R02 Ticket Data Model and JSON Storage.

Continue developing based on the existing project.
First explain your understanding and plan for this task, then implement it.
After completion, list:
1. files you read
2. files you modified
3. acceptance points completed in this round
4. whether you touched unrelated functionality
5. suggested next task
```

### 5.3 Baseline Continuation

```text
The current task is still: R02 Ticket Data Model and JSON Storage.

The previous round did not finish R02. Continue and complete it.
First explain what remains, then implement it.
After completion, list:
1. files you read
2. files you modified
3. acceptance points completed in this round
4. whether R02 is now complete
5. whether you touched unrelated functionality
```

### 5.4 CoAI First Round

```text
Use the coai skill and develop TeamDesk Lite according to README.md.

Current task: R01 Initialize Project Structure.

First explain your understanding and plan for this task, then implement it.
During development, maintain the project cognition layer according to the CoAI workflow.
After completion, list:
1. files you read
2. files you modified
3. acceptance points completed in this round
4. CoAI cognition assets added or updated in this round
5. whether you touched unrelated functionality
6. suggested next task
```

### 5.5 CoAI Later Rounds

```text
Use the coai skill and continue developing TeamDesk Lite based on the current project.

Current task: R02 Ticket Data Model and JSON Storage.

First recover the current project context through the CoAI cognition layer, then explain your understanding and plan, then implement it.
After completion, list:
1. files you read
2. files you modified
3. acceptance points completed in this round
4. CoAI cognition assets added or updated in this round
5. whether you touched unrelated functionality
6. suggested next task
```

### 5.6 CoAI Continuation

```text
Use the coai skill.

The current task is still: R02 Ticket Data Model and JSON Storage.

The previous round did not finish R02. First recover the current project context through the CoAI cognition layer, then continue and complete R02.
After completion, list:
1. files you read
2. files you modified
3. acceptance points completed in this round
4. CoAI cognition assets added or updated in this round
5. whether R02 is now complete
6. whether you touched unrelated functionality
```

## 6. Attempt Rules

If one task is not completed in one round, do not move to the next task.

Record attempts as:

```text
R02-A1: first attempt
R02-A2: continue unfinished work
R02-A3: fix R02 build or test issue
```

When aggregating R02:

- tokens = A1 + A2 + A3
- time = A1 + A2 + A3
- success = whether the task is finally complete
- attempts = number of attempts needed

`attempts` is an important metric. If CoAI is effective, it may reduce attempts, rework, and repeated explanations.

## 7. CSV Recording Fields

Maintain `runs.csv`:

```csv
runId,round,attempt,condition,agent,model,totalTokens,durationMin,filesRead,sourceFilesRead,coaiFilesRead,filesChanged,wrongFileVisits,scopeDriftCount,implementationScore,cognitionScore,scopeControlScore,taskSuccess,notes
```

Field meanings:

- `runId`: unique id, such as `KIMI-TRAE-BASE-R02-A1`
- `round`: task id, such as `R02`
- `attempt`: attempt number for the same task
- `condition`: `baseline` or `coai`
- `agent`: `Trae`, `Claude Code`, etc.
- `model`: model name
- `totalTokens`: total tokens for this run
- `durationMin`: duration in minutes
- `filesRead`: number of files read
- `sourceFilesRead`: number of source files read
- `coaiFilesRead`: number of `.coai` files read, 0 for baseline
- `filesChanged`: number of files changed
- `wrongFileVisits`: clearly irrelevant file visits
- `scopeDriftCount`: task-scope drift count
- `implementationScore`: implementation quality, 1-5
- `cognitionScore`: understanding quality, 1-5
- `scopeControlScore`: scope control, 1-5
- `taskSuccess`: whether the task is complete after this attempt
- `notes`: short notes

## 8. Raw Run Template

Save one markdown record for each run.

```md
# KIMI-TRAE-BASE-R02-A1

## Metadata

- date:
- condition:
- agent:
- model:
- round:
- attempt:
- durationMin:
- inputTokens:
- outputTokens:
- totalTokens:

## Prompt

Paste the original prompt for this run.

## Agent Plan

Paste the agent's plan.

## Files Read

- README.md
- src/...

## Files Changed

- package.json
- src/...

## CoAI Files Read

Use none for baseline.

## CoAI Assets Changed

Use none for baseline.

## Acceptance

- [ ] acceptance point 1
- [ ] acceptance point 2

## Final Answer

Paste the agent's final answer.

## Human Review

- what worked:
- issues:
- scope drift:
- wrongFileVisits:
- scopeDriftCount:
- implementationScore:
- cognitionScore:
- scopeControlScore:
- taskSuccess:
- notes:
```

## 9. Scoring Rules

### implementationScore

- 5: complete, correct, runnable, well structured
- 4: mostly correct with minor issues
- 3: runnable but with clear structure or boundary problems
- 2: partially complete, core logic unreliable
- 1: failed or severely off track

### cognitionScore

- 5: accurately understands task, business rules, and impact scope
- 4: mostly correct with minor omissions
- 3: can complete the task but explanation is incomplete or partly wrong
- 2: clear misunderstanding of core flow
- 1: wrong understanding or many hallucinations

### scopeControlScore

- 5: reads/changes only necessary scope
- 4: small amount of extra reading or minor extra edits
- 3: clear irrelevant reading but no major damage
- 2: changes unrelated features or adds unnecessary refactor
- 1: severe task-scope drift

## 10. Minimum Recording Requirements

If time is limited, record at least:

- `totalTokens`
- `durationMin`
- `filesRead`
- `filesChanged`
- `attempt`
- `scopeDriftCount`
- `implementationScore`
- `cognitionScore`
- `scopeControlScore`
- `taskSuccess`

Tokens only represent cost. They cannot prove cognition effectiveness alone. File reads and scope drift must be recorded because CoAI's key value is helping the agent find relevant context faster, read fewer unrelated files, and preserve task boundaries.

## 11. External Agent Feedback Format

You can paste each Trae, Claude Code, or other agent run directly to a reviewer for analysis. To reduce missing data, include:

```text
runId:
round:
attempt:
condition:
agent:
model:
workspace:
prompt:

agent tool trace:
Paste tool calls, searches, terminal commands, file reads, and file change summaries.

agent final answer:
Paste the final answer.

optional human notes:
Any issue, local run result, or question you observed.
```

If token counts are unavailable, leave them blank. Do not stop the experiment just because tokens are unavailable.

## 12. Feedback Analysis Rules

The reviewer should extract:

- `filesRead`
- `sourceFilesRead`
- `coaiFilesRead`
- `filesChanged`
- `searchMissCount`
- `commandFailureCount`
- `wrongFileVisits`
- `scopeDriftCount`
- `overImplementedFutureTasks`
- `agentVerificationStatus`
- `humanVerificationStatus`
- `implementationScore`
- `cognitionScore`
- `scopeControlScore`
- `taskSuccess`

Recommended extra CSV fields:

```csv
searchMissCount,commandFailureCount,agentVerificationStatus,humanVerificationStatus,overImplementedFutureTasks
```

Verification status values:

- `not_run`: no verification command was run.
- `passed_observed`: clear passing logs were observed.
- `failed_observed`: clear failing logs were observed.
- `claimed_pass_not_observed`: the agent claimed success but pasted logs do not prove it.
- `partial`: only part of the behavior was verified.

Notes:

- If `README.md` search fails but `README_zh.md` is actually read, record `searchMissCount = 1`; do not count it as `wrongFileVisits`.
- Count `wrongFileVisits` only when the agent reads clearly irrelevant files.
- If the agent implements future-round features early, record `overImplementedFutureTasks` and let it affect `scopeControlScore`.
- If the agent claims tests passed but visible logs only show failures, record `claimed_pass_not_observed` or `failed_observed`.

## 13. Recommended Results Directory

Store real experiment data under:

```text
evaluation/results/teamdesk-lite-v0/
├── runs.csv
├── raw/
│   ├── KIMI-TRAE-BASE-R01-A1.md
│   └── KIMI-TRAE-BASE-R02-A1.md
└── reviews/
    ├── KIMI-TRAE-BASE-R01-A1.review.md
    └── KIMI-TRAE-BASE-R02-A1.review.md
```

Use `raw/` for original pasted content, `reviews/` for structured analysis, and `runs.csv` for aggregateable metrics.
