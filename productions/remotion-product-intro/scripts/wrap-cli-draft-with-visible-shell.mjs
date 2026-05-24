#!/usr/bin/env node

import {copyFileSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {randomUUID} from "node:crypto";

const draftName = process.argv[2] || "remotion-product-intro-cli-layered";
const target = process.argv[3] || `D:\\JianyingPro Drafts\\${draftName}`;
const shell = "D:\\JianyingPro Drafts\\codex-auto-video-draft-20260521-184342";
const scanRoot = "C:\\Users\\huoda\\AppData\\Local\\JianyingPro\\User Data\\Projects\\com.lveditor.draft";
const scanEntry = join(scanRoot, draftName);
const rootMetaPath = join(scanRoot, "root_meta_info.json");
const durationUs = 15000000;

if (!existsSync(join(target, "draft_content.json"))) throw new Error(`Missing target draft: ${target}`);
if (!existsSync(shell)) throw new Error(`Missing shell draft: ${shell}`);

for (const dir of [
  ".backup",
  "adjust_mask",
  "common_attachment",
  "matting",
  "qr_upload",
  "Resources",
  "smart_crop",
  "subdraft",
  "Timelines",
]) {
  mkdirSync(join(target, dir), {recursive: true});
}

for (const file of [
  "attachment_pc_common.json",
  "attachment_editing.json",
  "draft.extra",
  "draft_agency_config.json",
  "draft_agency_info.json",
  "draft_biz_config.json",
  "draft_cover.jpg",
  "draft_meta_info.json",
  "draft_settings",
  "draft_virtual_store.json",
  "performance_opt_info.json",
  "timeline_layout.json",
]) {
  copyIfExists(join(shell, file), join(target, file));
}

const contentPath = join(target, "draft_content.json");
const content = JSON.parse(readFileSync(contentPath, "utf8"));
content.name = draftName;
content.duration = durationUs;
content.fps = 30;
content.canvas_config = {width: 1920, height: 1080, ratio: "16:9"};
content.update_time = Math.floor(Date.now() / 1000);
writeFileSync(contentPath, JSON.stringify(content), "utf8");
writeFileSync(join(target, "draft_content.json.bak"), JSON.stringify(content), "utf8");
writeFileSync(join(target, "template-2.tmp"), JSON.stringify(content), "utf8");
writeFileSync(join(target, "template.json"), JSON.stringify(content), "utf8");

if (!existsSync(scanEntry)) {
  symlinkSync(target, scanEntry, "junction");
}

const rootMetaBackup = `${rootMetaPath}.codex-backup-${timestamp()}`;
copyFileSync(rootMetaPath, rootMetaBackup);
const rootMeta = JSON.parse(readFileSync(rootMetaPath, "utf8"));
const existing = rootMeta.all_draft_store || [];
rootMeta.all_draft_store = existing.filter((entry) => {
  return entry.draft_name !== draftName && ![normalize(target), normalize(scanEntry)].includes(normalize(entry.draft_fold_path || ""));
});
rootMeta.all_draft_store.unshift(makeEntry(scanEntry, scanRoot));
rootMeta.all_draft_store.unshift(makeEntry(target, "D:\\JianyingPro Drafts"));
rootMeta.draft_ids = rootMeta.all_draft_store.length;
writeFileSync(rootMetaPath, JSON.stringify(rootMeta), "utf8");

process.stdout.write(
  JSON.stringify(
    {
      ok: true,
      draftName,
      target,
      scanEntry,
      rootMetaBackup,
      shellFilesAdded: true,
      durationUs,
      tracks: content.tracks?.length || 0,
      segments: content.tracks?.reduce((sum, track) => sum + (track.segments?.length || 0), 0) || 0,
    },
    null,
    2,
  ) + "\n",
);

function makeEntry(path, root) {
  const folder = normalize(path);
  return {
    cloud_draft_cover: false,
    cloud_draft_sync: false,
    draft_cloud_last_action_download: false,
    draft_cloud_purchase_info: "",
    draft_cloud_template_id: "",
    draft_cloud_tutorial_info: "",
    draft_cloud_videocut_purchase_info: "",
    draft_cover: `${folder}/draft_cover.jpg`,
    draft_fold_path: folder,
    draft_id: randomUUID().toUpperCase(),
    draft_is_ai_shorts: false,
    draft_is_cloud_temp_draft: false,
    draft_is_invisible: false,
    draft_is_web_article_video: false,
    draft_json_file: `${folder}/draft_content.json`,
    draft_name: draftName,
    draft_new_version: "5.9.0",
    draft_root_path: normalize(root),
    draft_timeline_materials_size: Buffer.byteLength(readFileSync(contentPath)),
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
  };
}

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
