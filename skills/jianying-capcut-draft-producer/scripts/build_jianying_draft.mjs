#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const planPath = args.plan;
if (!planPath) fail("Usage: node build_jianying_draft.mjs --plan <confirmed-plan.json>");

const plan = JSON.parse(readFileSync(planPath, "utf8"));
const normalized = normalizePlan(plan);
const validation = validatePlan(normalized);
if (validation.errors.length) {
  fail(`Plan validation failed:\n- ${validation.errors.join("\n- ")}`);
}

const draftDir = resolve(normalized.draftRoot, normalized.draftName);
mkdirSync(draftDir, { recursive: true });
const draft = buildDraft(normalized);
writeFileSync(join(draftDir, "draft_content.json"), JSON.stringify(draft), "utf8");
writeFileSync(
  join(draftDir, "codex_production_plan.json"),
  JSON.stringify(normalized, null, 2),
  "utf8",
);

const junction = normalized.delivery.ensureDefaultScanJunction
  ? ensureDefaultScanJunction(draftDir, normalized.draftName, normalized.defaultScanRoot)
  : null;
const postValidation = validateDraft(draftDir, draft, normalized);
const capcutInfo = args["capcut-info"] ? runCapcutInfo(draftDir) : null;

const jianyingOpenResult = normalized.delivery.openJianying ? openJianying(normalized.jianyingExe) : null;

process.stdout.write(
  `${JSON.stringify(
    {
      ok: postValidation.errors.length === 0,
      draftName: normalized.draftName,
      draftPath: draftDir,
      ratio: draft.canvas_config.ratio,
      shots: normalized.shots.length,
      placeholders: normalized.shots.filter((shot) => shot.placeholder).map((shot) => shot.label),
      captions: normalized.captions.length,
      audio: {
        voiceover: Boolean(normalized.voiceover?.path),
        music: Boolean(normalized.music?.path),
        sfx: normalized.sfx.length,
      },
      junction,
      validation: postValidation,
      capcutInfo,
      openedJianying: Boolean(jianyingOpenResult?.opened),
      jianyingOpenResult,
    },
    null,
    2,
  )}\n`,
);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--plan") {
      out.plan = argv[++i];
    } else if (argv[i] === "--capcut-info") {
      out["capcut-info"] = true;
    } else {
      fail(`Unknown argument: ${argv[i]}`);
    }
  }
  return out;
}

function normalizePlan(plan) {
  const draftName = slugOrName(plan.draftName || `jianying-draft-${timestamp()}`);
  const canvas = plan.canvas || {};
  return {
    ...plan,
    draftName,
    draftRoot: plan.draftRoot || "D:\\JianyingPro Drafts",
    defaultScanRoot:
      plan.defaultScanRoot ||
      "C:\\Users\\huoda\\AppData\\Local\\JianyingPro\\User Data\\Projects\\com.lveditor.draft",
    jianyingExe: plan.jianyingExe || "D:\\JianyingPro\\JianyingPro.exe",
    canvas: {
      ratio: canvas.ratio || "16:9",
      width: Number(canvas.width || 1920),
      height: Number(canvas.height || 1080),
    },
    script: plan.script || {},
    voiceover: normalizeAudio(plan.voiceover),
    shots: (plan.shots || []).map(normalizeShot),
    captions: (plan.captions || []).map(normalizeCaption),
    music: normalizeAudio(plan.music),
    sfx: (plan.sfx || []).map(normalizeAudio).filter(Boolean),
    delivery: {
      openJianying: Boolean(plan.delivery?.openJianying),
      ensureDefaultScanJunction: Boolean(plan.delivery?.ensureDefaultScanJunction),
    },
  };
}

function validatePlan(plan) {
  const errors = [];
  if (plan.canvas.ratio !== "16:9") errors.push("canvas.ratio must be 16:9 for this skill.");
  if (!plan.shots.length) errors.push("shots must contain at least one shot or placeholder.");
  for (const [index, shot] of plan.shots.entries()) {
    if (!shot.placeholder && !shot.path) errors.push(`shot ${index + 1} is missing path.`);
    if (!shot.placeholder && shot.path && !existsSync(shot.path)) {
      errors.push(`shot ${index + 1} media path does not exist: ${shot.path}`);
    }
  }
  for (const audio of [plan.voiceover, plan.music, ...plan.sfx].filter(Boolean)) {
    if (audio.path && !existsSync(audio.path)) errors.push(`audio path does not exist: ${audio.path}`);
  }
  return { errors };
}

