#!/usr/bin/env node
// Builds the results table for one round from each run's results.json and transcript.
//   node evals/harness/summarize.mjs <round-name>
// Writes evals/runs/<round>/summary.json and prints a Markdown table. Counts are copied as found.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const round = process.argv[2];
const kit = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dir = join(kit, "evals/runs", round);
const TYPES = ["1", "2", "3", "4", "5", "other"];
const NAMES = {
  1: "Price typed as a string, not Money",
  2: "Payment without APR and term",
  3: "Hex or px instead of a token",
  4: "Savings without Estimated and assumptions",
  5: "Accessibility miss (color-only status, contrast, axe)",
  other: "Other (build errors, missing amounts, changed kit files)",
};

const summary = {};
for (const cond of ["without", "with"]) {
  summary[cond] = { runs: [], instances: Object.fromEntries(TYPES.map((t) => [t, 0])), runsFailing: Object.fromEntries(TYPES.map((t) => [t, 0])) };
  for (let i = 1; i <= 5; i++) {
    const runDir = join(dir, `${cond}-${i}`);
    const resFile = join(runDir, "results.json");
    if (!existsSync(resFile)) {
      summary[cond].runs.push({ run: `${cond}-${i}`, missing: true });
      continue;
    }
    const res = JSON.parse(readFileSync(resFile, "utf8"));
    let cost = null;
    let readAgents = false;
    let readManifest = false;
    for (const line of readFileSync(join(runDir, "transcript.jsonl"), "utf8").split("\n")) {
      let e;
      try {
        e = JSON.parse(line);
      } catch {
        continue;
      }
      if (e.type === "result") cost = e.total_cost_usd;
      if (e.type === "assistant") {
        for (const c of e.message.content ?? []) {
          const p = c.type === "tool_use" ? String(c.input.file_path ?? "") : "";
          if (p.endsWith("/AGENTS.md")) readAgents = true;
          if (p.endsWith("/components.json")) readManifest = true;
        }
      }
    }
    for (const t of TYPES) {
      summary[cond].instances[t] += res.counts[t];
      if (res.counts[t] > 0) summary[cond].runsFailing[t]++;
    }
    summary[cond].runs.push({ run: `${cond}-${i}`, counts: res.counts, cost, readAgents, readManifest });
  }
}
writeFileSync(join(dir, "summary.json"), JSON.stringify(summary, null, 1));

const lines = [];
lines.push(`### ${round}`, "", "| Mistake type | Without docs: runs with it (of 5) | Without: instances | With docs: runs with it (of 5) | With: instances |", "|---|---|---|---|---|");
for (const t of TYPES) {
  lines.push(`| ${t === "other" ? "" : `${t}. `}${NAMES[t]} | ${summary.without.runsFailing[t]} | ${summary.without.instances[t]} | ${summary.with.runsFailing[t]} | ${summary.with.instances[t]} |`);
}
lines.push("", "| Run | 1 | 2 | 3 | 4 | 5 | other | read AGENTS.md | read components.json | cost (USD) |", "|---|---|---|---|---|---|---|---|---|---|");
for (const cond of ["without", "with"]) {
  for (const r of summary[cond].runs) {
    if (r.missing) {
      lines.push(`| ${r.run} | no result | | | | | | | | |`);
      continue;
    }
    lines.push(`| ${r.run} | ${TYPES.map((t) => r.counts[t]).join(" | ")} | ${r.readAgents ? "yes" : "no"} | ${r.readManifest ? "yes" : "no"} | ${r.cost == null ? "?" : r.cost.toFixed(2)} |`);
  }
}
console.log(lines.join("\n"));
