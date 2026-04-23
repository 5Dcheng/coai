# Templates

## Purpose

This directory contains canonical generation templates for CoAI assets.

Use templates when you are creating or rewriting a real asset.

## Boundary

- use templates to generate formal project assets
- treat templates as skeletons, not as complete examples
- replace placeholders such as `<module>` and `<feature>` before writing into a real repository
- do not copy examples as if they were templates

## Read Order

1. choose the correct template for the target asset
2. fill it with current task context
3. only read `../examples/*` if the template is still too abstract

## Files

- `feature.md`: create `.coai/project/<module>/<feature>.md`
- `module.md`: create optional `.coai/project/<module>.md`
- `current.md`: update `.coai/current.md`
- `mapper.json`: create `.coai/mapper/<module>/<feature>.mapper.json`
- `node.json`: create `.coai/node/<module>/<feature>/*.node.json`
- `bug-template.json`: create bug log JSON files
- `repair-prompt-template.md`: create repair prompts
