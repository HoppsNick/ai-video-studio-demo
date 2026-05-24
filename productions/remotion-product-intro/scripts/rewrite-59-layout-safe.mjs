import fs from 'node:fs';
import path from 'node:path';

const draftDir = 'D:\\JianyingPro Drafts\\remotion-product-intro-59-layered';
const files = [
  'draft_content.json',
  'draft_content.json.bak',
  'template-2.tmp',
  'template.json',
];

const contentPath = path.join(draftDir, 'draft_content.json');
const draft = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

const byId = new Map();
for (const text of draft.materials?.texts ?? []) {
  byId.set(text.id, text);
}

const textSegmentRefs = [];
for (const track of draft.tracks ?? []) {
  if (track.type !== 'text') continue;
  for (const segment of track.segments ?? []) {
    const textId = segment.material_id ?? segment.extra_material_refs?.[0];
    if (!textId) continue;
    textSegmentRefs.push({ track, segment, textId });
  }
}

const layout = {
  // Scene 1, left copy.
  'a101eb8c-2375-4eb7-9420-aeb93a85555f': { x: -0.62, y: -0.58, size: 24, scale: 0.46, width: 0.34, height: 0.09, align: 0 },
  'dcf9fb93-1223-4e01-9443-c30a932c2eeb': { x: -0.62, y: -0.39, size: 13, scale: 0.46, width: 0.28, height: 0.06, align: 0 },
  '20f047e5-1048-46df-81d4-b408aee0a216': { x: -0.52, y: -0.16, size: 26, scale: 0.43, width: 0.46, height: 0.18, align: 0 },
  '6356f1e3-6a9c-4d96-8d6c-138b980a2773': { x: -0.52, y: 0.12, size: 14, scale: 0.43, width: 0.46, height: 0.14, align: 0 },
  'a6c16d4b-14f1-4269-81ec-a9826d96dfc8': { x: -0.68, y: 0.43, size: 12, scale: 0.42, width: 0.18, height: 0.06, align: 1 },
  '6ce0d81a-e190-4cd8-ad4c-e5ee5555b310': { x: -0.45, y: 0.43, size: 12, scale: 0.42, width: 0.18, height: 0.06, align: 1 },
  '357898f8-971f-4e5d-9cd0-7c918a343fd2': { x: -0.24, y: 0.43, size: 12, scale: 0.42, width: 0.18, height: 0.06, align: 1 },

  // Scene 1, dashboard labels.
  '40f71580-9ed1-4317-b521-a3191b6a035d': { x: 0.54, y: -0.36, size: 13, scale: 0.40, width: 0.24, height: 0.06, align: 1 },
  'c06470f6-e498-405b-9931-a6c3d581eb06': { x: 0.38, y: -0.16, size: 24, scale: 0.42, width: 0.20, height: 0.08, align: 1 },
  '5e8a2431-b373-401b-a462-2afb0a18da64': { x: 0.69, y: -0.16, size: 13, scale: 0.40, width: 0.20, height: 0.06, align: 1 },
  '3194bd21-bbd8-4ad5-a22e-a37d4d37ab2f': { x: 0.69, y: 0.08, size: 13, scale: 0.40, width: 0.20, height: 0.06, align: 1 },
  '824bd45b-2737-467e-9325-5587d8755591': { x: 0.38, y: 0.17, size: 14, scale: 0.38, width: 0.24, height: 0.08, align: 1 },
  '23a313dd-7ab9-4fec-99ce-e8db0b1458f7': { x: 0.46, y: 0.40, size: 11, scale: 0.36, width: 0.40, height: 0.06, align: 1 },

  // Scene 2, left copy.
  '34c6e36b-33bf-44a5-bc3f-016826397bc6': { x: -0.66, y: -0.48, size: 13, scale: 0.46, width: 0.22, height: 0.06, align: 0 },
  '79cc103c-fd3a-4445-a23a-50c1db9f8349': { x: -0.50, y: -0.22, size: 28, scale: 0.42, width: 0.48, height: 0.18, align: 0 },
  '3dc0a77f-6d79-4dca-81ed-75468f4c2089': { x: -0.52, y: 0.13, size: 14, scale: 0.42, width: 0.46, height: 0.14, align: 0 },
  'd6c9bbf4-1cc2-435c-aaaa-a9faeab5f125': { x: -0.68, y: 0.46, size: 12, scale: 0.40, width: 0.18, height: 0.06, align: 1 },
  'e5e1000a-4f25-47a1-ad5f-02572dd510e8': { x: -0.45, y: 0.46, size: 12, scale: 0.40, width: 0.18, height: 0.06, align: 1 },
  '14c540b5-17f8-4fc4-894b-27e1c60ceda0': { x: -0.24, y: 0.46, size: 12, scale: 0.40, width: 0.18, height: 0.06, align: 1 },

  // Scene 2, dashboard labels.
  '40aa7826-5856-4d02-852d-a26c4d2daea2': { x: 0.57, y: -0.36, size: 13, scale: 0.40, width: 0.24, height: 0.06, align: 1 },
  '88d88c5b-c999-4b87-a183-e3cc78e07263': { x: 0.42, y: -0.16, size: 24, scale: 0.42, width: 0.20, height: 0.08, align: 1 },
  '14e27ebe-fbf0-459f-bb43-1291298dd0ff': { x: 0.70, y: -0.16, size: 13, scale: 0.40, width: 0.20, height: 0.06, align: 1 },
  '10fc928c-8efb-4740-86ab-9122d40a3736': { x: 0.70, y: 0.10, size: 13, scale: 0.40, width: 0.20, height: 0.06, align: 1 },
  '86e5a1c0-b775-4307-becb-6604e99c0895': { x: 0.42, y: 0.18, size: 14, scale: 0.38, width: 0.24, height: 0.08, align: 1 },

  // Scene 3, centered CTA.
  '1fa99b29-ca4e-432a-b8d3-db6a19afc506': { x: 0.00, y: -0.45, size: 26, scale: 0.46, width: 0.34, height: 0.09, align: 1 },
  'f3ff850c-9726-4352-8694-f114e7d5eb65': { x: 0.00, y: -0.24, size: 13, scale: 0.42, width: 0.22, height: 0.06, align: 1 },
  '54c344e0-c20b-4452-b226-be953d4f6849': { x: 0.00, y: 0.00, size: 28, scale: 0.42, width: 0.50, height: 0.18, align: 1 },
  '276f2439-0680-4fd6-bf58-63ada8c4c5d6': { x: 0.00, y: 0.28, size: 14, scale: 0.42, width: 0.48, height: 0.14, align: 1 },
  '3ab68e10-9bce-4d06-8e8e-4039d78653ee': { x: 0.00, y: 0.56, size: 16, scale: 0.42, width: 0.28, height: 0.07, align: 1 },
};

