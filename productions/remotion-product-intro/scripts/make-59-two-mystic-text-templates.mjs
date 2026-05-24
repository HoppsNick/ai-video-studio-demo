import fs from 'node:fs';
import path from 'node:path';

const draftDir = 'D:\\JianyingPro Drafts\\remotion-product-intro-59-layered';
const files = [
  'draft_content.json',
  'draft_content.json.bak',
  'template-2.tmp',
  'template.json',
];

const keep = {
  template1Title: {
    materialId: 'a101eb8c-2375-4eb7-9420-aeb93a85555f',
    segmentId: '30266198-7fe4-47a9-b9ca-e57b6855dfce',
    text: '玄机已启',
    size: 48,
    scale: 0.44,
    x: 0,
    y: -0.42,
    width: 0.58,
    height: 0.18,
    color: '#F4D27B',
    fill: [0.9568627451, 0.8235294118, 0.4823529412],
    border: '#2A1605',
    borderWidth: 0.032,
    shadow: '#00B89A',
    shadowAlpha: 0.58,
    shadowDistance: 7,
    shadowSmoothing: 18,
    styleName: '花字模板1 - 东方玄学金玉主标题',
  },
  template1Subtitle: {
    materialId: '20f047e5-1048-46df-81d4-b408aee0a216',
    segmentId: '966a23e3-f8ab-46c4-8cde-35d549cd39bc',
    text: '五行流转 · 生意入局',
    size: 25,
    scale: 0.42,
    x: 0,
    y: -0.17,
    width: 0.62,
    height: 0.10,
    color: '#DDFCF3',
    fill: [0.8666666667, 0.9882352941, 0.9529411765],
    border: '#102A24',
    borderWidth: 0.018,
    shadow: '#C8942D',
    shadowAlpha: 0.50,
    shadowDistance: 5,
    shadowSmoothing: 15,
    styleName: '花字模板1 - 东方玄学金玉副标题',
  },
  template2Title: {
    materialId: '79cc103c-fd3a-4445-a23a-50c1db9f8349',
    segmentId: '806ced3d-104c-4949-81cc-f17f24de6016',
    text: '灵签落定',
    size: 46,
    scale: 0.43,
    x: 0,
    y: 0.18,
    width: 0.58,
    height: 0.17,
    color: '#FFE7C2',
    fill: [1, 0.9058823529, 0.7607843137],
    border: '#5B130D',
    borderWidth: 0.034,
    shadow: '#D21F1B',
    shadowAlpha: 0.62,
    shadowDistance: 7,
    shadowSmoothing: 16,
    styleName: '花字模板2 - 朱砂符印主标题',
  },
  template2Subtitle: {
    materialId: '3dc0a77f-6d79-4dca-81ed-75468f4c2089',
    segmentId: 'ff77ef01-b9d2-427c-b0b1-05d7f59d3e03',
    text: '朱砂一点 · 财势开局',
    size: 24,
    scale: 0.41,
    x: 0,
    y: 0.43,
    width: 0.62,
    height: 0.10,
    color: '#FFD9A1',
    fill: [1, 0.8509803922, 0.631372549],
    border: '#24100B',
    borderWidth: 0.018,
    shadow: '#7A0F0A',
    shadowAlpha: 0.58,
    shadowDistance: 5,
    shadowSmoothing: 14,
    styleName: '花字模板2 - 朱砂符印副标题',
  },
};

const keepMaterialIds = new Set(Object.values(keep).map((item) => item.materialId));
const keepSegmentIds = new Set(Object.values(keep).map((item) => item.segmentId));

const contentPath = path.join(draftDir, 'draft_content.json');
const draft = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

function contentPayload(text, size, fill) {
  return JSON.stringify({
    styles: [
      {
        range: [0, [...text].length],
        size,
        bold: false,
        italic: false,
        underline: false,
        fill: {
          alpha: 1,
          content: {
            render_type: 'solid',
            solid: {
              alpha: 1,
              color: fill,
            },
          },
        },
        align: 1,
      },
    ],
    text,
  });
}

let visibleTextSegments = 0;
let hiddenTextSegments = 0;

for (const text of draft.materials?.texts ?? []) {
  const cfg = Object.values(keep).find((item) => item.materialId === text.id);
  if (!cfg) continue;

  text.alignment = 1;
  text.background_alpha = 0;
  text.background_color = '';
  text.background_style = 0;
  text.border_alpha = 1;
  text.border_color = cfg.border;
  text.border_width = cfg.borderWidth;
  text.content = contentPayload(cfg.text, cfg.size, cfg.fill);
  text.fixed_width = cfg.width;
  text.fixed_height = cfg.height;
  text.font_size = cfg.size;
  text.force_apply_line_max_width = false;
  text.global_alpha = 1;
  text.has_shadow = true;
  text.letter_spacing = 0.03;
  text.line_feed = 1;
  text.line_max_width = 0.92;
  text.line_spacing = 0.01;
  text.shadow_alpha = cfg.shadowAlpha;
  text.shadow_color = cfg.shadow;
  text.shadow_distance = cfg.shadowDistance;
  text.shadow_point = { x: 0, y: 0 };
  text.shadow_smoothing = cfg.shadowSmoothing;
  text.style_name = cfg.styleName;
  text.text_alpha = 1;
  text.text_color = cfg.color;
  text.text_size = cfg.size;
  text.use_effect_default_color = false;
}

for (const track of draft.tracks ?? []) {
  if (track.type !== 'text') continue;
  for (const segment of track.segments ?? []) {
    const materialId = segment.material_id ?? segment.extra_material_refs?.[0];
    const cfg = Object.values(keep).find((item) => item.materialId === materialId || item.segmentId === segment.id);

    if (!cfg) {
      segment.visible = false;
      hiddenTextSegments += 1;
      continue;
    }

    segment.material_id = cfg.materialId;
    segment.extra_material_refs = [];
    segment.visible = true;
    segment.target_timerange = { start: 0, duration: 15000000 };
    segment.source_timerange = null;
    segment.clip = segment.clip ?? {};
    segment.clip.alpha = 1;
    segment.clip.rotation = 0;
    segment.clip.scale = { x: cfg.scale, y: cfg.scale };
    segment.clip.transform = { x: cfg.x, y: cfg.y };
    segment.uniform_scale = { on: true, value: cfg.scale };
    segment.common_keyframes = [];
    segment.keyframe_refs = [];
    segment.extra_material_refs = [];
    visibleTextSegments += 1;
  }
}

if (draft.materials?.material_animations) {
  draft.materials.material_animations = [];
}

for (const file of files) {
  fs.writeFileSync(path.join(draftDir, file), JSON.stringify(draft), 'utf8');
}

const manifest = {
  updated_at: new Date().toISOString(),
  draft: draftDir,
  templates: [
    {
      name: '花字模板1',
      style: '东方玄学金玉',
      material_ids: [keep.template1Title.materialId, keep.template1Subtitle.materialId],
      sample_texts: [keep.template1Title.text, keep.template1Subtitle.text],
    },
    {
      name: '花字模板2',
      style: '朱砂符印',
      material_ids: [keep.template2Title.materialId, keep.template2Subtitle.materialId],
      sample_texts: [keep.template2Title.text, keep.template2Subtitle.text],
    },
  ],
};
fs.writeFileSync(path.join(draftDir, 'codex_flower_text_templates.json'), JSON.stringify(manifest, null, 2), 'utf8');

console.log(`Visible text template layers: ${visibleTextSegments}`);
console.log(`Hidden text layers: ${hiddenTextSegments}`);
