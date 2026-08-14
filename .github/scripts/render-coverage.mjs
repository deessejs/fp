#!/usr/bin/env node
/**
 * Render coverage-summary.json into a markdown table for the PR
 * comment. Reads packages/fp/coverage/coverage-summary.json (the v8
 * reporter output) and emits a markdown document to stdout. The CI
 * workflow captures that output and posts it as a sticky PR comment.
 *
 * Total row plus one row per file, sorted by file path. Per-file
 * thresholds are 100% on statements / branches / functions / lines
 * (rule 0001 / ADR 0002).
 *
 * Files with no branches (e.g. type-only modules) render the
 * branch column as `n/a` so the table is not misleading.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const summaryPath = resolve('packages/fp/coverage/coverage-summary.json');
const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));

const fmt = (n) => (typeof n === 'number' ? `${n.toFixed(2)}%` : '—');
const branchCell = (entry) => {
  if (!entry || typeof entry.total !== 'number') return '—';
  if (entry.total === 0) return 'n/a';
  return fmt(entry.pct);
};

const lines = [];
lines.push('## Coverage report');
lines.push('');
lines.push('| File | % Stmts | % Branch | % Funcs | % Lines |');
lines.push('| --- | ---: | ---: | ---: | ---: |');

const total = summary.total ?? {};
lines.push(`| **Total** | **${fmt(total.statements?.pct)}** | **${branchCell(total.branches)}** | **${fmt(total.functions?.pct)}** | **${fmt(total.lines?.pct)}** |`);

const fileKeys = Object.keys(summary).filter((k) => k !== 'total').sort();
for (const key of fileKeys) {
  const file = summary[key];
  lines.push(`| ${key} | ${fmt(file.statements?.pct)} | ${branchCell(file.branches)} | ${fmt(file.functions?.pct)} | ${fmt(file.lines?.pct)} |`);
}

lines.push('');
lines.push('_Per-file thresholds: 100% on statements / branches / functions / lines. Files with no branches render `n/a` in the Branch column._');
lines.push('');

process.stdout.write(lines.join('\n'));
