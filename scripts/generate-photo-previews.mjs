#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PHOTOS_ROOT = path.join(process.cwd(), "public", "photos");
const PREVIEWS_ROOT = path.join(process.cwd(), "public", "generated", "photos");
const OUTPUT_FILE = path.join(process.cwd(), "src", "generated", "photo-previews.json");
const MAX_SIZE = Number.parseInt(process.env.PHOTO_PREVIEW_MAX_SIZE ?? "2200", 10);
const WEBP_QUALITY = Number.parseInt(process.env.PHOTO_PREVIEW_QUALITY ?? "80", 10);

const PREVIEWABLE_EXTENSIONS = new Set([
  ".avif",
  ".heic",
  ".heif",
  ".jpeg",
  ".jpg",
  ".png",
  ".tif",
  ".tiff",
  ".webp",
]);

function walkFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolute));
      continue;
    }
    files.push(absolute);
  }
  return files;
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function isPreviewable(filePath) {
  return PREVIEWABLE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function outputRelativePath(inputRelativePath) {
  return inputRelativePath.replace(/\.[^.]+$/, ".webp");
}

async function generate() {
  fs.rmSync(PREVIEWS_ROOT, { recursive: true, force: true });
  fs.mkdirSync(PREVIEWS_ROOT, { recursive: true });

  const images = walkFiles(PHOTOS_ROOT).filter(isPreviewable).sort((a, b) => a.localeCompare(b));
  const previews = {};

  for (const imagePath of images) {
    const relative = toPosix(path.relative(PHOTOS_ROOT, imagePath));
    const previewRelative = outputRelativePath(relative);
    const previewAbsolute = path.join(PREVIEWS_ROOT, previewRelative);

    fs.mkdirSync(path.dirname(previewAbsolute), { recursive: true });

    try {
      await sharp(imagePath)
        .rotate()
        .resize({
          width: MAX_SIZE,
          height: MAX_SIZE,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: WEBP_QUALITY })
        .toFile(previewAbsolute);

      previews[`/photos/${relative}`] = `/generated/photos/${previewRelative}`;
    } catch (error) {
      // Keep build resilient: fallback to original if preview generation fails.
      console.warn(`Preview generation failed for ${relative}: ${String(error)}`);
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    maxSize: MAX_SIZE,
    quality: WEBP_QUALITY,
    previews,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Generated ${path.relative(process.cwd(), OUTPUT_FILE)} for ${Object.keys(previews).length} preview(s).`);
}

await generate();
