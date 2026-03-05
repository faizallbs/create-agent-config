import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { detectStack } from "../src/detect.js";

function createTempDir(): string {
  const dir = join(
    tmpdir(),
    `cac-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(dir, { recursive: true });
  return dir;
}

describe("detectStack", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("detects empty directory", () => {
    const stack = detectStack(tempDir);
    expect(stack.languages).toEqual([]);
    expect(stack.frameworks).toEqual([]);
    expect(stack.packageManager).toBe("unknown");
  });

  it("detects TypeScript project", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({
        name: "my-app",
        scripts: { build: "tsc", test: "vitest run" },
        devDependencies: { typescript: "^5.0.0", vitest: "^1.0.0" },
      }),
    );
    writeFileSync(join(tempDir, "tsconfig.json"), "{}");
    writeFileSync(join(tempDir, "package-lock.json"), "{}");

    const stack = detectStack(tempDir);
    expect(stack.name).toBe("my-app");
    expect(stack.languages).toContain("TypeScript");
    expect(stack.hasTypeScript).toBe(true);
    expect(stack.testFrameworks).toContain("Vitest");
    expect(stack.packageManager).toBe("npm");
  });

  it("detects React + Next.js", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({
        name: "nextjs-app",
        dependencies: { react: "^18.0.0", next: "^14.0.0" },
        devDependencies: {},
      }),
    );
    writeFileSync(join(tempDir, "next.config.js"), "module.exports = {}");

    const stack = detectStack(tempDir);
    expect(stack.frameworks).toContain("Next.js");
    expect(stack.frameworks).toContain("React");
  });

  it("detects Python project", () => {
    writeFileSync(join(tempDir, "requirements.txt"), "flask==3.0.0\n");

    const stack = detectStack(tempDir);
    expect(stack.languages).toContain("Python");
    expect(stack.hasPython).toBe(true);
  });

  it("detects pnpm", () => {
    writeFileSync(join(tempDir, "package.json"), JSON.stringify({ name: "x" }));
    writeFileSync(join(tempDir, "pnpm-lock.yaml"), "");

    const stack = detectStack(tempDir);
    expect(stack.packageManager).toBe("pnpm");
  });

  it("detects monorepo with turbo", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({ name: "mono" }),
    );
    writeFileSync(join(tempDir, "turbo.json"), "{}");

    const stack = detectStack(tempDir);
    expect(stack.isMonorepo).toBe(true);
  });

  it("detects monorepo with workspaces", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({
        name: "mono",
        workspaces: ["packages/*"],
      }),
    );

    const stack = detectStack(tempDir);
    expect(stack.isMonorepo).toBe(true);
  });

  it("detects NestJS", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({
        name: "api",
        dependencies: { "@nestjs/core": "^10.0.0", express: "^4.0.0" },
        devDependencies: { jest: "^29.0.0" },
      }),
    );

    const stack = detectStack(tempDir);
    expect(stack.frameworks).toContain("NestJS");
    expect(stack.frameworks).toContain("Express");
    expect(stack.testFrameworks).toContain("Jest");
  });

  it("lists top-level directories", () => {
    mkdirSync(join(tempDir, "src"));
    mkdirSync(join(tempDir, "tests"));
    mkdirSync(join(tempDir, "node_modules"));

    const stack = detectStack(tempDir);
    expect(stack.directories).toContain("src");
    expect(stack.directories).toContain("tests");
    expect(stack.directories).not.toContain("node_modules");
  });
});
