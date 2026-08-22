'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const READER_DIR = path.join(PUBLIC_DIR, 'reader');
const POSTS_INDEX = path.join(READER_DIR, 'data', 'posts.json');
const OUTPUT_FILE = path.join(READER_DIR, 'sync-manifest.json');
const SITE_ROOT = '/markdown/';
const SCHEMA_VERSION = 1;
const OUTPUT_SITE_PATH = 'reader/sync-manifest.json';

function requireFile(file, label = path.relative(ROOT, file)) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    throw new Error(`Missing generated file: ${label}`);
  }
}

function readPostIndex() {
  requireFile(POSTS_INDEX, 'public/reader/data/posts.json');
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(POSTS_INDEX, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid public/reader/data/posts.json: ${error.message}`);
  }
  if (!payload || !Array.isArray(payload.posts) || payload.posts.length === 0) {
    throw new Error('public/reader/data/posts.json has no posts');
  }
  if (payload.siteRoot !== SITE_ROOT) {
    throw new Error(`Reader siteRoot must be ${SITE_ROOT}; received ${String(payload.siteRoot)}`);
  }
  return payload;
}

function sitePathFromUrl(value, expectedPrefix, label) {
  try {
    const url = new URL(value, 'https://reader.invalid');
    if (url.origin !== 'https://reader.invalid' || !url.pathname.startsWith(SITE_ROOT)) {
      throw new Error('URL is not inside the configured site root');
    }
    const sitePath = decodeURIComponent(url.pathname.slice(SITE_ROOT.length));
    if (!sitePath.startsWith(expectedPrefix)) {
      throw new Error(`path must start with ${expectedPrefix}`);
    }
    return validateSitePath(sitePath, label);
  } catch (error) {
    throw new Error(`Invalid ${label}: ${String(value)} (${error.message})`);
  }
}

function validateSitePath(value, label = 'sync path') {
  if (typeof value !== 'string' || !value || value.startsWith('/') || value.includes('\\')
    || /[:%?#\u0000-\u001f\u007f]/.test(value)) {
    throw new Error(`${label} must be a relative URL path`);
  }
  const segments = value.split('/');
  if (segments.some(segment => !segment || segment === '.' || segment === '..')) {
    throw new Error(`${label} contains an unsafe path segment: ${value}`);
  }
  return value;
}

function absolutePublicPath(sitePath) {
  const normalized = validateSitePath(sitePath);
  const absolute = path.resolve(PUBLIC_DIR, ...normalized.split('/'));
  const relative = path.relative(PUBLIC_DIR, absolute);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Sync path escapes public/: ${sitePath}`);
  }
  return absolute;
}

function quotedAttributes(html, elementPattern, attribute) {
  const expression = new RegExp(`<${elementPattern}\\b[^>]*\\b${attribute}\\s*=\\s*(["'])(.*?)\\1`, 'gi');
  return Array.from(html.matchAll(expression), match => match[2]);
}

function referencedImagePaths(html, postId) {
  const values = quotedAttributes(html, '(?:img|source)', 'src');
  for (const sourceSet of quotedAttributes(html, '(?:img|source)', 'srcset')) {
    for (const candidate of sourceSet.split(',')) {
      const value = candidate.trim().split(/\s+/, 1)[0];
      if (value) values.push(value);
    }
  }

  const images = new Set();
  for (const value of values) {
    if (/^data:image\//i.test(value)) continue;
    let url;
    try {
      url = new URL(value, 'https://reader.invalid');
    } catch (error) {
      throw new Error(`Invalid image URL in ${postId}: ${value} (${error.message})`);
    }
    if (url.origin !== 'https://reader.invalid' || !url.pathname.startsWith(`${SITE_ROOT}images/posts/`)) {
      throw new Error(`Article image is not local to ${SITE_ROOT}images/posts/ in ${postId}: ${value}`);
    }
    images.add(sitePathFromUrl(url.href, 'images/posts/', `image URL in ${postId}`));
  }
  return images;
}

function collectSyncPaths(payload) {
  if (!fs.existsSync(READER_DIR) || !fs.statSync(READER_DIR).isDirectory()) {
    throw new Error('Missing generated directory: public/reader');
  }

  // Android owns the reader UI shell. Runtime snapshots contain only content,
  // so an APK update can never be paired with an older cloud-synced JS bridge.
  const paths = new Set(['reader/data/posts.json']);

  const postIds = new Set();
  const contentPaths = new Set();
  for (const post of payload.posts) {
    if (!post || typeof post.id !== 'string' || !post.id || postIds.has(post.id)) {
      throw new Error(`Invalid or duplicate post id: ${post && post.id}`);
    }
    postIds.add(post.id);
    const contentPath = sitePathFromUrl(post.contentUrl, 'reader/data/posts/', `contentUrl for ${post.id}`);
    if (!contentPath.endsWith('.html') || contentPaths.has(contentPath)) {
      throw new Error(`Invalid or duplicate contentUrl for ${post.id}: ${contentPath}`);
    }
    contentPaths.add(contentPath);
    const contentFile = absolutePublicPath(contentPath);
    requireFile(contentFile, `public/${contentPath}`);
    paths.add(contentPath);
    const html = fs.readFileSync(contentFile, 'utf8');
    for (const imagePath of referencedImagePaths(html, post.id)) {
      requireFile(absolutePublicPath(imagePath), `public/${imagePath}`);
      paths.add(imagePath);
    }
  }

  return Array.from(paths).sort();
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function buildManifest() {
  const payload = readPostIndex();
  const paths = collectSyncPaths(payload);
  const files = paths.map(sitePath => {
    const file = absolutePublicPath(sitePath);
    const content = fs.readFileSync(file);
    return {
      path: sitePath,
      bytes: content.length,
      sha256: sha256(content)
    };
  });
  const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
  const revisionHash = crypto.createHash('sha256');
  for (const file of files) {
    revisionHash.update(`${file.path}\0${file.bytes}\0${file.sha256}\n`, 'utf8');
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    revision: revisionHash.digest('hex'),
    generatedAt: new Date().toISOString(),
    siteRoot: SITE_ROOT,
    postCount: payload.posts.length,
    fileCount: files.length,
    totalBytes,
    files
  };
}

function main() {
  const manifest = buildManifest();
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  const imageCount = manifest.files.filter(file => file.path.startsWith('images/posts/')).length;
  console.log(
    `Reader sync manifest generated: ${manifest.postCount} posts, ${imageCount} images, `
      + `${manifest.fileCount} files, ${(manifest.totalBytes / 1024 / 1024).toFixed(1)} MiB, `
      + `revision ${manifest.revision.slice(0, 12)}.`
  );
}

if (require.main === module) main();

module.exports = {
  OUTPUT_SITE_PATH,
  SCHEMA_VERSION,
  SITE_ROOT,
  buildManifest,
  collectSyncPaths,
  sha256,
  validateSitePath
};
