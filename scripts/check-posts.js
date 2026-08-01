'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'source', '_posts');
const POST_IMAGES_DIR = path.join(ROOT, 'source', 'images', 'posts');
const SITE_IMAGE_ROOT = '/images/';
const REQUIRED_FIELDS = ['title', 'date', 'description', 'permalink', 'categories', 'tags', 'toc'];

const errors = [];
const warnings = [];
const referencedImages = new Set();

function report(collection, file, line, message) {
  collection.push(`${file}:${line} ${message}`);
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(absolutePath) : [absolutePath];
  });
}

function parseFrontMatter(file, lines) {
  if (lines[0] !== '---') {
    report(errors, file, 1, '缺少 Front Matter 起始标记');
    return { end: 0, values: new Map() };
  }

  const end = lines.indexOf('---', 1);
  if (end === -1) {
    report(errors, file, 1, 'Front Matter 没有结束标记');
    return { end: 0, values: new Map() };
  }

  const values = new Map();
  for (let index = 1; index < end; index += 1) {
    const match = lines[index].match(/^([a-z_]+):(?:\s*(.*))?$/i);
    if (match) values.set(match[1], match[2] || '');
  }

  for (const field of REQUIRED_FIELDS) {
    if (!values.has(field)) report(errors, file, 1, `Front Matter 缺少 ${field}`);
  }

  return { end, values };
}

function checkMarkdown(file, content, permalinks) {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);
  const { end, values } = parseFrontMatter(file, lines);
  const permalink = values.get('permalink');

  if (permalink) {
    if (permalinks.has(permalink)) {
      report(errors, file, 1, `permalink 与 ${permalinks.get(permalink)} 重复：${permalink}`);
    } else {
      permalinks.set(permalink, file);
    }
  }

  if (!content.includes('<!-- more -->')) {
    report(warnings, file, end + 1, '缺少首页摘要分隔符 <!-- more -->');
  }
  if (/<\/?font\b/i.test(content)) report(errors, file, 1, '仍包含已废弃的 <font> 标签');
  if (/<!--[^>]*ocr[^>]*-->/i.test(content)) report(errors, file, 1, '仍包含云笔记 OCR 注释');

  let fence = null;
  let previousHeading = null;
  for (let index = end + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!fence) {
        fence = { char: marker[0], length: marker.length, line: index + 1 };
      } else if (marker[0] === fence.char && marker.length >= fence.length && !fenceMatch[2].trim()) {
        fence = null;
      }
      continue;
    }
    if (fence) continue;

    const heading = line.match(/^(#{1,6})\s+\S/);
    if (heading) {
      const level = heading[1].length;
      if (level === 1) report(warnings, file, index + 1, '文章正文使用了 H1，建议从 H2 开始');
      if (previousHeading && level > previousHeading.level + 1) {
        report(errors, file, index + 1, `标题从 H${previousHeading.level} 跳到 H${level}`);
      }
      previousHeading = { level, line: index + 1 };
    }
  }
  if (fence) report(errors, file, fence.line, '代码围栏没有闭合');

  if (values.get('mathjax') === 'true') {
    let displayMathStart = null;
    let inCodeFence = false;
    for (let index = end + 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (/^\s{0,3}(`{3,}|~{3,})/.test(line)) {
        inCodeFence = !inCodeFence;
        continue;
      }
      if (inCodeFence) continue;

      if (line.includes('$$') && line.trim() !== '$$') {
        report(errors, file, index + 1, '展示公式的 $$ 必须独占一行');
      }
      if (line.trim() === '$$') {
        displayMathStart = displayMathStart ? null : index + 1;
        continue;
      }
      if (displayMathStart) {
        if (/^#{1,6}\s/.test(line)) {
          report(errors, file, index + 1, `标题被包含在第 ${displayMathStart} 行开始的公式块中`);
        }
        continue;
      }

      const singleDollars = [...line.matchAll(/(^|[^\\])\$/g)].length;
      if (singleDollars % 2 !== 0) {
        report(errors, file, index + 1, '单个 $ 公式不能跨行，请改用独占行的 $$');
      }
    }
    if (displayMathStart) report(errors, file, displayMathStart, '展示公式块没有闭合');
  }

  const imagePattern = /!\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g;
  for (const match of content.matchAll(imagePattern)) {
    const imageUrl = match[1].replace(/^<|>$/g, '');
    const line = content.slice(0, match.index).split(/\r?\n/).length;
    if (/^(?:https?:)?\/\//i.test(imageUrl)) {
      report(errors, file, line, `图片仍引用远程地址：${imageUrl}`);
      continue;
    }

    if (imageUrl.startsWith(SITE_IMAGE_ROOT)) {
      const sourcePath = path.resolve(ROOT, 'source', decodeURIComponent(imageUrl.slice(1)));
      referencedImages.add(sourcePath.toLowerCase());
      if (!fs.existsSync(sourcePath)) report(errors, file, line, `本地图片不存在：${imageUrl}`);
    }
  }

  if (content.includes('](/markdown/')) {
    report(errors, file, 1, '站点根路径不应硬编码为 /markdown/，Hexo 会根据 root 自动补齐');
  }

  const remoteHtmlImage = /<img\b[^>]*\bsrc=["'](?:https?:)?\/\//i;
  if (remoteHtmlImage.test(content)) report(errors, file, 1, 'HTML 图片仍引用远程地址');
}

function main() {
  const postFiles = fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b, 'en'));
  const permalinks = new Map();

  for (const file of postFiles) {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    checkMarkdown(file, content, permalinks);
  }

  const localImages = walkFiles(POST_IMAGES_DIR);
  const orphanImages = localImages.filter(file => !referencedImages.has(file.toLowerCase()));
  for (const image of orphanImages) {
    warnings.push(`未被正文引用的图片：${path.relative(ROOT, image).replace(/\\/g, '/')}`);
  }

  console.log(`检查完成：${postFiles.length} 篇文章，${referencedImages.size} 个图片引用，${localImages.length} 个本地图片文件。`);
  if (warnings.length) {
    console.log(`\n警告（${warnings.length}）：`);
    for (const warning of warnings) console.log(`- ${warning}`);
  }
  if (errors.length) {
    console.error(`\n错误（${errors.length}）：`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log('\n文档检查通过。');
  }
}

if (require.main === module) main();