function buildDraft(plan) {
  const videoTracks = [
    { flag: 0, id: id(), segments: [], type: "video" },
    { attribute: 0, flag: 2, id: id(), segments: [], type: "video" },
  ];
  const textTrack = { attribute: 0, flag: 0, id: id(), segments: [], type: "text" };
  const audioTrack = { attribute: 0, flag: 0, id: id(), segments: [], type: "audio" };
  const materials = {
    audios: [],
    drafts: [],
    effects: [],
    speeds: [],
    texts: [],
    videos: [],
  };

  for (const shot of plan.shots) {
    if (shot.placeholder) {
      const marker = createTextMaterial(`[占位镜头] ${shot.label}`, "marker");
      materials.texts.push(marker);
      textTrack.segments.push(createSegment(marker.id, shot.startUs, shot.durationUs, textTrack.id, "text"));
      continue;
    }
    const material = createVideoMaterial(shot);
    materials.videos.push(material);
    videoTracks[1].segments.push(createSegment(material.id, shot.startUs, shot.durationUs, videoTracks[1].id, "video"));
  }

  for (const caption of plan.captions) {
    const material = createTextMaterial(caption.text, caption.kind);
    materials.texts.push(material);
    textTrack.segments.push(createSegment(material.id, caption.startUs, caption.durationUs, textTrack.id, "text"));
  }

  for (const audio of [plan.voiceover, plan.music, ...plan.sfx].filter(Boolean)) {
    if (!audio.path) continue;
    const material = createAudioMaterial(audio);
    materials.audios.push(material);
    audioTrack.segments.push(createSegment(material.id, audio.startUs, audio.durationUs, audioTrack.id, "audio", audio.volume));
  }

  const tracks = [...videoTracks];
  if (textTrack.segments.length) tracks.push(textTrack);
  if (audioTrack.segments.length) tracks.push(audioTrack);

  return {
    canvas_config: {
      height: plan.canvas.height,
      ratio: plan.canvas.ratio,
      width: plan.canvas.width,
    },
    color_space: 0,
    config: {},
    cover: null,
    create_time: Math.floor(Date.now() / 1000),
    duration: inferDuration(plan),
    extra_info: null,
    fps: 30,
    group_container: null,
    id: id(),
    is_drop_frame_timecode: false,
    keyframes: [],
    last_modified_platform: {
      app_id: 3704,
      app_source: "lv",
      app_version: "9.6.0",
      os: "windows",
    },
    materials,
    mutable_config: null,
    name: plan.draftName,
    new_version: "9.6.0",
    platform: {
      app_id: 3704,
      app_source: "lv",
      app_version: "9.6.0",
      os: "windows",
      os_version: "10.0.26100",
    },
    relationships: [],
    render_index_track_mode_on: true,
    source: "codex",
    tracks,
    update_time: Math.floor(Date.now() / 1000),
  };
}

function createVideoMaterial(shot) {
  return {
    ai_matting: 0,
    category_id: "",
    category_name: "",
    check_flag: 14335,
    crop: crop(),
    crop_ratio: "free",
    crop_scale: 1,
    duration: shot.durationUs,
    extra_type_option: 1,
    formula_id: "",
    gameplay: null,
    has_audio: true,
    height: shot.height || 1080,
    id: id(),
    intensifies_audio_path: "",
    intensifies_path: "",
    material_id: "",
    material_name: shot.label || basename(shot.path),
    material_url: "",
    path: shot.path,
    paths: null,
    reverse_intensifies_path: "",
    reverse_path: "",
    source_platform: 0,
    stable: null,
    type: "video",
    video_algorithm: null,
    width: shot.width || 1920,
  };
}

function createAudioMaterial(audio) {
  return {
    category_id: "",
    category_name: "",
    check_flag: 1,
    duration: audio.durationUs,
    effect_id: "",
    formula_id: "",
    id: id(),
    intensifies_path: "",
    local_material_id: "",
    name: audio.label || basename(audio.path),
    path: audio.path,
    request_id: "",
    resource_id: "",
    source_platform: 0,
    team_id: "",
    type: "extract_music",
    wave_points: [],
  };
}

function createTextMaterial(text, kind) {
  const isFlower = kind === "flower" || kind === "title";
  return {
    add_type: 0,
    alignment: 1,
    background_alpha: 0,
    background_color: "",
    bold_width: 0,
    border_alpha: isFlower ? 1 : 0,
    border_color: isFlower ? "#101010" : "",
    border_width: isFlower ? 0.08 : 0,
    check_flag: 7,
    content: JSON.stringify({ text, styles: [{ range: [0, text.length * 2] }] }),
    font_alpha: 1,
    font_color: isFlower ? "#FFD34A" : "#FFFFFF",
    font_size: isFlower ? 18 : 12,
    id: id(),
    name: kind || "subtitle",
    type: "text",
  };
}

