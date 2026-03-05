import type { StackInfo } from "../detect.js";
import {
  stackSummary,
  commandsSection,
  directorySection,
  conventionsSection,
} from "./shared.js";

export function generateAgentsMd(
  projectName: string,
  stack: StackInfo,
  communityContent = "",
): string {
  const sections: string[] = [];

  sections.push(`# ${projectName}\n`);
  sections.push(`## Project\n`);
  sections.push(stackSummary(stack));

  if (stack.isMonorepo) {
    sections.push(`\nThis is a monorepo.`);
  }

  sections.push(`\n## Commands\n`);
  sections.push(commandsSection(stack));

  const dirs = directorySection(stack);
  if (dirs) {
    sections.push(`\n## Structure\n`);
    sections.push(dirs);
  }

  sections.push(`\n## Conventions\n`);
  sections.push(conventionsSection(stack));

  if (communityContent) {
    sections.push(`\n## Best Practices\n`);
    sections.push(communityContent);
  }

  sections.push(`\n## Rules\n`);
  sections.push(`- Do not modify generated files in \`dist/\` or \`build/\``);
  sections.push(`- Run tests before committing`);
  sections.push(`- Keep commits small and focused`);

  return sections.join("\n") + "\n";
}
