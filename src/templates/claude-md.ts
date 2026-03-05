import type { StackInfo } from "../detect.js";
import { stackSummary, commandsSection, conventionsSection } from "./shared.js";

export function generateClaudeMd(
  projectName: string,
  stack: StackInfo,
): string {
  const sections: string[] = [];

  sections.push(`# ${projectName}\n`);
  sections.push(stackSummary(stack));

  if (stack.isMonorepo) {
    sections.push(`\nMonorepo project.`);
  }

  sections.push(`\n## Commands\n`);
  sections.push(commandsSection(stack));

  sections.push(`\n## Conventions\n`);
  sections.push(conventionsSection(stack));

  sections.push(`\n## Important\n`);
  sections.push(`- Always run tests after changes`);
  sections.push(`- Do not edit files in \`dist/\` or \`build/\``);
  sections.push(`- Prefer editing existing files over creating new ones`);

  return sections.join("\n") + "\n";
}
