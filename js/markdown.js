/* A deliberately small Markdown subset — only what the article layout uses.
   Not a general parser: it handles the block types below and nothing else, which
   keeps it auditable and about 2KB. Anything unrecognised becomes a paragraph.

     ## Heading            → numbered section (also feeds the table of contents)
     > quote               → pull quote
     ```lang … ```         → console block
     ![caption](src)       → figure; empty src renders the hatch placeholder
     text                  → paragraph
     inline: **bold**  *italic*  `code`  [label](href)

   Escaping happens before any markup is emitted, so post content cannot inject
   HTML even though the files are authored by hand. */

import { esc } from './common.js';

function inline(src) {
  return esc(src)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) =>
      `<a href="${href}">${label}</a>`);
}

/**
 * @returns {{ html: string, toc: Array<{id: string, num: string, title: string}> }}
 */
export function renderMarkdown(src) {
  const lines = String(src).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const toc = [];
  let figures = 0;
  let firstPara = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line.trim()) continue;

    // fenced code
    if (line.startsWith('```')) {
      const body = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++]);
      out.push(`<pre class="vm-console">${esc(body.join('\n'))}</pre>`);
      continue;
    }

    // section heading
    if (line.startsWith('## ')) {
      const title = line.slice(3).trim();
      const num = String(toc.length + 1).padStart(2, '0');
      const id = `s${toc.length + 1}`;
      toc.push({ id, num, title });
      out.push(
        `<div class="vm-art-head" id="${id}">` +
          `<span class="vm-art-num">${num}</span>` +
          `<h2>${inline(title)}</h2>` +
          `<span class="vm-art-rule"></span>` +
        `</div>`
      );
      continue;
    }

    // pull quote — consecutive "> " lines
    if (line.startsWith('>')) {
      const body = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        body.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      i--;
      out.push(`<blockquote class="vm-pull">${inline(body.join(' '))}</blockquote>`);
      continue;
    }

    // figure — a lone image line
    const fig = line.match(/^!\[([^\]]*)\]\(([^)]*)\)\s*$/);
    if (fig) {
      const [, caption, src2] = fig;
      figures++;
      const inner = src2
        ? `<img src="${esc(src2)}" alt="${esc(caption)}">`
        : `<span class="vm-plate-label">[ ${esc(caption)} ]</span>`;
      out.push(
        `<figure class="vm-art-fig">` +
          `<div class="vm-plate vm-art-plate">${inner}</div>` +
          `<figcaption class="vm-caption">fig. ${figures} — ${esc(caption)}</figcaption>` +
        `</figure>`
      );
      continue;
    }

    // paragraph — the first one gets the drop cap
    const cls = firstPara ? ' class="vm-drop"' : '';
    firstPara = false;
    out.push(`<p${cls}>${inline(line)}</p>`);
  }

  return { html: out.join('\n'), toc };
}
