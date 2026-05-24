#!/usr/bin/env node

import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const skillRoot = new URL("..", import.meta.url);
const tempRoot = mkdtempSync(join(tmpdir(), "jianying-skill-smoke-"));
const copyFile = join(tempRoot, "copy.txt");
const planFile = join(tempRoot, "plan.json");
const mediaDir = join(tempRoot, "media");
const mediaFile = join(mediaDir, "downloaded.mp4");
const mediaManifest = join(tempRoot, "media-manifest.json");

mkdirSync(mediaDir, { recursive: true });
writeFileSync(copyFile, "真正拉开人与人差距的，不是某一次冲刺，而是你能不能在低谷里继续做对的事。", "utf8");
writeFileSync(mediaFile, "fake-video", "utf8");

const review = runNode(new URL("scripts/make_review_packet.mjs", skillRoot), ["--script-file", copyFile]);
assert(review.status === 0, `review script failed: ${review.stderr}`);
assert(review.stdout.includes("**等待确认**"), "review packet must include confirmation gate.");
assert(review.stdout.includes("配音预览"), "review packet must promise voice previews.");
assert(review.stdout.includes("包装预览"), "review packet must promise packaging previews.");

writeFileSync(
  mediaManifest,
  JSON.stringify(
    {
      items: [
        {
          sourcePath: mediaFile,
          order: 1,
          contentLabel: "夜色街道",
          emotion: "冷静观察",
        },
      ],
    },
    null,
    2,
  ),
  "utf8",
);

const organize = runNode(new URL("scripts/organize_media_manifest.mjs", skillRoot), ["--manifest", mediaManifest]);
assert(organize.status === 0, `media organizer failed: ${organize.stderr}`);
const organizePayload = JSON.parse(organize.stdout);
assert(!organizePayload.renameApplied, "media organizer should default to preview mode.");
assert(organizePayload.items[0].renamedPath.includes("夜色街道_冷静观察"), "rename preview should use Chinese content and emotion.");

writeFileSync(
  planFile,
  JSON.stringify(
    {
      draftName: "smoke-draft",
      draftRoot: join(tempRoot, "drafts"),
      defaultScanRoot: join(tempRoot, "scan-root"),
      shots: [
        {
          label: "待补主画面",
          placeholder: true,
          startUs: 0,
          durationUs: 4000000,
        },
      ],
      captions: [
        {
          text: "低谷里继续做对的事",
          startUs: 0,
          durationUs: 2200000,
          kind: "flower",
        },
      ],
      delivery: {
        openJianying: false,
      },
    },
    null,
    2,
  ),
  "utf8",
);

const build = runNode(new URL("scripts/build_jianying_draft.mjs", skillRoot), ["--plan", planFile]);
assert(build.status === 0, `draft builder failed: ${build.stderr}`);
const payload = JSON.parse(build.stdout);
assert(payload.ok, "draft builder should return ok for placeholder-only smoke plan.");
assert(payload.ratio === "16:9", "draft builder should default to 16:9.");
assert(payload.placeholders.length === 1, "draft builder should report placeholder shots.");
assert(payload.junction === null, "draft builder should not create a Junction by default.");

const content = JSON.parse(readFileSync(join(payload.draftPath, "draft_content.json"), "utf8"));
assert(content.canvas_config.ratio === "16:9", "draft_content.json must be 16:9.");
assert(content.tracks.some((track) => track.type === "text"), "placeholder smoke draft should include text track.");

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      tempRoot,
      reviewGate: true,
      draftPath: payload.draftPath,
      ratio: payload.ratio,
    },
    null,
    2,
  )}\n`,
);

function runNode(scriptUrl, args) {
  return spawnSync(process.execPath, [fileURLToPath(scriptUrl), ...args], {
    encoding: "utf8",
  });
}

function assert(condition, message) {
  if (!condition) {
    process.stderr.write(`${message}\n`);
    process.exit(1);
  }
}
