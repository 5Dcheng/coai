<p align="center">
  <img src="assets/pixel-coai-cut.png" alt="CoAI pixel artwork" width="720">
</p>

<h1 align="center">CoAI</h1>

<p align="center">
  Project cognition layer for AI coding.
</p>

<p align="center">
  <a href="README_zh.md"><strong>中文</strong></a>
  ·
  <a href="#quick-start"><strong>Quick Start</strong></a>
  ·
  <a href="docs/ch/README.md"><strong>Docs</strong></a>
  ·
  <a href="docs/effectiveness.md"><strong>Effectiveness</strong></a>
</p>

CoAI is a project cognition layer for AI coding.

It lets developers describe features in natural language, express key flows with `[[double-link tokens]]`, and let AI agents connect those tokens back to real code locations. The faster a project evolves through AI coding, the more important it becomes to keep a shared, current, and navigable cognition layer for both humans and agents.

CoAI does not replace specs, plans, or code. It preserves the stable understanding that survives the coding loop:

```text
feature.md cognition alignment -> mapper skeleton -> code + anchor -> system line sync -> feature.md cognition backflow
```

## Why CoAI

- AI can generate code quickly, but projects can become black boxes just as quickly. CoAI keeps the current meaning of the project inside the repository.
- Chat history goes stale. `.coai/` grows with the project state, so humans and agents can resume from the current cognition layer.
- Feature docs become code entry points. A flow like `[[User Input]] -> [[Frontend Submit]] -> [[Server Validation]]` can jump to real code.
- Agents do not need to blindly scan the whole repo. `.coai/project`, `.coai/mapper`, `.coai/node`, and `@coai anchor` provide high-signal context.
- CoAI encourages better feature and source-file boundaries because each capability must belong to a clear scenario event.
- CoAI helps non-specialist builders describe business workflows first, then let agents turn them into coding-ready feature docs and implementation structure.

In one sentence:

```text
CoAI helps humans stay in control of projects written with AI.
```

## Best Fit

Use CoAI when you:

- build with Codex, Claude Code, Cursor, Trae, Cline, or similar AI agents
- start a new project from a prompt, workflow, or business process
- want product meaning, architecture understanding, feature flow, and code locations connected
- want agents to understand project cognition before editing code
- want long-running AI coding projects to stay readable, navigable, and maintainable

Not recommended yet:

- one-shot full migration of a large legacy project
- using CoAI as a full spec / plan / task management system
- storing every exploration path or chat log in `.coai/`

## Quick Start

### 1. Install

Recommended:

```bash
npm install -D @5dc/coai
npm exec coai init
```

For non-Node host projects:

```bash
npm install -D @5dc/coai
npm exec coai init --no-package-json
```

Install the VS Code extension:

```bash
code --install-extension coai-0.0.1.vsix --force
```

After Marketplace release, install it directly from VS Code Marketplace.

### 2. Sync the skill

CoAI is designed for agent-assisted work. Sync the local Codex skill:

```bash
npm exec coai skill sync
```

For the first CoAI session in a repository, tell the agent:

```text
Use the coai skill first and understand this repository's .coai structure.
Before discussing a feature, before writing code, and after implementation, follow the CoAI loop:
feature.md cognition alignment -> mapper skeleton -> code + anchor -> agent writes anchor/file back into mapper -> system updates line -> feature.md cognition backflow.
Early node flow is a revisable semantic hypothesis, not a hard implementation constraint.
```

### 3. Start with an agent

For a new project, do not manually create every `.coai` file. Describe the goal in chat and let the agent use CoAI:

```text
I want a simple registration feature:
User Input -> Frontend Submit -> Server Validation -> Local JSON Storage -> Success Response.
Use CoAI to create the feature doc, mapper skeleton, and implementation.
```

If you already have a product spec or project brief:

1. initialize CoAI in the repository
2. place the spec inside the local repo
3. ask the agent to read the spec and create or update `.coai/project/<module>/<feature>.md`
4. ask the agent to maintain mapper `anchor` and `file` while coding
5. let CoAI sync mapper `line` through git-sync / pre-commit

## How It Works

CoAI has three deliverables:

- `.coai/`: the host project's cognition layer
- `@5dc/coai`: CLI, initializer, updater, local runtime, templates, and skill source
- VS Code extension: Hover, Ctrl/Cmd Click, Problems panel, and command palette integration

Typical workspace shape:

```text
.coai/
├── current.md        # latest project progress
├── project/          # module docs and feature docs
├── mapper/           # token -> code mapping
├── node/             # hover cognition
├── log/bugs/         # CoAI bug lifecycle records
└── coai/             # CoAI system assets and local runtime
```

Core responsibilities:

