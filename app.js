const contentEl = document.getElementById('content');
const tocEl = document.getElementById('toc');
const mapEl = document.getElementById('knowledgeMap');
const searchInput = document.getElementById('searchInput');
const topicCountEl = document.getElementById('topicCount');
const codeBlockCountEl = document.getElementById('codeBlockCount');

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function renderInline(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return html;
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const headings = [];
  const html = [];
  let inCode = false;
  let codeBuffer = [];
  let tableBuffer = [];
  let listBuffer = [];
  let listType = 'ul';
  let paragraphBuffer = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      html.push(`<p>${renderInline(paragraphBuffer.join(' '))}</p>`);
      paragraphBuffer = [];
    }
  };

  const flushList = () => {
    if (listBuffer.length) {
      const tag = listType === 'ol' ? 'ol' : 'ul';
      const items = listBuffer.map((item) => `<li>${renderInline(item)}</li>`).join('');
      html.push(`<${tag}>${items}</${tag}>`);
      listBuffer = [];
    }
  };

  const flushTable = () => {
    if (tableBuffer.length >= 2) {
      const rows = tableBuffer.map((row) => row.split('|').map((cell) => cell.trim()).filter((_, index) => index !== 0 && index !== row.split('|').length - 1));
      const headers = rows[0];
      const bodyRows = rows.slice(1);
      const head = headers.map((h) => `<th>${renderInline(h)}</th>`).join('');
      const body = bodyRows.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`).join('');
      html.push(`<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`);
      tableBuffer = [];
    }
  };

  const isTableSeparator = (line) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      flushParagraph();
      flushList();
      if (!inCode) {
        inCode = true;
        codeBuffer = [];
      } else {
        html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
        inCode = false;
      }
      return;
    }

    if (inCode) {
      codeBuffer.push(line);
      return;
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      flushTable();
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      const level = match[1].length;
      const text = match[2].trim();
      const id = slugify(text);
      headings.push({ level, text, id });
      html.push(`<h${level} id="${id}">${renderInline(text)}</h${level}>`);
      return;
    }

    if (/^\s*[-*]\s+/.test(trimmed)) {
      flushParagraph();
      flushTable();
      listType = 'ul';
      listBuffer.push(trimmed.replace(/^\s*[-*]\s+/, ''));
      return;
    }

    if (/^\s*\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      flushTable();
      listType = 'ol';
      listBuffer.push(trimmed.replace(/^\s*\d+\.\s+/, ''));
      return;
    }

    if (trimmed === '') {
      flushParagraph();
      flushList();
      flushTable();
      return;
    }

    if (trimmed.includes('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      flushParagraph();
      flushList();
      tableBuffer = [trimmed];
      return;
    }

    if (tableBuffer.length) {
      tableBuffer.push(trimmed);
      if (index + 1 === lines.length || lines[index + 1].trim() === '') {
        flushTable();
      }
      return;
    }

    paragraphBuffer.push(trimmed);
  });

  flushParagraph();
  flushList();
  flushTable();

  if (inCode) {
    html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
  }

  return { html: html.join(''), headings, codeBlocks: (markdown.match(/```/g) || []).length / 2 };
}

async function loadMarkdown() {
  try {
    const response = await fetch('./README.md');
    if (!response.ok) throw new Error('Failed to load README.md');
    const markdown = await response.text();
    const { html, headings, codeBlocks } = renderMarkdown(markdown);
    contentEl.innerHTML = html;
    topicCountEl.textContent = headings.length;
    codeBlockCountEl.textContent = codeBlocks;
    renderToc(headings);
    renderKnowledgeMap(headings);
  } catch (error) {
    contentEl.innerHTML = `<p>无法加载 README.md，请在仓库根目录运行本地服务器后再打开页面。</p>`;
    console.error(error);
  }
}

function renderToc(headings) {
  const topLevel = headings.filter((item) => item.level === 1 || item.level === 2);
  tocEl.innerHTML = topLevel
    .map((item) => `<a href="#${item.id}" class="toc-link">${escapeHtml(item.text)}</a>`)
    .join('');
}

function renderKnowledgeMap(headings) {
  const visibleHeadings = headings.filter((item) => item.level === 2 || item.level === 3).slice(0, 10);
  mapEl.innerHTML = visibleHeadings
    .map((item) => `<span class="chip">${escapeHtml(item.text)}</span>`)
    .join('');
}

searchInput.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  const links = tocEl.querySelectorAll('a');
  links.forEach((link) => {
    const text = link.textContent.toLowerCase();
    link.style.display = text.includes(query) ? 'block' : 'none';
  });

  const cards = mapEl.querySelectorAll('.chip');
  cards.forEach((chip) => {
    const text = chip.textContent.toLowerCase();
    chip.style.display = text.includes(query) ? 'inline-block' : 'none';
  });

  if (!query) {
    contentEl.querySelectorAll('p, li, td, th, h1, h2, h3').forEach((node) => {
      node.style.display = '';
    });
    return;
  }

  const textNodes = contentEl.querySelectorAll('p, li, td, th, h1, h2, h3');
  textNodes.forEach((node) => {
    const text = node.textContent.toLowerCase();
    node.style.display = text.includes(query) ? '' : 'none';
  });
});

loadMarkdown();
