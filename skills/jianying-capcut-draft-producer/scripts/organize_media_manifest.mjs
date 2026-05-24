#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, renameSync, readFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));
if (!args.manifest) fail("Usage: node organize_media_manifest.mjs --manifest <media-manifest.json> [--apply-rename] [--copy-destination <path> --confirm-copy]");

const manifestPath = resolve(args.manifest);
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const items = Array.isArray(manifest.items) ? manifest.items : [];
if (!items.length) fail("Manifest must contain items.");

const results = items.map((item, index) => organizeItem(item, index));
process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      renameApplied: Boolean(args["apply-rename"]),
      copyDestination: args["copy-destination"] || null,
      copyApplied: Boolean(args["copy-destination"] && args["confirm-copy"]),
      copyPendingConfirmation: Boolean(args["copy-destination"] && !args["confirm-copy"]),
      items: results,
    },
    null,
    2,
  )}\n`,
);

function organizeItem(item, index) {
  const sourcePath = resolveFromManifest(String(item.sourcePath || ""));
  if (!sourcePath || !existsSync(sourcePath)) fail(`Media item ${index + 1} source is missing: ${item.sourcePath || ""}`);

  const extension = extname(sourcePath);
  const renamedBase = sanitize(
    item.targetName ||
      `${String(item.order || index + 1).padStart(2, "0")}_${item.contentLabel || "素材"}_${item.emotion || "情绪待定"}`,
  );
  const renamedPath = join(dirname(sourcePath), `${renamedBase}${extension}`);
  const finalPath = args["apply-rename"] && sourcePath !== renamedPath ? renameMedia(sourcePath, renamedPath) : renamedPath;
  const copyPath = args["copy-destination"] ? join(resolve(args["copy-destination"]), basename(finalPath)) : null;

  if (copyPath && args["confirm-copy"]) {
    mkdirSync(dirname(copyPath), { recursive: true });
    copyFileSync(finalPath, copyPath);
  }

  return {
    sourcePath,
    contentLabel: item.contentLabel || "",
    emotion: item.emotion || "",
    renamedPath: finalPath,
    copiedPath: copyPath && args["confirm-copy"] ? copyPath : null,
  };
}

function renameMedia(sourcePath, renamedPath) {
  if (existsSync(renamedPath)) return renamedPath;
  renameSync(sourcePath, renamedPath);
  return renamedPath;
}

function resolveFromManifest(input) {
  if (!input) return "";
  return resolve(dirname(manifestPath), input);
}

function sanitize(input) {
  return String(input).trim().replace(/[<>:"/\\|?*]+/g, "-").replace(/\s+/g, "");
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--manifest") out.manifest = argv[++i];
    else if (arg === "--apply-rename") out["apply-rename"] = true;
    else if (arg === "--copy-destination") out["copy-destination"] = argv[++i];
    else if (arg === "--confirm-copy") out["confirm-copy"] = true;
    else fail(`Unknown argument: ${arg}`);
  }
  return out;
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