- `project/<module>/<feature>.md`: feature goals, constraints, ideal path, branch paths, and exception boundaries
- `mapper/<module>/<feature>.mapper.json`: maps `[[token]]` to `anchor/file/line`
- `node/<module>/<feature>/*.node.json`: short hover cognition
- `current.md`: latest project progress, not a replacement for feature docs

## Double-Link Navigation

In a feature doc:

```md
[[User Input]] -> [[Frontend Submit]] -> [[Server Validation]] -> [[Local JSON Storage]] -> [[Success Response]]
```

In code:

```ts
// @coai anchor: auth.register.validate.001
```

Then:

- Hover `[[Server Validation]]` to view node cognition
- Ctrl/Cmd Click `[[Server Validation]]` to jump to real code
- git-sync / pre-commit keeps mapper `line` aligned through `@coai anchor`

## CoAI vs Spec / Plan

CoAI does not replace spec-driven development.

The responsibility split is:

```text
CoAI: project cognition and code location
spec / plan: development process organization
coding agent: implementation execution
```

In AI coding, CoAI is the cognition alignment and backflow layer:

```text
CoAI -> spec / plan / agent coding -> CoAI
```

It does not store every process detail. It stores the feature meaning, key decisions, code entry points, and maintenance context that remain valid.

## Benchmark and Effectiveness Validation

CoAI validation separates three kinds of evidence:

- System reliability: run real CLI, git-sync, pre-commit, mapper, and bug-log cases, then quantify metrics such as `passRate`, `mapperLineAccuracy`, and `bugTypeAccuracy`.
- Agent cognition efficiency: compare A/B tasks with and without CoAI using target file accuracy, files read, lines read, wrong assumptions, and task success rate.
- Developer black-box perception: before real developer samples exist, use only clearly labeled `SIMULATED_DATA` and never present simulated data as real user-study evidence.

The default benchmark workspace is `E:\c5dc\coai\benchmark-workspaces`, outside the repository, to avoid polluting the codebase.

Current measured evidence from the TeamDesk Lite experiment:

- In a new-chat project cognition task, CoAI reduced source-file reads from 26 to 8 compared with the baseline, and the GLM-5-turbo billed usage dropped from 299,655 to 174,740 tokens in that run.
- In R26-R30 maintenance tasks, CoAI did not reduce total files read, but it reduced source/config/test/data reads from 46 to 21 by shifting part of the exploration into `.coai` cognition assets.
- A fresh `AGENTS.md` was cheaper for the single R31 usage task, but its generation cost was high and it requires manual updates before future new chats. This makes it a strong middle baseline, not a replacement for structured feature cognition, mapper/anchor source entry points, and cognition backflow.

This evidence supports a cautious product claim: CoAI helps preserve reusable, feature-oriented, source-locatable project cognition for long-running AI coding work. It does not prove that CoAI always reduces tokens or replaces source verification.

Details:

- [Benchmark and Effectiveness Validation](docs/benchmark.md)
- [CoAI Effectiveness Evidence](docs/effectiveness.md)

## Commands

Common commands:

```bash
npm exec coai init
npm exec coai update
npm exec coai skill sync
npm run coai:pre-commit-check
```

Command layers:

- package-management layer: `init`, `version`, `check-update`, `update`
- workspace-local runtime layer: `doctor`, `pre-commit-check`, hook management

Details: [CLI Runtime Flow](docs/ch/cli-runtime-flow.md)

## Documentation

User guides:

- [CLI Runtime Flow](docs/ch/cli-runtime-flow.md)
- [Runtime Modes](docs/ch/runtime-modes.md)
- [Template Integration Protocol](docs/ch/template-integration-protocol.md)
- [No package.json Mode](docs/ch/no-package-json-mode.md)
- [Upgrade Paths](docs/ch/upgrade-paths.md)
- [Manual Verification](docs/ch/manual-verification.md)
- [Benchmark and Effectiveness Validation](docs/benchmark.md)
- [CoAI Effectiveness Evidence](docs/effectiveness.md)

Technical docs:

- [Feature and Source Boundary Rules](docs/ch/feature-boundary-rules.md)
- [Contract Layer](docs/contract-layer.md)
- [CoAI vs Spec Systems](docs/ch/coai-vs-spec.md)
- [Skill Source](docs/ch/skill-source.md)
- [Hook Policy](docs/ch/hook-policy.md)
- [Repository Structure](docs/ch/structure.md)
- [Roadmap and Strategy](docs/ch/roadmap-and-strategy.md)

Open release:

- [Pre-open-source Strategy Draft](docs/ch/pre-open-source-strategy.md)

Chinese README:

- [README_zh.md](README_zh.md)

## Status

CoAI v0.0.1 is an early public testing release:

- VS Code Hover / Click navigation
- CLI init and update
- Git-based mapper line sync
- fail-open pre-commit check
- CoAI bug log and Problems panel
- skill and template assets

Use it first in new or controlled projects.

## License

MIT
