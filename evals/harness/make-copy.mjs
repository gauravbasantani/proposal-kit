#!/usr/bin/env node
// Makes one fresh copy of the kit for one eval run.
//   node evals/harness/make-copy.mjs <without|with> <dest>
// Both conditions get the same code: the components folder (minus stories and tests), lib, styles,
// and the config needed to type-check and build. Neither gets the checks (eslint rules, tests,
// scripts) or the reference view, so a run cannot copy the answer.
// "with" adds the AI-readable layer: AGENTS.md, components.json, llms.txt, the Storybook stories
// and the .storybook folder (which holds the "For AI tools" docs block).
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [condition, destArg] = process.argv.slice(2);
if (!["without", "with"].includes(condition) || !destArg) {
  console.error("usage: make-copy.mjs <without|with> <dest>");
  process.exit(2);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dest = resolve(destArg);
if (existsSync(dest)) {
  console.error(`${dest} already exists; use a fresh path`);
  process.exit(2);
}

const shared = ["package.json", "vite.config.ts", "tsconfig.app.json", "tsconfig.node.json", "src/lib", "src/styles/index.css", "src/styles/tokens.css", "src/components"];
const docsLayer = ["AGENTS.md", "components.json", "llms.txt", ".storybook"];

const isStory = (p) => /\.stories\.tsx?$/.test(p);
const isTest = (p) => /\.test\.tsx?$/.test(p);

function copy(rel, { stories }) {
  const from = join(root, rel);
  const walk = (p) => {
    if (statSync(p).isDirectory()) return readdirSync(p).forEach((n) => walk(join(p, n)));
    const r = relative(root, p);
    if (isTest(r)) return;
    if (isStory(r) && !stories) return;
    mkdirSync(dirname(join(dest, r)), { recursive: true });
    cpSync(p, join(dest, r));
  };
  walk(from);
}

mkdirSync(dest, { recursive: true });
for (const rel of shared) copy(rel, { stories: condition === "with" });
if (condition === "with") for (const rel of docsLayer) copy(rel, { stories: true });
mkdirSync(join(dest, "src/views"), { recursive: true });
writeFileSync(
  join(dest, "tsconfig.json"),
  JSON.stringify({ files: [], references: [{ path: "./tsconfig.app.json" }, { path: "./tsconfig.node.json" }] }, null, 2) + "\n",
);
symlinkSync(join(root, "node_modules"), join(dest, "node_modules"));
console.log(`${condition} copy at ${dest}`);
