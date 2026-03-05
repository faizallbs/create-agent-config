import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { StackInfo } from "../src/detect.js";
import type { CommunityRule } from "../src/rules.js";
import { generateFiles } from "../src/generate.js";

function createTempDir(): string {
  const dir = join(
    tmpdir(),
    `cac-gen-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(dir, { recursive: true });
  return dir;
}

const baseStack: StackInfo = {
  name: "test-project",
  languages: ["TypeScript"],
  frameworks: ["React", "Next.js"],
  buildTools: ["tsup"],
  testFrameworks: ["Vitest"],
  packageManager: "npm",
  scripts: {
    dev: "next dev",
    build: "next build",
    test: "vitest run",
    lint: "eslint .",
  },
  hasTypeScript: true,
  hasPython: false,
  isMonorepo: false,
  directories: ["src", "tests", "public"],
};

const sampleRules: CommunityRule[] = [
  {
    title: "Next.js Best Practices",
    content:
      "Use server components by default. Minimize use client directives.",
    source: "cursor.directory",
  },
];

describe("generateFiles", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("generates AGENTS.md", () => {
    const files = generateFiles("my-app", baseStack, ["agents-md"], tempDir);
    expect(files).toHaveLength(1);
    expect((files[0] as { path: string }).path).toBe("AGENTS.md");

    const content = readFileSync(join(tempDir, "AGENTS.md"), "utf-8");
    expect(content).toContain("# my-app");
    expect(content).toContain("TypeScript");
    expect(content).toContain("React");
  });

  it("generates CLAUDE.md", () => {
    const files = generateFiles("my-app", baseStack, ["claude-md"], tempDir);
    expect(files).toHaveLength(1);

    const content = readFileSync(join(tempDir, "CLAUDE.md"), "utf-8");
    expect(content).toContain("# my-app");
    expect(content).toContain("npm run test");
  });

  it("generates .cursor/rules/project.mdc with frontmatter", () => {
    const files = generateFiles("my-app", baseStack, ["cursor-mdc"], tempDir);
    expect(files).toHaveLength(1);

    const content = readFileSync(
      join(tempDir, ".cursor/rules/project.mdc"),
      "utf-8",
    );
    expect(content).toMatch(/^---/);
    expect(content).toContain("alwaysApply: true");
    expect(content).toContain("# my-app");
  });

  it("generates copilot instructions in .github/", () => {
    const files = generateFiles("my-app", baseStack, ["copilot-md"], tempDir);
    expect(files).toHaveLength(1);
    expect(existsSync(join(tempDir, ".github/copilot-instructions.md"))).toBe(
      true,
    );
  });

  it("generates all formats", () => {
    const files = generateFiles(
      "my-app",
      baseStack,
      [
        "agents-md",
        "claude-md",
        "cursor-mdc",
        "copilot-md",
        "windsurfrules",
        "clinerules",
      ],
      tempDir,
    );
    expect(files).toHaveLength(6);
  });

  it("skips existing files", () => {
    writeFileSync(join(tempDir, "AGENTS.md"), "existing content");

    const files = generateFiles("my-app", baseStack, ["agents-md"], tempDir);
    expect(files).toHaveLength(0);

    const content = readFileSync(join(tempDir, "AGENTS.md"), "utf-8");
    expect(content).toBe("existing content");
  });

  it("includes framework-specific conventions", () => {
    const files = generateFiles("my-app", baseStack, ["agents-md"], tempDir);
    const content = (files[0] as { content: string }).content;
    expect(content).toContain("Functional components");
    expect(content).toContain("hooks");
  });

  it("includes community rules when provided", () => {
    const files = generateFiles(
      "my-app",
      baseStack,
      ["agents-md"],
      tempDir,
      sampleRules,
    );
    const content = (files[0] as { content: string }).content;
    expect(content).toContain("Best Practices");
    expect(content).toContain("server components");
  });

  it("omits community section when no rules provided", () => {
    const files = generateFiles("my-app", baseStack, ["agents-md"], tempDir);
    const content = (files[0] as { content: string }).content;
    expect(content).not.toContain("Best Practices");
  });

  it("handles Python project", () => {
    const pyStack: StackInfo = {
      ...baseStack,
      languages: ["Python"],
      frameworks: ["FastAPI"],
      hasTypeScript: false,
      hasPython: true,
      testFrameworks: ["pytest"],
      scripts: {},
      packageManager: "unknown",
    };

    const files = generateFiles("py-api", pyStack, ["agents-md"], tempDir);
    const content = (files[0] as { content: string }).content;
    expect(content).toContain("Python");
    expect(content).toContain("PEP 8");
    expect(content).toContain("type hints");
  });
});
