#!/usr/bin/env node

import {randomUUID} from "node:crypto";
import {existsSync, mkdirSync, writeFileSync} from "node:fs";
import {join, resolve} from "node:path";

const US = 1000000;
const draftName = "remotion-product-intro-layered";
const draftRoot = "D:\\JianyingPro Drafts";
const draftDir = resolve(draftRoot, draftName);
const canvas = {width: 1920, height: 1080, ratio: "16:9"};

const layers = [
  textLayer("bg-note", "Dark gradient background - replace with image or video in Jianying", 0, 15, {
    x: 0,
    y: -470,
    size: 20,
    color: "#7BCFC4",
    alpha: 0.55,
  }),

  textLayer("brand-1", "PulseBoard", 0, 5, {
    x: -610,
    y: -340,
    size: 48,
    color: "#F5FBFF",
    bold: true,
  }),
  textLayer("kicker-1", "PRODUCT INTRO", 0, 5, {
    x: -640,
    y: -220,
    size: 26,
    color: "#9FE8DB",
    bold: true,
  }),
  textLayer("title-1", "See the work that moves revenue.", 0.2, 4.6, {
    x: -470,
    y: -95,
    size: 64,
    color: "#F5FBFF",
    bold: true,
  }),
  textLayer(
    "body-1",
    "One calm command center for pipeline, priorities, and customer momentum.",
    0.45,
    4.35,
    {x: -455, y: 90, size: 28, color: "#C7D7E2"},
  ),
  textLayer("chip-1", "*  Live pipeline", 1.2, 3.8, {
    x: -660,
    y: 265,
    size: 24,
    color: "#FFFFFF",
    background: "#213842",
  }),
  textLayer("chip-2", "*  Risk alerts", 1.35, 3.65, {
    x: -405,
    y: 265,
    size: 24,
    color: "#FFFFFF",
    background: "#213842",
  }),
  textLayer("chip-3", "*  Team focus", 1.5, 3.5, {
    x: -160,
    y: 265,
    size: 24,
    color: "#FFFFFF",
    background: "#213842",
  }),
  panelText("panel-title-1", "Revenue cockpit", 0.7, 4.3, 555, -230, 24),
  panelText("metric-1", "$4.2M", 0.9, 4.1, 420, -90, 58),
  panelText("risk-1", "Risk alerts\n03", 1.15, 3.85, 670, -95, 34),
  panelText("focus-1", "Focus score\n92", 1.35, 3.65, 670, 95, 34),
  panelText("bars-1", "|  ||  |||  ||||  |||  |||||", 1.0, 4.0, 420, 105, 42),
  panelText("tabs-1", "Pipeline     Renewals     Expansion", 1.8, 3.2, 505, 255, 22),

  textLayer("kicker-2", "CLARITY", 5, 5, {
    x: -700,
    y: -290,
    size: 26,
    color: "#9FE8DB",
    bold: true,
  }),
  textLayer("title-2", "From scattered\nupdates to one\nlive signal.", 5.1, 4.8, {
    x: -520,
    y: -120,
    size: 72,
    color: "#F5FBFF",
    bold: true,
  }),
  textLayer(
    "body-2",
    "Bring the numbers, decisions, and next steps\ninto the same frame.",
    5.35,
    4.5,
    {x: -505, y: 145, size: 30, color: "#C7D7E2"},
  ),
  textLayer("chip-4", "*  Live pipeline", 6.0, 4.0, {
    x: -660,
    y: 310,
    size: 24,
    color: "#FFFFFF",
    background: "#213842",
  }),
  textLayer("chip-5", "*  Risk alerts", 6.15, 3.85, {
    x: -405,
    y: 310,
    size: 24,
    color: "#FFFFFF",
    background: "#213842",
  }),
  textLayer("chip-6", "*  Team focus", 6.3, 3.7, {
    x: -160,
    y: 310,
    size: 24,
    color: "#FFFFFF",
    background: "#213842",
  }),
  panelText("panel-title-2", "Revenue cockpit", 5.45, 4.55, 610, -245, 24),
  panelText("metric-2", "$4.2M", 5.65, 4.35, 470, -95, 58),
  panelText("risk-2", "Risk alerts\n03", 5.85, 4.15, 720, -100, 34),
  panelText("focus-2", "Focus score\n92", 6.05, 3.95, 720, 110, 34),
  panelText("bars-2", "|  ||  |||  ||||  |||  |||||", 5.75, 4.25, 470, 120, 42),

  textLayer("brand-3", "PulseBoard", 10, 5, {
    x: 0,
    y: -285,
    size: 54,
    color: "#F5FBFF",
    bold: true,
  }),
  textLayer("kicker-3", "MOVE NOW", 10.2, 4.8, {
    x: 0,
    y: -150,
    size: 26,
    color: "#9FE8DB",
    bold: true,
  }),
  textLayer("title-3", "Make every team update\nfeel actionable.", 10.35, 4.4, {
    x: 0,
    y: 0,
    size: 66,
    color: "#F5FBFF",
    bold: true,
  }),
  textLayer(
    "body-3",
    "A product intro template ready for your real brand,\nscreenshots, and offer.",
    10.65,
    4.1,
    {x: 0, y: 185, size: 30, color: "#C7D7E2"},
  ),
  textLayer("cta-3", "Turn signal into action", 11.1, 3.8, {
    x: 0,
    y: 350,
    size: 34,
    color: "#06121C",
    bold: true,
    background: "#31D4B5",
  }),
];

