# Evaluation Results

This directory is reserved for real evaluation run records.

Recommended structure:

```text
evaluation/results/teamdesk-lite-v0/
├── runs.csv
├── raw/
│   └── <runId>.md
└── reviews/
    └── <runId>.review.md
```

Use `raw/` to store the original agent feedback pasted from Trae, Claude Code, or another agent.

Use `reviews/` to store structured analysis extracted from the raw run.

Use `runs.csv` for metrics that can be aggregated across rounds, agents, models, and conditions.

Do not mix measured results with simulated data. If a value is estimated or simulated, label it explicitly.
