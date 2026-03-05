import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import * as p from "@clack/prompts";
import color from "picocolors";
import type { StackInfo } from "./detect.js";
import type { OutputFormat } from "./prompt.js";
import type { CommunityRule } from "./rules.js";
import { generateAgentsMd } from "./templates/agents-md.js";
import { generateClaudeMd } from "./templates/claude-md.js";
import { generateCursorMdc } from "./templates/cursor-mdc.js";
import { generateCopilotMd } from "./templates/copilot-md.js";
import { generateWindsurfrules } from "./templates/windsurf.js";
import { generateClinerules } from "./templates/cline.js";

export interface GeneratedFile {
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
  communityRules: CommunityRule[],
): string {
  const communityContent =
    communityRules.length > 0
      ? communityRules.map((r) => r.content).join("\n\n")
      : "";

  switch (format) {
    case "agents-md":
      return generateAgentsMd(projectName, stack, communityContent);
    case "claude-md":
      return generateClaudeMd(projectName, stack, communityContent);
    case "cursor-mdc":
      return generateCursorMdc(projectName, stack, communityContent);
    case "copilot-md":
      return generateCopilotMd(projectName, stack, communityContent);
    case "windsurfrules":
      return generateWindsurfrules(projectName, stack, communityContent);
    case "clinerules":
      return generateClinerules(projectName, stack, communityContent);
  }
}

export function generateFiles(
  projectName: string,
  stack: StackInfo,
  formats: OutputFormat[],
  rootDir: string,
  communityRules: CommunityRule[] = [],
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  for (const format of formats) {
    const relativePath = getOutputPath(format);
    const fullPath = join(rootDir, relativePath);
    const content = renderTemplate(format, projectName, stack, communityRules);

    if (existsSync(fullPath)) {
      p.log.warn(
        `${color.dim(relativePath)} ${color.yellow("skipped (already exists)")}`,
      );
      continue;
    }

    const dir = dirname(fullPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(fullPath, content, "utf-8");
    files.push({ path: relativePath, content });
    p.log.success(`${color.green(relativePath)}`);
  }

  return files;
}
