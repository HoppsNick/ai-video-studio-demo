#!/usr/bin/env node

import {copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {join} from "node:path";

const nativeName = "5月23日 (1)";
const nativeDraft = "D:\\JianyingPro Drafts\\5月23日 (1)";
const sourceDraft = "C:\\Users\\huoda\\AppData\\Local\\JianyingPro\\User Data\\Projects\\com.lveditor.draft\\remotion-product-intro-layered-full";
const rootMetaPath = "C:\\Users\\huoda\\AppData\\Local\\JianyingPro\\User Data\\Projects\\com.lveditor.draft\\root_meta_info.json";
const durationUs = 15000000;

if (!existsSync(nativeDraft)) fail(`Native draft folder missing: ${nativeDraft}`);
if (!existsSync(join(sourceDraft, "draft_content.json"))) fail(`Layered source missing: ${sourceDraft}`);

const backupDir = join(nativeDraft, `.codex-backup-${timestamp()}`);
mkdirSync(backupDir, {recursive: true});
for (const file of ["draft_content.json", "draft_content.json.bak", "template-2.tmp", "draft_meta_info.json", "key_value.json"]) {
  copyIfExists(join(nativeDraft, file), join(backupDir, file));
}
if (existsSync(rootMetaPath)) copyFileSync(rootMetaPath, join(backupDir, "root_meta_info.json"));

const layered = JSON.parse(readFileSync(join(sourceDraft, "draft_content.json"), "utf8"));
const now = Math.floor(Date.now() / 1000);
const patched = {
  ...layered,
  name: nativeName,
  duration: durationUs,
  fps: 30,
  create_time: layered.create_time || now,
  update_time: now,
};

for (const file of ["draft_content.json", "draft_content.json.bak", "template-2.tmp"]) {
  writeFileSync(join(nativeDraft, file), JSON.stringify(patched), "utf8");
}
copyIfExists(join(sourceDraft, "codex_layer_manifest.json"), join(nativeDraft, "codex_layer_manifest.json"));

if (existsSync(rootMetaPath)) {
  const rootMeta = JSON.parse(readFileSync(rootMetaPath, "utf8"));
  for (const entry of rootMeta.all_draft_store || []) {
    if (entry.draft_name === nativeName || normalize(entry.draft_fold_path) === normalize(nativeDraft)) {
      entry.draft_name = nativeName;
      entry.draft_fold_path = normalize(nativeDraft);
      entry.draft_json_file = `${normalize(nativeDraft)}/draft_content.json`;
      entry.draft_root_path = "D:/JianyingPro Drafts";
      entry.tm_duration = durationUs;
      entry.tm_draft_modified = Date.now() * 1000;
      entry.draft_timeline_materials_size = Buffer.byteLength(JSON.stringify(patched));
      entry.streaming_edit_draft_ready = true;
      entry.draft_is_invisible = false;
    }
  }
  writeFileSync(rootMetaPath, JSON.stringify(rootMeta), "utf8");
}

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      nativeName,
      nativeDraft,
      sourceDraft,
      backupDir,
      written: ["draft_content.json", "draft_content.json.bak", "template-2.tmp", "codex_layer_manifest.json"],
      durationUs,
      tracks: patched.tracks?.length || 0,
      textMaterials: patched.materials?.texts?.length || 0,
    },
    null,
    2,
  )}\n`,
);

function copyIfExists(from, to) {
  if (existsSync(from)) copyFileSync(from, to);
}

function normalize(value) {
  return String(value).replaceAll("\\", "/");
}

function timestamp() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    "-",
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join("");
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
