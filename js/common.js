/* Shared behaviour for every page: content loading, theming, the typewriter,
   scroll reveal, and the bits of chrome both pages render (footer, starfield). */

/** Escape untrusted-ish strings before they go into an innerHTML template. */
export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── language ─────────────────────────────────────────────────────────────
// Every page ships in two locales. There is one content tree per language
// (content/en, content/es), so the renderers stay monolingual: they read
// whatever `loadContent` hands them and never branch on the active language.
export const LANGS = ['en', 'es'];
const LANG_KEY = 'vm-lang';

/** ?lang= first (so a link can carry a language), then the stored choice,
    then the browser's preference, then English. */
export function readLang() {
  const asked = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(asked)) return asked;
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (LANGS.includes(stored)) return stored;
  } catch (e) {}
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return LANGS.includes(nav) ? nav : 'en';
}

export const lang = readLang();
document.documentElement.setAttribute('lang', lang);
// A ?lang= link should keep its language when the visitor clicks through to
// another page, so it is stored on arrival like any other choice.
try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}

/**
 * Wires the EN/ES control. Switching reloads: the whole page — nav, hero,
 * timeline, article body — comes from the content tree, so re-fetching it is
 * both simpler and less error-prone than re-running every renderer by hand.
 */
export function initLang(el) {
  if (!el) return;
  el.innerHTML = LANGS.map((code) =>
    `<button class="vm-lang-opt${code === lang ? ' is-active' : ''}" type="button"
             data-lang="${code}" aria-pressed="${code === lang}"
             lang="${code}">${code.toUpperCase()}</button>`
  ).join('');

  el.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-lang]');
    if (!btn || btn.dataset.lang === lang) return;
    const next = btn.dataset.lang;
    try { localStorage.setItem(LANG_KEY, next); } catch (e) {}

    // A ?lang= in the address bar outranks the stored choice, so it has to move
    // with the click — otherwise the reload lands back on the old language.
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', next);
      location.href = url;
    } else {
      location.reload();
    }
  });
}

// ── strings ──────────────────────────────────────────────────────────────
/** Fills `{name}` placeholders: t(ui.post.entry, { n: 3 }). */
export function fmt(str, vars) {
  return String(str == null ? '' : str).replace(/\{(\w+)\}/g, (m, k) =>
    (vars && k in vars ? String(vars[k]) : m));
}

/**
 * Copy that lives in the HTML rather than in a renderer — side labels, the
 * noscript notice, back links. Each element names its key in `data-i18n`
 * (dotted path into site.ui); `data-i18n-attr` targets an attribute instead.
 */
export function applyStatic(ui, root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = el.dataset.i18n.split('.').reduce((o, k) => (o == null ? o : o[k]), ui);
    if (value == null) return;
    const attr = el.dataset.i18nAttr;
    if (attr) el.setAttribute(attr, value);
    else if (String(value).includes('\n')) el.innerHTML = esc(value).replace(/\n/g, '<br>');
    else el.textContent = value;
  });
}

/**
 * Load one or more JSON files from /content. Paths are relative to the page,
 * so this works identically at a domain root and in a project subpath.
 */
