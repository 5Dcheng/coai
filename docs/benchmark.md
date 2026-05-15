# Benchmark and Effectiveness Validation

## Goal

CoAI validation has three layers:

1. System reliability: prove that CLI, mapper, anchor, bug log, and hook behavior are stable.
2. Agent cognition efficiency: compare how much it costs an agent to move from feature meaning to code with and without CoAI.
3. Simulated developer perception: describe the future user-study framework with clearly labeled simulated data, without presenting it as real developer evidence.

The default benchmark workspace is:

```text
E:\c5dc\coai\benchmark-workspaces
```

The `coai_v1` repository should only store benchmark plans, scripts, and report templates. Temporary case workspaces should stay outside the code repository.

## System Reliability Tests

System tests use runnable cases to validate CoAI behavior. The first case set:

- `init-standard`: run `coai init` in a standard Node project and verify `.coai`, scripts, and hook installation.
- `init-no-package-json`: run `coai init --no-package-json` in a non-Node host project.
- `git-sync-line-shift`: update mapper `line` after source lines move.
- `git-sync-line-unchanged`: keep mapper entries skipped when anchors do not move.
- `anchor-prefix-fix`: normalize non-standard `@coai anchor <id>` prefixes.
- `missing-anchor`: create an open bug when a mapper points to a missing anchor.
- `duplicate-anchor`: create a duplicate-anchor bug when the same anchor appears more than once.
- `invalid-mapper`: create an invalid-mapper bug for invalid mapper JSON.
- `open-bug-freeze`: freeze mapper updates for code files blocked by open bugs.
- `pre-commit-pass-warning`: keep pre-commit fail-open with warnings when open bugs exist.

Core metrics:

- `passRate`
- `durationMs`
- `changedFiles`
- `matchedFiles`
- `updatedEntries`
- `skippedEntries`
- `failedEntries`
- `bugsCreated`
- `mapperLineAccuracy`
- `bugTypeAccuracy`

## Agent Cognition Efficiency Tests

Agent benchmarks use an A/B comparison:

- baseline: source code and normal README only.
- CoAI: source code plus `.coai/project`, `.coai/mapper`, and `.coai/node`.

Task types:

- Find the entry file for a target feature.
- Explain the full flow of a target feature.
- Identify the real code location for a `[[token]]`.
- List the files that should be read before changing a feature.

Quantitative metrics:

- target file accuracy
- anchor accuracy
- files read
- lines read
- feature-flow explanation accuracy
- wrong assumption count
- task success rate

This layer does not try to prove that CoAI replaces agent judgment. It tests whether CoAI reduces the exploration cost from feature meaning to correct code entry points.

Current measured product evidence is summarized in [CoAI Effectiveness Evidence](effectiveness.md).

The TeamDesk Lite experiment currently supports a cautious claim:

- CoAI can reduce repeated source exploration in new-chat and feature maintenance tasks.
- CoAI moves part of project understanding into feature-oriented cognition assets.
- CoAI still has initialization and cognition-maintenance costs.
- CoAI does not replace source verification.

## Simulated Developer Perception Data

Before real developer samples exist, developer black-box perception can only use simulated data to describe the study framework. All simulated data must be labeled:

```text
SIMULATED_DATA
```

Simulated metrics:

- `blackBoxFeeling`
- `maintenanceConfidence`
- `perceivedNavigationClarity`
- `understandingTimeMinutes`
- `changeConfidence`

Reports must state:

```text
The developer perception section uses simulated data only.
It is not evidence from real developer participants.
```

This data only demonstrates how a future real study will collect, compare, and present evidence. It must not be written as proof that developers have already validated CoAI.

## Future Script Plan

Future automation should add:

```text
scripts/run-benchmark.js
benchmark/report-template.md
benchmark/simulated-developer-study.sample.json
```

Suggested npm script:

```json
{
  "benchmark": "npm run build && node ./scripts/run-benchmark.js --workspace-root E:\\c5dc\\coai\\benchmark-workspaces"
}
```

Runner flow:

1. Create or clean case directories under `E:\c5dc\coai\benchmark-workspaces`.
2. Use an isolated Git repository for each case.
3. Write fixture files and create the initial commit.
4. Apply the target mutation.
5. Run the CoAI CLI command.
6. Read stdout, mapper files, bug logs, and git status.
7. Assert expected behavior.
8. Generate `benchmark/report.json` and `benchmark/report.md`.

The runner must not modify `coai_v1` `.coai`, source files, or real Git state unless the user explicitly asks to persist report outputs.

## Reporting Boundary

Report conclusions must be separated into:

- Measured: data from real benchmark runs.
- Simulated: clearly labeled simulated developer perception data.
- Not yet measured: claims that require real developer participation.

Public messaging should prioritize measurable evidence such as code-location time, files read, mapper line accuracy, bug type accuracy, and task success rate. Subjective black-box perception should only be used as evidence after a real user study.
