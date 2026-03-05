import { get as httpsGet } from "node:https";
import type { StackInfo } from "./detect.js";

const RAW_BASE =
  "https://raw.githubusercontent.com/pontusab/cursor.directory/main/packages/data/src/rules";

const FRAMEWORK_TO_FILES: Record<string, string> = {
  "Next.js": "nextjs",
  React: "react",
  Vue: "vue",
  Nuxt: "nuxtjs",
  Angular: "angular",
  Svelte: "svelte",
  SvelteKit: "sveltekit",
  Astro: "astro",
  Remix: "remix",
  Express: "expressjs",
  Fastify: "fastify",
  NestJS: "nestjs",
  Electron: "electron",
  Django: "django",
  Flask: "flask",
  FastAPI: "fastapi",
  Vite: "react-vite-2026",
};

const LANGUAGE_TO_FILES: Record<string, string> = {
  TypeScript: "typescript",
  Python: "python",
  Rust: "rust",
  Go: "go",
};

export interface CommunityRule {
  title: string;
  content: string;
  source: string;
}

function httpGet(url: string, timeoutMs = 8000): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = httpsGet(
      url,
      { headers: { "User-Agent": "create-agent-config" } },
      (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          httpGet(res.headers.location, timeoutMs).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        res.on("error", reject);
      },
    );
    req.on("error", reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });
  });
}

function parseFirstRule(tsSource: string): CommunityRule | null {
  const contentMatch = tsSource.match(/content:\s*`([\s\S]*?)`/);
  if (!contentMatch?.[1]) return null;

  const titleMatch = tsSource.match(/title:\s*"([^"]+)"/);

  return {
    title: titleMatch?.[1] ?? "Community rule",
    content: contentMatch[1].trim(),
    source: "cursor.directory",
  };
}

async function fetchRuleFile(fileName: string): Promise<CommunityRule | null> {
  try {
    const raw = await httpGet(`${RAW_BASE}/${fileName}.ts`);
    return parseFirstRule(raw);
  } catch {
    return null;
  }
}

export function getMatchingFileNames(stack: StackInfo): string[] {
  const files = new Set<string>();

  for (const fw of stack.frameworks) {
    const mapped = FRAMEWORK_TO_FILES[fw];
    if (mapped) files.add(mapped);
  }

  for (const lang of stack.languages) {
    const mapped = LANGUAGE_TO_FILES[lang];
    if (mapped) files.add(mapped);
  }

  return [...files];
}

export async function fetchCommunityRules(
  stack: StackInfo,
): Promise<CommunityRule[]> {
  const fileNames = getMatchingFileNames(stack);
  if (fileNames.length === 0) return [];

  const results = await Promise.allSettled(
    fileNames.map((f) => fetchRuleFile(f)),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<CommunityRule | null> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value)
    .filter((r): r is CommunityRule => r !== null);
}
