import { resolve } from "node:path";
import { detectStack } from "./detect.js";
import { promptUser } from "./prompt.js";
import { generateFiles } from "./generate.js";

const VERSION = "1.0.0";

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--version") || args.includes("-v")) {
    console.log(VERSION);
    return;
  }

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
  create-agent-config v${VERSION}

  Scaffold AI agent config files for your project.

  Usage:
    npm create agent-config          Interactive mode
    npx create-agent-config          Same thing
    npx create-agent-config [dir]    Target a specific directory

  Options:
    -v, --version    Print version
    -h, --help       Print this help
`);
    return;
  }

  const targetDir = resolve(args[0] ?? ".");

  console.log(`\n  create-agent-config v${VERSION}\n`);
  console.log(`  Scanning ${targetDir}...\n`);

  const stack = detectStack(targetDir);

  if (stack.languages.length > 0) {
    console.log(`  Detected: ${stack.languages.join(", ")}`);
  }
  if (stack.frameworks.length > 0) {
    console.log(`  Frameworks: ${stack.frameworks.join(", ")}`);
  }
  if (stack.testFrameworks.length > 0) {
    console.log(`  Testing: ${stack.testFrameworks.join(", ")}`);
  }

  const choices = await promptUser(stack);

  console.log(`\n  Generating config files...\n`);

  const files = generateFiles(
    choices.projectName,
    stack,
    choices.formats,
    targetDir,
  );

  if (files.length > 0) {
    console.log(
      `\n  Done. ${files.length} file${files.length === 1 ? "" : "s"} created.`,
    );
    console.log(`  Edit them to match your project's specific needs.\n`);
  } else {
    console.log(`\n  No files generated (all already exist).\n`);
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
