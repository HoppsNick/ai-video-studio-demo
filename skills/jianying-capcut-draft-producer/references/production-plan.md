# Production Plan Contract

`scripts/build_jianying_draft.mjs` consumes a confirmed plan JSON after the production packet, narration choice, and packaging choice are approved.

## Minimum example

```json
{
  "draftName": "demo-draft",
  "draftRoot": "D:\\JianyingPro Drafts",
  "canvas": { "ratio": "16:9", "width": 1920, "height": 1080 },
  "script": {
    "original": "原始文案",
    "spoken": "确认后的口播稿"
  },
  "voiceover": {
    "source": "confirmed-preview-option",
    "path": "D:\\assets\\voiceover.wav",
    "durationUs": 24000000
  },
  "packaging": {
    "preset": "mystery-cinematic-strong",
    "previewApproved": true
  },
  "shots": [
    {
      "label": "城市建立镜头",
      "path": "D:\\assets\\01_城市夜景_冷静观察.mp4",
      "startUs": 0,
      "durationUs": 6000000
    },
    {
      "label": "待补人物反应镜头",
      "placeholder": true,
      "startUs": 6000000,
      "durationUs": 4000000
    }
  ],
  "captions": [
    {
      "text": "第一句字幕",
      "startUs": 0,
      "durationUs": 3000000,
      "kind": "subtitle"
    },
    {
      "text": "重点词",
      "startUs": 3000000,
      "durationUs": 1400000,
      "kind": "flower"
    }
  ],
  "music": {
    "source": "licensed-local-library",
    "path": "D:\\assets\\music.mp3",
    "startUs": 0,
    "durationUs": 24000000,
    "volume": 0.18
  },
  "sfx": [
    {
      "label": "whoosh",
      "source": "licensed-local-library",
      "path": "D:\\assets\\whoosh.wav",
      "startUs": 5800000,
      "durationUs": 800000,
      "volume": 0.5
    }
  ],
  "delivery": {
    "openJianying": false,
    "ensureDefaultScanJunction": false
  }
}
```

## Rules

- `canvas.ratio` must be `16:9` for the default skill workflow.
- Final narration must have an approved preview choice or an explicit user-provided audio source.
- Packaging should carry a user-approved preset or preview decision before final assembly.
- `shots` may contain placeholders. Placeholder entries become text markers on a dedicated track.
- Caption `kind` accepts `subtitle`, `flower`, `title`, and `marker`.
- Missing optional `music` or `sfx` leaves those tracks absent.
- A missing media path for a non-placeholder shot is a validation error.
- Keep `delivery.ensureDefaultScanJunction` false unless the user confirms compatibility fallback is needed.
