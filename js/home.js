/* Home page. All copy comes from /content/*.json. */
import {
  esc, loadContent, contentError, initTheme, typer, initReveal,
  renderFooterLinks, renderStars, plateHTML
} from './common.js';

const $ = (sel) => document.querySelector(sel);

// Decorative, not editorial — kept in code rather than content.
// x/y are percentages of the hero box so the field survives narrow viewports.
const STARS = [
  { x: 12, y: 14, size: 3, dur: 3, accent: true },
  { x: 27, y: 8, dur: 4.2, delay: 0.8 },
  { x: 66, y: 12, size: 3, dur: 3.6, delay: 1.4, accent: true },
  { x: 79, y: 33, dur: 5, delay: 0.4 },
  { x: 49, y: 6, dur: 4.6, delay: 2 },
  { x: 74, y: 58, size: 3, dur: 3.2, delay: 1, accent: true },
  { x: 37, y: 40, dur: 3.8, delay: 1.7 }
];

initTheme($('#theme-toggle'));

try {
  const [site, experience, projects, skills, certs, posts] =
    await loadContent('site', 'experience', 'projects', 'skills', 'certificates', 'posts');

  renderShell(site);
  renderHero(site);
  renderExperience(site, experience);
  renderCatalogue(site, projects);
  renderInstrumentation(site, skills, certs);
  renderBlogTeaser(site, posts);

  initReveal();
  initNavSpy();
  initNavToggle();
} catch (err) {
  contentError('main', err);
}

