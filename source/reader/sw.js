'use strict';

const SHELL_CACHE = 'zy-reader-shell-v2';
const CONTENT_CACHE = 'zy-reader-content-v1';
const CACHE_PREFIX = 'zy-reader-';
const APP_SCOPE = new URL('./', self.registration.scope);
const POST_INDEX_URL = new URL('./data/posts.json', APP_SCOPE).href;
const APP_SHELL = [
  './',
  './reader.css',
  './reader.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './data/posts.json'
].map(path => new URL(path, APP_SCOPE).href);

async function installAppShell() {
  const cache = await caches.open(SHELL_CACHE);
  await cache.addAll(APP_SHELL);

  const indexResponse = await cache.match(POST_INDEX_URL);
  if (!indexResponse) throw new Error('Post index was not cached');
  const payload = await indexResponse.json();
  const postUrls = Array.isArray(payload.posts)
    ? payload.posts.map(post => new URL(post.contentUrl, self.location.origin))
      .filter(url => url.origin === self.location.origin
        && url.pathname.startsWith(`${APP_SCOPE.pathname}data/posts/`))
      .map(url => url.href)
    : [];
  if (postUrls.length === 0) throw new Error('Post index contains no article fragments');
  await cache.addAll(postUrls);
  await self.skipWaiting();
}

self.addEventListener('install', event => {
  event.waitUntil(installAppShell());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) && ![SHELL_CACHE, CONTENT_CACHE].includes(key))
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request) || await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CONTENT_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const scopePath = APP_SCOPE.pathname;
  const isReaderAsset = url.pathname.startsWith(scopePath);
  const isPostFragment = url.pathname.includes(`${scopePath}data/posts/`);
  const isPostImage = url.pathname.includes('/images/posts/');

  if (request.mode === 'navigate' && isReaderAsset) {
    event.respondWith(networkFirst(request, SHELL_CACHE, APP_SCOPE.href));
  } else if (isPostFragment) {
    event.respondWith(networkFirst(request, CONTENT_CACHE));
  } else if (isPostImage || request.destination === 'image') {
    event.respondWith(cacheFirst(request));
  } else if (isReaderAsset) {
    event.respondWith(networkFirst(request, SHELL_CACHE));
  }
});
