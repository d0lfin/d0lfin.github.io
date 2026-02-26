#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import exifr from "exifr";

const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".dng",
  ".heic",
  ".heif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".tif",
  ".tiff",
  ".webp",
]);

const DESCRIPTIONS_FILENAME = "descriptions.json";
const PHOTOS_ROOT = path.join(process.cwd(), "public", "photos");
const OUTPUT_FILE = path.join(process.cwd(), "src", "generated", "photo-metadata.json");
const PREVIEW_MAP_FILE = path.join(process.cwd(), "src", "generated", "photo-previews.json");

function walkFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(absolutePath));
    } else {
      results.push(absolutePath);
    }
  }
  return results;
}

function normalizeToPublicPhotoPath(value, relativeDir = "") {
  const normalized = value.replace(/\\/g, "/").trim();
  if (normalized.length === 0) {
    return "";
  }
  if (normalized.startsWith("/photos/")) {
    return normalized;
  }
  if (normalized.startsWith("photos/")) {
    return `/${normalized}`;
  }
  const joined = path.posix.join("/photos", relativeDir, normalized);
  return joined;
}

function readDescriptionMap() {
  const map = new Map();
  const files = walkFiles(PHOTOS_ROOT).filter(
    (filePath) => path.basename(filePath).toLowerCase() === DESCRIPTIONS_FILENAME,
  );

  for (const filePath of files) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        continue;
      }

      const dirRelativeToPhotosRoot = path
        .relative(PHOTOS_ROOT, path.dirname(filePath))
        .split(path.sep)
        .join("/");

      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value !== "string" || value.trim() === "") {
          continue;
        }
        const publicPath = normalizeToPublicPhotoPath(key, dirRelativeToPhotosRoot);
        if (!publicPath) {
          continue;
        }
        map.set(publicPath, value.trim());
      }
    } catch {
      // Do not fail CI for invalid optional description files.
    }
  }

  return map;
}

function toIso(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return undefined;
  }
  return value.toISOString();
}

async function extractExif(filePath) {
  try {
    const parsed = await exifr.parse(filePath, {
      pick: ["DateTimeOriginal", "CreateDate", "Make", "Model", "LensModel"],
      reviveValues: true,
    });

    if (!parsed) {
      return {};
    }

    const cameraMake = typeof parsed.Make === "string" ? parsed.Make.trim() : undefined;
    const cameraModel = typeof parsed.Model === "string" ? parsed.Model.trim() : undefined;
    const lensModel = typeof parsed.LensModel === "string" ? parsed.LensModel.trim() : undefined;
    const capturedAt = toIso(parsed.DateTimeOriginal) ?? toIso(parsed.CreateDate);

    return {
      capturedAt,
      cameraMake: cameraMake || undefined,
      cameraModel: cameraModel || undefined,
      lensModel: lensModel || undefined,
    };
  } catch {
    // Unsupported format or malformed EXIF should not break build.
    return {};
  }
}

function removeUndefinedFields(input) {
  const output = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== null && value !== "") {
      output[key] = value;
    }
  }
  return output;
}

function loadPreviewMap() {
  const map = new Map();
  if (!fs.existsSync(PREVIEW_MAP_FILE)) {
    return map;
  }

  try {
    const raw = fs.readFileSync(PREVIEW_MAP_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.previews) {
      return map;
    }
    for (const [originalPath, previewPath] of Object.entries(parsed.previews)) {
      if (typeof originalPath !== "string" || typeof previewPath !== "string") {
        continue;
      }
      map.set(originalPath, previewPath);
    }
  } catch {
    // Ignore malformed preview map and fallback to original image URLs.
  }

  return map;
}

async function generate() {
  const descriptionMap = readDescriptionMap();
  const previewMap = loadPreviewMap();
  const imageFiles = walkFiles(PHOTOS_ROOT).filter((filePath) =>
    IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase()),
  );

  imageFiles.sort((a, b) => a.localeCompare(b));

  const photos = {};
  for (const filePath of imageFiles) {
    const relativePath = path.relative(PHOTOS_ROOT, filePath).split(path.sep).join("/");
    const src = `/photos/${relativePath}`;
    const exif = await extractExif(filePath);
    const merged = removeUndefinedFields({
      description: descriptionMap.get(src),
      previewSrc: previewMap.get(src),
      ...exif,
    });
    photos[src] = merged;
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    photos,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Generated ${path.relative(process.cwd(), OUTPUT_FILE)} for ${imageFiles.length} photo(s).`);
}

await generate();
