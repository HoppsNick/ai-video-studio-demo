#!/usr/bin/env node

import {readFileSync, writeFileSync} from "node:fs";
import {join} from "node:path";

const project = "D:\\JianyingPro Drafts\\remotion-product-intro-59-layered";

const replacements = new Map([
  ["2d6776d9", "."],
  ["370c6b88", "One calm command center\nfor pipeline and priorities."],
  ["4b4a20a9", "Ready for your brand,\nscreenshots, and offer."],
  ["4ed641ad", "Pipeline   Renewals\nExpansion"],
  ["966a23e3", "See the work\nthat moves revenue."],
  ["806ced3d", "From scattered updates\nto one live signal."],
  ["945689b8", "Make every team update\nfeel actionable."],
]);

const roleBySegment = new Map([
  ["2d6776d9", "note"],
  ["30266198", "brand"],
  ["ff55c7fb", "brand"],
  ["9050d5d4", "kicker"],
  ["a23d14cc", "kicker"],
  ["f2c7a264", "kicker"],
  ["966a23e3", "title"],
  ["806ced3d", "title"],
  ["945689b8", "title"],
  ["370c6b88", "body"],
  ["ff77ef01", "body"],
  ["4b4a20a9", "body"],
  ["289a1b50", "chip"],
  ["0bd7959e", "chip"],
  ["8643e0f6", "chip"],
  ["a565a66c", "chip"],
  ["47d1e519", "chip"],
  ["6de567e0", "chip"],
  ["424df1e3", "metric"],
  ["b9f4c948", "metric"],
  ["cbd718a9", "chart"],
  ["4bac9953", "chart"],
  ["6ef6cae2", "cta"],
]);

const sizeByRole = {
  note: 8,
  brand: 32,
  kicker: 18,
  title: 38,
  body: 20,
  chip: 18,
  panel: 20,
  metric: 38,
  chart: 24,
  cta: 24,
};

for (const file of ["draft_content.json", "draft_content.json.bak", "template-2.tmp", "template.json"]) {
  const path = join(project, file);
  const draft = JSON.parse(readFileSync(path, "utf8"));
  const textById = new Map((draft.materials?.texts || []).map((text) => [text.id, text]));

  const usedAnimationIds = new Set();
  for (const track of draft.tracks || []) {
    for (const segment of track.segments || []) {
      if (track.type !== "text") continue;
      segment.visible = true;
      segment.extra_material_refs = [];
      segment.clip = segment.clip || {};
      segment.clip.alpha = segment.id?.startsWith("2d6776d9") ? 0.01 : 1;

      const shortId = segment.id.slice(0, 8);
      const material = textById.get(segment.material_id);
      if (!material) continue;

      const role = roleBySegment.get(shortId) || "panel";
      const newText = replacements.get(shortId);
      if (newText !== undefined) setText(material, newText);

      const size = sizeByRole[role] || 20;
      material.font_size = size;
      material.text_size = size;
      updateContentSize(material, size);

      material.fixed_width = role === "title" ? 0.55 : role === "body" ? 0.48 : role === "cta" ? 0.28 : material.fixed_width;
      material.fixed_height = role === "title" ? 0.2 : role === "body" ? 0.13 : role === "cta" ? 0.09 : material.fixed_height;
    }
  }

  draft.materials.material_animations = (draft.materials.material_animations || []).filter((animation) =>
    usedAnimationIds.has(animation.id),
  );
  draft.duration = 15000000;
  draft.fps = 30;
  draft.canvas_config = {width: 1920, height: 1080, ratio: "16:9"};
  draft.update_time = Math.floor(Date.now() / 1000);
  writeFileSync(path, JSON.stringify(draft), "utf8");
}

process.stdout.write(JSON.stringify({ok: true, project, changed: true}, null, 2) + "\n");

function setText(material, text) {
  const content = safeContent(material);
  content.text = text;
  const len = text.length * 2;
  content.styles = (content.styles || [{}]).map((style) => ({...style, range: [0, len]}));
  material.content = JSON.stringify(content);
}

function updateContentSize(material, size) {
  const content = safeContent(material);
  content.styles = (content.styles || [{}]).map((style) => ({...style, size}));
  material.content = JSON.stringify(content);
}

function safeContent(material) {
  try {
    return JSON.parse(material.content || "{}");
  } catch {
    return {text: "", styles: [{range: [0, 0]}]};
  }
}
