'use strict';

(() => {
  const DATA_URL = new URL('./data/posts.json', window.location.href).href;
  const SHELL_CACHE = 'zy-reader-shell-v2';
  const CONTENT_CACHE = 'zy-reader-content-v1';
  const SAFE_CONTENT_TAGS = new Set([
    'a', 'abbr', 'article', 'b', 'blockquote', 'br', 'caption', 'cite', 'code', 'col', 'colgroup',
    'dd', 'del', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure', 'h2', 'h3', 'h4', 'h5', 'h6',
    'hr', 'i', 'img', 'kbd', 'li', 'mark', 'ol', 'p', 'picture', 'pre', 'q', 's', 'samp',
    'small', 'source', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
    'thead', 'time', 'tr', 'u', 'ul', 'var',
    'mjx-break', 'mjx-container',
    'math', 'mfrac', 'mi', 'mn', 'mo', 'mover', 'mroot', 'mrow', 'mspace', 'msqrt', 'msub',
    'msubsup', 'msup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'semantics',
    'circle', 'ellipse', 'g', 'line', 'path', 'polygon', 'polyline', 'rect', 'svg', 'text', 'title'
  ]);
  const DROP_CONTENT_TAGS = new Set([
    'applet', 'audio', 'base', 'button', 'embed', 'form', 'frame', 'frameset', 'iframe', 'input',
    'link', 'meta', 'object', 'option', 'portal', 'script', 'select', 'style', 'template', 'textarea',
    'video'
  ]);
  const SAFE_CONTENT_ATTRIBUTES = new Set([
    'align', 'alt', 'cite', 'class', 'colspan', 'cx', 'cy', 'd', 'datetime', 'display', 'fill',
    'fill-rule', 'focusable', 'font-family', 'font-size', 'height', 'id', 'jax', 'overflow', 'points',
    'r', 'role', 'rowspan', 'rx', 'ry', 'scope', 'size', 'start', 'stroke', 'stroke-linecap',
    'stroke-linejoin', 'stroke-width', 'title', 'transform', 'viewbox', 'width', 'x', 'x1', 'x2',
    'xmlns', 'xmlns:xlink', 'y', 'y1', 'y2'
  ]);
  const STORAGE_KEYS = {
    favorites: 'zy-reader:favorites:v1',
    history: 'zy-reader:history:v1',
    offline: 'zy-reader:offline:v1',
    theme: 'zy-reader:theme:v1',
    sort: 'zy-reader:sort:v1'
  };

  const elements = {
    menuButton: document.getElementById('menu-button'),
    sidebar: document.getElementById('sidebar'),
    sidebarScrim: document.getElementById('sidebar-scrim'),
    libraryCount: document.getElementById('library-count'),
    refreshButton: document.getElementById('refresh-button'),
    searchInput: document.getElementById('search-input'),
    categoryList: document.getElementById('category-list'),
    clearCacheButton: document.getElementById('clear-cache-button'),
    libraryView: document.getElementById('library-view'),
    readerView: document.getElementById('reader-view'),
    viewTitle: document.getElementById('view-title'),
    viewSummary: document.getElementById('view-summary'),
    sortSelect: document.getElementById('sort-select'),
    notice: document.getElementById('notice'),
    postList: document.getElementById('post-list'),
    emptyState: document.getElementById('empty-state'),
    backButton: document.getElementById('back-button'),
    favoriteButton: document.getElementById('favorite-button'),
    downloadButton: document.getElementById('download-button'),
    externalButton: document.getElementById('external-button'),
    readerScroll: document.getElementById('reader-scroll'),
    readerCategory: document.getElementById('reader-category'),
    readerTitle: document.getElementById('reader-title'),
    readerDetails: document.getElementById('reader-details'),
    readerLoading: document.getElementById('reader-loading'),
    readerError: document.getElementById('reader-error'),
    readerErrorMessage: document.getElementById('reader-error-message'),
    retryButton: document.getElementById('retry-button'),
    readerContent: document.getElementById('reader-content'),
    networkStatus: document.getElementById('network-status'),
    installButton: document.getElementById('install-button'),
    themeButton: document.getElementById('theme-button'),
    imageDialog: document.getElementById('image-dialog'),
    imageDialogClose: document.getElementById('image-dialog-close'),
    imageDialogImage: document.getElementById('image-dialog-image'),
    imageDialogCaption: document.getElementById('image-dialog-caption')
  };

  const state = {
    posts: [],
    siteRoot: '/',
    activeFilter: 'all',
    query: '',
    sort: loadString(STORAGE_KEYS.sort, 'updated'),
    favorites: new Set(loadArray(STORAGE_KEYS.favorites)),
    readingHistory: loadArray(STORAGE_KEYS.history),
    offlinePosts: new Set(loadArray(STORAGE_KEYS.offline)),
    currentPost: null,
    nativeMode: isNativeMode(),
    nativeSyncState: 'syncing',
    nativeSyncMessage: '',
    loadToken: 0,
    installPrompt: null,
    noticeTimer: null
  };

  function loadArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
    } catch {
      return [];
    }
  }

  function loadString(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  function saveArray(key, values) {
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(values)));
    } catch {
      showNotice('浏览器未允许保存本地设置。', true);
    }
  }

  function saveString(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // The current session still works when storage is unavailable.
    }
  }

  function normalize(value) {
    return String(value || '')
      .normalize('NFKC')
      .toLocaleLowerCase('zh-CN')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  function absoluteUrl(value) {
    return new URL(value, window.location.origin).href;
  }

  function normalizeSiteRoot(value) {
    const root = String(value || '/').replace(/^\/+|\/+$/g, '');
    return root ? `/${root}/` : '/';
  }

  function siteRelativePath(value) {
    const pathname = new URL(value, window.location.origin).pathname;
    const withoutRoot = state.siteRoot !== '/' && pathname.startsWith(state.siteRoot)
      ? pathname.slice(state.siteRoot.length)
      : pathname.replace(/^\/+/, '');
    return withoutRoot.replace(/index\.html$/i, '').replace(/\/+$/, '');
  }

  function baseLocation() {
    return `${window.location.pathname}${window.location.search}`;
  }

  function hashPostId() {
    const parameters = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    return parameters.get('post');
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function isNativeMode() {
    return new URLSearchParams(window.location.search).get('native') === 'android'
      || /\bZYKnowledgeNotes\//.test(navigator.userAgent);
  }

  function showNotice(message, persistent = false) {
    window.clearTimeout(state.noticeTimer);
    elements.notice.textContent = message;
    elements.notice.hidden = false;
    if (!persistent) {
      state.noticeTimer = window.setTimeout(() => {
        elements.notice.hidden = true;
      }, 4200);
    }
  }

  function closeSidebar() {
    document.body.classList.remove('sidebar-open');
  }

  function updateNetworkStatus() {
    if (state.nativeMode) {
      const labels = {
        syncing: '同步中',
        synced: '已同步',
        offline: '离线旧版',
        'first-online': '首次需联网',
        error: '同步失败'
      };
      elements.networkStatus.textContent = labels[state.nativeSyncState] || labels.error;
      elements.networkStatus.classList.toggle('syncing', state.nativeSyncState === 'syncing');
      elements.networkStatus.classList.toggle(
        'offline',
        ['offline', 'first-online', 'error'].includes(state.nativeSyncState)
      );
      elements.networkStatus.title = state.nativeSyncMessage || elements.networkStatus.textContent;
      return;
    }
    const online = navigator.onLine;
    elements.networkStatus.textContent = online ? '在线' : '离线';
    elements.networkStatus.classList.toggle('offline', !online);
  }

  function applyTheme(theme) {
    const selected = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = selected;
    elements.themeButton.setAttribute('aria-label', selected === 'dark' ? '切换浅色模式' : '切换深色模式');
    elements.themeButton.title = elements.themeButton.getAttribute('aria-label');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', selected === 'dark' ? '#0d2221' : '#132a2a');
    saveString(STORAGE_KEYS.theme, selected);
  }

  function initializeTheme() {
    const stored = loadString(STORAGE_KEYS.theme, '');
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(stored || preferred);
  }

  function categories() {
    const counts = new Map();
    for (const post of state.posts) {
      const values = post.categories.length ? post.categories : ['未分类'];
      for (const category of values) counts.set(category, (counts.get(category) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((left, right) => left[0].localeCompare(right[0], 'zh-CN'));
  }

  function validHistory() {
    const ids = new Set(state.posts.map(post => post.id));
    return state.readingHistory.filter((id, index, values) => ids.has(id) && values.indexOf(id) === index);
  }

  function addCategoryButton(fragment, key, label, count, icon) {
    const button = makeElement('button', 'category-button');
    button.type = 'button';
    button.dataset.filter = key;
    button.classList.toggle('active', state.activeFilter === key);
    button.setAttribute('aria-pressed', String(state.activeFilter === key));

    const iconElement = makeElement('span', 'category-icon', icon);
    iconElement.setAttribute('aria-hidden', 'true');
    button.append(iconElement, makeElement('span', '', label), makeElement('span', 'category-count', String(count)));
    fragment.append(button);
  }

  function renderCategories() {
    const fragment = document.createDocumentFragment();
    addCategoryButton(fragment, 'all', '全部文章', state.posts.length, '▦');
    addCategoryButton(fragment, 'favorites', '我的收藏', state.favorites.size, '☆');
    addCategoryButton(fragment, 'recent', '最近阅读', validHistory().length, '↺');

    const separator = makeElement('div', 'sidebar-label', '分类');
    separator.style.padding = '18px 10px 7px';
    fragment.append(separator);

    for (const [category, count] of categories()) {
      addCategoryButton(fragment, `category:${category}`, category, count, '▸');
    }

    elements.categoryList.replaceChildren(fragment);
  }

  function searchScore(post, terms) {
    const fields = {
      title: normalize(post.title),
      aliases: normalize(post.aliases.join(' ')),
      tags: normalize(post.tags.join(' ')),
      description: normalize(post.description),
      content: normalize(post.searchText)
    };
    const fullText = Object.values(fields).join(' ');
    if (!terms.every(term => fullText.includes(term))) return -1;

    return terms.reduce((score, term) => {
      if (fields.title.startsWith(term)) score += 120;
      else if (fields.title.includes(term)) score += 100;
      if (fields.aliases.includes(term)) score += 80;
      if (fields.tags.includes(term)) score += 60;
      if (fields.description.includes(term)) score += 30;
      if (fields.content.includes(term)) score += 10;
      return score;
    }, 0);
  }

  function filteredPosts() {
    let posts = [...state.posts];

    if (state.activeFilter === 'favorites') {
      posts = posts.filter(post => state.favorites.has(post.id));
    } else if (state.activeFilter === 'recent') {
      const order = validHistory();
      const positions = new Map(order.map((id, index) => [id, index]));
      posts = posts.filter(post => positions.has(post.id)).sort((left, right) => positions.get(left.id) - positions.get(right.id));
    } else if (state.activeFilter.startsWith('category:')) {
      const category = state.activeFilter.slice('category:'.length);
      posts = posts.filter(post => post.categories.includes(category));
    }

    const terms = normalize(state.query).split(' ').filter(Boolean);
    if (terms.length) {
      posts = posts
        .map(post => ({ post, score: searchScore(post, terms) }))
        .filter(result => result.score >= 0)
        .sort((left, right) => right.score - left.score || String(right.post.updated).localeCompare(String(left.post.updated)))
        .map(result => result.post);
    } else if (state.activeFilter !== 'recent') {
      posts.sort(state.sort === 'title'
        ? (left, right) => left.title.localeCompare(right.title, 'zh-CN')
        : (left, right) => String(right.updated).localeCompare(String(left.updated)));
    }

    return posts;
  }

  function currentFilterName() {
    if (state.activeFilter === 'favorites') return '我的收藏';
    if (state.activeFilter === 'recent') return '最近阅读';
    if (state.activeFilter.startsWith('category:')) return state.activeFilter.slice('category:'.length);
    return '全部文章';
  }

  function postRow(post) {
    const row = makeElement('article', 'post-row');
    row.dataset.postId = post.id;

    const openButton = makeElement('button', 'post-open');
    openButton.type = 'button';
    openButton.dataset.openPost = post.id;
    openButton.setAttribute('aria-label', `打开文章：${post.title}`);

    const kicker = makeElement('div', 'post-kicker');
    const category = post.categories[0] || '未分类';
    const categoryText = makeElement('span', '', category);
    const date = makeElement('time', '', formatDate(post.updated));
    date.dateTime = post.updated;
    kicker.append(categoryText, date);

    const title = makeElement('h2', 'post-title', post.title);
    const description = makeElement('p', 'post-description', post.description || '暂无摘要');
    const tags = makeElement('div', 'post-tags');
    for (const tag of post.tags.slice(0, 4)) tags.append(makeElement('span', 'post-tag', tag));
    openButton.append(kicker, title, description, tags);

    const favorite = makeElement('button', 'row-favorite', state.favorites.has(post.id) ? '★' : '☆');
    favorite.type = 'button';
    favorite.dataset.favoritePost = post.id;
    favorite.classList.toggle('active', state.favorites.has(post.id));
    favorite.setAttribute('aria-label', state.favorites.has(post.id) ? `取消收藏：${post.title}` : `收藏：${post.title}`);
    favorite.setAttribute('aria-pressed', String(state.favorites.has(post.id)));
    favorite.title = favorite.getAttribute('aria-label');

    row.append(openButton, favorite);
    return row;
  }

  function renderPosts() {
    const posts = filteredPosts();
    const title = state.query ? '搜索结果' : currentFilterName();
    elements.viewTitle.textContent = title;
    elements.viewSummary.textContent = state.query
      ? `找到 ${posts.length} 篇包含“${state.query.trim()}”的文章`
      : `${posts.length} 篇文章，可按标题、标签、别名和正文搜索`;
    elements.emptyState.hidden = posts.length !== 0;
    elements.postList.hidden = posts.length === 0;

    const fragment = document.createDocumentFragment();
    for (const post of posts) fragment.append(postRow(post));
    elements.postList.replaceChildren(fragment);
  }

  function renderLibrary() {
    elements.libraryCount.textContent = `${state.posts.length} 篇文章`;
    renderCategories();
    renderPosts();
  }

  function setFilter(filter) {
    state.activeFilter = filter;
    state.query = '';
    elements.searchInput.value = '';
    closeSidebar();
    showLibrary(true);
    renderLibrary();
  }

  function toggleFavorite(id) {
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    saveArray(STORAGE_KEYS.favorites, state.favorites);
    renderLibrary();
    updateReaderActions();
  }

  function rememberPost(id) {
    state.readingHistory = [id, ...state.readingHistory.filter(item => item !== id)].slice(0, 50);
    saveArray(STORAGE_KEYS.history, state.readingHistory);
    renderCategories();
  }

  function reviewLabel(status) {
    const labels = {
      unverified: '仅经 AI 整理，未经人工核实',
      'partially-verified': '部分内容已经人工核实',
      'human-verified': '已经人工核实'
    };
    return labels[status] || '核实状态未知';
  }

  function updateReaderActions() {
    const post = state.currentPost;
    if (!post) return;
    const favorite = state.favorites.has(post.id);
    elements.favoriteButton.classList.toggle('active', favorite);
    elements.favoriteButton.firstElementChild.textContent = favorite ? '★' : '☆';
    elements.favoriteButton.setAttribute('aria-label', favorite ? '取消收藏文章' : '收藏文章');
    elements.favoriteButton.title = elements.favoriteButton.getAttribute('aria-label');

    if (state.nativeMode) {
      elements.downloadButton.disabled = true;
      elements.downloadButton.classList.add('active');
      elements.downloadButton.querySelector('.action-label').textContent = '本机';
      elements.downloadButton.title = '正文和图片由应用同步后保存在本机';
      return;
    }

    elements.downloadButton.disabled = false;
    const offline = state.offlinePosts.has(post.id);
    elements.downloadButton.classList.toggle('active', offline);
    elements.downloadButton.querySelector('.action-label').textContent = offline ? '已离线' : '离线';
    elements.downloadButton.title = offline ? '已下载，点击检查更新' : '下载以便离线阅读';
  }

  function showReader(post) {
    elements.libraryView.hidden = true;
    elements.readerView.hidden = false;
    elements.readerCategory.textContent = post.categories[0] || '未分类';
    elements.readerTitle.textContent = post.title;
    elements.readerDetails.replaceChildren();

    const updated = makeElement('span', '', `更新于 ${formatDate(post.updated)}`);
    const review = makeElement('span', 'review-badge', reviewLabel(post.reviewStatus));
    elements.readerDetails.append(updated, review);
    if (post.hasMath) elements.readerDetails.append(makeElement('span', '', '包含公式'));
    if (post.tags.length) elements.readerDetails.append(makeElement('span', '', post.tags.slice(0, 4).join(' · ')));

    elements.readerScroll.scrollTop = 0;
    elements.readerLoading.hidden = false;
    elements.readerError.hidden = true;
    elements.readerContent.replaceChildren();
    updateReaderActions();
  }

  function showLibrary(replaceHistory = false) {
    state.loadToken += 1;
    state.currentPost = null;
    elements.readerView.hidden = true;
    elements.libraryView.hidden = false;
    elements.readerContent.replaceChildren();
    if (replaceHistory) window.history.replaceState({ view: 'library', readerDepth: 0 }, '', baseLocation());
  }

  async function cacheResponse(url, response) {
    if (state.nativeMode || !('caches' in window)) return;
    try {
      const cache = await caches.open(CONTENT_CACHE);
      await cache.put(url, response);
    } catch {
      // Reading still works if the browser refuses a cache write.
    }
  }

  async function fetchWithOfflineFallback(url, options = {}) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!state.nativeMode) void cacheResponse(url, response.clone());
      return response;
    } catch (error) {
      if (!state.nativeMode && 'caches' in window) {
        const cached = await caches.match(url);
        if (cached) return cached;
      }
      throw error;
    }
  }

  function safeContent(html) {
    const template = document.createElement('template');
    template.innerHTML = html;

    for (const element of Array.from(template.content.querySelectorAll('*'))) {
      const tag = element.localName.toLowerCase();
      if (DROP_CONTENT_TAGS.has(tag)) {
        element.remove();
        continue;
      }
      if (!SAFE_CONTENT_TAGS.has(tag)) {
        element.replaceWith(...element.childNodes);
        continue;
      }

      for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase();
        if (name === 'href') {
          if (tag !== 'a' || !isSafeLinkUrl(attribute.value)) element.removeAttribute(attribute.name);
        } else if (name === 'src') {
          if (!['img', 'source'].includes(tag) || !isSafeImageUrl(attribute.value)) element.removeAttribute(attribute.name);
        } else if (name === 'srcset') {
          if (!['img', 'source'].includes(tag) || !isSafeSourceSet(attribute.value)) element.removeAttribute(attribute.name);
        } else if (name === 'style') {
          if (tag !== 'svg' || !/^vertical-align:\s*-?(?:\d+(?:\.\d+)?ex|0);?$/i.test(attribute.value.trim())) {
            element.removeAttribute(attribute.name);
          }
        } else if (!SAFE_CONTENT_ATTRIBUTES.has(name) && !name.startsWith('aria-') && !name.startsWith('data-')) {
          element.removeAttribute(attribute.name);
        }
      }
    }
    return template.content;
  }

  function isSafeLinkUrl(value) {
    try {
      const url = new URL(String(value || '').trim(), window.location.origin);
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
    } catch {
      return false;
    }
  }

  function isSafeImageUrl(value) {
    const source = String(value || '').trim();
    if (/^data:image\/(?:gif|jpe?g|png|webp);base64,/i.test(source)) return true;
    try {
      const url = new URL(source, window.location.origin);
      return ['http:', 'https:'].includes(url.protocol) && url.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  function isSafeSourceSet(value) {
    const candidates = String(value || '').split(',').map(item => item.trim()).filter(Boolean);
    return candidates.length > 0 && candidates.every(candidate => isSafeImageUrl(candidate.split(/\s+/, 1)[0]));
  }

  function prepareContent() {
    elements.readerContent.querySelectorAll('img').forEach(image => {
      image.loading = 'lazy';
      image.decoding = 'async';
      if (!image.alt) image.alt = '文章插图';
    });
  }

  async function loadPostContent(post, force = false) {
    const token = ++state.loadToken;
    elements.readerLoading.hidden = false;
    elements.readerError.hidden = true;
    elements.readerContent.replaceChildren();

    try {
      const response = await fetchWithOfflineFallback(absoluteUrl(post.contentUrl), {
        cache: force ? 'reload' : 'no-cache'
      });
      const html = await response.text();
      if (token !== state.loadToken || state.currentPost?.id !== post.id) return;
      elements.readerContent.replaceChildren(safeContent(html));
      prepareContent();
      elements.readerLoading.hidden = true;
    } catch (error) {
      if (token !== state.loadToken) return;
      elements.readerLoading.hidden = true;
      const localPreview = ['127.0.0.1', 'localhost'].includes(window.location.hostname);
      elements.readerErrorMessage.textContent = state.nativeMode
        ? state.nativeSyncState === 'first-online'
          ? '首次使用需要联网下载文档。请连接网络后点击刷新。'
          : '本机还没有这篇正文。请点击刷新同步云端；无法联网时仍可阅读已经保存的其他文章。'
        : localPreview
        ? '本地阅读服务已经停止。请重新双击仓库里的“启动笔记阅读器.cmd”，并保持启动窗口开启。'
        : navigator.onLine
          ? `读取失败：${error.message}`
          : '当前没有网络，而且这篇文章尚未下载。';
      elements.readerError.hidden = false;
    }
  }

  function openPost(post, pushHistory = true) {
    if (!post) return;
    state.currentPost = post;
    rememberPost(post.id);
    showReader(post);
    closeSidebar();
    if (pushHistory) {
      const readerDepth = Math.max(0, Number(window.history.state?.readerDepth) || 0) + 1;
      window.history.pushState({ postId: post.id, readerDepth }, '', `#post=${encodeURIComponent(post.id)}`);
    }
    void loadPostContent(post);
  }

  function findPostForUrl(url) {
    const normalizedPath = siteRelativePath(url);
    return state.posts.find(post => siteRelativePath(post.url) === normalizedPath);
  }

  function returnToLibrary() {
    const readerDepth = Math.max(0, Number(window.history.state?.readerDepth) || 0);
    if (readerDepth > 0) window.history.go(-readerDepth);
    else showLibrary(true);
  }

  function openImage(image) {
    elements.imageDialogImage.src = image.currentSrc || image.src;
    elements.imageDialogImage.alt = image.alt || '文章插图';
    elements.imageDialogCaption.textContent = image.alt || '';
    if (typeof elements.imageDialog.showModal === 'function') elements.imageDialog.showModal();
    else window.open(elements.imageDialogImage.src, '_blank', 'noopener');
  }

  function onContentClick(event) {
    const image = event.target.closest('img');
    if (image) {
      event.preventDefault();
      openImage(image);
      return;
    }

    const anchor = event.target.closest('a[href]');
    if (!anchor || !state.currentPost) return;
    event.preventDefault();
    const href = anchor.getAttribute('href');
    if (!href) return;

    if (href.startsWith('#')) {
      try {
        const target = elements.readerContent.querySelector(`#${CSS.escape(decodeURIComponent(href.slice(1)))}`);
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {
        // Ignore malformed legacy anchors.
      }
      return;
    }

    const targetUrl = new URL(href, absoluteUrl(state.currentPost.url));
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(targetUrl.protocol)) return;
    const post = targetUrl.origin === window.location.origin ? findPostForUrl(targetUrl) : null;
    if (post) {
      openPost(post);
      return;
    }
    window.open(targetUrl.href, '_blank', 'noopener,noreferrer');
  }

  function collectResourceUrls() {
    const urls = new Set();
    if (!state.currentPost) return urls;
    urls.add(absoluteUrl(state.currentPost.contentUrl));

    elements.readerContent.querySelectorAll('img[src], source[src]').forEach(element => {
      const value = element.getAttribute('src');
      if (!value) return;
      const url = new URL(value, window.location.origin);
      if (url.origin === window.location.origin) urls.add(url.href);
    });

    elements.readerContent.querySelectorAll('source[srcset], img[srcset]').forEach(element => {
      const sourceSet = element.getAttribute('srcset') || '';
      for (const candidate of sourceSet.split(',')) {
        const value = candidate.trim().split(/\s+/)[0];
        if (!value) continue;
        const url = new URL(value, window.location.origin);
        if (url.origin === window.location.origin) urls.add(url.href);
      }
    });
    return urls;
  }

  async function cacheUrl(url) {
    const cache = await caches.open(CONTENT_CACHE);
    let response;
    try {
      response = await fetch(url, { cache: 'reload' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      response = await caches.match(url);
      if (!response) throw error;
    }
    await cache.put(url, response.clone());
  }

  async function downloadCurrentPost() {
    const post = state.currentPost;
    if (!post || !('caches' in window)) {
      showNotice('当前浏览器不支持离线下载。');
      return;
    }

    elements.downloadButton.disabled = true;
    const label = elements.downloadButton.querySelector('.action-label');
    const originalLabel = label.textContent;
    label.textContent = '准备中';

    try {
      if (!elements.readerContent.firstElementChild) await loadPostContent(post, true);
      if (!elements.readerContent.firstElementChild) throw new Error('正文没有载入');
      if (navigator.storage?.persist) void navigator.storage.persist();

      const urls = Array.from(collectResourceUrls());
      let completed = 0;
      const queue = [...urls];
      const workers = Array.from({ length: Math.min(3, queue.length) }, async () => {
        while (queue.length) {
          const url = queue.shift();
          await cacheUrl(url);
          completed += 1;
          label.textContent = `${completed}/${urls.length}`;
        }
      });
      await Promise.all(workers);

      state.offlinePosts.add(post.id);
      saveArray(STORAGE_KEYS.offline, state.offlinePosts);
      updateReaderActions();
      showNotice(`《${post.title}》已可离线阅读，共保存 ${urls.length} 个文件。`);
    } catch (error) {
      label.textContent = originalLabel;
      showNotice(`离线下载未完成：${error.message}`, true);
    } finally {
      elements.downloadButton.disabled = false;
      if (state.currentPost?.id === post.id) updateReaderActions();
    }
  }

  async function clearOfflineContent() {
    if (!('caches' in window)) return;
    const confirmed = window.confirm('只删除已经下载的文章和图片。收藏、历史记录和在线文章不会受影响。是否继续？');
    if (!confirmed) return;

    await caches.delete(CONTENT_CACHE);
    state.offlinePosts.clear();
    saveArray(STORAGE_KEYS.offline, state.offlinePosts);
    updateReaderActions();
    showNotice('离线文章和图片已清理。');
  }

  function validatePosts(payload) {
    if (!payload || !Array.isArray(payload.posts)) throw new Error('文章目录格式错误');
    const ids = new Set();
    return payload.posts.filter(post => {
      if (!post || !post.id || !post.url || !post.contentUrl || ids.has(post.id)) return false;
      ids.add(post.id);
      post.categories = Array.isArray(post.categories) ? post.categories : [];
      post.tags = Array.isArray(post.tags) ? post.tags : [];
      post.aliases = Array.isArray(post.aliases) ? post.aliases : [];
      return true;
    });
  }

  async function loadPostIndex(force = false) {
    elements.refreshButton.disabled = true;
    try {
      const response = await fetchWithOfflineFallback(DATA_URL, {
        cache: state.nativeMode ? 'no-store' : force ? 'reload' : 'no-cache'
      });
      const payload = await response.json();
      state.siteRoot = normalizeSiteRoot(payload.siteRoot);
      state.posts = validatePosts(payload);
      const validIds = new Set(state.posts.map(post => post.id));
      state.favorites = new Set(Array.from(state.favorites).filter(id => validIds.has(id)));
      state.offlinePosts = new Set(Array.from(state.offlinePosts).filter(id => validIds.has(id)));
      state.readingHistory = validHistory();
      saveArray(STORAGE_KEYS.favorites, state.favorites);
      saveArray(STORAGE_KEYS.offline, state.offlinePosts);
      saveArray(STORAGE_KEYS.history, state.readingHistory);
      renderLibrary();
      if (force && !state.nativeMode) showNotice(`文章目录已刷新，共 ${state.posts.length} 篇。`);
    } catch (error) {
      if (state.nativeMode) {
        state.nativeSyncState = state.nativeSyncState === 'syncing' ? 'syncing' : 'first-online';
        state.nativeSyncMessage = state.nativeSyncState === 'syncing'
          ? '正在进行首次同步，请稍候…'
          : '首次使用需要联网下载文档';
        updateNetworkStatus();
        elements.libraryCount.textContent = state.nativeSyncState === 'syncing' ? '等待同步' : '暂无本地文档';
        elements.viewSummary.textContent = state.nativeSyncState === 'syncing'
          ? '正在从云端下载第一份本地文档，请稍候…'
          : '首次使用需要连接网络。联网后点击刷新即可下载文档。';
        showNotice(state.nativeSyncMessage, true);
      } else {
        elements.libraryCount.textContent = '读取失败';
        elements.viewSummary.textContent = '无法读取文章目录';
        showNotice(navigator.onLine ? `目录读取失败：${error.message}` : '当前离线，且本机还没有文章目录缓存。', true);
      }
      throw error;
    } finally {
      elements.refreshButton.disabled = state.nativeMode && state.nativeSyncState === 'syncing';
    }
  }

  async function installApplication() {
    if (state.installPrompt) {
      state.installPrompt.prompt();
      await state.installPrompt.userChoice;
      state.installPrompt = null;
      elements.installButton.hidden = true;
      return;
    }

    const appleMobile = /iphone|ipad|ipod/i.test(navigator.userAgent);
    window.alert(appleMobile
      ? '请点击 Safari 的“分享”按钮，然后选择“添加到主屏幕”。'
      : '请打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。');
  }

  function delay(milliseconds) {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
  }

  async function waitForOfflineArticles() {
    for (let attempt = 0; attempt < 180; attempt += 1) {
      const cache = await caches.open(SHELL_CACHE);
      const indexResponse = await cache.match(DATA_URL);
      if (indexResponse) {
        const payload = await indexResponse.json();
        const urls = Array.isArray(payload.posts)
          ? payload.posts.map(post => new URL(post.contentUrl, window.location.origin).href)
          : [];
        if (urls.length > 0) {
          const matches = await Promise.all(urls.map(url => cache.match(url)));
          if (matches.every(Boolean)) return urls.length;
        }
      }
      await delay(250);
    }
    throw new Error('等待正文缓存超时');
  }

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    try {
      showNotice('正在把全部正文保存到本机，请稍候…');
      await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
      const count = await waitForOfflineArticles();
      showNotice(`${count} 篇正文已保存到本机，停止本地服务后仍可阅读。`);
    } catch (error) {
      showNotice(`离线功能初始化失败：${error.message}`, true);
    }
  }

  function normalizeNativeSyncState(value) {
    const normalized = String(value || '').trim().toLowerCase().replace(/_/g, '-');
    if (['syncing', 'checking', 'downloading'].includes(normalized)) return 'syncing';
    if (['synced', 'ready', 'success', 'current', 'up-to-date'].includes(normalized)) return 'synced';
    if (['offline', 'stale'].includes(normalized)) return 'offline';
    if (['empty', 'first-run', 'first-online', 'needs-network'].includes(normalized)) return 'first-online';
    return 'error';
  }

  async function useNativeLocalCopy(detail = '') {
    try {
      await reloadNativeLibrary();
      if (detail) showNotice(detail, true);
      return true;
    } catch {
      return false;
    }
  }

  async function reloadNativeLibrary() {
    const activeId = state.currentPost?.id || '';
    await loadPostIndex(false);
    if (!activeId) return;

    const updatedPost = state.posts.find(post => post.id === activeId);
    if (!updatedPost) {
      showLibrary(true);
      return;
    }
    state.currentPost = updatedPost;
    showReader(updatedPost);
    await loadPostContent(updatedPost, true);
  }

  async function handleNativeSync(syncState, message) {
    if (!state.nativeMode) return;

    const payload = syncState && typeof syncState === 'object' ? syncState : null;
    const nextState = normalizeNativeSyncState(
      payload?.state || payload?.status || payload?.phase || syncState
    );
    const detail = String(payload?.message || message || '').trim();
    state.nativeSyncState = nextState;
    state.nativeSyncMessage = detail;
    updateNetworkStatus();

    if (nextState === 'syncing') {
      elements.refreshButton.disabled = true;
      showNotice(detail || '正在从云端同步文档，请稍候…', true);
      return;
    }

    elements.refreshButton.disabled = false;
    if (nextState === 'synced') {
      try {
        await reloadNativeLibrary();
        showNotice(detail || `云端文档已同步到本机，共 ${state.posts.length} 篇。`);
      } catch (error) {
        state.nativeSyncState = 'first-online';
        state.nativeSyncMessage = `同步完成，但本地文档读取失败：${error.message}`;
        updateNetworkStatus();
        showNotice(state.nativeSyncMessage, true);
      }
      return;
    }

    if (nextState === 'offline') {
      const loaded = await useNativeLocalCopy();
      if (loaded) {
        showNotice(detail || '无法连接云端，正在使用上次同步到本机的版本。', true);
      } else {
        state.nativeSyncState = 'first-online';
        state.nativeSyncMessage = detail || '首次使用需要联网下载文档';
        updateNetworkStatus();
        elements.libraryCount.textContent = '暂无本地文档';
        elements.viewSummary.textContent = '首次使用需要连接网络。联网后点击刷新即可下载文档。';
        showNotice(state.nativeSyncMessage, true);
      }
      return;
    }

    if (nextState === 'first-online') {
      const loaded = await useNativeLocalCopy();
      if (loaded) {
        state.nativeSyncState = 'offline';
        state.nativeSyncMessage = detail || '云端暂时不可用，正在使用本机已有版本';
        updateNetworkStatus();
        showNotice(state.nativeSyncMessage, true);
      } else {
        showNotice(detail || '首次使用需要联网下载文档。连接网络后请点击刷新。', true);
      }
      return;
    }

    const loaded = await useNativeLocalCopy();
    state.nativeSyncState = loaded ? 'offline' : 'first-online';
    state.nativeSyncMessage = detail || (loaded
      ? '云端同步失败，正在使用本机已有版本'
      : '云端同步失败。首次使用需要联网下载文档');
    updateNetworkStatus();
    showNotice(
      state.nativeSyncMessage,
      true
    );
  }

  function requestNativeSync() {
    if (!state.nativeMode) return;
    state.nativeSyncState = 'syncing';
    state.nativeSyncMessage = '正在检查云端文档更新';
    updateNetworkStatus();
    elements.refreshButton.disabled = true;
    showNotice('正在检查云端文档更新，请稍候…', true);

    try {
      if (!window.ZYNative || typeof window.ZYNative.requestSync !== 'function') {
        throw new Error('应用同步服务尚未就绪');
      }
      window.ZYNative.requestSync();
    } catch (error) {
      void handleNativeSync('error', error.message);
    }
  }

  window.__ZY_NATIVE_SYNC__ = (syncState, message) => {
    void handleNativeSync(syncState, message);
  };

  function bindEvents() {
    elements.menuButton.addEventListener('click', () => document.body.classList.toggle('sidebar-open'));
    elements.sidebarScrim.addEventListener('click', closeSidebar);
    elements.refreshButton.addEventListener('click', () => {
      if (state.nativeMode) requestNativeSync();
      else void loadPostIndex(true);
    });
    elements.clearCacheButton.addEventListener('click', () => void clearOfflineContent());
    elements.themeButton.addEventListener('click', () => {
      applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
    elements.installButton.addEventListener('click', () => void installApplication());

    elements.searchInput.addEventListener('input', event => {
      state.query = event.target.value;
      renderPosts();
    });
    elements.sortSelect.addEventListener('change', event => {
      state.sort = event.target.value;
      saveString(STORAGE_KEYS.sort, state.sort);
      renderPosts();
    });
    elements.categoryList.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (button) setFilter(button.dataset.filter);
    });
    elements.postList.addEventListener('click', event => {
      const favorite = event.target.closest('[data-favorite-post]');
      if (favorite) {
        toggleFavorite(favorite.dataset.favoritePost);
        return;
      }
      const open = event.target.closest('[data-open-post]');
      if (open) openPost(state.posts.find(post => post.id === open.dataset.openPost));
    });

    elements.backButton.addEventListener('click', returnToLibrary);
    elements.favoriteButton.addEventListener('click', () => {
      if (state.currentPost) toggleFavorite(state.currentPost.id);
    });
    elements.downloadButton.addEventListener('click', () => void downloadCurrentPost());
    elements.externalButton.addEventListener('click', () => {
      if (state.currentPost) window.open(absoluteUrl(state.currentPost.url), '_blank', 'noopener,noreferrer');
    });
    elements.retryButton.addEventListener('click', () => {
      if (state.nativeMode) requestNativeSync();
      else if (state.currentPost) void loadPostContent(state.currentPost, true);
    });
    elements.readerContent.addEventListener('click', onContentClick);

    elements.imageDialogClose.addEventListener('click', () => elements.imageDialog.close());
    elements.imageDialog.addEventListener('click', event => {
      if (event.target === elements.imageDialog) elements.imageDialog.close();
    });

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    window.addEventListener('popstate', () => {
      const id = hashPostId();
      if (!id) {
        showLibrary(false);
        return;
      }
      const post = state.posts.find(item => item.id === id);
      if (post) openPost(post, false);
      else showLibrary(true);
    });
    window.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (state.currentPost) showLibrary(true);
        elements.searchInput.focus();
      } else if (event.key === 'Escape' && document.body.classList.contains('sidebar-open')) {
        closeSidebar();
      }
    });

    window.addEventListener('beforeinstallprompt', event => {
      if (state.nativeMode) return;
      event.preventDefault();
      state.installPrompt = event;
      elements.installButton.hidden = false;
    });
    window.addEventListener('appinstalled', () => {
      state.installPrompt = null;
      elements.installButton.hidden = true;
      showNotice('知识笔记已经安装。');
    });
  }

  async function start() {
    initializeTheme();
    updateNetworkStatus();
    elements.sortSelect.value = state.sort === 'title' ? 'title' : 'updated';
    elements.installButton.hidden = isStandalone() || state.nativeMode;
    elements.clearCacheButton.hidden = state.nativeMode;
    if (state.nativeMode) {
      elements.refreshButton.setAttribute('aria-label', '同步云端文档');
      elements.refreshButton.title = '同步云端文档';
    }
    bindEvents();
    if (!state.nativeMode) void registerServiceWorker();

    try {
      await loadPostIndex();
    } catch {
      return;
    }

    const requestedView = new URLSearchParams(window.location.search).get('view');
    if (requestedView === 'favorites') state.activeFilter = 'favorites';
    renderLibrary();

    const initialPostId = hashPostId();
    if (initialPostId) {
      const post = state.posts.find(item => item.id === initialPostId);
      window.history.replaceState({ view: 'library', readerDepth: 0 }, '', baseLocation());
      if (post) openPost(post, true);
    } else {
      window.history.replaceState({ view: 'library', readerDepth: 0 }, '', window.location.href);
    }
  }

  void start();
})();
