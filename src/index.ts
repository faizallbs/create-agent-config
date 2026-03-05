import { resolve } from "node:path";
import * as p from "@clack/prompts";
import color from "picocolors";
import { detectStack } from "./detect.js";
import { promptUser, showPlan } from "./prompt.js";
import { generateFiles } from "./generate.js";
import { fetchCommunityRules } from "./rules.js";
import type { CommunityRule } from "./rules.js";

const VERSION = "2.0.0";

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--version") || args.includes("-v")) {
    console.log(VERSION);
    return;
  }

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
  ${color.bold("create-agent-config")} v${VERSION}

  Scaffold AI agent config files for your project.
  Fetches community best practices from cursor.directory.

  ${color.dim("Usage:")}
    npm create agent-config          Interactive mode
    npx create-agent-config          Same thing
    npx create-agent-config [dir]    Target a specific directory

  ${color.dim("Options:")}
    --offline    Skip fetching community rules
    -v, --version    Print version
    -h, --help       Print this help

  ${color.dim("What gets generated (you choose which):")}
    AGENTS.md                        Open standard (Codex, Devin, Jules)
    CLAUDE.md                        Claude Code
    .cursor/rules/project.mdc       Cursor IDE
    .github/copilot-instructions.md GitHub Copilot
    .windsurfrules                   Windsurf / Codeium
    .clinerules                      Cline

  Existing files are never overwritten.
  Source: ${color.underline("https://github.com/ofershap/create-agent-config")}
`);
    return;
  }

  const offline = args.includes("--offline");
  const positionalArgs = args.filter((a) => !a.startsWith("-"));
  const targetDir = resolve(positionalArgs[0] ?? ".");

  p.intro(color.bgCyan(color.black(" create-agent-config ")));

  const s = p.spinner();

  s.start("Scanning project...");
  const stack = detectStack(targetDir);
  s.stop("Project scanned.");

  let remoteRules: CommunityRule[] = [];
  if (!offline) {
    s.start("Fetching community rules from cursor.directory...");
    remoteRules = await fetchCommunityRules(stack);
    if (remoteRules.length > 0) {
      s.stop(
        `Found ${remoteRules.length} community rule${remoteRules.length === 1 ? "" : "s"} for your stack.`,
      );
    } else {
      s.stop("No matching community rules found. Using built-in defaults.");
    }
  }

  const choices = await promptUser(stack, remoteRules);

  showPlan(
    choices.projectName,
    choices.formats,
    choices.useRemoteRules,
    targetDir,
  );

  const proceed = await p.confirm({
    message: "Generate these files?",
    initialValue: true,
  });

  if (p.isCancel(proceed) || !proceed) {
    p.cancel("Nothing generated.");
    return;
  }

  const activeRules = choices.useRemoteRules ? remoteRules : [];

  const files = generateFiles(
    choices.projectName,
    stack,
    choices.formats,
    targetDir,
    activeRules,
  );

  if (files.length > 0) {
    p.outro(
      `${color.green(`${files.length} file${files.length === 1 ? "" : "s"} created.`)} Edit them to match your project.`,
    );
  } else {
    p.outro("All files already existed. Nothing to do.");
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

export { detectStack } from "./detect.js";
export type { StackInfo } from "./detect.js";
export type { OutputFormat, UserChoices } from "./prompt.js";
export { generateFiles } from "./generate.js";
export type { CommunityRule } from "./rules.js";
export { fetchCommunityRules } from "./rules.js";
