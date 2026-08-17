/* Victor Maldonado — portfolio. Compiled down from the Claude Design component
   (x-dc / sc-for / {{ }}) to plain DOM work, so the page ships as static files
   with no runtime and no build step. */
(function () {
  'use strict';

  // ── content ────────────────────────────────────────────────────────────
  var PROJECTS = [
    {
      id: 'VM-001 · ckpt_01.pt',
      name: 'Sabor Analytics',
      blurb: 'NLP · magnitude 82% sarcasm recall',
      shot: '[ screenshot: sentiment dashboard ]',
      role: 'Solo — data, model, UI',
      year: '2026',
      metric: '82% sarcasm recall',
      problem: 'Off-the-shelf Spanish sentiment models read Venezuelan speech as neutral or, worse, hostile. Regional irony, diminutives and slang all land outside their training distribution — so a comment that is affectionate gets scored as an insult.',
      approach: 'I collected and hand-labeled 12k regional comments, fine-tuned a multilingual transformer on them, and added a sarcasm head trained on a smaller, carefully adversarial subset. The demo shows the model’s confidence per token so you can see exactly where it changes its mind.',
      stack: ['PyTorch', 'Transformers', 'spaCy', 'FastAPI'],
      lesson: 'Labeling my own language taught me more about the data than any architecture choice did.',
      live: '#work',
      source: '#work'
    },
    {
      id: 'VM-002 · ckpt_02.tflite',
      name: 'AgroVision',
      blurb: 'edge CV · visible from a $40 phone',
      shot: '[ photo: app in a coffee field ]',
      role: 'Model + mobile integration',
      year: '2025',
      metric: '11 MB · 94% top-1',
      problem: 'Coffee growers near San Cristóbal lose harvests to leaf rust that is obvious three weeks too late. Cloud inference is not an option: the fields have no signal and the phones are entry-level Androids.',
      approach: 'A MobileNet-family classifier trained on a field-collected dataset, pruned and quantized to int8 until it ran fully offline in under 400 ms on a $40 device. The app stores diagnoses locally and syncs when the grower gets back to town.',
      stack: ['TensorFlow Lite', 'OpenCV', 'Android', 'Quantization'],
      lesson: 'Constraints are a design brief. The 11 MB limit made the model better, not just smaller.',
      live: '#work',
      source: '#work'
    },
    {
      id: 'VM-003 · ckpt_03.idx',
      name: 'StudyRAG',
      blurb: 'LLMs · retrieval over my own notes',
      shot: '[ screenshot: chat over course notes ]',
      role: 'Solo — retrieval + interface',
      year: '2025',
      metric: '4 semesters indexed',
      problem: 'Four semesters of handwritten and half-typed notes, none of them searchable, all of them needed the night before an exam.',
      approach: 'OCR into a cleaned corpus, chunked and embedded into a vector index, with a retrieval layer that always cites the source page. It answers in the wording of my own notes — including my own mistakes, which turned out to be a useful study feature.',
      stack: ['LangChain', 'FastAPI', 'pgvector', 'Tesseract'],
      lesson: 'A retrieval system is only as honest as its citations. Showing sources fixed my trust in it.',
      live: '#work',
      source: '#work'
    }
  ];

  var SKILLS = [
    { name: 'Python', level: 4 },
    { name: 'PyTorch', level: 4 },
    { name: 'TensorFlow / Keras', level: 3 },
    { name: 'OpenCV · scikit-learn', level: 3 },
    { name: 'FastAPI · SQL', level: 3 },
    { name: 'Docker · Git · Linux', level: 2 }
  ];

  var CERTS = [
    { name: 'Machine Learning Specialization', issuer: 'Stanford Online · Coursera', year: '2024' },
    { name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', year: '2025' },
    { name: 'TensorFlow Developer Certificate', issuer: 'Google / TensorFlow', year: '2025' },
    { name: 'CS50x — Introduction to CS', issuer: 'Harvard · edX', year: '2023' }
  ];

  // ── helpers ────────────────────────────────────────────────────────────
  var $ = function (sel) { return document.querySelector(sel); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // ── theme ──────────────────────────────────────────────────────────────
  var root = document.documentElement;
  var themeBtn = $('#theme-toggle');

  function paintTheme() {
    var dark = root.getAttribute('data-vm-theme') !== 'light';
    themeBtn.textContent = dark ? '☾ night shift' : '☀ day shift';
    themeBtn.setAttribute('aria-pressed', String(!dark));
  }

  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-vm-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-vm-theme', next);
    try { localStorage.setItem('vm-theme', next); } catch (e) {}
    paintTheme();
  });
  paintTheme();

  // ── typewriters ────────────────────────────────────────────────────────
  // Cycles a word list: type it out, hold, delete it, move to the next.
  function typer(el, words, speed, hold) {
    if (!el || reduceMotion) return;
    var i = 0, pos = words[0].length, deleting = false, pause = hold;
    setInterval(function () {
      if (pause > 0) { pause--; return; }
      var word = words[i];
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

  typer($('#night-word'),
    ['observatorio', 'computer-vision', 'pytorch', 'nlp', 'edge-ai', 'deep-learning', 'python', 'data-wrangling'],
    75, 22);
  typer($('#hero-role'),
    ['AI/ML engineer', 'backend developer', 'full-stack developer', 'data wrangler'],
    85, 26);

  // ── catalogue ──────────────────────────────────────────────────────────
  var catalogue = $('#catalogue');
  var openIdx = null;

  function recordHTML(p, idx) {
    return '' +
      '<div class="vm-record" id="record-' + idx + '" role="region" aria-label="' + esc(p.name) + ' record">' +
        '<button class="vm-record-close" type="button" data-close="' + idx + '">× close record</button>' +
        '<div class="vm-record-grid">' +
          '<div>' +
            '<div class="vm-plate vm-record-plate"><span class="vm-plate-label">' + esc(p.shot) + '</span></div>' +
            '<div class="vm-specs">' +
              spec('role', p.role, false) +
              spec('year', p.year, false) +
              spec('metric', p.metric, true) +
            '</div>' +
            '<div class="vm-tags">' + p.stack.map(function (t) {
              return '<span class="vm-tag">' + esc(t) + '</span>';
            }).join('') + '</div>' +
          '</div>' +
          '<div class="vm-record-body">' +
            '<div class="vm-record-kicker">record ' + esc(p.id) + '</div>' +
            '<h3 class="vm-record-title">' + esc(p.name) + '</h3>' +
            '<div class="vm-record-rule"></div>' +
            '<p class="vm-record-p">' + esc(p.problem) + '</p>' +
            '<p class="vm-record-p">' + esc(p.approach) + '</p>' +
            '<div class="vm-lesson">' +
              '<div class="vm-lesson-key">what I learned</div>' +
              '<div class="vm-lesson-txt">' + esc(p.lesson) + '</div>' +
            '</div>' +
            '<div class="vm-record-actions">' +
              '<a class="vm-link-btn" href="' + esc(p.live) + '">open live demo ↗</a>' +
              '<a class="vm-link-btn vm-link-btn--muted" href="' + esc(p.source) + '">source on github ↗</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function spec(key, val, accent) {
    return '<div class="vm-spec">' +
      '<span class="vm-spec-key">' + esc(key) + '</span>' +
      '<span class="vm-spec-fill"></span>' +
      '<span class="vm-spec-val' + (accent ? ' vm-spec-val--acc' : '') + '">' + esc(val) + '</span>' +
    '</div>';
  }

  function renderCatalogue() {
    catalogue.innerHTML = PROJECTS.map(function (p, idx) {
      var open = openIdx === idx;
      return '' +
        '<button class="vm-row" type="button" data-idx="' + idx + '"' +
            ' aria-expanded="' + open + '" aria-controls="record-' + idx + '">' +
          '<span class="vm-row-id">' + esc(p.id) + '</span>' +
          '<span><span class="vm-row-name">' + esc(p.name) + '</span>' +
            '<span class="vm-row-blurb">' + esc(p.blurb) + '</span></span>' +
          '<span class="vm-row-cta">' +
            '<span>' + (open ? '&gt; close_record' : '&gt; open_record') + '</span>' +
            '<span>&gt; live</span><span>&gt; github</span>' +
          '</span>' +
        '</button>' +
        (open ? recordHTML(p, idx) : '');
    }).join('');
  }

  catalogue.addEventListener('click', function (ev) {
    var closer = ev.target.closest('[data-close]');
    if (closer) {
      openIdx = null;
      renderCatalogue();
      var row = catalogue.querySelector('[data-idx="' + closer.dataset.close + '"]');
      if (row) row.focus();
      return;
    }
    var row = ev.target.closest('[data-idx]');
    if (!row) return;
    var idx = Number(row.dataset.idx);
    openIdx = openIdx === idx ? null : idx;
    renderCatalogue();
    var again = catalogue.querySelector('[data-idx="' + idx + '"]');
    if (again) again.focus();
  });

  renderCatalogue();

  // ── instrumentation ────────────────────────────────────────────────────
  $('#skills').innerHTML = SKILLS.map(function (s) {
    var ticks = [0, 1, 2, 3, 4].map(function (n) {
      return '<span class="vm-tick' + (n < s.level ? ' vm-tick--on' : '') + '"></span>';
    }).join('');
    return '<div class="vm-skill">' +
      '<span class="vm-skill-name">' + esc(s.name) + '</span>' +
      '<div class="vm-ticks" role="img" aria-label="' + s.level + ' of 5">' + ticks + '</div>' +
    '</div>';
  }).join('');

  $('#certs').innerHTML = CERTS.map(function (c) {
    return '<div class="vm-cert">' +
      '<div class="vm-cert-row">' +
        '<span class="vm-cert-name">' + esc(c.name) + '</span>' +
        '<span class="vm-cert-fill"></span>' +
        '<span class="vm-cert-year">' + esc(c.year) + '</span>' +
      '</div>' +
      '<div class="vm-cert-issuer">' + esc(c.issuer) + '</div>' +
    '</div>';
  }).join('');

  // ── scroll reveal ──────────────────────────────────────────────────────
  // Arming happens in JS so the sections stay visible when JS is unavailable.
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.vm-reveal'));
  if (!reduceMotion && 'IntersectionObserver' in window) {
    reveals.forEach(function (el) { el.classList.add('is-armed'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // ── nav highlight ──────────────────────────────────────────────────────
  var links = Array.prototype.slice.call(document.querySelectorAll('.vm-nav-links a'));
  var targets = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && targets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    targets.forEach(function (t) { spy.observe(t); });
  }
})();
