#!/usr/bin/env node
// Fails if a hex color or px value appears in any CSS file outside src/styles/tokens.css.
// TS/TSX files are covered by the ESLint rule proposal-kit/tokens-only.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.argv[2] ?? process.cwd();
const TOKEN_FILE = "src/styles/tokens.css";
const HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const PX = /\b\d+(?:\.\d+)?px\b/g;
const SKIP = new Set(["node_modules", "dist", "storybook-static", ".git", "evals"]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.css$/.test(name)) out.push(full);
  }
  return out;
}

let failures = 0;
for (const file of walk(join(root, "src")).concat(walk(join(root, ".storybook")))) {
  const rel = relative(root, file);
  if (rel === TOKEN_FILE) continue;
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      const code = line.replace(/\/\*.*?\*\//g, "");
      for (const m of [...code.matchAll(HEX), ...code.matchAll(PX)]) {
        failures++;
        console.error(`${rel}:${i + 1}  "${m[0]}" is a hardcoded value. Move it into ${TOKEN_FILE} and use the token.`);
      }
    });
}
if (failures) {
  console.error(`\ncheck-tokens: ${failures} hardcoded value(s) outside ${TOKEN_FILE}`);
  process.exit(1);
}
console.log(`check-tokens: OK (no hex or px outside ${TOKEN_FILE})`);
