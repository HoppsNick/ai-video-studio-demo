#!/usr/bin/env node

import {randomUUID} from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import {dirname, join} from "node:path";

const sourceDraft = "D:\\JianyingPro Drafts\\remotion-product-intro-layered";
const scanRoot = "C:\\Users\\huoda\\AppData\\Local\\JianyingPro\\User Data\\Projects\\com.lveditor.draft";
const skeletonDraft = join(scanRoot, "codex-auto-video-draft-20260521-184342");
const draftName = "remotion-product-intro-layered-full";
const targetDraft = join(scanRoot, draftName);
const rootMetaPath = join(scanRoot, "root_meta_info.json");
const durationUs = 15000000;

if (!existsSync(join(sourceDraft, "draft_content.json"))) fail(`Missing source draft: ${sourceDraft}`);
if (!existsSync(skeletonDraft)) fail(`Missing skeleton draft: ${skeletonDraft}`);
if (!existsSync(rootMetaPath)) fail(`Missing root metadata: ${rootMetaPath}`);

if (existsSync(targetDraft)) {
  const backup = `${targetDraft}.codex-old-${timestamp()}`;
  renameByCopy(targetDraft, backup);
  rmSync(targetDraft, {recursive: true, force: true});
}

mkdirSync(targetDraft, {recursive: true});
for (const dir of [
  ".backup",
  "adjust_mask",
  "assets",
  "common_attachment",
  "matting",
  "qr_upload",
  "Resources",
  "smart_crop",
  "subdraft",
  "Timelines",
]) {
  mkdirSync(join(targetDraft, dir), {recursive: true});
}

const content = patchDraftContent(JSON.parse(readFileSync(join(sourceDraft, "draft_content.json"), "utf8")));
for (const file of ["draft_content.json", "draft_content.json.bak", "template.json", "template-2.tmp"]) {
  writeFileSync(join(targetDraft, file), JSON.stringify(content), "utf8");
}

copyIfExists(join(sourceDraft, "codex_layer_manifest.json"), join(targetDraft, "codex_layer_manifest.json"));
for (const file of [
  "draft_cover.jpg",
  "draft_meta_info.json",
  "draft.extra",
  "draft_settings",
  "attachment_pc_common.json",
  "draft_agency_config.json",
  "draft_agency_info.json",
  "draft_biz_config.json",
  "draft_virtual_store.json",
  "performance_opt_info.json",
  "timeline_layout.json",
]) {
  copyIfExists(join(skeletonDraft, file), join(targetDraft, file));
}

const metaBackup = `${rootMetaPath}.codex-backup-${timestamp()}`;
copyFileSync(rootMetaPath, metaBackup);
const rootMeta = JSON.parse(readFileSync(rootMetaPath, "utf8"));
const targetNorm = normalizePath(targetDraft);
rootMeta.all_draft_store = (rootMeta.all_draft_store || []).filter((entry) => {
  return entry.draft_name !== draftName && normalizePath(entry.draft_fold_path || "") !== targetNorm;
});
rootMeta.all_draft_store.unshift(createRootMetaEntry());
rootMeta.draft_ids = rootMeta.all_draft_store.length;
rootMeta.root_path = normalizePath(scanRoot);
writeFileSync(rootMetaPath, JSON.stringify(rootMeta), "utf8");

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      draftName,
      draftPath: targetDraft,
      rootMetaPath,
      metaBackup,
      files: statSummary(targetDraft),
    },
    null,
    2,
  )}\n`,
);

function patchDraftContent(content) {
  const now = Math.floor(Date.now() / 1000);
  return {
    ...content,
    id: randomUUID().toUpperCase(),
    name: draftName,
    create_time: now,
    update_time: now,
    duration: durationUs,
    new_version: "9.6.0",
    platform: platform(),
    last_modified_platform: platform(),
  };
}

function createRootMetaEntry() {
  const now = Date.now() * 1000;
  const folder = normalizePath(targetDraft);
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
    draft_timeline_materials_size: statSync(join(targetDraft, "draft_content.json")).size,
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

function platform() {
  return {
    app_id: 3704,
    app_source: "lv",
    app_version: "9.6.0",
    os: "windows",
    os_version: "10.0.26100",
  };
}

function copyIfExists(from, to) {
  if (!existsSync(from)) return;
  mkdirSync(dirname(to), {recursive: true});
  copyFileSync(from, to);
}

function renameByCopy(from, to) {
  mkdirSync(to, {recursive: true});
  for (const file of ["draft_content.json", "codex_layer_manifest.json"]) {
    copyIfExists(join(from, file), join(to, file));
  }
}

function statSummary(dir) {
  const files = [
    "draft_content.json",
    "template.json",
    "draft_content.json.bak",
    "draft_cover.jpg",
    "draft_meta_info.json",
    "draft_virtual_store.json",
    "timeline_layout.json",
  ];
  return files.map((file) => ({file, exists: existsSync(join(dir, file))}));
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
