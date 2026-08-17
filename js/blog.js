/* Blog index — "The Night Shift". Posts and copy come from /content/*.json. */
import {
  esc, loadContent, contentError, initTheme, renderFooterLinks, renderStars
} from './common.js';

const $ = (sel) => document.querySelector(sel);

// Percentages of the hero box — see renderStars in common.js.
const STARS = [
  { x: 10, y: 12, dur: 3.4, accent: true },
  { x: 54, y: 17, size: 3, dur: 4, delay: 1.2, accent: true },
  { x: 34, y: 8, dur: 4.8, delay: 0.6 },
  { x: 75, y: 30, dur: 4.4, delay: 1.8 }
];

initTheme($('#theme-toggle'));

try {
  const [site, posts] = await loadContent('site', 'posts');
  const meta = site.blogPage;

  // Newest first, whatever order the JSON happens to be in.
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  renderShell(site, meta, posts);
  initFilters(meta, posts);
} catch (err) {
  contentError('#post-list', err);
}

function renderShell(site, meta, posts) {
  $('#prompt-user').textContent = site.handle;
  $('#prompt-cmd').textContent = meta.command;
  $('#back-link').textContent = meta.backLabel;

  renderStars($('#stars'), STARS);

  $('#blog-kicker').textContent =
    meta.kicker.replace('{count}', String(posts.length).padStart(2, '0'));
  $('#blog-title').innerHTML =
    `${esc(meta.titleLead)}<em>${esc(meta.titleAccent)}</em>`;
  $('#blog-subtitle').textContent = meta.subtitle;

  $('#blog-outro').textContent = meta.outro;
  $('#blog-outro-link').textContent = meta.outroLink;

  $('#footer-log').textContent = site.footer.blogLog;
  renderFooterLinks($('#footer-links'), site.footer.links);
}

// ── tag filter ───────────────────────────────────────────────────────────
function initFilters(meta, posts) {
  // Tags are derived from the posts, so adding a post with a new tag is enough.
  const tags = ['all', ...Array.from(new Set(posts.map((p) => p.tag)))];
  let active = 'all';

  const filterBar = $('#filters');
  const list = $('#post-list');

  const paintFilters = () => {
    filterBar.innerHTML = tags.map((t) => `
      <button class="vm-filter${t === active ? ' is-active' : ''}" type="button"
              data-tag="${esc(t)}" aria-pressed="${t === active}">
        ${t === 'all' ? 'all' : '#' + esc(t)}
      </button>`).join('');
  };

  const paintPosts = () => {
    const shown = active === 'all' ? posts : posts.filter((p) => p.tag === active);
    if (!shown.length) {
      list.innerHTML = '<p class="vm-empty">No entries under that tag yet.</p>';
      return;
    }
    list.innerHTML = shown.map((p) => `
      <article class="vm-entry">
        <div class="vm-entry-meta">
          <span>obs. ${esc(p.date)}</span>
          <span class="vm-post-tag">#${esc(p.tag)}</span>
          <span>${esc(p.mins)} min</span>
        </div>
        <h2 class="vm-entry-title"><a href="${esc(p.url || '#')}">${esc(p.title)}</a></h2>
        <p class="vm-entry-teaser">${esc(p.teaser)}</p>
      </article>`).join('');
  };

  filterBar.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-tag]');
    if (!btn) return;
    active = btn.dataset.tag;
    paintFilters();
    paintPosts();
  });

  paintFilters();
  paintPosts();
}
