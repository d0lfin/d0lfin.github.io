# d0lfin Photo Blog

Photo-first personal site on Astro + MDX.

## Commands

- `npm install` - install dependencies
- `npm run photo:previews` - create resized/compressed display previews
- `npm run photo:metadata` - generate metadata from EXIF + optional descriptions
- `npm run dev` - start local dev server
- `npm run build` - generate photo metadata, then build static output into `dist/`
- `npm run preview` - preview production build locally
- `npm run lint` - run `astro check`

## Content Structure

- Blog entries: `src/content/blog/*.md`
- Public photo files: `public/photos/<year>/<month>/<series>/*`
- Optional description files: `public/photos/**/descriptions.json` (map `path -> description`)

## Blog Add Workflow (Markdown-Only)

Create a markdown file in `src/content/blog/`, for example `my-note.md`:

```md
---
title: My Note
date: 2026-02-26
tags:
  - note
summary: One-line summary for list/SEO.
draft: false
hero: /photos/2026/02/baker-beach/dawn-wide.svg
---

# Heading

Regular markdown content goes here.
```

Post slug is generated from the filename (`my-note.md` -> `/blog/my-note/`).

## Photo Add Workflow (Commit-Only)

1. Add photo files into a dated folder structure, for example:

```sh
public/photos/2026/02/baker-beach/dawn-wide.jpg
public/photos/2026/02/baker-beach/surfline.jpg
```

2. Optional: create or update `descriptions.json` near those files:

```json
{
  "/photos/2026/02/baker-beach/dawn-wide.jpg": "Golden light and low tide at sunrise.",
  "/photos/2026/02/baker-beach/surfline.jpg": "Foam lines moving toward the rocks."
}
```

3. Commit and push to `master`.

Notes:
- Description is optional. If there is no `descriptions.json`, the photo is still published.
- New photo pages are generated automatically from file paths.
- During GitHub Actions, a separate preview step generates compressed/resized webp files for display.
- Pages use generated previews for viewing and keep links to original files for full-size open/download.
- EXIF date/camera/lens are extracted automatically during `npm run build` (including GitHub Actions).
