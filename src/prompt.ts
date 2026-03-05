import * as p from "@clack/prompts";
import color from "picocolors";
import type { StackInfo } from "./detect.js";
import type { CommunityRule } from "./rules.js";

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
  useRemoteRules: boolean;
}

interface FormatOption {
  value: OutputFormat;
  label: string;
  hint: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: "agents-md",
    label: "AGENTS.md",
    hint: "open standard - Codex, Devin, Jules, 40+ tools",
  },
  {
    value: "claude-md",
    label: "CLAUDE.md",
    hint: "Claude Code",
  },
  {
    value: "cursor-mdc",
    label: ".cursor/rules/project.mdc",
    hint: "Cursor IDE",
  },
  {
    value: "copilot-md",
    label: ".github/copilot-instructions.md",
    hint: "GitHub Copilot",
  },
  {
    value: "windsurfrules",
    label: ".windsurfrules",
    hint: "Windsurf / Codeium",
  },
  {
    value: "clinerules",
    label: ".clinerules",
    hint: "Cline",
  },
];

function formatStack(stack: StackInfo): string {
  const parts: string[] = [];
  if (stack.languages.length > 0)
    parts.push(color.cyan(stack.languages.join(", ")));
  if (stack.frameworks.length > 0)
    parts.push(color.yellow(stack.frameworks.join(", ")));
  if (stack.testFrameworks.length > 0)
    parts.push(color.green(stack.testFrameworks.join(", ")));
  if (stack.buildTools.length > 0)
    parts.push(color.magenta(stack.buildTools.join(", ")));
  return parts.join(color.dim(" + "));
}

export async function promptUser(
  stack: StackInfo,
  remoteRules: CommunityRule[],
): Promise<UserChoices> {
  const detected = formatStack(stack);
  if (detected) {
    p.log.info(`Detected: ${detected}`);
    p.log.info(`Package manager: ${color.cyan(stack.packageManager)}`);
    if (stack.isMonorepo) p.log.info("Monorepo detected");
  } else {
    p.log.warn("Could not detect project stack. Using minimal defaults.");
  }

  const projectName = await p.text({
    message: "Project name?",
    placeholder: stack.name || "my-project",
    defaultValue: stack.name || "my-project",
  });

  if (p.isCancel(projectName)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const formats = await p.multiselect({
    message: "Which config files should I create?",
    options: FORMAT_OPTIONS,
    required: true,
    initialValues: FORMAT_OPTIONS.map((o) => o.value),
  });

  if (p.isCancel(formats)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  let useRemoteRules = false;
  if (remoteRules.length > 0) {
    const ruleNames = remoteRules
      .map((r) => color.cyan(r.title))
      .join(color.dim(", "));

    const useRemote = await p.confirm({
      message: `Found ${remoteRules.length} community rule${remoteRules.length === 1 ? "" : "s"} for your stack (${ruleNames}). Include them?`,
      initialValue: true,
    });

    if (p.isCancel(useRemote)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }

    useRemoteRules = useRemote;
  }

  return {
    projectName: projectName as string,
    formats: formats as OutputFormat[],
    useRemoteRules,
  };
}

export function showPlan(
  projectName: string,
  formats: OutputFormat[],
  useRemoteRules: boolean,
  rootDir: string,
): void {
  const lines = formats.map((f) => {
    const opt = FORMAT_OPTIONS.find((o) => o.value === f);
    const file = getFilePath(f);
    return `  ${color.green("+")} ${color.bold(file)} ${color.dim(`(${opt?.hint ?? f})`)}`;
  });

  p.log.message(
    [
      `${color.bold("Here's what I'll generate:")}`,
      "",
      ...lines,
      "",
      `${color.dim("Location:")} ${rootDir}`,
      useRemoteRules
        ? `${color.dim("Rules:")} community best practices from cursor.directory`
        : `${color.dim("Rules:")} built-in defaults`,
      `${color.dim("Existing files will be skipped.")}`,
    ].join("\n"),
  );
}

function getFilePath(format: OutputFormat): string {
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
