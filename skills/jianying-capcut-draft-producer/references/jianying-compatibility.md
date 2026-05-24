# Jianying Compatibility

## Current Windows defaults

- Draft root: `D:\JianyingPro Drafts`
- Jianying executable: `D:\JianyingPro\JianyingPro.exe`
- Jianying default scan root used only for compatibility Junctions:
  `C:\Users\huoda\AppData\Local\JianyingPro\User Data\Projects\com.lveditor.draft`

## Draft shape

The current workflow writes a Jianying `9.6`-style JSON `draft_content.json`:

- `platform.app_source` is `lv`
- `platform.app_version` is `9.6.0`
- `canvas_config` is `1920x1080` with ratio `16:9`
- Video and audio tracks use explicit segments with absolute media paths

The builder stores a compact draft shape with the fields needed by the current Jianying reader and by `capcut info`.

## Media paths

Persist media paths as absolute Windows paths. The current CapCut CLI install needed Windows path handling fixes for drive-letter media paths, so the skill builder avoids relying on path coercion by the CLI when building the base draft.

## Visibility and duplicate drafts

Prefer one scan path for each physical draft.

- When the configured D-drive draft root is already visible to Jianying, keep `delivery.ensureDefaultScanJunction` false.
- If Jianying is already open when a draft is written, opening the executable again may not refresh the project list. Report that a Jianying restart may be needed.
- If the user confirms Jianying still cannot see the draft after a restart, enable the compatibility Junction fallback.
- Do not keep both a visible draft-root entry and a default-scan Junction for the same draft unless the user explicitly accepts duplicate project entries.

## Compatibility checks

After draft creation:

1. Confirm `draft_content.json` parses.
2. Confirm every declared media path exists unless the shot is a placeholder.
3. Confirm the canvas ratio is `16:9`.
4. If `capcut` is available, run `capcut info <draft> -H`.
5. If the user asks to open Jianying, launch the executable and report whether an existing Jianying process means the project list may need a restart.
## Jianying 5.9 text-template workflow

Marker: `jianying-59-text-template-workflow`.

Use this path when the user is specifically testing editable text templates, flower text, or CapCut/Jianying layered drafts in Jianying 5.9.

- Known working executable path from the current Windows setup: `F:\Users\huoda\Desktop\剪映解锁版\剪映解锁版\JianyingPro\5.9.0.11632\JianyingPro.exe`.
- Keep the physical draft under `D:\JianyingPro Drafts` and, when needed for discovery, expose it with a Junction under `C:\Users\huoda\AppData\Local\JianyingPro\User Data\Projects\com.lveditor.draft`.
- Do not open or save these 5.9 JSON drafts in Jianying 10.6. Jianying 10.6 can encrypt native draft files; current CLI tooling cannot reliably decrypt those encrypted `draft_content.json` files.
- Before mutating `draft_content.json`, close all `JianyingPro` processes. If Jianying is open, it may rewrite the file from its in-memory old state and silently undo the patch.
- After closing Jianying, write the same JSON content to `draft_content.json`, `draft_content.json.bak`, `template-2.tmp`, and `template.json` when those files are present in the draft shell.
- Avoid using `capcut text-style` or similar commands for final layout fixes if they reset text `clip.transform` to `{x:0,y:0}`. For template layout, patch JSON directly: `segment.clip.transform`, `segment.clip.scale`, `segment.uniform_scale`, `material.font_size`, `material.text_size`, `material.fixed_width`, `material.fixed_height`, and style payload size/alignment.
- Prefer hiding surplus text segments with `segment.visible = false` rather than deleting them while iterating. This keeps source layers recoverable and avoids disturbing draft shell structure.
- Verify after each write with a structural read: count visible text segments, hidden text segments, origin-centered segments, animation count, and any large scale/font outliers.