export async function loadContent(...names) {
  const results = await Promise.all(names.map(async (name) => {
    const res = await fetch(`./content/${lang}/${name}.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`content/${lang}/${name}.json → HTTP ${res.status}`);
    return res.json();
  }));
  return results.length === 1 ? results[0] : results;
}

/** Renders a human-readable failure in place instead of a silently blank page. */
export function contentError(target, err) {
  console.error(err);
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  // The message cannot come from content/: content is exactly what failed.
  const msg = lang === 'es'
    ? 'No se pudo cargar el contenido. Si abriste el archivo directamente, ' +
      'sírvelo por HTTP — <code>python3 -m http.server</code>.'
    : 'Could not load content. If you opened this file directly, ' +
      'serve it over HTTP instead — <code>python3 -m http.server</code>.';
  el.innerHTML = `<p class="vm-error">${msg}</p>`;
}

// ── theme ────────────────────────────────────────────────────────────────
// The stored theme is applied pre-paint by an inline script in each page's
// <head>; this only wires up the toggle and keeps its label in sync.
export function initTheme(btn, labels) {
  if (!btn) return;
  const root = document.documentElement;
  // Called before content loads on a failed fetch, so the labels are optional.
  const words = labels || { dark: 'night shift', light: 'day shift' };
  if (words.aria) btn.setAttribute('aria-label', words.aria);

  const paint = () => {
    const dark = root.getAttribute('data-vm-theme') !== 'light';
    // Icon and words are separate elements so the label can be dropped at phone
    // width, where the design calls for an icon-only control.
    btn.innerHTML =
      `<span class="vm-theme-icon">${dark ? '☾' : '☀'}</span>` +
      `<span class="vm-theme-label">${dark ? esc(words.dark) : esc(words.light)}</span>`;
    btn.setAttribute('aria-pressed', String(!dark));
  };

  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-vm-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-vm-theme', next);
    try { localStorage.setItem('vm-theme', next); } catch (e) {}
    paint();
  });

  paint();
}

// ── typewriter ───────────────────────────────────────────────────────────
/** Cycles a word list: type it out, hold, delete it, move to the next. */
export function typer(el, words, speed, hold) {
  if (!el || reduceMotion || !words || !words.length) return;
  let i = 0, pos = words[0].length, deleting = false, pause = hold;
  el.textContent = words[0];
  setInterval(() => {
    if (pause > 0) { pause--; return; }
    const word = words[i];
    if (!deleting) {
      pos++;
      if (pos >= word.length) { pos = word.length; deleting = true; pause = hold; }
    } else {
      pos--;
      if (pos <= 0) { pos = 0; deleting = false; i = (i + 1) % words.length; pause = 4; }
    }
    el.textContent = words[i].slice(0, pos);
  }, speed);
}

// ── scroll reveal ────────────────────────────────────────────────────────
// Arming happens here rather than in CSS so content stays visible without JS.
export function initReveal(selector = '.vm-reveal') {
  const els = Array.from(document.querySelectorAll(selector));
  if (reduceMotion || !('IntersectionObserver' in window) || !els.length) return;

  els.forEach((el) => el.classList.add('is-armed'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    });
  }, { threshold: 0.08 });
  els.forEach((el) => io.observe(el));
}

// ── shared chrome ────────────────────────────────────────────────────────
export function renderFooterLinks(el, links) {
  if (!el) return;
  el.innerHTML = links.map((l) =>
    `<a href="${esc(l.href)}">${esc(l.label)}</a>`
  ).join('');
}

/**
 * Decorative twinkling starfield. Positions are percentages of the hero box,
 * not pixels — at a fixed px offset most of the field lands outside a phone
 * viewport and the hero renders bare on exactly the devices most people use.
 */
export function renderStars(el, stars) {
  if (!el) return;
  el.innerHTML = stars.map((s) => {
    const size = s.size || 2;
    const style = [
      `left:${s.x}%`, `top:${s.y}%`,
      `width:${size}px`, `height:${size}px`,
      `animation-duration:${s.dur}s`,
      s.delay ? `animation-delay:${s.delay}s` : ''
    ].filter(Boolean).join(';');
    return `<span class="vm-star${s.accent ? ' vm-star--acc' : ''}" style="${style}"></span>`;
  }).join('');
}

/** Renders a plate: a real image if content supplies one, otherwise the hatch placeholder. */
export function plateHTML(plate, extraClass = '') {
  const cls = `vm-plate${extraClass ? ' ' + extraClass : ''}`;
  const label = `<span class="vm-plate-label">${esc((plate && plate.label) || '')}</span>`;
  if (plate && plate.image) {
    // `fit: "contain"` is for logos and artwork: no crop, no sepia ageing.
    const fit = plate.fit === 'contain' ? ' vm-plate--contain' : '';
    // A missing file would otherwise leave an empty frame. Fall back to the label
    // and rewrite the class list, which also drops `--contain` so the frame goes
    // back to the hatch placeholder instead of a padded solid box.
    const fallback = `this.parentNode.className='${cls} vm-plate--empty';`
      + `this.parentNode.innerHTML='${label.replace(/"/g, '&quot;').replace(/'/g, "\\'")}'`;
    // Lazy because every plate sits below the fold — and because a plate hidden
    // by a breakpoint (the company plate on phones) then costs no download.
    return `<div class="${cls}${fit}"><img src="${esc(plate.image)}" alt="${esc(plate.alt || plate.label || '')}" loading="lazy" onerror="${fallback}"></div>`;
  }
  // No image at all: a labelled placeholder frame.
  return `<div class="${cls} vm-plate--empty">${label}</div>`;
}
