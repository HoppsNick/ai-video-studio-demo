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

const styles = {
  note: {
    style: ["--alpha", "0.28", "--bg-color", "#07131F", "--bg-alpha", "0.25"],
    anim: ["--intro", "fade-in", "--intro-duration", "0.4s", "--outro", "fade-out", "--outro-duration", "0.3s"],
  },
  brand: {
    style: [
      "--shadow",
      "--shadow-alpha",
      "0.55",
      "--shadow-color",
      "#0AF0C8",
      "--shadow-distance",
      "6",
      "--shadow-smoothing",
      "18",
    ],
    anim: ["--intro", "zoom-in-text", "--intro-duration", "0.45s", "--outro", "fade-out", "--outro-duration", "0.25s"],
  },
  kicker: {
    style: [
      "--shadow",
      "--shadow-alpha",
      "0.65",
      "--shadow-color",
      "#31D4B5",
      "--shadow-distance",
      "4",
      "--shadow-smoothing",
      "12",
    ],
    anim: ["--intro", "fade-in", "--intro-duration", "0.4s", "--outro", "fade-out", "--outro-duration", "0.25s"],
  },
  title: {
    style: [
      "--shadow",
      "--shadow-alpha",
      "0.7",
      "--shadow-color",
      "#05111A",
      "--shadow-distance",
      "8",
      "--shadow-smoothing",
      "24",
      "--border-width",
      "0.03",
      "--border-color",
      "#0A2C35",
      "--border-alpha",
      "0.75",
    ],
    anim: ["--intro", "pop-up", "--intro-duration", "0.48s", "--outro", "fade-out", "--outro-duration", "0.25s"],
  },
  body: {
    style: [
      "--shadow",
      "--shadow-alpha",
      "0.45",
      "--shadow-color",
      "#07131F",
      "--shadow-distance",
      "5",
      "--shadow-smoothing",
      "16",
    ],
    anim: ["--intro", "fade-in", "--intro-duration", "0.45s", "--outro", "fade-out", "--outro-duration", "0.25s"],
  },
  chip: {
    style: [
      "--bg-color",
      "#17313B",
      "--bg-alpha",
      "0.78",
      "--bg-style",
      "1",
      "--bg-round-radius",
      "0.55",
      "--bg-width",
      "1.18",
      "--bg-height",
      "1.32",
      "--shadow",
      "--shadow-alpha",
      "0.45",
      "--shadow-color",
      "#31D4B5",
      "--shadow-distance",
      "4",
      "--shadow-smoothing",
      "16",
    ],
    anim: ["--intro", "pop-up", "--intro-duration", "0.35s", "--outro", "fade-out", "--outro-duration", "0.2s"],
  },
  panel: {
    style: [
      "--bg-color",
      "#10212B",
      "--bg-alpha",
      "0.72",
      "--bg-style",
      "1",
      "--bg-round-radius",
      "0.28",
      "--bg-width",
      "1.18",
      "--bg-height",
      "1.28",
      "--shadow",
      "--shadow-alpha",
      "0.42",
      "--shadow-color",
      "#000000",
      "--shadow-distance",
      "5",
      "--shadow-smoothing",
      "18",
    ],
    anim: ["--intro", "fade-in", "--intro-duration", "0.42s", "--outro", "fade-out", "--outro-duration", "0.22s"],
  },
  panelSmall: {
    style: ["--alpha", "0.88", "--bg-color", "#10212B", "--bg-alpha", "0.55", "--bg-style", "1", "--bg-round-radius", "0.2"],
    anim: ["--intro", "fade-in", "--intro-duration", "0.35s", "--outro", "fade-out", "--outro-duration", "0.2s"],
  },
  metric: {
    style: [
      "--shadow",
      "--shadow-alpha",
      "0.68",
      "--shadow-color",
      "#1D8FFF",
      "--shadow-distance",
      "5",
      "--shadow-smoothing",
      "18",
    ],
    anim: ["--intro", "zoom-in-text", "--intro-duration", "0.4s", "--outro", "fade-out", "--outro-duration", "0.22s"],
  },
  chart: {
    style: [
      "--shadow",
      "--shadow-alpha",
      "0.58",
      "--shadow-color",
      "#31D4B5",
      "--shadow-distance",
      "4",
      "--shadow-smoothing",
      "12",
    ],
    anim: ["--intro", "typewriter", "--intro-duration", "0.55s", "--outro", "fade-out", "--outro-duration", "0.2s"],
  },
  cta: {
    style: [
      "--bg-color",
      "#31D4B5",
      "--bg-alpha",
      "0.96",
      "--bg-style",
      "1",
      "--bg-round-radius",
      "0.28",
      "--bg-width",
      "1.45",
      "--bg-height",
      "1.55",
      "--shadow",
      "--shadow-alpha",
      "0.72",
      "--shadow-color",
      "#31D4B5",
      "--shadow-distance",
      "8",
      "--shadow-smoothing",
      "24",
    ],
    anim: ["--intro", "pop-up", "--intro-duration", "0.5s", "--outro", "fade-out", "--outro-duration", "0.32s"],
  },
};

const results = [];
for (const [id, role] of layers) {
  const preset = styles[role];
  run(["text-style", project, id, ...preset.style], id, role, "style");
  run(["text-anim", project, id, ...preset.anim], id, role, "anim");
}

writeFileSync(join(project, "codex_style_apply_results.json"), JSON.stringify(results, null, 2), "utf8");
process.stdout.write(JSON.stringify({ok: true, project, styled: layers.length, operations: results.length}, null, 2) + "\n");

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
