import type { StackInfo } from "../detect.js";
import { commandsSection, conventionsSection } from "./shared.js";

export function generateWindsurfrules(
  projectName: string,
  stack: StackInfo,
): string {
  const sections: string[] = [];

  sections.push(`# ${projectName}\n`);

  const techParts: string[] = [];
  if (stack.languages.length > 0) techParts.push(stack.languages.join(", "));
  if (stack.frameworks.length > 0) techParts.push(stack.frameworks.join(", "));
  if (techParts.length > 0) {
    sections.push(`Stack: ${techParts.join(" + ")}\n`);
  }

  sections.push(`## Commands\n`);
  sections.push(commandsSection(stack));

  sections.push(`\n## Conventions\n`);
  sections.push(conventionsSection(stack));

  sections.push(`\n## Rules\n`);
  sections.push(`- Run tests before completing tasks`);
  sections.push(`- Do not modify generated files in dist/ or build/`);

  return sections.join("\n") + "\n";
}
