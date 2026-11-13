#!/usr/bin/env node
// Checks one eval run and counts failures by mistake type.
//   node evals/harness/check-run.mjs <run-copy-dir> <run-output-dir> <check-work-dir>
// Every check maps to exactly one mistake type (or "other", which is not counted in types 1-5):
//   type 1  eslint proposal-kit/no-raw-currency
//   type 2  eslint proposal-kit/payment-needs-terms; tsc errors on <PaymentLine>; rendered page shows a payment without 6.49% or 240 months
//   type 3  eslint proposal-kit/tokens-only; scripts/check-tokens.mjs on CSS the run wrote
//   type 4  eslint proposal-kit/savings-needs-estimate; tsc errors on <SavingsEstimate>; rendered savings without "estimated", rate, 3% or 25 years
//   type 5  eslint proposal-kit/no-color-only-status; axe in jsdom (all rules but contrast); axe color-contrast in real Chrome, light and dark
//   other   any other tsc or eslint error, render errors, expected amounts missing from the page, kit files the run changed
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [runDirArg, outDirArg, workArg] = process.argv.slice(2);
const kit = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const runDir = resolve(runDirArg);
const outDir = resolve(outDirArg);
const ws = resolve(workArg);
const log = [];
const say = (s) => log.push(s);
const findings = [];
const add = (type, check, detail) => findings.push({ type, check, detail });

// ---- 1. what did the run write or change? ----
const files = (dir, base = dir, acc = []) => {
  for (const n of readdirSync(dir)) {
    if (n === "node_modules") continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) files(p, base, acc);
    else acc.push(relative(base, p));
  }
  return acc;
};
// Only files the run itself wrote or edited (Write/Edit calls in its transcript) count. Comparing
// against the kit alone would blame a run for kit edits made after its copy was taken.
const touched = new Set();
const transcript = join(outDir, "transcript.jsonl");
const fromTranscript = existsSync(transcript);
if (fromTranscript) {
  for (const line of readFileSync(transcript, "utf8").split("\n")) {
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue;
    }
    if (e.type !== "assistant") continue;
    for (const c of e.message.content ?? []) {
      if (c.type === "tool_use" && ["Write", "Edit", "MultiEdit"].includes(c.name) && c.input.file_path) {
        touched.add(relative(runDir, resolve(runDir, c.input.file_path)));
      }
    }
  }
}
const written = [];
const changedKit = [];
for (const rel of files(runDir)) {
  if (fromTranscript && !touched.has(rel)) continue;
  const kitFile = join(kit, rel);
  if (!existsSync(kitFile)) written.push(rel);
  else if (rel !== "tsconfig.json" && readFileSync(kitFile, "utf8") !== readFileSync(join(runDir, rel), "utf8")) changedKit.push(rel);
}
say(`files the run wrote: ${written.join(", ") || "(none)"}`);
say(`kit files the run changed (not used in the check; the kit's originals are): ${changedKit.join(", ") || "(none)"}`);
for (const f of changedKit) add("other", "changed-kit-file", f);
mkdirSync(join(outDir, "output"), { recursive: true });
for (const rel of written.concat(changedKit)) {
  mkdirSync(dirname(join(outDir, "output", rel)), { recursive: true });
  cpSync(join(runDir, rel), join(outDir, "output", rel));
}
const target = "src/views/GeneratedSummary.tsx";
if (!written.includes(target)) add("other", "no-output-file", target);

// ---- 2. check workspace: the full kit plus what the run wrote ----
rmSync(ws, { recursive: true, force: true });
mkdirSync(ws, { recursive: true });
for (const rel of ["package.json", "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json", "tsconfig.test.json", "vite.config.ts", "vitest.config.ts", "eslint.config.js", "components.json", "eslint-rules", "scripts", "src", ".storybook"]) {
  cpSync(join(kit, rel), join(ws, rel), { recursive: true });
}
symlinkSync(join(kit, "node_modules"), join(ws, "node_modules"));
const agentSrc = written.filter((r) => r.startsWith("src/"));
for (const rel of agentSrc) {
  mkdirSync(dirname(join(ws, rel)), { recursive: true });
  cpSync(join(runDir, rel), join(ws, rel));
}
const agentCode = agentSrc.filter((r) => /\.(tsx?|jsx?)$/.test(r));
const agentCss = agentSrc.filter((r) => /\.css$/.test(r));

