'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'source', '_posts');
const IMAGES_DIR = path.join(ROOT, 'source', 'images', 'posts');
const MANIFEST_FILE = path.join(__dirname, 'post-image-manifest.json');
const SITE_IMAGE_ROOT = '/images/posts';

const POST_SLUGS = {
  'AD使用.md': 'altium-designer-notes',
  'STM32_CLION.md': 'stm32-clion-development',
  'dengfoc学习笔记-常用foc代码.md': 'dengfoc-control-code',
  'pmsm自动控制原理.md': 'pmsm-control-basics',
  'simulink仿真.md': 'simulink-motor-simulation',
  'word使用.md': 'word-formatting-notes',
  '三相永磁同步电机.md': 'three-phase-pmsm',
  '元器件关键参数.md': 'component-selection-parameters',
  '双三相永磁同步电机.md': 'dual-three-phase-pmsm',
  '基础元器件.md': 'semiconductor-basics',
  '嵌入式.md': 'embedded-communication-protocols',
  '嵌入式基础知识.md': 'embedded-system-basics',
  '永磁同步电机谐波分析.md': 'pmsm-harmonic-analysis',
  '滤波器设计.md': 'analog-filter-design',
  '电机电源.md': 'motor-drive-power-supply',
  '电机疑问讨论.md': 'motor-engineering-questions',
  '电机驱动PCB-翻译总结.md': 'motor-drive-pcb-layout',
  '转速环PI参数整定.md': 'pmsm-speed-loop-pi-tuning'
};

const IMAGE_PATTERN = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;
const EXTENSIONS = new Map([
  ['image/gif', '.gif'],
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/svg+xml', '.svg'],
  ['image/webp', '.webp']
]);

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function fetchImage(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          referer: 'https://www.yuque.com/',
          'user-agent': 'Mozilla/5.0 (compatible; Hexo image migration)'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const contentType = (response.headers.get('content-type') || '').split(';')[0].toLowerCase();
      const extension = EXTENSIONS.get(contentType);
      if (!extension) throw new Error(`unsupported content type: ${contentType || 'missing'}`);

      const data = Buffer.from(await response.arrayBuffer());
      if (!data.length) throw new Error('empty response body');
      return { contentType, data, extension };
    } catch (error) {
      lastError = error;
      if (attempt < 3) await sleep(attempt * 750);
    }
  }
  throw new Error(`${url}: ${lastError.message}`);
}

async function runPool(items, concurrency, worker) {
  let nextIndex = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      await worker(items[index], index);
    }
  });
  await Promise.all(runners);
}

async function main() {
  const posts = [];
  const jobs = [];

  for (const [file, slug] of Object.entries(POST_SLUGS)) {
    const filePath = path.join(POSTS_DIR, file);
    const source = await fs.readFile(filePath, 'utf8');
    const urls = [...source.matchAll(IMAGE_PATTERN)].map(match => match[2]);
    const uniqueUrls = [...new Set(urls)];

    posts.push({ file, filePath, slug, source });
    uniqueUrls.forEach((url, index) => jobs.push({ file, index: index + 1, slug, url }));
  }

  const localized = new Map();
  const manifest = [];

  await runPool(jobs, 6, async job => {
    const { contentType, data, extension } = await fetchImage(job.url);
    const hash = crypto.createHash('sha256').update(job.url).digest('hex').slice(0, 10);
    const filename = `${String(job.index).padStart(3, '0')}-${hash}${extension}`;
    const outputDir = path.join(IMAGES_DIR, job.slug);
    const outputFile = path.join(outputDir, filename);
    const sitePath = `${SITE_IMAGE_ROOT}/${job.slug}/${filename}`;

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputFile, data);
    localized.set(`${job.file}\0${job.url}`, sitePath);
    manifest.push({
      article: job.file,
      bytes: data.length,
      contentType,
      localPath: sitePath,
      sourceUrl: job.url
    });
  });

  for (const post of posts) {
    let imageNumber = 0;
    const rewritten = post.source.replace(IMAGE_PATTERN, (match, alt, url) => {
      imageNumber++;
      const sitePath = localized.get(`${post.file}\0${url}`);
      if (!sitePath) throw new Error(`missing localized path for ${post.file}: ${url}`);
      const effectiveAlt = alt.trim() || `${post.slug} 插图 ${imageNumber}`;
      return `![${effectiveAlt}](${sitePath})`;
    });
    await fs.writeFile(post.filePath, rewritten, 'utf8');
  }

  manifest.sort((left, right) => left.article.localeCompare(right.article) || left.localPath.localeCompare(right.localPath));
  await fs.writeFile(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  const totalBytes = manifest.reduce((sum, image) => sum + image.bytes, 0);
  console.log(`Localized ${manifest.length} article images (${(totalBytes / 1024 / 1024).toFixed(1)} MiB).`);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