// ── collapsed nav (phone only) ───────────────────────────────────────────
// The button is display:none above the breakpoint, so this is inert on desktop.
function initNavToggle() {
  const btn = $('#nav-toggle');
  const nav = $('#site-nav');
  const links = $('#nav-links');
  if (!btn || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle('is-nav-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    btn.textContent = open ? '✕' : '☰';
  };

  btn.addEventListener('click', () => setOpen(!nav.classList.contains('is-nav-open')));
  // Tapping a destination should dismiss the menu, not leave it covering the page.
  links.addEventListener('click', (ev) => {
    if (ev.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && nav.classList.contains('is-nav-open')) {
      setOpen(false);
      btn.focus();
    }
  });
}

// ── shell ────────────────────────────────────────────────────────────────
function renderShell(site) {
  $('#prompt-user').textContent = site.handle;
  $('#prompt-cmd').textContent = site.hero.command;

  $('#nav-links').innerHTML = site.nav.map((l) =>
    `<a href="${esc(l.href)}">${esc(l.label)}</a>`
  ).join('');

  $('#footer-log').textContent = site.footer.log;
  renderFooterLinks($('#footer-links'), site.footer.links);
}

function renderHero(site) {
  const hero = site.hero;
  renderStars($('#stars'), STARS);

  $('#session-log').innerHTML = hero.sessionLog.map((line, i) =>
    `<div class="vm-log-line${line.accent ? ' vm-log-line--acc' : ''}"
          style="animation-delay:${0.1 + i * 0.35}s">${esc(line.text)}</div>`
  ).join('');

  $('#hero-name').textContent = `${site.name} —`;
  $('#hero-intro').textContent = hero.intro;
  $('#fig-caption').textContent = hero.figureCaption;

  typer($('#night-word'), hero.promptWords, 75, 22);
  typer($('#hero-role'), hero.roles, 85, 26);
}

function sectionHead(id, meta) {
  const eyebrow = document.querySelector(`#${id} .vm-eyebrow span`);
  const lede = document.querySelector(`#${id} .vm-lede`);
  if (eyebrow) eyebrow.textContent = meta.eyebrow;
  if (lede) lede.textContent = meta.lede;
}

// ── experience ───────────────────────────────────────────────────────────
function renderExperience(site, entries) {
  sectionHead('experience', site.sections.experience);
  const nodeClass = { filled: ' vm-node--filled', accent: ' vm-node--acc', muted: '' };

  $('#timeline').innerHTML = entries.map((e) => `
    <article class="vm-expedition">
      <figure class="vm-plate-wrap">
        ${plateHTML(e.plate)}
        <figcaption class="vm-caption">${esc(e.plate.caption)}</figcaption>
      </figure>
      <div class="vm-commit">
        <span class="vm-node${nodeClass[e.node] ?? ''}" aria-hidden="true"></span>
        <div class="vm-commit-meta">
          <span class="vm-hash">commit ${esc(e.commit)}</span>
          <span>${esc(e.expedition)}</span>
        </div>
        <h2 class="vm-commit-title">${esc(e.title)}</h2>
        <p class="vm-prose">${esc(e.body)}</p>
        <div class="vm-tags">${e.tags.map((t) => `<span class="vm-tag">${esc(t)}</span>`).join('')}</div>
      </div>
    </article>
  `).join('');
}

// ── catalogue ────────────────────────────────────────────────────────────
function renderCatalogue(site, projects) {
  sectionHead('work', site.sections.work);

  const catalogue = $('#catalogue');
  let openIdx = null;

  const spec = (key, val, accent) => `
    <div class="vm-spec">
      <span class="vm-spec-key">${esc(key)}</span>
      <span class="vm-spec-fill"></span>
      <span class="vm-spec-val${accent ? ' vm-spec-val--acc' : ''}">${esc(val)}</span>
    </div>`;

  const record = (p, idx) => `
    <div class="vm-record" id="record-${idx}" role="region" aria-label="${esc(p.name)} record">
      <button class="vm-record-close" type="button" data-close="${idx}">× close record</button>
      <div class="vm-record-grid">
        <div>
          ${plateHTML(p.shot, 'vm-record-plate')}
          <div class="vm-specs">
            ${spec('role', p.role, false)}
            ${spec('year', p.year, false)}
            ${spec('metric', p.metric, true)}
          </div>
          <div class="vm-tags">${p.stack.map((t) => `<span class="vm-tag">${esc(t)}</span>`).join('')}</div>
        </div>
        <div class="vm-record-body">
          <div class="vm-record-kicker">record ${esc(p.id)}</div>
          <h3 class="vm-record-title">${esc(p.name)}</h3>
          <div class="vm-record-rule"></div>
          <p class="vm-record-p">${esc(p.problem)}</p>
          <p class="vm-record-p">${esc(p.approach)}</p>
          <div class="vm-lesson">
            <div class="vm-lesson-key">what I learned</div>
            <div class="vm-lesson-txt">${esc(p.lesson)}</div>
          </div>
          <div class="vm-record-actions">
            <a class="vm-link-btn" href="${esc(p.links.live)}">open live demo ↗</a>
            <a class="vm-link-btn vm-link-btn--muted" href="${esc(p.links.source)}">source on github ↗</a>
          </div>
        </div>
      </div>
    </div>`;

  const paint = () => {
    catalogue.innerHTML = projects.map((p, idx) => {
      const open = openIdx === idx;
      return `
        <button class="vm-row" type="button" data-idx="${idx}"
                aria-expanded="${open}" aria-controls="record-${idx}">
          <span class="vm-row-id">${esc(p.id)}</span>
          <span>
            <span class="vm-row-name">${esc(p.name)}</span>
            <span class="vm-row-blurb">${esc(p.blurb)}</span>
          </span>
          <span class="vm-row-cta">
            <span>&gt; ${open ? 'close_record' : 'open_record'}</span>
            <span>&gt; live</span><span>&gt; github</span>
          </span>
        </button>
        ${open ? record(p, idx) : ''}`;
    }).join('');
  };

  catalogue.addEventListener('click', (ev) => {
    const closer = ev.target.closest('[data-close]');
    const row = ev.target.closest('[data-idx]');
    if (!closer && !row) return;

    const idx = Number(closer ? closer.dataset.close : row.dataset.idx);
    // The close button always collapses; a row toggles.
    openIdx = closer ? null : (openIdx === idx ? null : idx);
    paint();
    catalogue.querySelector(`[data-idx="${idx}"]`)?.focus();
  });

  paint();
}

// ── instrumentation ──────────────────────────────────────────────────────
function renderInstrumentation(site, skills, certs) {
  const meta = site.sections.instrumentation;
  sectionHead('instrumentation', meta);
  $('#skills-label').textContent = meta.skillsLabel;
  $('#skills-note').textContent = meta.skillsNote;
  $('#certs-label').textContent = meta.certsLabel;

  $('#skills').innerHTML = skills.map((s) => {
    const ticks = [0, 1, 2, 3, 4].map((n) =>
      `<span class="vm-tick${n < s.level ? ' vm-tick--on' : ''}"></span>`
    ).join('');
    return `
      <div class="vm-skill">
        <span class="vm-skill-name">${esc(s.name)}</span>
        <div class="vm-ticks" role="img" aria-label="${s.level} of 5">${ticks}</div>
      </div>`;
  }).join('');

  $('#certs').innerHTML = certs.map((c) => `
    <div class="vm-cert">
      <div class="vm-cert-row">
        <span class="vm-cert-name">${esc(c.name)}</span>
        <span class="vm-cert-fill"></span>
        <span class="vm-cert-year">${esc(c.year)}</span>
      </div>
      <div class="vm-cert-issuer">${esc(c.issuer)}</div>
    </div>`).join('');
}

// ── blog teaser ──────────────────────────────────────────────────────────
function renderBlogTeaser(site, posts) {
  const meta = site.sections.blog;
  $('#blog-eyebrow').textContent = meta.eyebrow;
  $('#blog-link').textContent = meta.linkLabel;
  $('#blog .vm-lede').textContent = meta.lede;

  $('#posts').innerHTML = posts.slice(0, 3).map((p) => `
    <article class="vm-post">
      <div class="vm-post-meta">
        <span>obs. ${esc(p.date)}</span>
        <span class="vm-post-tag">#${esc(p.tag)}</span>
      </div>
      <h3 class="vm-post-title"><a href="${esc(p.url)}">${esc(p.title)}</a></h3>
      <p class="vm-post-blurb">${esc(p.blurb || p.teaser)}</p>
    </article>`).join('');
}

// ── nav highlight ────────────────────────────────────────────────────────
function initNavSpy() {
  const links = Array.from(document.querySelectorAll('#nav-links a[href^="#"]'));
  const targets = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (!('IntersectionObserver' in window) || !targets.length) return;

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  targets.forEach((t) => spy.observe(t));
}