const run = (cmd, args, env = {}) => {
  const r = spawnSync(cmd, args, { cwd: ws, encoding: "utf8", env: { ...process.env, ...env }, maxBuffer: 64 * 1024 * 1024 });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
};

// ---- 3. TypeScript ----
const tsc = run("npx", ["tsc", "-p", "tsconfig.app.json", "--noEmit", "--pretty", "false"]);
say(`\n$ tsc -p tsconfig.app.json --noEmit (exit ${tsc.code})\n${tsc.out.trim() || "(no output)"}`);
for (const line of tsc.out.split("\n")) {
  const m = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/);
  if (!m) continue;
  const [, file, ln, col, code, msg] = m;
  if (!agentCode.includes(file)) continue;
  const src = readFileSync(join(ws, file), "utf8").split("\n")[Number(ln) - 1] ?? "";
  const at = src.slice(Number(col) - 1);
  const detail = `${file}:${ln} ${code} ${msg}`;
  if (/^PaymentLine\b/.test(at) || /PaymentLineProps/.test(msg)) add(2, "tsc:PaymentLine", detail);
  else if (/^SavingsEstimate\b/.test(at) || /SavingsEstimateProps|SavingsAssumptions/.test(msg)) add(4, "tsc:SavingsEstimate", detail);
  else add("other", "tsc:other", detail);
}

// ---- 4. ESLint ----
const RULE_TYPE = {
  "proposal-kit/no-raw-currency": 1,
  "proposal-kit/payment-needs-terms": 2,
  "proposal-kit/tokens-only": 3,
  "proposal-kit/savings-needs-estimate": 4,
  "proposal-kit/no-color-only-status": 5,
};
if (agentCode.length) {
  const human = run("npx", ["eslint", "--no-warn-ignored", ...agentCode]);
  say(`\n$ eslint ${agentCode.join(" ")} (exit ${human.code})\n${human.out.trim() || "(no problems)"}`);
  const json = run("npx", ["eslint", "--no-warn-ignored", "-f", "json", ...agentCode]);
  let parsed = [];
  try {
    parsed = JSON.parse(json.out.slice(json.out.indexOf("[")));
  } catch {
    add("other", "eslint-crashed", json.out.slice(0, 300));
  }
  for (const f of parsed) {
    for (const m of f.messages) {
      const detail = `${relative(ws, f.filePath)}:${m.line} ${m.ruleId ?? "parse"} ${m.message}`;
      if (m.ruleId in RULE_TYPE) add(RULE_TYPE[m.ruleId], `eslint:${m.ruleId}`, detail);
      else if (m.severity === 2) add("other", `eslint:${m.ruleId ?? "parse-error"}`, detail);
    }
  }
}

// ---- 5. token check on CSS the run wrote ----
if (agentCss.length) {
  const tok = run("node", ["scripts/check-tokens.mjs", ws]);
  say(`\n$ node scripts/check-tokens.mjs (exit ${tok.code})\n${tok.out.trim()}`);
  for (const line of tok.out.split("\n")) {
    const m = line.match(/^(\S+):(\d+)\s+"(.+?)"/);
    if (m && agentCss.includes(m[1])) add(3, "check-tokens", line.trim());
  }
}

// ---- 6. render it: axe in jsdom, payment and savings text ----
let renderedText = "";
if (existsSync(join(ws, target))) {
  mkdirSync(join(ws, "src/__eval__"), { recursive: true });
  cpSync(join(kit, "evals/harness/generated.test.tsx"), join(ws, "src/__eval__/generated.test.tsx"));
  const evalOut = join(ws, "eval-rendered.json");
  const vt = run("npx", ["vitest", "run", "src/__eval__/generated.test.tsx"], { EVAL_OUT: evalOut });
  say(`\n$ vitest run src/__eval__/generated.test.tsx (exit ${vt.code})\n${vt.out.trim().split("\n").slice(-12).join("\n")}`);
  if (existsSync(evalOut)) {
    const r = JSON.parse(readFileSync(evalOut, "utf8"));
    renderedText = r.text;
    for (const f of r.findings) add(f.type, f.check, f.detail);
  } else add("other", "render-harness-failed", vt.out.slice(-300));
}

