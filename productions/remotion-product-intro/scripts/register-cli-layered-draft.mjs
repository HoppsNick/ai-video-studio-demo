#!/usr/bin/env node

import {randomUUID} from "node:crypto";
import {copyFileSync, existsSync, readFileSync, statSync, writeFileSync} from "node:fs";

const draftName = process.argv[2] || "remotion-product-intro-cli-layered";
const draftDir = process.argv[3] || `D:\\JianyingPro Drafts\\${draftName}`;
const rootMetaPath = "C:\\Users\\huoda\\AppData\\Local\\JianyingPro\\User Data\\Projects\\com.lveditor.draft\\root_meta_info.json";
const durationUs = 15000000;

if (!existsSync(`${draftDir}\\draft_content.json`)) {
  throw new Error(`Missing draft_content.json: ${draftDir}`);
}

const backup = `${rootMetaPath}.codex-backup-${timestamp()}`;
copyFileSync(rootMetaPath, backup);

const rootMeta = JSON.parse(readFileSync(rootMetaPath, "utf8"));
rootMeta.all_draft_store = (rootMeta.all_draft_store || []).filter((entry) => {
  return entry.draft_name !== draftName && normalize(entry.draft_fold_path || "") !== normalize(draftDir);
});
rootMeta.all_draft_store.unshift({
  cloud_draft_cover: false,
  cloud_draft_sync: false,
  draft_cloud_last_action_download: false,
  draft_cloud_purchase_info: "",
  draft_cloud_template_id: "",
  draft_cloud_tutorial_info: "",
  draft_cloud_videocut_purchase_info: "",
  draft_cover: `${normalize(draftDir)}/draft_cover.jpg`,
  draft_fold_path: normalize(draftDir),
  draft_id: randomUUID().toUpperCase(),
  draft_is_ai_shorts: false,
  draft_is_cloud_temp_draft: false,
  draft_is_invisible: false,
  draft_is_web_article_video: false,
  draft_json_file: `${normalize(draftDir)}/draft_content.json`,
  draft_name: draftName,
  draft_new_version: "5.9.0",
  draft_root_path: "D:/JianyingPro Drafts",
  draft_timeline_materials_size: statSync(`${draftDir}\\draft_content.json`).size,
  draft_type: "",
  draft_web_article_video_enter_from: "",
  streaming_edit_draft_ready: true,
  tm_draft_cloud_completed: "",
  tm_draft_cloud_entry_id: -1,
  tm_draft_cloud_modified: 0,
  tm_draft_cloud_parent_entry_id: -1,
  tm_draft_cloud_space_id: -1,
  tm_draft_cloud_user_id: -1,
  tm_draft_create: Date.now() * 1000,
  tm_draft_modified: Date.now() * 1000,
  tm_draft_removed: 0,
  tm_duration: durationUs,
});
rootMeta.draft_ids = rootMeta.all_draft_store.length;
writeFileSync(rootMetaPath, JSON.stringify(rootMeta), "utf8");
process.stdout.write(JSON.stringify({ok: true, draftName, draftDir, backup}, null, 2) + "\n");

function normalize(value) {
  return String(value).replaceAll("\\", "/");
}

function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}${String(d.getSeconds()).padStart(2, "0")}`;
}
