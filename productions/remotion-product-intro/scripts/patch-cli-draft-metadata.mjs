#!/usr/bin/env node

import {readFileSync, writeFileSync} from "node:fs";
import {join} from "node:path";

const project = process.argv[2] || "D:\\JianyingPro Drafts\\remotion-product-intro-cli-layered";
const projectName = project.split(/[\\/]/).pop() || "remotion-product-intro-cli-layered";
for (const file of ["draft_content.json", "draft_content.json.bak"]) {
  const path = join(project, file);
  const draft = JSON.parse(readFileSync(path, "utf8"));
  draft.name = projectName;
  draft.duration = 15000000;
  draft.fps = 30;
  draft.canvas_config = {
    height: 1080,
    ratio: "16:9",
    width: 1920,
  };
  draft.update_time = Math.floor(Date.now() / 1000);
  writeFileSync(path, JSON.stringify(draft), "utf8");
}
process.stdout.write(JSON.stringify({ok: true, project, duration: 15000000, ratio: "16:9"}, null, 2) + "\n");
