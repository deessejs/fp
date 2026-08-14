#!/usr/bin/env node
/**
 * Render coverage-summary.json into a markdown table for the PR
 * comment. Reads packages/fp/coverage/coverage-summary.json (produced
 * by the json-summary reporter) and emits a markdown document to
 * stdout. The CI workflow captures that output and posts it as a
 * sticky PR comment.
 *
 * Total row plus one row per file, sorted by file path. Per-file
 * thresholds are 100% on statements / branches / functions / lines
 * (rule 0001 / ADR 0002).
 */

import { readFileSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';

const summaryPath = resolve('packages/fp/coverage/coverage-summary.json');
const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
const repoRoot = resolve(".");

const fmt = (entry) => (entry && typeof entry.pct === "number" ? `${entry.pct.toFixed(2)}%` : "—");
const branchCell = (entry) => {
  if (!entry || typeof entry.total !== "number") return "—";
  if (entry.total === 0) return "n/a";
  return fmt(entry);
};

const lines = [];
lines.push("## Coverage report");
lines.push("");
lines.push("| File | % Stmts | % Branch | % Funcs | % Lines |");
lines.push("| --- | ---: | ---: | ---: | ---: |");

const total = summary.total ?? {};
lines.push(`| **Total** | **${fmt(total.statements)}** | **${fmt(total.branches)}** | **${fmt(total.functions)}** | **${fmt(total.lines)}** |`);

const fileKeys = Object.keys(summary).filter((k) => k !== 'total').sort();
for (const key of fileKeys) {
  const file = summary[key];
  const rel = relative(repoRoot, key).split(sep).join("/");
  lines.push(`| ${rel} | ${fmt(file.statements)} | ${branchCell(file.branches)} | ${fmt(file.functions)} | ${fmt(file.lines)} |`);
}

lines.push("");
lines.push("_Per-file thresholds: 100% on statements / branches / functions / lines (ADR 0002). Files with no branches render `n/a` in the Branch column. The threshold gate is disabled in this PR and lands with the full method × variant test matrix in a follow-up._");
lines.push("");

process.stdout.write(lines.join('\n'));
