# d0lfin Photo Blog

Photo-first personal site on Astro + MDX.

## Commands

- `npm install` - install dependencies
- `npm run dev` - start local dev server
- `npm run build` - build static output into `dist/`
- `npm run preview` - preview production build locally
- `npm run lint` - run `astro check`

## Content Structure

- Blog entries: `src/content/blog/*.md`
- Public photo files: `public/photos/<year>/<month>/<series>/*`
- Optional description files: `public/photos/**/descriptions.json` (map `path -> description`)

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
