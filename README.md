# d0lfin Photo Blog

Photo-first personal site on Astro + MDX.

## Commands

- `npm install` - install dependencies
- `npm run dev` - start local dev server
- `npm run build` - build static output into `dist/`
- `npm run preview` - preview production build locally
- `npm run lint` - run `astro check`

## Content Structure

- Photo entries: `src/content/photos/*.md`
- Blog entries: `src/content/blog/*.md`
- Photo manifests (path -> description): `src/content/photoManifests/*.json`
- Public photo files: `public/photos/<year>/<month>/<series>/*`

## Photo Add Workflow (Commit-Only)

1. Add photo files into a dated folder structure, for example:

```sh
public/photos/2026/02/baker-beach/dawn-wide.jpg
public/photos/2026/02/baker-beach/surfline.jpg
```

2. Create or update a manifest file with path-to-description mapping:

```json
{
  "images": [
    {
      "path": "/photos/2026/02/baker-beach/dawn-wide.jpg",
      "description": "Golden light and low tide at sunrise."
    },
    {
      "path": "/photos/2026/02/baker-beach/surfline.jpg",
      "description": "Foam lines moving toward the rocks."
    }
  ]
}
```

3. Add a photo entry in `src/content/photos/<slug>.md` and point `cover` and `manifest` to those files.
4. Commit and push to `master`.
