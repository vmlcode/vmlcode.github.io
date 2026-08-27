/* Single article. The post is chosen by ?p=<slug>; metadata comes from
   content/posts.json and the body from content/posts/<slug>.md. */
import {
  esc, fmt, lang, loadContent, contentError, initTheme, initLang, applyStatic,
  renderFooterLinks
} from './common.js';
import { renderMarkdown } from './markdown.js';

const $ = (sel) => document.querySelector(sel);

initLang($('#lang-toggle'));

let ui = null;

try {
  const [site, posts] = await loadContent('site', 'posts');

  ui = site.ui;
  initTheme($('#theme-toggle'), ui.theme);
  applyStatic(ui);

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const slug = new URLSearchParams(location.search).get('p');
  const post = posts.find((p) => p.slug === slug) ?? (slug ? null : posts[0]);

  renderFooterLinks($('#footer-links'), site.footer.links);

  if (!post) {
    notFound(slug, posts);
  } else {
    await renderPost(post, posts);
    initProgress();
    initTocSpy();
    initTocToggle();
  }
} catch (err) {
  initTheme($('#theme-toggle'));
  contentError('#art-body', err);
}

// ── article ──────────────────────────────────────────────────────────────
async function renderPost(post, posts) {
  document.title = `${post.title} — ${ui.post.titleSuffix}`;
  $('#prompt-cmd').textContent = `cat obs_${post.date}.md`;

  $('#art-meta').innerHTML = [
    `<span class="vm-acc-txt">${esc(ui.post.obs)} ${esc(post.date)}</span>`,
    `<span>#${esc(post.tag)}</span>`,
    `<span>${esc(post.mins)} ${esc(ui.post.mins)}</span>`,
    `<span>${esc(fmt(ui.post.entry, { n: post.entry }))}</span>`
  ].join('');
  $('#art-title').textContent = post.title;
  $('#art-teaser').textContent = post.teaser;

  const res = await fetch(`./content/${lang}/posts/${post.slug}.md`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`content/${lang}/posts/${post.slug}.md → HTTP ${res.status}`);
  const { html, toc } = renderMarkdown(await res.text());

  const tags = (post.stack || [])
    .map((t) => `<span class="vm-tag">${esc(t)}</span>`).join('');
  const related = post.related
    ? `<div class="vm-art-related">${esc(ui.post.relatedLead)}` +
      `<a href="${esc(post.related.href)}">${esc(post.related.label)}</a>` +
      `${esc(ui.post.relatedTail)}</div>`
    : '';

  $('#art-body').innerHTML = `${html}<div class="vm-tags vm-art-tags">${tags}</div>${related}`;

  $('#toc').innerHTML = toc.map((s) =>
    `<a href="#${s.id}">${esc(s.num)} · ${esc(s.title.toLowerCase())}</a>`
  ).join('');

  renderShare(post);
  renderNext(post, posts);
}

function renderShare(post) {
  const url = location.href;
  const text = `${post.title} — ${ui.post.titleSuffix}`;
  $('#share-x').href =
    `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  $('#share-in').href =
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  $('#copy-link').addEventListener('click', async (ev) => {
    const btn = ev.currentTarget;
    try {
      await navigator.clipboard.writeText(url);
      btn.textContent = ui.post.copied;
    } catch {
      btn.textContent = ui.post.copyFailed;
    }
    setTimeout(() => { btn.textContent = ui.post.copy; }, 1800);
  });
}

function renderNext(post, posts) {
  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 2);
  $('#next-entries').innerHTML = others.map((p) =>
    `<a href="${esc(p.url)}">${esc(p.title)}</a>`
  ).join('');
}

function notFound(slug, posts) {
  document.title = `${ui.post.notFoundDoc} — ${ui.post.titleSuffix}`;
  $('#art-meta').innerHTML = '<span>404</span>';
  $('#art-title').textContent = ui.post.notFoundTitle;
  $('#art-teaser').textContent = slug
    ? fmt(ui.post.notFoundTeaser, { slug })
    : ui.post.notFoundNoSlug;
  $('#art-body').innerHTML =
    `<p>${esc(ui.post.notFoundBody)}</p>` +
    '<ul class="vm-art-list">' +
    posts.map((p) => `<li><a href="${esc(p.url)}">${esc(p.title)}</a></li>`).join('') +
    '</ul>';
}

// ── reading progress ─────────────────────────────────────────────────────
function initProgress() {
  const bar = $('#progress-bar');
  const paint = () => {
    const el = document.scrollingElement || document.documentElement;
    const max = el.scrollHeight - el.clientHeight;
    bar.style.width = `${max > 0 ? Math.min(100, (el.scrollTop / max) * 100).toFixed(1) : 0}%`;
  };
  window.addEventListener('scroll', paint, { passive: true });
  window.addEventListener('resize', paint, { passive: true });
  paint();
}

// ── toc collapse (phone only) ────────────────────────────────────────────
// CSS gives the button pointer-events:none above the breakpoint, so the
// contents list is permanently expanded on desktop and this never fires.
function initTocToggle() {
  const btn = $('#toc-toggle');
  const toc = $('#toc');
  if (!btn || !toc) return;

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    toc.classList.toggle('is-collapsed', !open);
    btn.querySelector('.vm-toc-icon').textContent = open ? '−' : '+';
  });

  // Jumping to a section should close the list on a phone so the heading lands
  // at the top of the viewport rather than under an open menu.
  toc.addEventListener('click', (ev) => {
    if (ev.target.closest('a') && window.matchMedia('(max-width: 860px)').matches) {
      btn.click();
    }
  });
}

// ── toc highlight ────────────────────────────────────────────────────────
function initTocSpy() {
  const links = Array.from(document.querySelectorAll('#toc a'));
  const heads = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (!('IntersectionObserver' in window) || !heads.length) return;

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-15% 0px -75% 0px' });

  heads.forEach((h) => spy.observe(h));
}
