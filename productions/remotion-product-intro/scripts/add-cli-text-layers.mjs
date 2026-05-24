#!/usr/bin/env node

import {spawnSync} from "node:child_process";
import {writeFileSync} from "node:fs";
import {join} from "node:path";

const project = process.argv[2] || "D:\\JianyingPro Drafts\\remotion-product-intro-cli-layered";

const layers = [
  l(0, 15, "Dark background placeholder", -0.02, -0.88, 20, "#7BCFC4"),
  l(0, 5, "PulseBoard", -0.64, -0.63, 48, "#F5FBFF"),
  l(0, 5, "PRODUCT INTRO", -0.67, -0.41, 26, "#9FE8DB"),
  l(0.2, 4.6, "See the work that moves revenue.", -0.49, -0.18, 52, "#F5FBFF"),
  l(0.45, 4.35, "One calm command center for pipeline,\npriorities, and customer momentum.", -0.47, 0.17, 25, "#C7D7E2"),
  l(1.2, 3.8, "* Live pipeline", -0.69, 0.49, 24, "#FFFFFF"),
  l(1.35, 3.65, "* Risk alerts", -0.42, 0.49, 24, "#FFFFFF"),
  l(1.5, 3.5, "* Team focus", -0.17, 0.49, 24, "#FFFFFF"),
  l(0.7, 4.3, "Revenue cockpit", 0.58, -0.43, 24, "#EEF7FF"),
  l(0.9, 4.1, "$4.2M", 0.44, -0.17, 58, "#EEF7FF"),
  l(1.15, 3.85, "Risk alerts\n03", 0.7, -0.18, 34, "#EEF7FF"),
  l(1.35, 3.65, "Focus score\n92", 0.7, 0.18, 34, "#EEF7FF"),
  l(1.0, 4.0, "|  ||  |||  ||||  |||  |||||", 0.44, 0.2, 36, "#31D4B5"),
  l(1.8, 3.2, "Pipeline     Renewals     Expansion", 0.53, 0.47, 20, "#EEF7FF"),

  l(5, 5, "CLARITY", -0.73, -0.54, 26, "#9FE8DB"),
  l(5.1, 4.8, "From scattered\nupdates to one\nlive signal.", -0.54, -0.22, 68, "#F5FBFF"),
  l(5.35, 4.5, "Bring the numbers, decisions,\nand next steps into the same frame.", -0.53, 0.27, 28, "#C7D7E2"),
  l(6.0, 4.0, "* Live pipeline", -0.69, 0.57, 24, "#FFFFFF"),
  l(6.15, 3.85, "* Risk alerts", -0.42, 0.57, 24, "#FFFFFF"),
  l(6.3, 3.7, "* Team focus", -0.17, 0.57, 24, "#FFFFFF"),
  l(5.45, 4.55, "Revenue cockpit", 0.64, -0.45, 24, "#EEF7FF"),
  l(5.65, 4.35, "$4.2M", 0.49, -0.18, 58, "#EEF7FF"),
  l(5.85, 4.15, "Risk alerts\n03", 0.75, -0.19, 34, "#EEF7FF"),
  l(6.05, 3.95, "Focus score\n92", 0.75, 0.2, 34, "#EEF7FF"),
  l(5.75, 4.25, "|  ||  |||  ||||  |||  |||||", 0.49, 0.22, 36, "#31D4B5"),

  l(10, 5, "PulseBoard", 0, -0.53, 54, "#F5FBFF"),
  l(10.2, 4.8, "MOVE NOW", 0, -0.28, 26, "#9FE8DB"),
  l(10.35, 4.4, "Make every team update\nfeel actionable.", 0, 0, 62, "#F5FBFF"),
  l(10.65, 4.1, "A product intro template ready for your real brand,\nscreenshots, and offer.", 0, 0.34, 28, "#C7D7E2"),
  l(11.1, 3.8, "Turn signal into action", 0, 0.65, 34, "#06121C"),
];

const results = [];
for (const [index, layer] of layers.entries()) {
  const capcutArgs = [
      "add-text",
      project,
      `${layer.start}s`,
      `${layer.duration}s`,
      layer.text,
      "--x",
      String(layer.x),
      "--y",
      String(layer.y),
      "--font-size",
      String(layer.size),
      "--color",
      layer.color,
      "--track-name",
      `layer-${String(index + 1).padStart(2, "0")}`,
    ];
  const result = spawnSync(
    process.platform === "win32" ? "cmd.exe" : "capcut",
    process.platform === "win32" ? ["/c", "capcut", ...capcutArgs] : capcutArgs,
    {encoding: "utf8"},
  );
  results.push({
    index: index + 1,
    text: layer.text,
    status: result.status,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || result.error?.message || "").trim(),
  });
  if (result.status !== 0) {
    process.stderr.write(JSON.stringify(results.at(-1), null, 2) + "\n");
    process.exit(result.status || 1);
  }
}

writeFileSync(
  join(project, "codex_cli_layer_manifest.json"),
  JSON.stringify({project, layers, results}, null, 2),
  "utf8",
);
process.stdout.write(JSON.stringify({ok: true, project, layers: layers.length}, null, 2) + "\n");

function l(start, duration, text, x, y, size, color) {
  return {start, duration, text, x, y, size, color};
}
