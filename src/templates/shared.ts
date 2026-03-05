import type { StackInfo } from "../detect.js";

export function stackSummary(stack: StackInfo): string {
  const parts: string[] = [];
  if (stack.languages.length > 0)
    parts.push(`Languages: ${stack.languages.join(", ")}`);
  if (stack.frameworks.length > 0)
    parts.push(`Frameworks: ${stack.frameworks.join(", ")}`);
  if (stack.testFrameworks.length > 0)
    parts.push(`Testing: ${stack.testFrameworks.join(", ")}`);
  if (stack.buildTools.length > 0)
    parts.push(`Build: ${stack.buildTools.join(", ")}`);
  parts.push(`Package manager: ${stack.packageManager}`);
  return parts.join("\n");
}

export function commandsSection(stack: StackInfo): string {
  const lines: string[] = [];
  const s = stack.scripts;
  if (s.dev) lines.push(`- Dev server: \`${runner(stack)} dev\``);
  if (s.build) lines.push(`- Build: \`${runner(stack)} build\``);
  if (s.test) lines.push(`- Test: \`${runner(stack)} test\``);
  if (s.lint) lines.push(`- Lint: \`${runner(stack)} lint\``);
  if (s.typecheck) lines.push(`- Typecheck: \`${runner(stack)} typecheck\``);
  if (s.format) lines.push(`- Format: \`${runner(stack)} format\``);
  if (s.start) lines.push(`- Start: \`${runner(stack)} start\``);
  return lines.length > 0
    ? lines.join("\n")
    : "- Check package.json for available scripts";
}

function runner(stack: StackInfo): string {
  switch (stack.packageManager) {
    case "pnpm":
      return "pnpm";
    case "yarn":
      return "yarn";
    case "bun":
      return "bun run";
    default:
      return "npm run";
  }
}

export function directorySection(stack: StackInfo): string {
  if (stack.directories.length === 0) return "";
  return stack.directories.map((d) => `- \`${d}/\``).join("\n");
}

export function conventionsSection(stack: StackInfo): string {
  const lines: string[] = [];
  if (stack.hasTypeScript) {
    lines.push("- Use TypeScript strict mode");
    lines.push("- Prefer `const` over `let`, avoid `any`");
    lines.push("- Use explicit return types on exported functions");
  }
  if (
    stack.frameworks.includes("React") ||
    stack.frameworks.includes("Next.js")
  ) {
    lines.push("- Functional components only, no class components");
    lines.push("- Use hooks for state and side effects");
  }
  if (stack.frameworks.includes("NestJS")) {
    lines.push("- Follow NestJS module/controller/service pattern");
    lines.push("- Use dependency injection");
  }
  if (stack.hasPython) {
    lines.push("- Follow PEP 8 style");
    lines.push("- Use type hints");
  }
  if (lines.length === 0) {
    lines.push("- Follow existing code patterns");
    lines.push("- Keep functions small and focused");
  }
  return lines.join("\n");
}
