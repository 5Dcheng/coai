# Roadmap And Strategy

This document contains internal product planning notes that should not dominate the public README.

## v1 Product Boundary

v1 is defined as:

- VS Code extension
- CLI command entry
- `.coai` template assets
- `coai init` initializer
- `coai update` workspace system-asset updater
- Git hook management
- CoAI methodology and skill source

v1 does not aim to:

- fully replace VS Code editor interaction
- provide a full project generator
- perform AST-level automatic generation
- automatically trigger an AI agent to repair bugs
- block application commits for CoAI cognition-layer issues

## Delivery Layers

- `skill`: teaches agents how to work with CoAI.
- `.coai/`: records the current host project's cognition layer.
- `.coai/coai/`: stores CoAI system assets inside the host project.
- npm package: distributes CLI, shared core, templates, and skill source.
- VSIX / VS Code extension: distributes editor interaction.

## Naming Strategy

Recommended public naming path:

- product name: `CoAI`
- CLI command: `coai`
- short-term npm package candidate: `@5dc/coai`
- long-term brand target if available: `@coai/coai`

Using a scoped package is safer than relying on the bare `coai` package name, because it makes the official publisher clearer.

## Version Roadmap

### v1

Goal: core foundation, basic usability, and real testability.

- Double-link navigation
- Hover and Ctrl/Cmd Click
- Mapper / node / anchor structure
- Git incremental mapper sync
- Bug log and bug repair lifecycle
- CLI, init, update, and hook management
- Basic package distribution through npm tarball and VSIX

### v2

Goal: more real usage and hardening.

- More forward tests in real projects
- Stronger CoAI skill behavior
- Better templates and examples
- Better docs and onboarding
- Optimize v1 behavior based on actual usage

### v3

Goal: expanded cognition and navigation capabilities.

- Relationship navigation beyond one-hop code jump
- Richer dependency and feature relation views
- Adaptation for Obsidian-style knowledge navigation if valuable
- More editor/runtime integrations where justified

### v4

Goal: end-to-end reliability.

- End-to-end integration test suites
- Cross-platform hook and CLI validation
- Full onboarding smoke tests
- Release automation and regression gates

## Community And Commercialization Notes

Short-term priority:

1. Stabilize usage in internal/team projects.
2. Create a repeatable template onboarding flow.
3. Publish real examples and demos.
4. Build trust around the methodology before choosing a business model.

Potential commercialization paths:

- consulting for project onboarding
- team templates and methodology packages
- enhanced VS Code tooling
- private knowledge index or dashboard
- agent-assisted repair workflows

Commercialization should come after there are visible examples, clear user value, and repeatable adoption.
