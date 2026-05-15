# Experiment Environment

## Agent Runtime

- agent: Trae SOLO Coder
- model: Kimi K2.6
- workspace: `D:\c5dc\coai\valid\trea-kimi-base`
- language input: Chinese
- condition label used in CSV: `baseline`

## Built-in Context Features

Trae workspace context features were available during this baseline run:

- workspace code indexing: enabled
- workspace index status: 100%
- workspace-level search / retrieval: available
- document set: not intentionally used

## Interpretation Boundary

This baseline is not a raw LLM baseline.

It should be interpreted as:

```text
Trae + Kimi K2.6 + Trae built-in workspace index + README_zh.md
```

The later CoAI condition should use the same agent and workspace-index setting, with CoAI added as the cognition layer.

Therefore, the intended comparison is:

```text
baseline: agent workspace index + README
coai: agent workspace index + README + CoAI cognition map
```

This makes the comparison realistic for modern coding agents. It also means CoAI should not be evaluated as a replacement for workspace search, but as a project cognition map that may improve feature understanding, task boundaries, context recovery, and long-term maintenance cost.
