'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const syncManifestBuilder = require('./build-reader-sync-manifest');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const READER_DIR = path.join(PUBLIC_DIR, 'reader');
const SOURCE_POSTS_DIR = path.join(ROOT, 'source', '_posts');
const errors = [];

function report(message) {
  errors.push(message);
}

function requiredFile(relativePath) {
  const absolutePath = path.join(PUBLIC_DIR, ...relativePath.split('/'));
  if (!fs.existsSync(absolutePath)) report(`缺少生成文件：public/${relativePath}`);
  return absolutePath;
}

function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    report(`${label} 不是有效 JSON：${error.message}`);
    return {};
  }
}

function publicPathFromUrl(url, siteRoot) {
  if (typeof url !== 'string' || !url.startsWith(siteRoot)) return '';
  const relative = decodeURIComponent(url.slice(siteRoot.length).split(/[?#]/, 1)[0]);
  return path.join(PUBLIC_DIR, ...relative.split('/').filter(Boolean));
}

function normalizedSitePath(value, siteRoot, basePath = siteRoot) {
  const origin = 'https://reader.invalid';
  try {
    const resolved = new URL(value, new URL(basePath, origin));
    if (resolved.origin !== origin) return '';
    const root = String(siteRoot || '/');
    const pathname = decodeURIComponent(resolved.pathname);
    const relative = root !== '/' && pathname.startsWith(root)
      ? pathname.slice(root.length)
      : pathname.replace(/^\/+/, '');
    return relative.replace(/index\.html$/i, '').replace(/\/+$/, '');
  } catch {
    return '';
  }
}

function quotedAttributes(html, elementPattern, attribute) {
  const expression = new RegExp(`<${elementPattern}\\b[^>]*\\b${attribute}\\s*=\\s*(["'])(.*?)\\1`, 'gi');
  return Array.from(html.matchAll(expression), match => match[2]);
}

function checkPng(file, expectedSize) {
  if (!fs.existsSync(file)) return;
  const buffer = fs.readFileSync(file);
  const signature = '89504e470d0a1a0a';
  if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== signature) {
    report(`${path.relative(ROOT, file)} 不是有效 PNG`);
    return;
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width !== expectedSize || height !== expectedSize) {
    report(`${path.relative(ROOT, file)} 尺寸应为 ${expectedSize}x${expectedSize}，实际为 ${width}x${height}`);
  }
}

function checkJavaScript(file) {
  if (!fs.existsSync(file)) return;
  try {
    new vm.Script(fs.readFileSync(file, 'utf8'), { filename: file });
  } catch (error) {
    report(`${path.relative(ROOT, file)} 语法错误：${error.message}`);
  }
}

function main() {
const requiredAssets = [
  'reader/index.html',
  'reader/reader.css',
  'reader/reader.js',
  'reader/sw.js',
  'reader/manifest.webmanifest',
  'reader/icons/icon.svg',
  'reader/icons/icon-192.png',
  'reader/icons/icon-512.png',
  'reader/data/posts.json',
  'reader/sync-manifest.json'
];
for (const asset of requiredAssets) requiredFile(asset);

const indexPath = path.join(READER_DIR, 'index.html');
const readerScriptPath = path.join(READER_DIR, 'reader.js');
const serviceWorkerPath = path.join(READER_DIR, 'sw.js');
checkJavaScript(readerScriptPath);
checkJavaScript(serviceWorkerPath);
checkPng(path.join(READER_DIR, 'icons', 'icon-192.png'), 192);
checkPng(path.join(READER_DIR, 'icons', 'icon-512.png'), 512);

if (fs.existsSync(indexPath)) {
  const index = fs.readFileSync(indexPath, 'utf8');
  if (!index.includes('./manifest.webmanifest')) report('reader/index.html 未引用 PWA manifest');
  if (!index.includes('./reader.js')) report('reader/index.html 未引用阅读器脚本');
  if (!index.includes('Content-Security-Policy')) report('reader/index.html 缺少 Content Security Policy');
  const noticePosition = index.indexOf('id="notice"');
  if (noticePosition < 0) report('reader/index.html 缺少全局通知区域');
  else if (noticePosition > index.indexOf('class="library-view"')) {
    report('reader/index.html 的全局通知不能放在隐藏的文章列表视图内');
  }
  if (/https?:\/\//i.test(index)) report('reader/index.html 不应依赖远程静态资源');
}

if (fs.existsSync(readerScriptPath)) {
  const script = fs.readFileSync(readerScriptPath, 'utf8');
  if (/search\.xml|atom\.xml/i.test(script)) report('reader/reader.js 不得加载 search.xml 或 atom.xml');
  if (!script.includes("register('./sw.js'")) report('reader/reader.js 未注册 Service Worker');
}

if (fs.existsSync(serviceWorkerPath)) {
  const serviceWorker = fs.readFileSync(serviceWorkerPath, 'utf8');
  if (!serviceWorker.includes('installAppShell()') || !serviceWorker.includes('cache.addAll(postUrls)')) {
    report('reader/sw.js 必须在安装时预缓存全部文章正文');
  }
}

const manifestPath = path.join(READER_DIR, 'manifest.webmanifest');
const manifest = fs.existsSync(manifestPath) ? readJson(manifestPath, 'reader/manifest.webmanifest') : {};
if (manifest.start_url !== '/markdown/reader/') report('manifest start_url 必须为 /markdown/reader/');
if (manifest.scope !== '/markdown/reader/') report('manifest scope 必须为 /markdown/reader/');
if (manifest.display !== 'standalone') report('manifest display 必须为 standalone');

const dataPath = path.join(READER_DIR, 'data', 'posts.json');
const payload = fs.existsSync(dataPath) ? readJson(dataPath, 'reader/data/posts.json') : {};
const posts = Array.isArray(payload.posts) ? payload.posts : [];
const sourcePostCount = fs.existsSync(SOURCE_POSTS_DIR)
  ? fs.readdirSync(SOURCE_POSTS_DIR).filter(file => file.endsWith('.md')).length
  : 0;
if (posts.length !== sourcePostCount) report(`阅读器目录应有 ${sourcePostCount} 篇，实际有 ${posts.length} 篇`);
if (payload.siteRoot !== '/markdown/') report('posts.json siteRoot 必须为 /markdown/');
if (fs.existsSync(dataPath) && fs.statSync(dataPath).size > 500 * 1024) report('posts.json 超过 500 KiB，启动负担过大');

function checkSyncManifest() {
  const syncManifestPath = path.join(READER_DIR, 'sync-manifest.json');
  if (!fs.existsSync(syncManifestPath)) return;

  const syncManifest = readJson(syncManifestPath, 'reader/sync-manifest.json');
  if (syncManifest.schemaVersion !== syncManifestBuilder.SCHEMA_VERSION) {
    report(`sync-manifest schemaVersion 必须为 ${syncManifestBuilder.SCHEMA_VERSION}`);
  }
  if (syncManifest.siteRoot !== syncManifestBuilder.SITE_ROOT) {
    report(`sync-manifest siteRoot 必须为 ${syncManifestBuilder.SITE_ROOT}`);
  }
  if (!/^[0-9a-f]{64}$/.test(String(syncManifest.revision || ''))) {
    report('sync-manifest revision 必须为 64 位小写十六进制 SHA-256');
  }
  if (typeof syncManifest.generatedAt !== 'string'
    || Number.isNaN(Date.parse(syncManifest.generatedAt))
    || new Date(syncManifest.generatedAt).toISOString() !== syncManifest.generatedAt) {
    report('sync-manifest generatedAt 必须为 ISO 8601 UTC 时间');
  }
  if (!Number.isInteger(syncManifest.postCount) || syncManifest.postCount !== posts.length) {
    report(`sync-manifest postCount 应为 ${posts.length}，实际为 ${String(syncManifest.postCount)}`);
  }
  if (!Array.isArray(syncManifest.files)) {
    report('sync-manifest files 必须为数组');
    return;
  }
  if (syncManifest.fileCount !== syncManifest.files.length) {
    report(`sync-manifest fileCount 与 files 数量不一致：${String(syncManifest.fileCount)} / ${syncManifest.files.length}`);
  }

  const seenPaths = new Set();
  const revisionHash = crypto.createHash('sha256');
  let actualTotalBytes = 0;
  let previousPath = '';
  for (const entry of syncManifest.files) {
    if (!entry || typeof entry.path !== 'string' || !entry.path || entry.path.startsWith('/')
      || entry.path.includes('\\') || /[:%?#\u0000-\u001f\u007f]/.test(entry.path)
      || entry.path.split('/').some(part => !part || part === '.' || part === '..')) {
      report(`sync-manifest 包含非法路径：${entry && entry.path}`);
      continue;
    }
    const validContentPath = entry.path === 'reader/data/posts.json'
      || (entry.path.startsWith('reader/data/posts/') && entry.path.endsWith('.html'));
    if (!validContentPath && !entry.path.startsWith('images/posts/')) {
      report(`sync-manifest 路径不在允许的同步目录内：${entry.path}`);
    }
    if (entry.path === syncManifestBuilder.OUTPUT_SITE_PATH) report('sync-manifest 不得包含自身');
    if (seenPaths.has(entry.path)) report(`sync-manifest 包含重复路径：${entry.path}`);
    seenPaths.add(entry.path);
    if (previousPath && entry.path < previousPath) report('sync-manifest files 必须按 path 字典序排列');
    previousPath = entry.path;

    const file = path.resolve(PUBLIC_DIR, ...entry.path.split('/'));
    const relative = path.relative(PUBLIC_DIR, file);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
      report(`sync-manifest 路径越界：${entry.path}`);
      continue;
    }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      report(`sync-manifest 文件不存在：${entry.path}`);
      continue;
    }

    const content = fs.readFileSync(file);
    const actualHash = crypto.createHash('sha256').update(content).digest('hex');
    if (!Number.isInteger(entry.bytes) || entry.bytes !== content.length) {
      report(`sync-manifest 文件大小不匹配：${entry.path}`);
    }
    if (!/^[0-9a-f]{64}$/.test(String(entry.sha256 || '')) || entry.sha256 !== actualHash) {
      report(`sync-manifest 文件 hash 不匹配：${entry.path}`);
    }
    actualTotalBytes += content.length;
    revisionHash.update(`${entry.path}\0${entry.bytes}\0${entry.sha256}\n`, 'utf8');
  }
  if (!Number.isInteger(syncManifest.totalBytes) || syncManifest.totalBytes !== actualTotalBytes) {
    report(`sync-manifest totalBytes 不匹配：${String(syncManifest.totalBytes)} / ${actualTotalBytes}`);
  }
  if (revisionHash.digest('hex') !== syncManifest.revision) {
    report('sync-manifest revision 与 files 内容不一致');
  }

  try {
    const expected = syncManifestBuilder.buildManifest();
    if (JSON.stringify(expected.files) !== JSON.stringify(syncManifest.files)) {
      report('sync-manifest files 不完整或包含未引用文件');
    }
    if (expected.revision !== syncManifest.revision) {
      report('sync-manifest revision 不是当前阅读器产物的 revision');
    }
    if (expected.fileCount !== syncManifest.fileCount) {
      report('sync-manifest fileCount 不是当前阅读器产物的数量');
    }
    if (expected.totalBytes !== syncManifest.totalBytes) {
      report('sync-manifest totalBytes 不是当前阅读器产物的总大小');
    }
  } catch (error) {
    report(`无法根据当前阅读器产物重建 sync-manifest：${error.message}`);
  }
}

checkSyncManifest();

const ids = new Set();
const knownPostPaths = new Set(posts.map(post => normalizedSitePath(post && post.url, payload.siteRoot)));
for (const post of posts) {
  const label = post && post.id ? post.id : '<unknown>';
  if (!post || !post.id) {
    report('posts.json 中存在缺少 id 的文章');
    continue;
  }
  if (ids.has(post.id)) report(`posts.json 包含重复 id：${post.id}`);
  ids.add(post.id);
  for (const field of ['title', 'description', 'url', 'contentUrl', 'updated', 'reviewStatus']) {
    if (typeof post[field] !== 'string' || !post[field]) report(`${label} 缺少 ${field}`);
  }
  for (const field of ['categories', 'tags', 'aliases', 'relatedPosts']) {
    if (!Array.isArray(post[field])) report(`${label} 的 ${field} 必须是数组`);
  }
  if (post.url.includes('/markdown//') || post.contentUrl.includes('/markdown//')) report(`${label} URL 含重复斜杠`);

  const articleDirectory = publicPathFromUrl(post.url, payload.siteRoot);
  const articlePage = articleDirectory ? path.join(articleDirectory, 'index.html') : '';
  if (!articlePage || !fs.existsSync(articlePage)) report(`${label} 原文章页面不存在：${post.url}`);

  const contentFile = publicPathFromUrl(post.contentUrl, payload.siteRoot);
  if (!contentFile || !fs.existsSync(contentFile)) {
    report(`${label} 正文片段不存在：${post.contentUrl}`);
    continue;
  }
  const content = fs.readFileSync(contentFile, 'utf8');
  if (!content.includes(`data-post-id="${post.id}"`)) report(`${label} 正文片段缺少对应 data-post-id`);

  for (const href of quotedAttributes(content, 'a', 'href')) {
    if (!href || href.startsWith('#')) continue;
    const postPath = normalizedSitePath(href, payload.siteRoot, post.url);
    if (postPath && !knownPostPaths.has(postPath)) report(`${label} 包含无法映射到阅读器文章的站内链接：${href}`);
  }

  const resourceUrls = quotedAttributes(content, '(?:img|source)', 'src');
  for (const sourceSet of quotedAttributes(content, '(?:img|source)', 'srcset')) {
    for (const candidate of sourceSet.split(',')) {
      const resourceUrl = candidate.trim().split(/\s+/, 1)[0];
      if (resourceUrl) resourceUrls.push(resourceUrl);
    }
  }
  for (const resourceUrl of resourceUrls) {
    if (/^data:image\//i.test(resourceUrl)) continue;
    if (/^(?:https?:)?\/\//i.test(resourceUrl)) {
      report(`${label} 正文图片必须本地化，不能引用远程地址：${resourceUrl}`);
      continue;
    }
    if (!resourceUrl.startsWith(payload.siteRoot)) {
      report(`${label} 正文图片路径必须位于 ${payload.siteRoot} 下：${resourceUrl}`);
      continue;
    }
    const resourceFile = publicPathFromUrl(resourceUrl, payload.siteRoot);
    if (!resourceFile || !fs.existsSync(resourceFile)) report(`${label} 正文资源不存在：${resourceUrl}`);
  }
}

if (errors.length) {
  console.error(`阅读器检查失败（${errors.length}）：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`阅读器检查通过：${posts.length} 篇文章，目录 ${(fs.statSync(dataPath).size / 1024).toFixed(1)} KiB。`);
}
}

if (require.main === module) main();
