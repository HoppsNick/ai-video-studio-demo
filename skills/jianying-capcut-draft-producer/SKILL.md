---
name: jianying-capcut-draft-producer
description: Turn Chinese narration copy into a review-gated Jianying draft workflow. Use when the user wants Codex to analyze copy, offer production options, wait for confirmation, preview voice and packaging choices, organize sourced media, and then build a 16:9 Jianying/CapCut draft with voiceover, visuals, subtitles, flower text, packaging, music, and sound effects.
---

# Jianying CapCut Draft Producer

Use this skill for Chinese copy-to-Jianying requests such as:

- "鎶婅繖娈垫枃妗堝仛鎴愬壀鏄犺崏绋?
- "杩欐鍙ｆ挱甯垜閰嶉煶銆侀厤鐢婚潰銆佸仛鑺卞瓧鍜屽寘瑁?
- "鍏堢粰鎴戣繖娈垫枃妗堢殑鍒朵綔閫夐」"

This skill is a review-gated workflow. Do not collapse the gates when creative or file-placement choices are still unresolved.

## Defaults

- Output directory: `D:\JianyingPro Drafts`
- Canvas: Jianying `16:9` landscape
- Script handling: light spoken-language rewrite
- Packaging: strong packaging with subtitles, emphasis flower text, title beats, and tasteful transitions
- Visual sourcing: prefer stock media APIs or user-provided assets
- Visual fallback: keep explicit placeholder shots when no suitable asset is found
- Audio layers: voiceover, background music, and sound effects
- Music fallback: keep a music placeholder when no usable music is available
- Draft scan strategy: keep one physical draft in the configured draft root; create a default-scan Junction only when the user confirms that compatibility fallback is needed

Read [references/workflow.md](references/workflow.md) before executing a request. Read [references/audio-sources.md](references/audio-sources.md) before choosing narration, music, or sound-effect sources. Read [references/jianying-compatibility.md](references/jianying-compatibility.md) before writing a draft.
Read the jianying-59-text-template-workflow sections in workflow and compatibility references before editing Jianying 5.9 text templates or flower-text samples.

## Gate 1: Production Review

When the user provides copy but has not confirmed a production plan:

1. Analyze the copy only.
2. Do not generate voiceover audio or voice previews yet.
3. Do not download media.
4. Do not create or mutate a Jianying draft.
5. Return a review packet with these four sections in order:
   1. `鏂囨鍒ゆ柇涓庢帹鑽愮洰鏍囨椂闀縛
   2. `鎺ㄨ崘鍒朵綔鏂规`
   3. `鍙皟鏁村埗浣滃崟`
   4. `绛夊緟纭`

Use `scripts/make_review_packet.mjs` when a structured first pass is useful:

```powershell
node scripts/make_review_packet.mjs --script-file path\to\copy.txt
```

The review packet must offer meaningful choices for:

- Script handling: original, light spoken rewrite, compressed version, expanded version
- Duration: keep estimated duration, recommended compression, explicit target duration
- Canvas: default `16:9`
- Voice direction: gender, mood, pacing, plus a promise to provide previewable voice choices before final narration generation
- Visual sourcing: stock APIs, user assets, mixed sourcing, placeholders for missing shots
- Packaging: restrained, standard, strong, plus a promise to provide previewable packaging choices before final draft assembly
- Subtitle and flower-text density
- Audio layers and music mood
- Delivery details: draft name, open Jianying, keep placeholder-shot report
- Media archive behavior: after stock downloads, rename files with Chinese content and emotion labels; copy to a second folder only after the user confirms the destination

Recommend one production option and explain why in one short paragraph. Wait for explicit user confirmation or explicit overrides before Gate 2.

## Gate 2: Preview Choices

After the production packet is confirmed and before final generation:

1. Present previewable narration options. Prefer playable short voice samples, provider preview links, or user-supplied reference audio. Do not generate the full narration until the user chooses a voice option.
2. Present previewable packaging options. Prefer small style boards, still-frame mockups, short packaging clips, or reusable named style presets that show transition, sticker, flower-text, and title treatment.
3. Ask the user to confirm the chosen narration source and packaging style.

If a preview source is unavailable, state the limitation and offer the nearest confirmable alternative before building.

## Gate 3: Assets And Draft

Enter final production only after the production packet, narration choice, and packaging choice are confirmed.

1. Turn the confirmed copy into timed narration lines, shot beats, emphasis terms, packaging beats, and audio cues.
2. Generate or ingest the confirmed final voiceover.
3. Source the confirmed visuals.
4. After stock footage is downloaded, rename media with Chinese content and emotion labels. Use `scripts/organize_media_manifest.mjs` for the rename plan and only copy media to a second path after explicit destination confirmation.
5. Keep named placeholder clips for missing shots instead of silently changing the plan.
6. Select usable music and sound effects from the confirmed audio source strategy. Keep placeholders when a sound source is missing.
7. Build the Jianying draft with the confirmed media, captions, flower text, title beats, transitions, stickers or packaging elements, music, and sound effects.
8. Verify the resulting draft with structural checks and open Jianying when requested.

Use `scripts/build_jianying_draft.mjs` for the base `16:9` Jianying draft:

```powershell
node scripts/build_jianying_draft.mjs --plan path\to\confirmed-plan.json
```

The confirmed plan JSON contract is documented in [references/production-plan.md](references/production-plan.md).

## Compatibility Rules

- Keep the actual draft under `D:\JianyingPro Drafts` unless the user confirms another location.
- Build a Jianying `9.6`-style JSON draft structure for the current Windows setup.
- Prefer absolute Windows paths for media persisted into the draft.
- Default to a single draft root entry. Do not create a default-scan Junction when the configured D-drive draft root is already visible to Jianying.
- If Jianying cannot see the draft after a restart, ask before creating or reusing a compatibility Junction.
- Run the builder validation and `capcut info` when available before declaring the draft ready.

## Output

Gate 1 output is a production review packet only.

Gate 2 output is a preview-choice packet only.

Gate 3 output must report:

- Draft name and draft path
- Canvas ratio
- Voiceover, music, and SFX source status
- Number of placed shots and placeholder shots
- Media rename/archive result and any pending copy confirmation
- Validation result
- Whether Jianying was opened and whether a restart is needed for the draft list to refresh

