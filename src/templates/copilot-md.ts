import type { StackInfo } from "../detect.js";
import { commandsSection, conventionsSection } from "./shared.js";

export function generateCopilotMd(
  projectName: string,
  stack: StackInfo,
): string {
  const sections: string[] = [];

  sections.push(`# ${projectName}\n`);

  const techParts: string[] = [];
  if (stack.languages.length > 0) techParts.push(stack.languages.join(", "));
  if (stack.frameworks.length > 0) techParts.push(stack.frameworks.join(", "));
  if (techParts.length > 0) {
    sections.push(`Tech: ${techParts.join(", ")}\n`);
  }

  sections.push(`## Commands\n`);
  sections.push(commandsSection(stack));

  sections.push(`\n## Conventions\n`);
  sections.push(conventionsSection(stack));

  return sections.join("\n") + "\n";
}
