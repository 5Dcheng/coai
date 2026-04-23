# Pre-Open-Source Strategy Draft

## Goal

This draft defines a staged pre-open-source strategy for CoAI during the warm-up phase:

- live-stream real project testing
- publish articles and videos
- collect early feedback
- protect high-value cognition assets while exposing enough of the product for trust and adoption

## Release Layers

Treat CoAI as three layers with different disclosure strategies:

### 1. Public product layer

Safe to open early:

- `src/`
- `skills/coai/`
- `template/.coai/`
- `docs/`
- `README.md`
- `README_zh.md`
- npm package / tarball
- VSIX package
- demo repositories or minimal examples

### 2. System asset layer

Usually safe to open early after review:

- `.coai/coai/` templates
- hook templates
- metadata
- skill source references

### 3. Project cognition layer

Usually delay or partially disclose:

- `.coai/project/`
- `.coai/current.md`
- `.coai/mapper/`
- `.coai/node/`
- real bug logs
- long-lived internal cognition documents tied to the current CoAI repository itself

## What To Open Now

Recommended for the warm-up phase:

- open the package, extension, CLI, templates, docs, and skill
- keep the current repository's full `.coai/project/` private for now
- expose only selected `.coai` examples if needed for explanation

## What To Delay

Recommended to delay until later:

- full internal `.coai/project/` for the CoAI repository itself
- `.coai/current.md`
- `.coai/log/bugs/open/`
- `.coai/log/bugs/resolved/`
- full internal mapper/node network of the CoAI repository

## Issue And PR Policy

Recommended community policy during the warm-up phase:

### Encourage

- bug reports
- reproduction steps
- integration feedback
- documentation issues
- feature requests
- real project test cases

### Be cautious with

- direct PRs against core behavior
- direct PRs that change methodology or feature-boundary rules
- direct PRs that change `.coai` conventions without prior discussion

### Suggested policy text

- Please open an Issue before submitting major feature or methodology changes.
- During the warm-up phase, core behavior changes are usually implemented by the maintainer with AI assistance after triage.
- Feedback, reproduction cases, and documentation improvements are highly welcome.

## Skill Upgrade Policy

Current practical policy:

- repository `skills/coai/` is the source of truth
- local installed Codex skill is a synchronized copy
- use `coai skill sync` to copy the latest repository skill into the local Codex skill directory

## Package And Command Policy

Recommended command model:

- initialize workspace: `npx coai init`
- check package update availability: `npx coai check-update`
- update workspace system assets: `npx coai update` or `npx coai coai sync`
- sync local Codex skill: `npx coai skill sync`

Important boundary:

- package update itself still belongs to the package manager
- use `npm install -D @5dc/coai@latest` to update the package version

## Suggested Public Positioning

- public layer: system, method, template, demos
- delayed layer: internal cognition assets of the current CoAI repository
- collaboration focus: issue-first, maintainer-triaged, AI-assisted implementation