function rewriteContentStyle(rawContent, size, align) {
  let payload;
  try {
    payload = JSON.parse(rawContent);
  } catch {
    return rawContent;
  }

  if (typeof payload.text === 'string') {
    payload.text = payload.text
      .replace('See the work that moves revenue.', 'See the work\nthat moves revenue.')
      .replace('Capture decisions, signals, and risk in one live operating layer.', 'Capture decisions, signals,\nand risk in one live operating layer.')
      .replace('Turn scattered inputs into one clean command surface.', 'Turn scattered inputs into\none clean command surface.')
      .replace('Launch every weekly revenue review with the answer already framed.', 'Launch every weekly revenue review\nwith the answer already framed.');
  }

  const length = [...(payload.text ?? '')].length;
  if (Array.isArray(payload.styles)) {
    for (const style of payload.styles) {
      style.range = [0, length];
      style.size = size;
      style.align = align;
    }
  }
  return JSON.stringify(payload);
}

let updated = 0;
let hidden = 0;

for (const { segment, textId } of textSegmentRefs) {
  const text = byId.get(textId);
  if (!text) continue;

  if (textId === 'ad0d2440-f193-423c-8c55-a5972770c4c3') {
    segment.visible = false;
    segment.clip = segment.clip ?? {};
    segment.clip.transform = { x: -0.02, y: -0.88 };
    segment.clip.scale = { x: 0.1, y: 0.1 };
    segment.uniform_scale = { on: true, value: 0.1 };
    hidden += 1;
    continue;
  }

  const cfg = layout[textId];
  if (!cfg) {
    console.warn(`No layout entry for ${textId}: ${text.content?.slice?.(0, 40) ?? ''}`);
    continue;
  }

  segment.visible = true;
  segment.extra_material_refs = [];
  segment.clip = segment.clip ?? {};
  segment.clip.transform = { x: cfg.x, y: cfg.y };
  segment.clip.scale = { x: cfg.scale, y: cfg.scale };
  segment.uniform_scale = { on: true, value: cfg.scale };

  text.font_size = cfg.size;
  text.text_size = cfg.size;
  text.fixed_width = cfg.width;
  text.fixed_height = cfg.height;
  text.content = rewriteContentStyle(text.content, cfg.size, cfg.align);
  updated += 1;
}

if (draft.materials?.material_animations) {
  draft.materials.material_animations = [];
}

for (const file of files) {
  fs.writeFileSync(path.join(draftDir, file), JSON.stringify(draft), 'utf8');
}

console.log(`Rewrote ${updated} text layers; hid ${hidden} placeholder layer.`);