function createSegment(materialId, startUs, durationUs, trackId, type, volume = 1) {
  return {
    clip:
      type === "video" || type === "text"
        ? {
            alpha: 1,
            flip: { horizontal: false, vertical: false },
            rotation: 0,
            scale: { x: 1, y: 1 },
            transform: { x: 0, y: 0 },
          }
        : null,
    common_keyframes: [],
    enable_adjust: false,
    enable_color_curves: false,
    enable_color_wheels: false,
    enable_lut: false,
    extra_material_refs: [],
    group_id: "",
    id: id(),
    intensifies_audio: false,
    is_tone_modify: true,
    last_nonzero_volume: volume,
    material_id: materialId,
    render_index: type === "text" ? 14000 : 1,
    reverse: false,
    source_timerange: { duration: durationUs, start: 0 },
    speed: 1,
    target_timerange: { duration: durationUs, start: startUs },
    track_attribute: 0,
    track_id: trackId,
    track_render_index: type === "text" ? 14000 : 1,
    visible: true,
    volume,
  };
}

function ensureDefaultScanJunction(draftDir, draftName, scanRoot) {
  if (!existsSync(scanRoot)) return { ok: false, reason: `scan root missing: ${scanRoot}` };
  const link = join(scanRoot, draftName);
  if (existsSync(link)) return { ok: true, link, reused: true };
  symlinkSync(draftDir, link, "junction");
  return { ok: true, link, target: draftDir, reused: false };
}

function validateDraft(draftDir, draft, plan) {
  const errors = [];
  const warnings = [];
  if (!existsSync(join(draftDir, "draft_content.json"))) errors.push("draft_content.json was not written.");
  if (draft.canvas_config.ratio !== "16:9") errors.push("draft canvas ratio is not 16:9.");
  if (!draft.tracks.some((track) => track.type === "video")) warnings.push("draft has no video track.");
  if (plan.shots.some((shot) => shot.placeholder)) warnings.push("draft contains placeholder shots.");
  return { errors, warnings };
}

function runCapcutInfo(draftDir) {
  const result = spawnSync("capcut", ["info", draftDir, "-H"], { encoding: "utf8", shell: process.platform === "win32" });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout?.trim() || "",
    stderr: result.stderr?.trim() || "",
  };
}

function openJianying(exe) {
  if (!existsSync(exe)) return { opened: false, reason: `Jianying executable missing: ${exe}` };
  const existing = findJianyingProcess();
  const child = spawn(exe, ["--src3"], { detached: true, stdio: "ignore", windowsHide: false });
  child.unref();
  return {
    opened: true,
    existingProcess: existing,
    restartMayBeNeeded: existing,
  };
}

function findJianyingProcess() {
  if (process.platform !== "win32") return false;
  const result = spawnSync(
    "powershell",
    ["-NoProfile", "-Command", "Get-Process JianyingPro -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Id"],
    { encoding: "utf8", windowsHide: true },
  );
  return Boolean(result.stdout?.trim());
}

function normalizeShot(shot, index) {
  return {
    label: shot.label || `shot-${index + 1}`,
    path: shot.path ? absolutePath(shot.path) : undefined,
    placeholder: Boolean(shot.placeholder),
    startUs: Number(shot.startUs || 0),
    durationUs: Number(shot.durationUs || 3000000),
    width: shot.width ? Number(shot.width) : undefined,
    height: shot.height ? Number(shot.height) : undefined,
  };
}

function normalizeCaption(caption) {
  return {
    text: String(caption.text || "").trim(),
    startUs: Number(caption.startUs || 0),
    durationUs: Number(caption.durationUs || 2000000),
    kind: caption.kind || "subtitle",
  };
}

function normalizeAudio(audio) {
  if (!audio) return null;
  return {
    label: audio.label || "",
    path: audio.path ? absolutePath(audio.path) : undefined,
    startUs: Number(audio.startUs || 0),
    durationUs: Number(audio.durationUs || 0),
    volume: Number(audio.volume ?? 1),
  };
}

function inferDuration(plan) {
  const ends = [];
  for (const item of [...plan.shots, ...plan.captions, ...[plan.voiceover, plan.music, ...plan.sfx].filter(Boolean)]) {
    ends.push(Number(item.startUs || 0) + Number(item.durationUs || 0));
  }
  return Math.max(0, ...ends);
}

function crop() {
  return {
    lower_left_x: 0,
    lower_left_y: 1,
    lower_right_x: 1,
    lower_right_y: 1,
    upper_left_x: 0,
    upper_left_y: 0,
    upper_right_x: 1,
    upper_right_y: 0,
  };
}

function absolutePath(input) {
  return isAbsolute(input) ? input : resolve(dirname(planPath), input);
}

function slugOrName(value) {
  return String(value).trim().replace(/[<>:"/\\|?*]+/g, "-");
}

function basename(input) {
  return input.split(/[\\/]/).pop() || input;
}

function id() {
  return randomUUID().toUpperCase();
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
