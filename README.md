<h1 align="center">create-agent-config</h1>

<p align="center">
  <strong>Your AI agent starts every session blind. Fix that in 10 seconds.</strong>
</p>

<p align="center">
  One command. Detects your stack. Generates config files<br>
  for Cursor, Claude Code, Copilot, Windsurf, Cline, and the AGENTS.md standard.
</p>

<p align="center">
  <a href="#quick-start"><img src="https://img.shields.io/badge/Try_It_Now-22c55e?style=for-the-badge&logoColor=white" alt="Try It Now" /></a>
  &nbsp;
  <a href="#supported-formats"><img src="https://img.shields.io/badge/See_Formats-8b5cf6?style=for-the-badge&logoColor=white" alt="See Formats" /></a>
</p>

<p align="center">
  <a href="https://github.com/ofershap/create-agent-config/stargazers"><img src="https://img.shields.io/github/stars/ofershap/create-agent-config?style=social" alt="GitHub stars" /></a>
  &nbsp;
  <a href="https://www.npmjs.com/package/create-agent-config"><img src="https://img.shields.io/npm/v/create-agent-config.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/create-agent-config"><img src="https://img.shields.io/npm/dm/create-agent-config.svg" alt="npm downloads" /></a>
  <a href="https://github.com/ofershap/create-agent-config/actions/workflows/ci.yml"><img src="https://github.com/ofershap/create-agent-config/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-strict-blue" alt="TypeScript" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
  <a href="https://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
</p>

---

## The Setup Problem

You open a project in Cursor. The agent doesn't know your stack, your conventions, your test commands. It guesses. It guesses wrong.

So you write a CLAUDE.md. Then you need .cursor/rules for Cursor. Then copilot-instructions.md for Copilot. Then .windsurfrules because half your team uses Windsurf.

That's 4 files saying roughly the same thing, and you wrote them all from scratch.

## Quick Start

```bash
npm create agent-config
```

That's it. It scans your project, asks which formats you want, and writes the files.

Works with `npx` too:

```bash
npx create-agent-config
```

Or target a specific directory:

```bash
npx create-agent-config ./my-project
```

## What It Does

1. Scans your project directory (package.json, tsconfig, framework configs, lockfiles)
2. Detects languages, frameworks, test runners, build tools, package manager
3. Asks which config formats to generate
4. Writes best-practice config files with your detected stack baked in

No API keys. No LLM calls. Works offline. Instant.

## Supported Formats

| Format         | File                              | Tools                           |
| -------------- | --------------------------------- | ------------------------------- |
| AGENTS.md      | `AGENTS.md`                       | Codex, Devin, Jules, 40+ agents |
| Claude Code    | `CLAUDE.md`                       | Claude Code                     |
| Cursor         | `.cursor/rules/project.mdc`       | Cursor IDE (modern format)      |
| GitHub Copilot | `.github/copilot-instructions.md` | GitHub Copilot                  |
| Windsurf       | `.windsurfrules`                  | Windsurf / Codeium              |
| Cline          | `.clinerules`                     | Cline                           |

All formats get the same detected information - your stack, commands, conventions, project structure. Edit them after generation to add project-specific rules.

## What Gets Detected

| Category         | Examples                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Languages        | TypeScript, JavaScript, Python, Rust, Go                                                    |
| Frameworks       | Next.js, React, Vue, Nuxt, Angular, Svelte, NestJS, Express, Fastify, Hono, Django, FastAPI |
| Test runners     | Vitest, Jest, Mocha, Playwright, Cypress, pytest                                            |
| Build tools      | tsup, esbuild, rollup, Vite, Webpack                                                        |
| Package managers | npm, pnpm, yarn, bun                                                                        |
| Monorepo tools   | Turborepo, Nx, Lerna, workspaces                                                            |

Detection is static analysis only. It reads config files and package.json - nothing gets executed, nothing gets uploaded.

## Generated Output

Here's what a generated `AGENTS.md` looks like for a Next.js + TypeScript project:

```markdown
# my-app

## Project

Languages: TypeScript
Frameworks: Next.js, React
Testing: Vitest
Package manager: pnpm

## Commands

- Dev server: `pnpm dev`
- Build: `pnpm build`
- Test: `pnpm test`
- Lint: `pnpm lint`

## Conventions

- Use TypeScript strict mode
- Prefer `const` over `let`, avoid `any`
- Use explicit return types on exported functions
- Functional components only, no class components
- Use hooks for state and side effects

## Rules

- Do not modify generated files in `dist/` or `build/`
- Run tests before committing
- Keep commits small and focused
```

The Cursor `.mdc` format includes YAML frontmatter with `alwaysApply: true` so rules load automatically.

## Existing Files Are Safe

If a config file already exists, it gets skipped. You won't lose anything.

## Tech Stack

|                  |                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| **Language**     | ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)     |
| **Testing**      | ![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)                        |
| **Bundler**      | ![tsup](https://img.shields.io/badge/tsup-ESM%20%2B%20CJS-yellow)                                        |
| **CI**           | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white) |
| **Dependencies** | Zero runtime deps                                                                                        |

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Author

[![Made by ofershap](https://gitshow.dev/api/card/ofershap)](https://gitshow.dev/ofershap)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/ofershap)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github&logoColor=white)](https://github.com/ofershap)

---

If this helped you, [star the repo](https://github.com/ofershap/create-agent-config), [open an issue](https://github.com/ofershap/create-agent-config/issues) if something breaks, or [start a discussion](https://github.com/ofershap/create-agent-config/discussions).

## License

[MIT](LICENSE) &copy; [Ofer Shapira](https://github.com/ofershap)
