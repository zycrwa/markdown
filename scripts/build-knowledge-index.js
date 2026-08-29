'use strict';

const fs = require('node:fs');
const path = require('node:path');
const frontMatter = require('hexo-front-matter');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'source', '_posts');
const INDEX_PATH = path.join(ROOT, 'KNOWLEDGE_INDEX.md');

function array(value) {
  return Array.isArray(value) ? value : [];
}

function inline(values) {
  return values.length ? values.join('、') : '无';
}

function loadPosts() {
  return fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .sort((left, right) => left.localeCompare(right, 'en'))
    .map(file => {
      const filePath = path.join(POSTS_DIR, file);
      const data = frontMatter.parse(fs.readFileSync(filePath, 'utf8'));
      return {
        id: path.basename(file, '.md'),
        file,
        title: data.title || '',
        description: data.description || '',
        category: array(data.categories)[0] || '未分类',
        tags: array(data.tags),
        aliases: array(data.aliases),
        relatedPosts: array(data.related_posts),
        sourceDocs: array(data.source_docs),
        reviewStatus: data.review_status || 'missing'
      };
    });
}

function buildIndex(posts = loadPosts()) {
  const lines = [
    '# AI 知识库索引',
    '',
    '> 本文件由 `npm run knowledge:index` 根据文章 Front Matter 自动生成，请勿手工编辑。',
    '',
    'AI 处理新资料时，应先在本索引中按标题、别名、标签和范围筛选候选文章，再精读候选正文。相同主题优先合并，边界不同但有关联的主题通过 `related_posts` 连接。',
    '',
    '## 概览',
    '',
    '| ID | 标题 | 分类 | 审核状态 |',
    '| --- | --- | --- | --- |',
    ...posts.map(post => `| \`${post.id}\` | ${post.title} | ${post.category} | \`${post.reviewStatus}\` |`),
    '',
    '## 检索信息',
    ''
  ];

  for (const post of posts) {
    lines.push(
      `### ${post.title}`,
      '',
      `- ID：\`${post.id}\``,
      `- 文件：\`source/_posts/${post.file}\``,
      `- 范围：${post.description}`,
      `- 别名：${inline(post.aliases)}`,
      `- 标签：${inline(post.tags)}`,
      `- 关联文章：${post.relatedPosts.length ? post.relatedPosts.map(id => `\`${id}\``).join('、') : '无'}`
    );
    if (post.sourceDocs.length) {
      lines.push(`- 原稿：${post.sourceDocs.map(file => `\`${file}\``).join('、')}`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  const posts = loadPosts();
  fs.writeFileSync(INDEX_PATH, buildIndex(posts), 'utf8');
  console.log(`知识索引已更新：${posts.length} 篇文章。`);
}

if (require.main === module) main();

module.exports = { INDEX_PATH, buildIndex, loadPosts };
