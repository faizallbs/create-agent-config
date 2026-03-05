import type { StackInfo } from "../detect.js";
import { commandsSection, conventionsSection } from "./shared.js";

export function generateCursorMdc(
  projectName: string,
  stack: StackInfo,
  communityContent = "",
): string {
  const lines: string[] = [];

  lines.push(`---`);
  lines.push(`description: Project rules for ${projectName}`);
  lines.push(`globs:`);
  lines.push(`alwaysApply: true`);
  lines.push(`---\n`);

  lines.push(`# ${projectName}\n`);

  const techParts: string[] = [];
  if (stack.languages.length > 0) techParts.push(stack.languages.join(", "));
  if (stack.frameworks.length > 0) techParts.push(stack.frameworks.join(", "));
  if (techParts.length > 0) {
    lines.push(`Stack: ${techParts.join(" + ")}\n`);
  }

  lines.push(`## Commands\n`);
  lines.push(commandsSection(stack));

  lines.push(`\n## Conventions\n`);
  lines.push(conventionsSection(stack));

  if (communityContent) {
    lines.push(`\n## Best Practices\n`);
    lines.push(communityContent);
  }

  lines.push(`\n## Rules\n`);
  lines.push(`- Do not modify generated files in \`dist/\` or \`build/\``);
  lines.push(`- Run tests before suggesting changes are complete`);
  lines.push(`- Prefer editing existing files over creating new ones`);

  return lines.join("\n") + "\n";
}
