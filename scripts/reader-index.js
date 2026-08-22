'use strict';

/* global hexo */

// Build a small navigation index from Hexo's post collection. The reader must
// never parse search.xml because that file contains the complete rendered HTML
// and server-rendered MathJax SVG.

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value.toArray === 'function') return value.toArray();
  return [value];
}

function stringValue(value) {
  if (value && typeof value === 'object' && 'name' in value) return String(value.name);
  return String(value);
}

function strings(value) {
  return toArray(value)
    .map(stringValue)
    .map(item => item.trim())
    .filter(Boolean);
}

function dateValue(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function normalizeRoot(value) {
  const root = String(value || '/');
  return `/${root.replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');
}

function postId(post) {
  const source = String(post.source || '');
  const file = source.split(/[\\/]/).pop() || '';
  return file.replace(/\.md$/i, '');
}

function postUrl(root, post) {
  const postPath = String(post.path || post.permalink || '').replace(/^\/+/, '');
  return `${root}${postPath}`.replace(/([^:]\/)\/+/g, '$1');
}

function searchText(value) {
  return String(value || '')
    .replace(/^---[\s\S]*?---\s*/u, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, ' $1 ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, ' $1 ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_>#|~$\\{}\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

hexo.extend.generator.register('reader-index', function generateReaderIndex(locals) {
  const root = normalizeRoot(this.config && this.config.root);
  const sourcePosts = toArray(locals.posts);
  const posts = sourcePosts
    .map(post => {
      const id = postId(post);
      const categories = strings(post.categories);
      const tags = strings(post.tags);
      const aliases = strings(post.aliases);
      const relatedPosts = strings(post.related_posts);

      return {
        id,
        title: String(post.title || id),
        description: String(post.description || ''),
        categories,
        tags,
        aliases,
        relatedPosts,
        updated: dateValue(post.updated || post.date),
        date: dateValue(post.date),
        reviewStatus: String(post.review_status || 'unverified'),
        hasMath: Boolean(post.mathjax),
        url: postUrl(root, post),
        contentUrl: `${root}reader/data/posts/${encodeURIComponent(id)}.html`,
        searchText: searchText(post.raw || post._content || '')
      };
    })
    .filter(post => post.id && post.url)
    .sort((left, right) => String(right.updated).localeCompare(String(left.updated)));

  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    siteRoot: root,
    posts
  };

  const indexRoute = {
    path: 'reader/data/posts.json',
    data: JSON.stringify(payload, null, 2)
  };

  const contentRoutes = sourcePosts.map(post => ({
    path: `reader/data/posts/${postId(post)}.html`,
    data: `<article class="reader-content post-body" data-post-id="${postId(post)}">${String(post.content || '')}</article>`
  }));

  return [indexRoute, ...contentRoutes];
});
