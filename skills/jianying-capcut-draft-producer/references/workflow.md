# Workflow

## Review-gated contract

Use three gates so creative decisions are confirmed before expensive or hard-to-undo work.

### Gate 1: production review

For copy-only requests, analyze the text and return a production review packet. Treat any of these as Gate 1 confirmation:

- The user chooses options from the packet.
- The user says to use the recommended packet.
- The user supplies an explicit brief that already fixes duration, canvas, visual sourcing, packaging direction, and delivery behavior.

Do not call TTS, stock media downloaders, image generation, music downloaders, or draft-writing scripts before Gate 1 confirmation.

### Gate 2: preview choices

Before generating final narration or assembling the final draft:

1. Offer narration choices that the user can preview.
2. Offer packaging choices that the user can preview.
3. Wait for the user to choose or explicitly approve a default.

Voice previews may be short generated samples, provider preview links, or user-provided reference audio. Packaging previews may be still mockups, short sample clips, or named presets with enough visual evidence to compare transition, sticker, flower-text, and title treatment.

### Gate 3: assets and draft

Only after Gate 2 approval:

1. Prepare a confirmed production plan JSON.
2. Generate or ingest the final narration audio and align line timings.
3. Search or download visuals. Prefer the available stock-media skill when the plan calls for stock media APIs.
4. Rename downloaded stock media with Chinese content and emotion labels.
5. Ask for confirmation before copying organized media to any second destination path.
6. Fill unresolved shots with placeholder entries in the plan.
7. Build the Jianying draft.
8. Validate the draft and report placeholders.

## Stage 1 packet

Keep the packet useful, not bureaucratic.

1. Estimate spoken duration from Chinese copy length and sentence rhythm.
2. Point out the most likely video shape: explanation, emotional montage, story, tutorial, review, or sales pitch.
3. Recommend one duration and production package.
4. State that narration and packaging previews come after the user confirms the production packet.
5. Offer full adjustment options so the user can change the recommendation before production.

## Media organization

For downloaded footage, describe filenames with:

- Shot order when sequence matters
- Chinese content label
- Emotion or atmosphere label
- Source-preserving extension

Example: `03_涔︽灦鍏夊奖_绁炵鍘嬭揩.mp4`.

Use a manifest-driven rename step so the user can inspect the naming before copy operations. Keep original source paths in the manifest and never copy to a second folder without an explicit destination confirmation.

## Creative defaults

- Landscape pacing should avoid portrait-short-video assumptions unless the user asks for them.
- Strong packaging means emphasis text and title beats serve the narration. It does not mean every second must carry decoration.
- Placeholder shots must be clearly named so the user can replace them in Jianying.
## Flower-text template sampling

Marker: `jianying-59-text-template-workflow`.

When the user wants reusable flower-text or styled text templates instead of a full crowded timeline:

1. Ask the user to create or identify a draft/sample text when real Jianying-native styling is needed. A sentinel text such as `STYLE_SAMPLE_ALL` is useful for discovering style-bearing layers.
2. Use Jianying 5.9 for editable JSON drafts; close Jianying before every JSON mutation.
3. Keep only a small number of visible text layers per screen. For template libraries, use two text layers per template: one main title and one subtitle/descriptor.
4. Hide unused text layers rather than deleting them during design exploration.
5. Assign stable template names in the text material `style_name` field when possible, for example `花字模板1 - 东方玄学金玉主标题` and `花字模板1 - 东方玄学金玉副标题`.
6. Record reusable templates in `codex_flower_text_templates.json` inside the draft directory. Include template name, style description, material IDs, and sample texts so future runs can identify and reuse them.
7. Keep the visual density low: one template can occupy the upper half of the canvas and another the lower half for comparison, but production scenes should usually show only one template group at a time.
8. If the user reports no visual change after a patch, first check whether Jianying was open and overwrote the JSON. Close Jianying, reapply the patch, and then verify file modification time and visible layer counts.

Recent proven pattern:

- `花字模板1`: 东方玄学金玉 style, main text `玄机已启`, subtitle `五行流转 · 生意入局`.
- `花字模板2`: 朱砂符印 style, main text `灵签落定`, subtitle `朱砂一点 · 财势开局`.

