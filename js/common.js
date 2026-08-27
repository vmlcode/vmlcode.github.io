/* Shared behaviour for every page: content loading, theming, the typewriter,
   scroll reveal, and the bits of chrome both pages render (footer, starfield). */

/** Escape untrusted-ish strings before they go into an innerHTML template. */
export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Load one or more JSON files from /content. Paths are relative to the page,
 * so this works identically at a domain root and in a project subpath.
 */
export async function loadContent(...names) {
  const results = await Promise.all(names.map(async (name) => {
    const res = await fetch(`./content/${name}.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`content/${name}.json → HTTP ${res.status}`);
    return res.json();
  }));
  return results.length === 1 ? results[0] : results;
}

/** Renders a human-readable failure in place instead of a silently blank page. */
export function contentError(target, err) {
  console.error(err);
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  el.innerHTML =
    '<p class="vm-error">Could not load content. If you opened this file directly, ' +
    'serve it over HTTP instead — <code>python3 -m http.server</code>.</p>';
}

// ── theme ────────────────────────────────────────────────────────────────
// The stored theme is applied pre-paint by an inline script in each page's
// <head>; this only wires up the toggle and keeps its label in sync.
export function initTheme(btn) {
  if (!btn) return;
  const root = document.documentElement;

  const paint = () => {
    const dark = root.getAttribute('data-vm-theme') !== 'light';
    // Icon and words are separate elements so the label can be dropped at phone
    // width, where the design calls for an icon-only control.
    btn.innerHTML =
      `<span class="vm-theme-icon">${dark ? '☾' : '☀'}</span>` +
      `<span class="vm-theme-label">${dark ? 'night shift' : 'day shift'}</span>`;
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
