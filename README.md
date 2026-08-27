# Portfolio — Victor Maldonado

Static personal site plus its blog, *The Night Shift*.
No framework and no build step: content lives in JSON, pages are ES modules.

Live at **https://vmlcode.github.io**

```
index.html          home page shell
blog.html           blog index shell
post.html           article shell — one page serves every post
styles.css          design tokens (Classical system) + all component styles
js/common.js        content loading, theming, typewriter, scroll reveal, shared chrome
js/home.js          home page rendering
js/blog.js          blog index rendering + tag filter
js/post.js          article rendering, reading progress, TOC, share
js/markdown.js      small Markdown subset parser (~2KB)
content/<lang>/     all editable content, one tree per language (see below)
content/images/     shared images, referenced from any language
og/                 social-card sources + build script
```

Compiled by hand from the Claude Design components `Portfolio Site.dc.html` and
`Portfolio Blog.dc.html`, which relied on the `x-dc` preview runtime (`sc-for`,
`sc-if`, `{{ }}` bindings, `style-hover`). Those constructs are preview-only, so
they were replaced with real DOM rendering, CSS `:hover` rules and responsive
breakpoints — the source was authored at a fixed 1180px preview width.

## Languages

The site ships in English and Spanish. Each language is a complete content tree:

```
content/en/*.json  content/en/posts/*.md
content/es/*.json  content/es/posts/*.md
content/images/    shared by both
```

The renderers never branch on language — they read whatever
`loadContent()` hands them, and it always loads from `content/<lang>/`. Both
trees must therefore carry the **same keys** and the same post slugs; only the
copy differs.

The active language is chosen in this order: `?lang=en|es` in the URL, then the
visitor's stored choice, then the browser's preference, then English. The EN/ES
control in the header stores the choice and reloads. A `?lang=` link is stored
on arrival, so it survives a click through to another page.

Interface strings that are not editorial — button labels, "contents", the 404
copy — live under `ui` in each `site.json`. Renderers read them from there;
copy that sits in the HTML instead names its key with `data-i18n="post.share"`
(add `data-i18n-attr` to target an attribute rather than the text).

## Editing content

Everything editorial is JSON; you should not need to touch HTML or JS to update
the site. Paths below are relative to `content/<lang>/`.

| File | Holds |
|---|---|
| `site.json` | Name, hero copy, session log, nav, section headings, blog-page copy, footer + social links, and the `ui` interface strings |
| `experience.json` | Timeline entries (the "expeditions") |
| `projects.json` | Work catalogue records — problem, approach, lesson, stack, links |
| `skills.json` | Skill name + `level` 1–5 (drives the tick meters) |
| `certificates.json` | Certificate name, issuer, year |
| `posts.json` | Blog posts, shared by both pages |

Notes:

- **Edit both trees.** A key present in one language and missing in the other
  renders as `undefined` in the language that lacks it.

- **Posts** are sorted newest-first by `date` at runtime, so order in the file
  doesn't matter. The home page shows the newest three. Blog filter tags are
  derived from the posts themselves — adding a post with a new `tag` makes the
  filter chip appear automatically.
- Posts carry both `teaser` (blog index) and `blurb` (shorter, home page).

## Writing a post

Two steps:

1. Add `content/en/posts/<slug>.md` and `content/es/posts/<slug>.md` with the
   body. **The slug is shared** — it is what keeps the two versions of an
   article linked, so it stays in English in both trees.
2. Add an entry to both `content/en/posts.json` and `content/es/posts.json`
   whose `slug` matches the filename, and set `"url": "./post.html?p=<slug>"`.

Every article is served by `post.html`, which reads `?p=<slug>`. The supported
Markdown is deliberately narrow — `js/markdown.js` handles exactly this and
treats anything else as a paragraph:

| Syntax | Renders as |
|---|---|
| `## Heading` | Numbered section; also builds the table of contents |
| `> quote` | Pull quote |
| ` ```…``` ` | Console block |
| `![caption](src)` | Figure — leave `src` empty for the hatch placeholder |
| `**bold**` `*italic*` `` `code` `` `[label](href)` | Inline |

The first paragraph automatically gets the drop cap. Post content is escaped
before any markup is emitted, so a `.md` file cannot inject HTML.
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

## Link previews

`og/home.png` and `og/blog.png` are generated from HTML sources at exactly
1200×630:

```sh
./og/build.sh                          # uses Brave; BROWSER=... to override
```

`og:image` URLs are absolute and hardcoded in each page's `<head>` — relative
paths are ignored by most scrapers, and crawlers don't run the JS that renders
everything else. **If you move to a custom domain, update those absolute URLs
and the canonical links.** After changing them, force a re-scrape via LinkedIn's
Post Inspector or Facebook's Sharing Debugger; both cache aggressively.

## Known trade-offs

- Rendering content from JSON/Markdown means the HTML ships nearly empty, so
  crawlers that don't execute JS see only the `<title>`/meta tags. Fine for a
  portfolio; the fix, if it ever matters, is a build step that inlines content
  at publish time. All pages carry a `<noscript>` fallback.
- **Articles share one preview card.** Which post `post.html` shows comes from
  `?p=`, which a scraper never evaluates, so every entry previews as the generic
  blog card. Per-post cards would require generating one HTML file per post —
  the same build step as above.

## Still placeholder

- Photo plates and in-article figures render as hatch placeholders — see
  `image` above and the `![caption](src)` syntax.
- Footer social links and per-project `live`/`source` URLs are `#`.
- **The six articles are drafts written to match the titles and projects**, not
  Victor's own writing. Replace the `.md` files with the real thing.
