# Portfolio — Victor Maldonado

Static personal site ("El Observatorio") plus its blog, *The Night Shift*.
No framework and no build step: content lives in JSON, pages are ES modules.

Live at **https://vmlcode.github.io**

```
index.html        home page shell
blog.html         blog index shell
styles.css        design tokens (Classical system) + all component styles
js/common.js      content loading, theming, typewriter, scroll reveal, shared chrome
js/home.js        home page rendering
js/blog.js        blog index rendering + tag filter
content/*.json    all editable content (see below)
```

Compiled by hand from the Claude Design components `Portfolio Site.dc.html` and
`Portfolio Blog.dc.html`, which relied on the `x-dc` preview runtime (`sc-for`,
`sc-if`, `{{ }}` bindings, `style-hover`). Those constructs are preview-only, so
they were replaced with real DOM rendering, CSS `:hover` rules and responsive
breakpoints — the source was authored at a fixed 1180px preview width.

## Editing content

Everything editorial is JSON; you should not need to touch HTML or JS to update
the site.

| File | Holds |
|---|---|
| `content/site.json` | Name, hero copy, session log, nav, section headings, blog-page copy, footer + social links |
| `content/experience.json` | Timeline entries (the "expeditions") |
| `content/projects.json` | Work catalogue records — problem, approach, lesson, stack, links |
| `content/skills.json` | Skill name + `level` 1–5 (drives the tick meters) |
| `content/certificates.json` | Certificate name, issuer, year |
| `content/posts.json` | Blog posts, shared by both pages |

Notes:

- **Posts** are sorted newest-first by `date` at runtime, so order in the file
  doesn't matter. The home page shows the newest three. Blog filter tags are
  derived from the posts themselves — adding a post with a new `tag` makes the
  filter chip appear automatically.
- Posts carry both `teaser` (blog index) and `blurb` (shorter, home page).
- **Photos**: every `plate` / `shot` object takes an `image` path. Leave it
  `null` for the diagonal-hatch placeholder, or set it to e.g.
  `"./img/cv-lab.jpg"` to drop in a real photo (styled sepia to match).

## Local preview

Content is fetched over HTTP, so opening `index.html` from the filesystem will
not work — serve it:

```sh
python3 -m http.server 8000    # then open http://localhost:8000
```

## Deploy

Pushing to `main` publishes to GitHub Pages automatically (branch root, legacy
build, `.nojekyll` present). No workflow to configure.

Vercel also works unchanged if you'd rather move: `npx vercel --prod`.
`vercel.json` sets clean URLs and revalidating cache headers (assets are not
content-hashed, so they must not be cached immutably).

## Known trade-offs

- Rendering content from JSON means the HTML ships nearly empty, so crawlers
  that don't execute JS see only the `<title>`/meta tags. Fine for a portfolio;
  if that ever matters, the fix is a small build step that inlines the JSON at
  publish time. Both pages carry a `<noscript>` fallback pointing at this repo.

## Still placeholder

- Photo plates render as placeholders — see `image` above.
- Footer social links, per-project `live`/`source`, and every post `url` are `#`.
- There is no individual article page yet; post titles link to `#`. The design
  project has a `Portfolio Article.dc.html` that could be ported next.
