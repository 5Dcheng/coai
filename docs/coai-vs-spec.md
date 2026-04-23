# CoAI vs Spec-Driven Systems

## Purpose

This document explains the relationship and boundary between CoAI and spec-driven systems such as Spec-Driven Development, `spec-kit`, or similar plan/spec workflows.

The goal is not to deny overlap. The goal is to make the primary responsibility of each system explicit, so CoAI does not drift into the wrong product category.

## Short Answer

There is overlap, but the center of gravity is different.

- spec-driven systems focus on specification, execution planning, task decomposition, dependency ordering, and engineering control
- CoAI focuses on feature semantics, state-aware project cognition, semantic-to-code linkage, and cognition backflow after implementation

In one sentence:

- spec-driven systems are process-driven execution frameworks
- CoAI is a state-driven project cognition layer

## Where They Overlap

Both systems can appear before coding starts.

Both may help answer questions like:

- what is the feature
- what is the ideal path
- what constraints matter
- what should happen next

That means CoAI is not "anti-plan," and spec systems are not "anti-cognition."

The difference is in what their outputs are optimized to preserve over time.

## Core Difference

### Spec-driven systems

Primary concern:

- how to structure and control a change

Typical outputs:

- spec
- plan
- tasks
- design
- constitution / rules
- checkpoints / test gates

Primary value:

- reduce ambiguity before implementation
- organize execution order
- make multi-step engineering work controllable

### CoAI

Primary concern:

- how to keep a project understandable as it evolves

Typical outputs:

- `project/<module>/<feature>.md`
- `node/*.node.json`
- `mapper/*.mapper.json`
- `current.md`
- bug logs
- `@coai anchor`

Primary value:

- preserve feature meaning
- keep semantic entry points stable
- connect semantics to real code
- let cognition flow back into the project after implementation
- prevent long-running AI-built projects from becoming black boxes

## Process vs State

This is the most important distinction.

Spec-driven systems are usually process-oriented:

- define the change
- decompose the work
- order the tasks
- execute
- verify

CoAI is state-oriented:

- define feature meaning
- preserve the current valid cognition
- bind meaning to implementation
- update project state after the implementation changes

CoAI assumes a project moves forward through state, not by preserving every detail of the process that led there.

That is why CoAI should not become a full archive of exploration history.

## Why CoAI Should Not Try To Become `spec-kit`

If CoAI expands too far into plan/task orchestration, it starts competing in a category that already has stronger and more explicit tools.

That would weaken CoAI's sharpest differentiation.

CoAI's strongest position is not:

- "a lighter spec system"
- "a visual plan system"
- "another task breakdown workflow"

CoAI's strongest position is:

- semantic feature design before coding
- semantic-to-code linkage during coding
- cognition backflow after coding
- long-term project comprehensibility

## What CoAI Can Do Before Coding

CoAI still has a valid role before implementation.

It can help define:

- the ideal path
- the core feature semantics
- meaningful nodes in the feature flow
- high-level technical direction
- the future semantic anchors that will connect docs and code

This is lighter than a full execution spec.

It is closer to semantic feature design than to full engineering orchestration.

## What CoAI Does After Coding

This is where CoAI becomes most distinct.

After code is implemented and validated, CoAI can:

- attach feature meaning back to code via anchors and mapper
- provide Hover cognition through node files
- maintain mapper line locations through git-aware sync
- keep unresolved cognition-layer problems visible through bug logs
- preserve the current meaningful project state in `current.md`

This is not the main job of spec-driven systems.

## Output Comparison

### Spec-driven output

Optimized for:

- execution clarity
- sequencing
- dependency control
- engineering rigor

Common questions it answers:

- what should we do
- in what order
- with which constraints
- how do we verify it

### CoAI output

Optimized for:

- semantic clarity
- feature understanding
- code reachability
- long-term cognition continuity

Common questions it answers:

- what does this feature mean
- where does it live in code
- what parts of the implementation matter
- what stable knowledge should remain after implementation evolves

## Typical Combined Workflow

These systems can be complementary.

One reasonable flow is:

1. CoAI helps express feature semantics and ideal path in natural language
2. a spec/planning system optionally turns that into execution structure
3. coding happens
4. validation happens
5. CoAI receives cognition backflow and binds stable semantics to code

This can be summarized as:

`CoAI -> spec/plan -> coding -> validation -> CoAI`

But this does not mean CoAI should absorb the whole spec/planning layer.

## Non-Engineer Entry Point

CoAI has a particularly strong entry point for non-engineers or non-technical builders.

Many people know:

- the workflow they want
- the outcome they want
- the major steps in the process
- the important exceptions

But they do not know technical language.

CoAI allows that workflow knowledge to become a usable semantic feature description before it becomes technical code.

This is a different entry point from many spec systems, which assume the work is already ready to be formalized as engineering artifacts.

## Long-Term Need

Spec-heavy workflows can be very valuable in:

- large teams
- high-risk systems
- strict governance environments
- complex dependency-heavy engineering

But they are not universally required in every AI-native project, especially when:

- the builder is solo or small-team
- the system is evolving quickly
- strong coding agents already perform internal planning
- the main problem becomes comprehension drift rather than task decomposition

In those cases, CoAI can remain useful even when formal spec workflows are reduced or optional.

## Final Position

CoAI should not position itself as a direct `spec-kit` competitor.

The better position is:

- spec systems organize execution
- CoAI preserves project cognition

Or more sharply:

- spec systems help decide how to execute change
- CoAI helps keep the evolving system understandable

## Recommended One-Sentence Definition

Use this when distinction matters:

**CoAI is a state-driven project cognition layer for AI-native development, not a process-driven execution orchestration system.**