mkdirSync(draftDir, {recursive: true});
const draft = buildDraft();
writeFileSync(join(draftDir, "draft_content.json"), JSON.stringify(draft), "utf8");
writeFileSync(
  join(draftDir, "codex_layer_manifest.json"),
  JSON.stringify(
    {
      draftName,
      draftPath: draftDir,
      canvas,
      durationSeconds: 15,
      editableLayers: layers.map(({name, text, start, duration}) => ({
        name,
        text,
        startSeconds: start,
        durationSeconds: duration,
      })),
      notes: [
        "This is a layered editable Jianying draft reconstructed from the Remotion composition.",
        "Text, chips, CTA, and UI labels are separate editable text layers.",
        "Gradient background and chart panel geometry are approximated with editable text/label layers.",
      ],
    },
    null,
    2,
  ),
  "utf8",
);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      draftName,
      draftPath: draftDir,
      ratio: canvas.ratio,
      durationUs: 15 * US,
      textLayers: layers.length,
      files: ["draft_content.json", "codex_layer_manifest.json"],
      validation: validateDraft(draft),
    },
    null,
    2,
  )}\n`,
);

function buildDraft() {
  const textTracks = layers.map((layer, index) => {
    const trackId = id();
    const material = createTextMaterial(layer);
    return {
      material,
      track: {
        attribute: 0,
        flag: 0,
        id: trackId,
        segments: [createTextSegment(material.id, trackId, layer, index)],
        type: "text",
      },
    };
  });

  return {
    canvas_config: canvas,
    color_space: 0,
    config: {},
    cover: null,
    create_time: now(),
    duration: 15 * US,
    extra_info: null,
    fps: 30,
    group_container: null,
    id: id(),
    is_drop_frame_timecode: false,
    keyframes: [],
    last_modified_platform: platform(),
    materials: {
      audios: [],
      drafts: [],
      effects: [],
      speeds: [],
      texts: textTracks.map((item) => item.material),
      videos: [],
    },
    mutable_config: null,
    name: draftName,
    new_version: "9.6.0",
    platform: platform(),
    relationships: [],
    render_index_track_mode_on: true,
    source: "codex-remotion-layered",
    tracks: textTracks.map((item) => item.track),
    update_time: now(),
  };
}

function textLayer(name, text, start, duration, style) {
  return {name, text, start, duration, style};
}

function panelText(name, text, start, duration, x, y, size) {
  return textLayer(name, text, start, duration, {
    x,
    y,
    size,
    color: "#EEF7FF",
    background: "#12212A",
    alpha: 0.96,
    bold: true,
  });
}

function createTextMaterial(layer) {
  const style = layer.style;
  const text = layer.text;
  return {
    add_type: 0,
    alignment: 1,
    background_alpha: style.background ? Number(style.alpha ?? 0.82) : 0,
    background_color: style.background || "",
    bold_width: style.bold ? 0.18 : 0,
    border_alpha: 0,
    border_color: "",
    border_width: 0,
    check_flag: 7,
    content: JSON.stringify({
      text,
      styles: [
        {
          range: [0, text.length * 2],
          font_size: style.size,
          fill: {content: {solid: {color: [style.color || "#FFFFFF"]}}},
        },
      ],
    }),
    font_alpha: Number(style.alpha ?? 1),
    font_color: style.color || "#FFFFFF",
    font_size: style.size || 28,
    id: id(),
    name: layer.name,
    type: "text",
  };
}

function createTextSegment(materialId, trackId, layer, index) {
  const style = layer.style;
  return {
    clip: {
      alpha: Number(style.alpha ?? 1),
      flip: {horizontal: false, vertical: false},
      rotation: 0,
      scale: {x: Number(style.scale ?? 1), y: Number(style.scale ?? 1)},
      transform: {
        x: Number(style.x || 0) / (canvas.width / 2),
        y: Number(style.y || 0) / (canvas.height / 2),
      },
    },
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
    last_nonzero_volume: 1,
    material_id: materialId,
    render_index: 10000 + index,
    reverse: false,
    source_timerange: {duration: seconds(layer.duration), start: 0},
    speed: 1,
    target_timerange: {duration: seconds(layer.duration), start: seconds(layer.start)},
    track_attribute: 0,
    track_id: trackId,
    track_render_index: 10000 + index,
    visible: true,
    volume: 1,
  };
}

function validateDraft(draft) {
  const errors = [];
  if (draft.canvas_config.ratio !== "16:9") errors.push("canvas ratio is not 16:9");
  if (draft.duration !== 15 * US) errors.push("duration is not 15 seconds");
  if (draft.tracks.length !== layers.length) errors.push("track count does not match layer count");
  if (!draft.materials.texts.length) errors.push("no editable text materials were written");
  return {ok: errors.length === 0, errors};
}

function seconds(value) {
  return Math.round(Number(value) * US);
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

function id() {
  return randomUUID().toUpperCase();
}

function now() {
  return Math.floor(Date.now() / 1000);
}
