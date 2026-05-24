import {existsSync} from "node:fs";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const defaults = {
  model: "gpt-4o-mini-tts",
  voice: "marin",
  format: "mp3",
  outFile: "assets/audio/openai-voiceover.mp3",
  instructions:
    "用自然、清晰、有画面感的中文旁白风格朗读。语速适中，停顿自然，情绪克制但有吸引力。",
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
    args[rawKey] =
      inlineValue ??
      (nextValue && !nextValue.startsWith("--") ? argv[++index] : "true");
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

const createSpeech = async ({
  apiKey,
  model,
  voice,
  input,
  instructions,
  responseFormat,
}) => {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      input,
      instructions,
      response_format: responseFormat,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI TTS failed (${response.status}): ${detail}`);
  }

  return Buffer.from(await response.arrayBuffer());
};

const main = async () => {
  await loadEnvFile(path.resolve(projectRoot, ".env.local"));
  await loadEnvFile("C:\\Users\\huoda\\.codex\\secrets\\openai.env");

  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing OPENAI_API_KEY. Add it to .env.local or C:\\Users\\huoda\\.codex\\secrets\\openai.env.",
    );
  }

  const input = (await readInputText(args)).trim();
  if (!input) {
    throw new Error("Text input is empty.");
  }

  const responseFormat =
    args.format ?? process.env.OPENAI_TTS_FORMAT ?? defaults.format;
  const outFile =
    args.out ??
    process.env.OPENAI_TTS_OUT_FILE ??
    defaults.outFile.replace(/\.mp3$/, `.${responseFormat}`);
  const outPath = path.resolve(projectRoot, outFile);

  const audio = await createSpeech({
    apiKey,
    input,
    model: args.model ?? process.env.OPENAI_TTS_MODEL ?? defaults.model,
    voice: args.voice ?? process.env.OPENAI_TTS_VOICE ?? defaults.voice,
    instructions:
      args.instructions ??
      process.env.OPENAI_TTS_INSTRUCTIONS ??
      defaults.instructions,
    responseFormat,
  });

  await mkdir(path.dirname(outPath), {recursive: true});
  await writeFile(outPath, audio);

  console.log(`Saved ${path.relative(projectRoot, outPath)}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
