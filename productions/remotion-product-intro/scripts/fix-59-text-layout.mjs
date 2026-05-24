#!/usr/bin/env node

import {spawnSync} from "node:child_process";
import {writeFileSync} from "node:fs";
import {join} from "node:path";

const project = "D:\\JianyingPro Drafts\\remotion-product-intro-59-layered";

const layers = [
  ["2d6776d9", "note"],
  ["30266198", "brand"],
  ["9050d5d4", "kicker"],
  ["966a23e3", "title"],
  ["370c6b88", "body"],
  ["289a1b50", "chip"],
  ["0bd7959e", "chip"],
  ["8643e0f6", "chip"],
  ["b718328a", "panel"],
  ["424df1e3", "metric"],
  ["9e905002", "panel"],
  ["0c031a1d", "panel"],
  ["cbd718a9", "chart"],
  ["4ed641ad", "panelSmall"],
  ["a23d14cc", "kicker"],
  ["806ced3d", "title"],
  ["ff77ef01", "body"],
  ["a565a66c", "chip"],
  ["47d1e519", "chip"],
  ["6de567e0", "chip"],
  ["053e883d", "panel"],
  ["b9f4c948", "metric"],
  ["ed7e15a6", "panel"],
  ["b3a385c3", "panel"],
  ["4bac9953", "chart"],
  ["ff55c7fb", "brand"],
  ["f2c7a264", "kicker"],
  ["945689b8", "title"],
  ["4b4a20a9", "body"],
  ["6ef6cae2", "cta"],
];

const styleByRole = {
  note: ["--alpha", "0.18", "--fixed-width", "0.7", "--fixed-height", "0.08"],
  brand: ["--fixed-width", "0.42", "--fixed-height", "0.12", "--shadow", "--shadow-alpha", "0.35", "--shadow-color", "#000000", "--shadow-distance", "3", "--shadow-smoothing", "10"],
  kicker: ["--fixed-width", "0.34", "--fixed-height", "0.08", "--shadow", "--shadow-alpha", "0.4", "--shadow-color", "#000000", "--shadow-distance", "2", "--shadow-smoothing", "8"],
  title: ["--fixed-width", "0.66", "--fixed-height", "0.28", "--shadow", "--shadow-alpha", "0.42", "--shadow-color", "#000000", "--shadow-distance", "4", "--shadow-smoothing", "12", "--border-width", "0.015", "--border-color", "#09242C", "--border-alpha", "0.5"],
  body: ["--fixed-width", "0.6", "--fixed-height", "0.18", "--shadow", "--shadow-alpha", "0.28", "--shadow-color", "#000000", "--shadow-distance", "2", "--shadow-smoothing", "8"],
  chip: ["--fixed-width", "0.18", "--fixed-height", "0.08", "--bg-color", "#17313B", "--bg-alpha", "0.55", "--bg-style", "1", "--bg-round-radius", "0.25", "--shadow", "--shadow-alpha", "0.25", "--shadow-color", "#000000", "--shadow-distance", "2", "--shadow-smoothing", "8"],
  panel: ["--fixed-width", "0.22", "--fixed-height", "0.14", "--bg-color", "#10212B", "--bg-alpha", "0.5", "--bg-style", "1", "--bg-round-radius", "0.16", "--shadow", "--shadow-alpha", "0.25", "--shadow-color", "#000000", "--shadow-distance", "2", "--shadow-smoothing", "8"],
  panelSmall: ["--fixed-width", "0.38", "--fixed-height", "0.08", "--alpha", "0.78"],
  metric: ["--fixed-width", "0.22", "--fixed-height", "0.12", "--shadow", "--shadow-alpha", "0.32", "--shadow-color", "#000000", "--shadow-distance", "3", "--shadow-smoothing", "10"],
  chart: ["--fixed-width", "0.34", "--fixed-height", "0.08", "--alpha", "0.88"],
  cta: ["--fixed-width", "0.34", "--fixed-height", "0.11", "--bg-color", "#31D4B5", "--bg-alpha", "0.85", "--bg-style", "1", "--bg-round-radius", "0.2", "--shadow", "--shadow-alpha", "0.35", "--shadow-color", "#000000", "--shadow-distance", "3", "--shadow-smoothing", "10"],
};

const results = [];
for (const [id, role] of layers) {
  run(["text-style", project, id, ...styleByRole[role]], id, role, "style");
}

writeFileSync(join(project, "codex_layout_fix_results.json"), JSON.stringify(results, null, 2), "utf8");
process.stdout.write(JSON.stringify({ok: true, project, fixed: layers.length, operations: results.length}, null, 2) + "\n");

function run(args, id, role, op) {
  const result = spawnSync("cmd.exe", ["/c", "capcut", ...args], {encoding: "utf8"});
  const entry = {
    id,
    role,
    op,
    status: result.status,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || result.error?.message || "").trim(),
  };
  results.push(entry);
  if (result.status !== 0) {
    process.stderr.write(JSON.stringify(entry, null, 2) + "\n");
    process.exit(result.status || 1);
  }
}
