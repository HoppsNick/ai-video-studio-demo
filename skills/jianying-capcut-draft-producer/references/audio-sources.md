# Audio Sources

## Narration

Do not generate the final narration from an unapproved voice.

Prefer sources in this order:

1. User-provided narration or reference voice file.
2. A TTS provider or local voice workflow that can produce short preview samples before the full take.
3. A temporary placeholder narration track only when the user explicitly accepts a placeholder.

For each narration option, present enough information to choose:

- Voice or provider label
- Gender and tone
- Pace and emotion
- Preview artifact or preview method
- Whether the final audio can be generated locally or needs a configured external source

## Background music

Use one of these source strategies:

- User-provided licensed music
- A local licensed music library path confirmed by the user
- A configured music API or library with usable license terms
- A named music placeholder when no source is confirmed

State the chosen source and license responsibility in the production note.

## Sound effects

Use one of these source strategies:

- User-provided effects
- A local licensed SFX library path confirmed by the user
- A configured SFX source with usable license terms
- Named SFX placeholders for missing cues

Avoid pretending stock-video providers cover music or SFX unless that source is actually configured.
