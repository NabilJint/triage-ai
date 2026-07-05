# Antigravity Agent Config

## Skills

ECC skills are available at `.agents/skills/` and include:
- frontend-patterns, backend-patterns, tdd-workflow, verification-loop
- api-design, e2e-testing, security-review, search-first
- deployment-patterns, database-migrations, cost-aware-llm-pipeline
- docker-patterns, coding-standards

## Agents

Subagents are available at `agents/`:
- planner, architect, code-reviewer, typescript-reviewer
- tdd-guide, security-reviewer, build-error-resolver, e2e-runner
- refactor-cleaner, doc-updater, docs-lookup, database-reviewer
- loop-operator, harness-optimizer, chief-of-staff

## Rules

Project rules at `.claude/rules/ecc/`:
- `common/` — Language-agnostic principles
- `typescript/` — TypeScript specific patterns

## Security

Run `npx ecc-agentshield scan` from project root.
