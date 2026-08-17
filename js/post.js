/* Single article. The post is chosen by ?p=<slug>; metadata comes from
   content/posts.json and the body from content/posts/<slug>.md. */
import { esc, loadContent, contentError, initTheme, renderFooterLinks } from './common.js';
import { renderMarkdown } from './markdown.js';

const $ = (sel) => document.querySelector(sel);

initTheme($('#theme-toggle'));

try {
  const [site, posts] = await loadContent('site', 'posts');
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
  }
} catch (err) {
  contentError('#art-body', err);
}

// ── article ──────────────────────────────────────────────────────────────
async function renderPost(post, posts) {
  document.title = `${post.title} — The Night Shift`;
  $('#prompt-cmd').textContent = `cat obs_${post.date}.md`;

  $('#art-meta').innerHTML = [
    `<span class="vm-acc-txt">obs. ${esc(post.date)}</span>`,
    `<span>#${esc(post.tag)}</span>`,
    `<span>${esc(post.mins)} min</span>`,
    `<span>entry ${esc(post.entry)}</span>`
  ].join('');
  $('#art-title').textContent = post.title;
  $('#art-teaser').textContent = post.teaser;

  const res = await fetch(`./content/posts/${post.slug}.md`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`content/posts/${post.slug}.md → HTTP ${res.status}`);
  const { html, toc } = renderMarkdown(await res.text());

  const tags = (post.stack || [])
    .map((t) => `<span class="vm-tag">${esc(t)}</span>`).join('');
  const related = post.related
    ? `<div class="vm-art-related">This entry is about ` +
      `<a href="${esc(post.related.href)}">${esc(post.related.label)}</a> — ` +
      `the full project record lives in the catalogue at El Observatorio.</div>`
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
  const text = `${post.title} — The Night Shift`;
  $('#share-x').href =
    `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  $('#share-in').href =
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  $('#copy-link').addEventListener('click', async (ev) => {
    const btn = ev.currentTarget;
    try {
      await navigator.clipboard.writeText(url);
      btn.textContent = 'copied ✓';
    } catch {
      btn.textContent = 'copy failed';
    }
    setTimeout(() => { btn.textContent = 'copy link'; }, 1800);
  });
}

function renderNext(post, posts) {
  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 2);
  $('#next-entries').innerHTML = others.map((p) =>
    `<a href="${esc(p.url)}">${esc(p.title)}</a>`
  ).join('');
}

function notFound(slug, posts) {
  document.title = 'Entry not found — The Night Shift';
  $('#art-meta').innerHTML = '<span>404</span>';
  $('#art-title').textContent = 'No entry under that name';
  $('#art-teaser').textContent = slug
    ? `Nothing in the journal matches “${slug}”.`
    : 'No entry was requested.';
  $('#art-body').innerHTML =
    '<p>The entry may have been renamed. Everything published so far:</p>' +
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
