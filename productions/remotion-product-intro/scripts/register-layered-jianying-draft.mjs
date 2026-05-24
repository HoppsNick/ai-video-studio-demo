#!/usr/bin/env node

import {randomUUID} from "node:crypto";
import {copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, symlinkSync, writeFileSync} from "node:fs";
import {join} from "node:path";

const draftName = "remotion-product-intro-layered";
const draftDir = "D:\\JianyingPro Drafts\\remotion-product-intro-layered";
const scanRoot = "C:\\Users\\huoda\\AppData\\Local\\JianyingPro\\User Data\\Projects\\com.lveditor.draft";
const scanEntry = join(scanRoot, draftName);
const rootMetaPath = join(scanRoot, "root_meta_info.json");
const durationUs = 15000000;

if (!existsSync(draftDir)) {
  fail(`Draft directory does not exist: ${draftDir}`);
}
if (!existsSync(join(draftDir, "draft_content.json"))) {
  fail(`draft_content.json is missing in: ${draftDir}`);
}
if (!existsSync(scanRoot)) {
  fail(`Jianying scan root does not exist: ${scanRoot}`);
}

mkdirSync(scanRoot, {recursive: true});
let junction = {created: false, reused: false, path: scanEntry, target: draftDir};
if (existsSync(scanEntry)) {
  const stat = lstatSync(scanEntry);
  junction = {...junction, reused: true, isSymbolicLink: stat.isSymbolicLink()};
} else {
  symlinkSync(draftDir, scanEntry, "junction");
  junction.created = true;
}

const backupPath = `${rootMetaPath}.codex-backup-${timestamp()}`;
copyFileSync(rootMetaPath, backupPath);
const rootMeta = JSON.parse(readFileSync(rootMetaPath, "utf8"));
const drafts = Array.isArray(rootMeta.all_draft_store) ? rootMeta.all_draft_store : [];
const normalizedEntry = normalizePath(scanEntry);
const normalizedDraftDir = normalizePath(draftDir);
rootMeta.all_draft_store = drafts.filter((entry) => {
  return (
    entry.draft_name !== draftName &&
    normalizePath(entry.draft_fold_path || "") !== normalizedEntry &&
    normalizePath(entry.draft_fold_path || "") !== normalizedDraftDir
  );
});
rootMeta.all_draft_store.unshift(createMetaEntry());
rootMeta.draft_ids = rootMeta.all_draft_store.length;
rootMeta.root_path = normalizePath(scanRoot);
writeFileSync(rootMetaPath, JSON.stringify(rootMeta), "utf8");

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      draftName,
      draftDir,
      scanEntry,
      junction,
      rootMetaPath,
      backupPath,
      registeredDrafts: rootMeta.all_draft_store.length,
    },
    null,
    2,
  )}\n`,
);

function createMetaEntry() {
  const now = Date.now() * 1000;
  const folder = normalizePath(scanEntry);
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
    draft_new_version: "9.6.0",
    draft_root_path: normalizePath(scanRoot),
    draft_timeline_materials_size: readFileSync(join(draftDir, "draft_content.json")).length,
    draft_type: "",
    draft_web_article_video_enter_from: "",
    streaming_edit_draft_ready: true,
    tm_draft_cloud_completed: "",
    tm_draft_cloud_entry_id: -1,
    tm_draft_cloud_modified: 0,
    tm_draft_cloud_parent_entry_id: -1,
    tm_draft_cloud_space_id: -1,
    tm_draft_cloud_user_id: -1,
    tm_draft_create: now,
    tm_draft_modified: now,
    tm_draft_removed: 0,
    tm_duration: durationUs,
  };
}

function normalizePath(value) {
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
