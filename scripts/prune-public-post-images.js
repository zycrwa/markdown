'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildManifest } = require('./build-reader-sync-manifest');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const PUBLIC_POST_IMAGES = path.join(PUBLIC_DIR, 'images', 'posts');

function filesBelow(directory) {
  if (!fs.existsSync(directory)) return [];
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...filesBelow(absolute));
    else if (entry.isFile()) result.push(absolute);
  }
  return result;
}

function assertGeneratedPath(absolute) {
  const relative = path.relative(PUBLIC_POST_IMAGES, absolute);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to prune outside public/images/posts: ${absolute}`);
  }
}

function removeEmptyDirectories(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) removeEmptyDirectories(path.join(directory, entry.name));
  }
  if (directory !== PUBLIC_POST_IMAGES && fs.readdirSync(directory).length === 0) {
    assertGeneratedPath(directory);
    fs.rmdirSync(directory);
  }
}

function main() {
  const manifest = buildManifest();
  const retained = new Set(manifest.files
    .filter(file => file.path.startsWith('images/posts/'))
    .map(file => path.resolve(PUBLIC_DIR, ...file.path.split('/'))));

  let removedFiles = 0;
  let removedBytes = 0;
  for (const file of filesBelow(PUBLIC_POST_IMAGES)) {
    if (retained.has(path.resolve(file))) continue;
    assertGeneratedPath(file);
    removedBytes += fs.statSync(file).size;
    fs.unlinkSync(file);
    removedFiles += 1;
  }
  removeEmptyDirectories(PUBLIC_POST_IMAGES);
  console.log(`Pruned ${removedFiles} unreferenced generated post images (${(removedBytes / 1024 / 1024).toFixed(1)} MiB).`);
}

if (require.main === module) main();

module.exports = { main };