// ---- 7. real Chrome: axe color-contrast, light and dark ----
if (existsSync(join(ws, target)) && !findings.some((f) => f.check === "render-error")) {
  writeFileSync(
    join(ws, "eval.html"),
    `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>eval</title></head><body><div id="root"></div><script type="module" src="./src/__eval__/main.tsx"></script></body></html>`,
  );
  writeFileSync(
    join(ws, "src/__eval__/main.tsx"),
    `import { createRoot } from "react-dom/client";\nimport "@/styles/index.css";\nimport View from "@/views/GeneratedSummary";\ncreateRoot(document.getElementById("root")!).render(<View />);\n`,
  );
  const html = join(ws, "dist-eval/eval.html");
  writeFileSync(
    join(ws, "vite.eval.config.ts"),
    `import { fileURLToPath, URL } from "node:url";\nimport { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport tailwindcss from "@tailwindcss/vite";\nexport default defineConfig({ base: "./", plugins: [react(), tailwindcss()], resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } }, build: { outDir: "dist-eval", emptyOutDir: true, rollupOptions: { input: "eval.html" } } });\n`,
  );
  const b2 = run("npx", ["vite", "build", "-c", "vite.eval.config.ts"]);
  if (b2.code !== 0 || !existsSync(html)) {
    add("other", "build-failed", b2.out.slice(-300));
    say(`\n$ vite build (eval page) FAILED\n${b2.out.slice(-1500)}`);
  } else {
    // Playwright is not a kit dependency; point PLAYWRIGHT_NODE_MODULES at a node_modules folder that has it.
    const require = createRequire(`${process.env.PLAYWRIGHT_NODE_MODULES ?? join(kit, "node_modules")}/`);
    const { chromium } = require("playwright");
    const axeSrc = readFileSync(join(kit, "node_modules/axe-core/axe.min.js"), "utf8");
    // Serve the built page over http: Chrome will not run module scripts from file://.
    const http = await import("node:http");
    const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };
    const server = http.createServer((req, res) => {
      const p = join(ws, "dist-eval", decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "eval.html");
      if (!p.startsWith(join(ws, "dist-eval")) || !existsSync(p)) {
        res.writeHead(404);
        return res.end();
      }
      res.writeHead(200, { "content-type": types[p.slice(p.lastIndexOf("."))] ?? "application/octet-stream" });
      res.end(readFileSync(p));
    });
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    const url = `http://127.0.0.1:${server.address().port}/eval.html`;
    const browser = await chromium.launch({ channel: "chrome" });
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto(url, { waitUntil: "networkidle" });
      const rendered = await page.waitForSelector("#root > *", { timeout: 10000 }).then(() => true).catch(() => false);
      const textLength = await page.evaluate(() => (document.getElementById("root")?.innerText ?? "").trim().length);
      if (!rendered || textLength < 50) {
        add("other", `chrome-blank-render:${theme}`, `root text length ${textLength}`);
        say(`\n$ Chrome render (${theme}) is blank (root text length ${textLength}); contrast not measured`);
        await page.close();
        continue;
      }
      // Switch theme with CSS transitions off, so axe never measures a color halfway through a fade.
      await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });
      await page.evaluate((t) => document.documentElement.classList.toggle("dark", t === "dark"), theme);
      await page.waitForTimeout(300);
      await page.addScriptTag({ content: axeSrc });
      const v = await page.evaluate(async () => {
        const r = await window.axe.run(document, { runOnly: { type: "rule", values: ["color-contrast"] } });
        return r.violations.flatMap((x) => x.nodes.map((n) => `${n.target.join(" ")} ${n.any[0]?.data ? `${n.any[0].data.contrastRatio}:1 (${n.any[0].data.fgColor} on ${n.any[0].data.bgColor})` : ""}`));
      });
      for (const d of v) add(5, `axe-chrome:color-contrast:${theme}`, d);
      say(`\n$ axe color-contrast in Chrome, ${theme}: ${v.length} violation(s)${v.length ? "\n  " + v.join("\n  ") : ""}`);
      await page.screenshot({ path: join(outDir, `render-${theme}.png`), fullPage: true });
      await page.close();
    }
    await browser.close();
    server.close();
  }
}

// ---- 8. tally ----
const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, other: 0 };
for (const f of findings) counts[f.type]++;
say(`\nFINDINGS (${findings.length})`);
for (const f of findings) say(`  [type ${f.type}] ${f.check}  ${f.detail}`);
say(`\nCOUNTS ${JSON.stringify(counts)}`);
writeFileSync(join(outDir, "check.log"), log.join("\n") + "\n");
writeFileSync(join(outDir, "results.json"), JSON.stringify({ written, changedKit, counts, findings, renderedText }, null, 1));
console.log(`${relative(kit, outDir)} ${JSON.stringify(counts)}`);
