import { describe, it, expect } from "vitest";
import type { StackInfo } from "../src/detect.js";
import { getMatchingFileNames } from "../src/rules.js";

const baseStack: StackInfo = {
  name: "test",
  languages: [],
  frameworks: [],
  buildTools: [],
  testFrameworks: [],
  packageManager: "npm",
  scripts: {},
  hasTypeScript: false,
  hasPython: false,
  isMonorepo: false,
  directories: [],
};

describe("getMatchingFileNames", () => {
  it("returns empty for unrecognized stack", () => {
    expect(getMatchingFileNames(baseStack)).toEqual([]);
  });

  it("maps TypeScript to typescript file", () => {
    const stack = { ...baseStack, languages: ["TypeScript"] };
    expect(getMatchingFileNames(stack)).toContain("typescript");
  });

  it("maps Next.js to nextjs file", () => {
    const stack = { ...baseStack, frameworks: ["Next.js"] };
    expect(getMatchingFileNames(stack)).toContain("nextjs");
  });

  it("maps multiple frameworks and languages", () => {
    const stack = {
      ...baseStack,
      languages: ["TypeScript", "Python"],
      frameworks: ["React", "Express"],
    };
    const files = getMatchingFileNames(stack);
    expect(files).toContain("typescript");
    expect(files).toContain("python");
    expect(files).toContain("react");
    expect(files).toContain("expressjs");
  });

  it("deduplicates results", () => {
    const stack = { ...baseStack, languages: ["TypeScript"] };
    const files = getMatchingFileNames(stack);
    const unique = [...new Set(files)];
    expect(files).toEqual(unique);
  });
});
