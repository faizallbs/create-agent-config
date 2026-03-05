import { createInterface } from "node:readline";
import type { StackInfo } from "./detect.js";

export type OutputFormat =
  | "agents-md"
  | "claude-md"
  | "cursor-mdc"
  | "copilot-md"
  | "windsurfrules"
  | "clinerules";

export interface UserChoices {
  projectName: string;
  formats: OutputFormat[];
}

const FORMAT_LABELS: Record<OutputFormat, string> = {
  "agents-md":
    "AGENTS.md          (open standard - Codex, Devin, Jules, 40+ tools)",
  "claude-md": "CLAUDE.md          (Claude Code)",
  "cursor-mdc": ".cursor/rules/     (Cursor IDE - modern .mdc format)",
  "copilot-md": "copilot-instructions.md (GitHub Copilot)",
  windsurfrules: ".windsurfrules     (Windsurf / Codeium)",
  clinerules: ".clinerules        (Cline)",
};

const ALL_FORMATS: OutputFormat[] = [
  "agents-md",
  "claude-md",
  "cursor-mdc",
  "copilot-md",
  "windsurfrules",
  "clinerules",
];

function ask(
  rl: ReturnType<typeof createInterface>,
  question: string,
): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

export async function promptUser(stack: StackInfo): Promise<UserChoices> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const defaultName = stack.name || "my-project";
    const nameAnswer = await ask(rl, `\n  Project name (${defaultName}): `);
    const projectName = nameAnswer.trim() || defaultName;

    console.log("\n  Which config files should I generate?\n");

    ALL_FORMATS.forEach((fmt, i) => {
      console.log(`    ${i + 1}. ${FORMAT_LABELS[fmt]}`);
    });

    console.log(`    a. All of the above`);

    const formatAnswer = await ask(
      rl,
      `\n  Pick formats (comma-separated numbers, or 'a' for all) [a]: `,
    );

    let formats: OutputFormat[];
    const trimmed = formatAnswer.trim().toLowerCase();

    if (!trimmed || trimmed === "a" || trimmed === "all") {
      formats = [...ALL_FORMATS];
    } else {
      const indices = trimmed
        .split(/[,\s]+/)
        .map((s) => parseInt(s, 10) - 1)
        .filter((n) => n >= 0 && n < ALL_FORMATS.length);
      formats =
        indices.length > 0
          ? [...new Set(indices.map((i) => ALL_FORMATS[i] as OutputFormat))]
          : [...ALL_FORMATS];
    }

    return { projectName, formats };
  } finally {
    rl.close();
  }
}
