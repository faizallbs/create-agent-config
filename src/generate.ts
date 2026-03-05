import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { StackInfo } from "./detect.js";
import type { OutputFormat } from "./prompt.js";
import { generateAgentsMd } from "./templates/agents-md.js";
import { generateClaudeMd } from "./templates/claude-md.js";
import { generateCursorMdc } from "./templates/cursor-mdc.js";
import { generateCopilotMd } from "./templates/copilot-md.js";
import { generateWindsurfrules } from "./templates/windsurf.js";
import { generateClinerules } from "./templates/cline.js";

interface GeneratedFile {
  path: string;
  content: string;
}

function getOutputPath(format: OutputFormat): string {
  switch (format) {
    case "agents-md":
      return "AGENTS.md";
    case "claude-md":
      return "CLAUDE.md";
    case "cursor-mdc":
      return ".cursor/rules/project.mdc";
    case "copilot-md":
      return ".github/copilot-instructions.md";
    case "windsurfrules":
      return ".windsurfrules";
    case "clinerules":
      return ".clinerules";
  }
}

function renderTemplate(
  format: OutputFormat,
  projectName: string,
  stack: StackInfo,
): string {
  switch (format) {
    case "agents-md":
      return generateAgentsMd(projectName, stack);
    case "claude-md":
      return generateClaudeMd(projectName, stack);
    case "cursor-mdc":
      return generateCursorMdc(projectName, stack);
    case "copilot-md":
      return generateCopilotMd(projectName, stack);
    case "windsurfrules":
      return generateWindsurfrules(projectName, stack);
    case "clinerules":
      return generateClinerules(projectName, stack);
  }
}

export function generateFiles(
  projectName: string,
  stack: StackInfo,
  formats: OutputFormat[],
  rootDir: string,
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  for (const format of formats) {
    const relativePath = getOutputPath(format);
    const fullPath = join(rootDir, relativePath);
    const content = renderTemplate(format, projectName, stack);

    if (existsSync(fullPath)) {
      console.log(`  ⚠ skipped ${relativePath} (already exists)`);
      continue;
    }

    const dir = dirname(fullPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(fullPath, content, "utf-8");
    files.push({ path: relativePath, content });
    console.log(`  ✓ ${relativePath}`);
  }

  return files;
}
