# Project Backbone

> Loaded every session. A map, not documentation: link to details, never copy them. Keep under ~80 lines.
> Fill with `/backbone-init`; kept in sync by `/spec-new` and `/spec-finish`; after work done without specs, run `/backbone-sync`.

Last synced: <date> | <sha>   (multi-repo: <date> | <repo>@<sha> <repo>@<sha> ...)

## Overview
- What: <one or two lines: what the system does and for whom>
- Stack: <languages, frameworks, infra>

## Structure
| Path / repo | Role |
|---|---|
| <path> | <what lives there> |

## Domain glossary
<!-- The nouns of the business, as the team says them. Code, specs and tests use these names. -->
| Term | Meaning | States / relations |
|---|---|---|
| <Order> | <one customer purchase> | <draft → paid → cancelled; has many OrderItem> |

## Docs index
| Doc | About | Status |
|---|---|---|
| <path> | <topic> | current / outdated (do not use for X) |

## Capabilities
<!-- One line per spec/specs/<capability>/spec.md -->
- <capability>: <one line>

## Open changes
<!-- One line per spec/changes/<name>/ not yet archived -->
- none

## Commands
- Install: <cmd>
- Verify (milestone and task DoD): <lint && typecheck && test>

## Invariants
<!-- Rules every change MUST respect. One line each. -->
- <e.g. money amounts are integers in base units, never floats>

## Conventions
- Branch / commit: <e.g. feat/<topic> from develop, conventional commits>
- Language & style: <e.g. Vietnamese prose, English technical terms>
