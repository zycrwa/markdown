'use strict';

const fs = require('node:fs');
const path = require('node:path');
const frontMatter = require('hexo-front-matter');
const { INDEX_PATH, buildIndex } = require('./build-knowledge-index');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'source', '_posts');
const POST_IMAGES_DIR = path.join(ROOT, 'source', 'images', 'posts');
const ARCHIVE_DIR = path.join(ROOT, 'archive');
const SITE_IMAGE_ROOT = '/images/';
const REQUIRED_FIELDS = [
  'title',
  'date',
  'updated',
  'description',
  'permalink',
  'categories',
  'tags',
  'aliases',
  'related_posts',
  'source_docs',
  'review_status',
  'toc'
];
const ARRAY_FIELDS = ['categories', 'tags', 'aliases', 'related_posts', 'source_docs'];
const REVIEW_STATUSES = new Set(['unverified', 'partially-verified', 'human-verified']);

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

function uniqueStrings(file, field, value) {
  if (!Array.isArray(value)) {
    report(errors, file, 1, `${field} 必须是 YAML 数组`);
    return [];
  }

  const normalized = value.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim());
  if (normalized.length !== value.length) report(errors, file, 1, `${field} 只能包含非空字符串`);
  if (new Set(normalized).size !== normalized.length) report(errors, file, 1, `${field} 包含重复项`);
  return normalized;
}

function parsePost(file, content) {
  const cleanContent = content.replace(/^\uFEFF/, '');
  const lines = cleanContent.split(/\r?\n/);
  if (lines[0] !== '---') {
    report(errors, file, 1, '缺少 Front Matter 起始标记');
    return { data: {}, end: 0, lines };
  }

  const end = lines.indexOf('---', 1);
  if (end === -1) {
    report(errors, file, 1, 'Front Matter 没有结束标记');
    return { data: {}, end: 0, lines };
  }

  const presentFields = new Set();
  for (let index = 1; index < end; index += 1) {
    const match = lines[index].match(/^([a-z_]+):(?:\s|$)/i);
    if (match) presentFields.add(match[1]);
  }
  for (const field of REQUIRED_FIELDS) {
    if (!presentFields.has(field)) report(errors, file, 1, `Front Matter 缺少 ${field}`);
  }

  try {
    return { data: frontMatter.parse(cleanContent), end, lines };
  } catch (error) {
    report(errors, file, 1, `Front Matter YAML 无法解析：${error.message}`);
    return { data: {}, end, lines };
  }
}

function checkMetadata(file, id, data, permalinks) {
  for (const field of ['title', 'description', 'permalink', 'review_status']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) {
      report(errors, file, 1, `${field} 必须是非空字符串`);
    }
  }
  if (typeof data.description === 'string' && data.description.trim().length < 20) {
    report(errors, file, 1, 'description 应说明文章覆盖范围，不能少于 20 个字符');
  }

  for (const field of ARRAY_FIELDS) data[field] = uniqueStrings(file, field, data[field]);
  for (const field of ['categories', 'tags', 'source_docs']) {
    if (!data[field]?.length) report(errors, file, 1, `${field} 至少需要一项`);
  }

  if (!(data.date instanceof Date) || Number.isNaN(data.date.getTime())) {
    report(errors, file, 1, 'date 不是有效日期');
  }
  if (!(data.updated instanceof Date) || Number.isNaN(data.updated.getTime())) {
    report(errors, file, 1, 'updated 不是有效日期');
  }
  if (data.date instanceof Date && data.updated instanceof Date && data.updated < data.date) {
    report(errors, file, 1, 'updated 不能早于 date');
  }

  if (!REVIEW_STATUSES.has(data.review_status)) {
    report(errors, file, 1, `review_status 必须是 ${[...REVIEW_STATUSES].join('、')} 之一`);
  }
  if (data.toc !== true && data.toc !== false) report(errors, file, 1, 'toc 必须是 true 或 false');

  if (typeof data.permalink === 'string' && data.permalink) {
    if (!data.permalink.endsWith('/')) report(errors, file, 1, 'permalink 必须以 / 结尾');
    if (data.permalink.includes('pending/')) report(errors, file, 1, 'permalink 仍是模板占位值');
    if (permalinks.has(data.permalink)) {
      report(errors, file, 1, `permalink 与 ${permalinks.get(data.permalink)} 重复：${data.permalink}`);
    } else {
      permalinks.set(data.permalink, file);
    }
  }

  for (const sourceDoc of data.source_docs || []) {
    const sourcePath = path.resolve(ROOT, sourceDoc);
    const relativeToArchive = path.relative(ARCHIVE_DIR, sourcePath);
    if (relativeToArchive.startsWith('..') || path.isAbsolute(relativeToArchive)) {
      report(errors, file, 1, `source_docs 必须指向 archive/：${sourceDoc}`);
    } else if (!fs.existsSync(sourcePath)) {
      report(errors, file, 1, `source_docs 文件不存在：${sourceDoc}`);
    }
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    report(errors, file, 1, '文件名必须是小写英文、数字和连字符组成的稳定文章 ID');
  }
}

function checkBody(file, content, data, end, lines) {
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

  if (data.mathjax === true) {
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
  if (/<img\b[^>]*\bsrc=["'](?:https?:)?\/\//i.test(content)) {
    report(errors, file, 1, 'HTML 图片仍引用远程地址');
  }
}

function checkKnowledgeIndex() {
  if (!fs.existsSync(INDEX_PATH)) {
    errors.push('KNOWLEDGE_INDEX.md:1 缺少知识索引，请运行 npm run knowledge:index');
    return;
  }
  const actual = fs.readFileSync(INDEX_PATH, 'utf8').replace(/\r\n/g, '\n');
  const expected = buildIndex().replace(/\r\n/g, '\n');
  if (actual !== expected) {
    errors.push('KNOWLEDGE_INDEX.md:1 知识索引已过期，请运行 npm run knowledge:index');
  }
}

function main() {
  const postFiles = fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .sort((left, right) => left.localeCompare(right, 'en'));
  const permalinks = new Map();
  const posts = new Map();

  for (const file of postFiles) {
    const id = path.basename(file, '.md');
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { data, end, lines } = parsePost(file, content);
    checkMetadata(file, id, data, permalinks);
    checkBody(file, content, data, end, lines);
    posts.set(id, { file, data });
  }

  for (const [id, post] of posts) {
    for (const relatedId of post.data.related_posts || []) {
      if (relatedId === id) report(errors, post.file, 1, 'related_posts 不能引用文章自身');
      if (!posts.has(relatedId)) {
        report(errors, post.file, 1, `related_posts 引用了不存在的文章：${relatedId}`);
      } else if (!(posts.get(relatedId).data.related_posts || []).includes(id)) {
        report(errors, post.file, 1, `related_posts 必须双向关联：${relatedId} 未引用 ${id}`);
      }
    }
  }

  const localImages = walkFiles(POST_IMAGES_DIR);
  const orphanImages = localImages.filter(file => !referencedImages.has(file.toLowerCase()));
  for (const image of orphanImages) {
    warnings.push(`未被正文引用的图片：${path.relative(ROOT, image).replace(/\\/g, '/')}`);
  }

  checkKnowledgeIndex();

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
