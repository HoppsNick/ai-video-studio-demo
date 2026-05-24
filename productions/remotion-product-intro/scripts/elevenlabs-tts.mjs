import {existsSync} from "node:fs";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const defaults = {
  voiceId: "JBFqnCBsd6RMkjVDRZzb",
  modelId: "eleven_multilingual_v2",
  outputFormat: "mp3_44100_128",
  outFile: "assets/audio/elevenlabs-voiceover.mp3",
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0,
  useSpeakerBoost: true,
};

const loadEnvFile = async (filePath) => {
  if (!existsSync(filePath)) {
    return;
  }

  const raw = await readFile(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
};

const parseArgs = (argv) => {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const [rawKey, inlineValue] = token.slice(2).split("=");
    const nextValue = argv[index + 1];
    const value =
      inlineValue ??
      (nextValue && !nextValue.startsWith("--") ? argv[++index] : "true");
    args[rawKey] = value;
  }

  return args;
};

const readInputText = async (args) => {
  if (args.text) {
    return args.text;
  }

  const inputFile = args.file ?? "voiceover.txt";
  const inputPath = path.resolve(projectRoot, inputFile);
  if (!existsSync(inputPath)) {
    throw new Error(
      `Missing text input. Pass --text "..." or create ${path.relative(projectRoot, inputPath)}.`,
    );
  }

  return readFile(inputPath, "utf8");
};

const toNumber = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Expected a number, got "${value}".`);
  }

  return parsed;
};

const createSpeech = async ({
  apiKey,
  voiceId,
  modelId,
  outputFormat,
  text,
  stability,
  similarityBoost,
  style,
  useSpeakerBoost,
}) => {
  const endpoint = new URL(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
  );
  endpoint.searchParams.set("output_format", outputFormat);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
        style,
        use_speaker_boost: useSpeakerBoost,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`ElevenLabs API failed (${response.status}): ${detail}`);
  }

  return {
    audio: Buffer.from(await response.arrayBuffer()),
    characterCount: response.headers.get("x-character-count"),
    requestId: response.headers.get("request-id"),
  };
};

const main = async () => {
  await loadEnvFile(path.resolve(projectRoot, ".env.local"));
  await loadEnvFile("C:\\Users\\huoda\\.codex\\secrets\\elevenlabs.env");

  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing ELEVENLABS_API_KEY. Add it to .env.local or set it in your shell.",
    );
  }

  const text = (await readInputText(args)).trim();
  if (!text) {
    throw new Error("Text input is empty.");
  }

  const outFile = args.out ?? process.env.ELEVENLABS_OUT_FILE ?? defaults.outFile;
  const outPath = path.resolve(projectRoot, outFile);
  const result = await createSpeech({
    apiKey,
    text,
    voiceId: args.voice ?? process.env.ELEVENLABS_VOICE_ID ?? defaults.voiceId,
    modelId: args.model ?? process.env.ELEVENLABS_MODEL_ID ?? defaults.modelId,
    outputFormat:
      args.format ?? process.env.ELEVENLABS_OUTPUT_FORMAT ?? defaults.outputFormat,
    stability: toNumber(args.stability, defaults.stability),
    similarityBoost: toNumber(
      args["similarity-boost"],
      defaults.similarityBoost,
    ),
    style: toNumber(args.style, defaults.style),
    useSpeakerBoost:
      args["speaker-boost"] === undefined
        ? defaults.useSpeakerBoost
        : args["speaker-boost"] !== "false",
  });

  await mkdir(path.dirname(outPath), {recursive: true});
  await writeFile(outPath, result.audio);

  console.log(`Saved ${path.relative(projectRoot, outPath)}`);
  if (result.characterCount) {
    console.log(`Character count: ${result.characterCount}`);
  }
  if (result.requestId) {
    console.log(`Request ID: ${result.requestId}`);
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
