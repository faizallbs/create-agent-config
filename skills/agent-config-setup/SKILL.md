---
name: agent-config-setup
description: Generate AI agent config files for any project — Cursor, Claude Code, Copilot, Windsurf, Cline, AGENTS.md. Use when setting up a new project for AI agents.
---

# Agent Config Setup

Use this skill to generate AI agent configuration files for a project. One command detects the stack and writes config for every major AI coding tool.

## Usage

```bash
npm create agent-config
```

Or with npx:

```bash
npx create-agent-config [directory]
```

## Supported Formats

| Format                            | Agent              |
| --------------------------------- | ------------------ |
| `.cursor/rules/*.mdc`             | Cursor             |
| `CLAUDE.md`                       | Claude Code        |
| `AGENTS.md`                       | Universal standard |
| `.github/copilot-instructions.md` | GitHub Copilot     |
| `.windsurfrules`                  | Windsurf           |
| `.clinerules`                     | Cline              |

## What It Does

1. Scans your project for stack signals (package.json, tsconfig, Dockerfile, etc.)
2. Detects frameworks, languages, test tools, CI setup
3. Asks which config formats you want
4. Writes tailored config files with project-specific conventions

## Key Patterns

- Auto-detects: TypeScript, React, Next.js, Python, Go, Docker, Monorepos, and 20+ more
- Each format gets the same project knowledge, adapted to the tool's config syntax
- Safe to run on existing projects — won't overwrite files without confirmation
- Non-interactive mode: `npx create-agent-config --yes` for CI/scripting
