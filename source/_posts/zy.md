---
title: 我的第一篇 Hexo 发布练习
date: 2026-08-01 22:07:22
categories:
  - 博客搭建
tags:
  - Hexo
  - GitHub Pages
---

这是我通过 Hexo 发布的一篇练习文章。

## 文章原稿在哪里

这篇文章的 Markdown 原稿保存在：

```text
source/_posts/hexo-publishing-practice.md
```

Hexo 只读取 `source/_posts/` 中的文章，根目录原有的 `docs/` 不属于当前博客的文章来源。

## 发布时发生了什么

1. Hexo 读取 Markdown 原稿。
2. Hexo 根据主题生成 HTML、CSS 等静态文件。
3. 生成结果暂时保存在 `public/`。
4. 部署工具把 `public/` 推送到 GitHub 的 `gh-pages` 分支。
5. GitHub Pages 将 `gh-pages` 中的网页发布到公网。

这说明我们平时只需要维护 Markdown 原稿，不需要手工编写生成后的 HTML。
