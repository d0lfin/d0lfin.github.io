import fs from "node:fs";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

const DESCRIPTIONS_FILENAME = "descriptions.json";
const GENERATED_METADATA_FILE = path.join(
  process.cwd(),
  "src",
  "generated",
  "photo-metadata.json",
);

interface GeneratedPhotoMetadata {
  description?: string;
  previewSrc?: string;
  capturedAt?: string;
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
}

export interface PhotoItem {
  slug: string;
  src: string;
  relativePath: string;
  title: string;
  description?: string;
  previewSrc?: string;
  capturedAt?: string;
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  year?: number;
  month?: number;
}

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(absolutePath));
      continue;
    }
    results.push(absolutePath);
  }
  return results;
}

function normalizePublicPath(value: string, relativeDir: string = ""): string {
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
  return path.posix.join("/photos", relativeDir, normalized);
}

function loadDescriptionMap(photosRoot: string): Map<string, string> {
  const map = new Map<string, string>();
  const files = walkFiles(photosRoot).filter(
    (filePath) => path.basename(filePath).toLowerCase() === DESCRIPTIONS_FILENAME,
  );

  for (const filePath of files) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        continue;
      }
      const relativeDir = path
        .relative(photosRoot, path.dirname(filePath))
        .split(path.sep)
        .join("/");
      for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof value !== "string" || value.trim() === "") {
          continue;
        }
        const publicPath = normalizePublicPath(key, relativeDir);
        if (!publicPath) {
          continue;
        }
        map.set(publicPath, value.trim());
      }
    } catch {
      // Ignore invalid description files so image publishing remains non-blocking.
    }
  }

  return map;
}

function loadGeneratedMetadataMap(): Map<string, GeneratedPhotoMetadata> {
  const map = new Map<string, GeneratedPhotoMetadata>();

  if (!fs.existsSync(GENERATED_METADATA_FILE)) {
    return map;
  }

  try {
    const raw = fs.readFileSync(GENERATED_METADATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as {
      photos?: Record<string, GeneratedPhotoMetadata>;
    };
    if (!parsed || typeof parsed !== "object" || !parsed.photos) {
      return map;
    }
    for (const [key, value] of Object.entries(parsed.photos)) {
      if (!value || typeof value !== "object") {
        continue;
      }
      map.set(key, value);
    }
  } catch {
    // Ignore generated metadata parse errors and keep file-based discovery alive.
  }

  return map;
}

function slugFromRelativePath(relativePath: string): string {
  const noExt = relativePath.replace(/\.[^.]+$/, "");
  return noExt
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/\/+/g, "--")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromRelativePath(relativePath: string): string {
  const fileName = path.basename(relativePath).replace(/\.[^.]+$/, "");
  return fileName
    .split(/[-_]+/)
    .filter(Boolean)
    .map((chunk) => `${chunk[0]?.toUpperCase() ?? ""}${chunk.slice(1)}`)
    .join(" ");
}

function parsePathDate(relativePath: string): { year?: number; month?: number } {
  const parts = relativePath.split(path.sep);
  if (parts.length < 2) {
    return {};
  }
  const maybeYear = Number(parts[0]);
  const maybeMonth = Number(parts[1]);
  if (!Number.isInteger(maybeYear) || maybeYear < 1900 || maybeYear > 3000) {
    return {};
  }
  if (!Number.isInteger(maybeMonth) || maybeMonth < 1 || maybeMonth > 12) {
    return {};
  }
  return { year: maybeYear, month: maybeMonth };
}

function getSortScore(photo: PhotoItem): number {
  if (photo.capturedAt) {
    const timestamp = new Date(photo.capturedAt).getTime();
    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }
  }
  if (!photo.year || !photo.month) {
    return 0;
  }
  return photo.year * 100 + photo.month;
}

export function getAllPhotos(): PhotoItem[] {
  const photosRoot = path.join(process.cwd(), "public", "photos");
  const descriptionMap = loadDescriptionMap(photosRoot);
  const generatedMetadataMap = loadGeneratedMetadataMap();

  const photos = walkFiles(photosRoot)
    .filter((filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      return IMAGE_EXTENSIONS.has(ext);
    })
    .map((filePath) => {
      const relativePath = path.relative(photosRoot, filePath);
      const normalizedRelativePath = relativePath.split(path.sep).join("/");
      const src = `/photos/${normalizedRelativePath}`;
      const { year, month } = parsePathDate(relativePath);
      const generatedMetadata = generatedMetadataMap.get(src);
      return {
        slug: slugFromRelativePath(normalizedRelativePath),
        src,
        relativePath: normalizedRelativePath,
        title: titleFromRelativePath(normalizedRelativePath),
        description: generatedMetadata?.description ?? descriptionMap.get(src),
        previewSrc: generatedMetadata?.previewSrc,
        capturedAt: generatedMetadata?.capturedAt,
        cameraMake: generatedMetadata?.cameraMake,
        cameraModel: generatedMetadata?.cameraModel,
        lensModel: generatedMetadata?.lensModel,
        year,
        month,
      } satisfies PhotoItem;
    });

  photos.sort((a, b) => {
    const scoreDiff = getSortScore(b) - getSortScore(a);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }
    return b.relativePath.localeCompare(a.relativePath);
  });

  return photos;
}
