# Portfolio — Victor Maldonado

Static personal site ("the observatory"). No framework, no build step: three files
served as-is.

```
index.html    markup + metadata
styles.css    design tokens (Classical system) + all component styles
app.js        theme toggle, typewriters, project catalogue, scroll reveal
```

Compiled by hand from the Claude Design component `Portfolio Site.dc.html`, which
relied on the `x-dc` preview runtime (`sc-for`, `sc-if`, `{{ }}` bindings,
`style-hover`). Those constructs are preview-only, so they were replaced with real
DOM rendering, CSS `:hover` rules, and responsive breakpoints — the source was
authored at a fixed 1180px preview width.

## Local preview

```sh
python3 -m http.server 8000    # then open http://localhost:8000
```

## Deploy — Vercel (primary)

```sh
npx vercel          # preview deployment
npx vercel --prod   # production
```

`vercel.json` sets clean URLs and revalidating cache headers (assets are not
content-hashed, so they must not be cached immutably).

## Deploy — GitHub Pages (fallback)

Everything uses relative paths and `.nojekyll` is present, so pushing to a repo and
enabling Pages on the branch root works with no changes.

## Editing content

All copy for the project catalogue, skills and certificates lives in the
`PROJECTS`, `SKILLS` and `CERTS` arrays at the top of `app.js`. Experience entries
and blog cards are plain markup in `index.html`.

## Still placeholder

- Photo plates render as diagonal-hatch placeholders — drop in real images.
- Footer social links and the per-project `live` / `source` URLs point at `#`.
- The blog section links back to itself; there is no blog page in this repo yet.
