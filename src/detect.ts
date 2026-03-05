import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

export interface StackInfo {
  name: string;
  languages: string[];
  frameworks: string[];
  buildTools: string[];
  testFrameworks: string[];
  packageManager: "npm" | "yarn" | "pnpm" | "bun" | "unknown";
  scripts: Record<string, string>;
  hasTypeScript: boolean;
  hasPython: boolean;
  isMonorepo: boolean;
  directories: string[];
}

function readJsonSafe(path: string): Record<string, unknown> | null {
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function fileExists(root: string, ...paths: string[]): boolean {
  return paths.some((p) => existsSync(join(root, p)));
}

function detectPackageManager(root: string): StackInfo["packageManager"] {
  if (existsSync(join(root, "bun.lockb")) || existsSync(join(root, "bun.lock")))
    return "bun";
  if (existsSync(join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(root, "yarn.lock"))) return "yarn";
  if (existsSync(join(root, "package-lock.json"))) return "npm";
  return "unknown";
}

function detectFrameworks(
  root: string,
  deps: Record<string, unknown>,
): string[] {
  const found: string[] = [];

  const checks: [string, string[] | (() => boolean)][] = [
    [
      "Next.js",
      () =>
        fileExists(root, "next.config.js", "next.config.mjs", "next.config.ts"),
    ],
    ["Nuxt", () => fileExists(root, "nuxt.config.ts", "nuxt.config.js")],
    ["Remix", ["@remix-run/react", "@remix-run/node"]],
    ["Astro", ["astro"]],
    ["SvelteKit", ["@sveltejs/kit"]],
    ["Angular", () => fileExists(root, "angular.json")],
    ["React", ["react"]],
    ["Vue", ["vue"]],
    ["Svelte", ["svelte"]],
    ["Express", ["express"]],
    ["Fastify", ["fastify"]],
    ["NestJS", ["@nestjs/core"]],
    ["Hono", ["hono"]],
    ["Elysia", ["elysia"]],
    ["Electron", ["electron"]],
    ["Vite", ["vite"]],
    ["Webpack", ["webpack"]],
    ["Turborepo", () => fileExists(root, "turbo.json")],
    ["Nx", () => fileExists(root, "nx.json")],
    ["Django", () => fileExists(root, "manage.py")],
    ["Flask", ["flask"]],
    ["FastAPI", ["fastapi"]],
  ];

  for (const [name, check] of checks) {
    if (typeof check === "function") {
      if (check()) found.push(name);
    } else {
      if (check.some((dep) => dep in deps)) found.push(name);
    }
  }

  return found;
}

function detectTestFrameworks(deps: Record<string, unknown>): string[] {
  const found: string[] = [];
  const checks: [string, string[]][] = [
    ["Vitest", ["vitest"]],
    ["Jest", ["jest"]],
    ["Mocha", ["mocha"]],
    ["Playwright", ["@playwright/test"]],
    ["Cypress", ["cypress"]],
    ["pytest", ["pytest"]],
  ];

  for (const [name, pkgs] of checks) {
    if (pkgs.some((dep) => dep in deps)) found.push(name);
  }

  return found;
}

function getTopLevelDirs(root: string): string[] {
  try {
    return readdirSync(root)
      .filter((f) => {
        if (
          f.startsWith(".") ||
          f === "node_modules" ||
          f === "dist" ||
          f === "build" ||
          f === "coverage"
        )
          return false;
        try {
          return statSync(join(root, f)).isDirectory();
        } catch {
          return false;
        }
      })
      .slice(0, 20);
  } catch {
    return [];
  }
}

export function detectStack(rootDir?: string): StackInfo {
  const root = resolve(rootDir ?? ".");
  const languages: string[] = [];
  const buildTools: string[] = [];

  const pkg = readJsonSafe(join(root, "package.json"));
  const allDeps: Record<string, unknown> = {
    ...((pkg?.dependencies as Record<string, unknown>) ?? {}),
    ...((pkg?.devDependencies as Record<string, unknown>) ?? {}),
  };

  const scripts = (pkg?.scripts as Record<string, string>) ?? {};
  const name = (pkg?.name as string) ?? "";

  const hasTypeScript = fileExists(root, "tsconfig.json", "tsconfig.base.json");
  const hasPython = fileExists(
    root,
    "requirements.txt",
    "pyproject.toml",
    "Pipfile",
    "setup.py",
    "setup.cfg",
  );
  const hasJs = pkg !== null || fileExists(root, "package.json");

  if (hasTypeScript) languages.push("TypeScript");
  if (hasJs && !hasTypeScript) languages.push("JavaScript");
  if (hasPython) languages.push("Python");
  if (fileExists(root, "Cargo.toml")) languages.push("Rust");
  if (fileExists(root, "go.mod")) languages.push("Go");

  if (hasTypeScript && "tsup" in allDeps) buildTools.push("tsup");
  if ("esbuild" in allDeps) buildTools.push("esbuild");
  if ("rollup" in allDeps) buildTools.push("rollup");

  const isMonorepo =
    fileExists(root, "turbo.json", "nx.json", "lerna.json") ||
    pkg?.workspaces !== undefined;

  const frameworks = detectFrameworks(root, allDeps);
  const testFrameworks = detectTestFrameworks(allDeps);

  return {
    name,
    languages,
    frameworks,
    buildTools,
    testFrameworks,
    packageManager: detectPackageManager(root),
    scripts,
    hasTypeScript,
    hasPython,
    isMonorepo,
    directories: getTopLevelDirs(root),
  };
}
