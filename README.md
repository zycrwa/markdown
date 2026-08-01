# ZY 的技术笔记

这是一个使用 [Hexo](https://hexo.io/zh-cn/) 生成并部署到 GitHub Pages 的静态博客。

线上地址：<https://zycrwa.github.io/markdown/>

## 快速使用

### 1. 新建文章

```bash
npm run new -- "文章标题"
```

Hexo 会在 `source/_posts/` 中创建 Markdown 文件。也可以直接在该目录中手动新建 `.md` 文件。

> 文章必须放在 `source/_posts/`。

### 2. 编写文章

每篇文章开头必须包含 Front Matter。可以使用下面的完整模板：

````markdown
---
title: 我的新文章
date: 2026-08-01 22:00:00
categories:
  - 学习笔记
tags:
  - Hexo
  - GitHub Pages
---

这里是文章简介。

## 二级标题

这里是正文，可以使用普通 Markdown 语法。

- 列表项目一
- 列表项目二

```c
#include <stdio.h>

int main(void) {
    printf("Hello, Hexo!\n");
    return 0;
}
```
````

Front Matter 字段说明：

- `title`：网页上显示的文章标题。
- `date`：发布时间，格式为 `年-月-日 时:分:秒`。
- `categories`：文章分类，可以不填。
- `tags`：文章标签，可以不填。

建议文件使用 UTF-8 编码，文件名使用简短的英文和连字符，例如 `git-basic-notes.md`。

### 3. 本地预览

```bash
npm run server
```

浏览器访问：

```text
http://localhost:4000/markdown/
```

确认文章显示正常后，在运行服务器的终端按 `Ctrl+C` 关闭预览服务。

### 4. 提交 Markdown 原稿

```bash
git add source/_posts
git commit -m "Add new post"
git push origin master
```

这一步把 Markdown 原稿保存到 GitHub 的 `master` 分支，但还不会更新线上网页。

### 5. 发布网站

```bash
npm run deploy
```

该命令会自动清理旧文件、生成网页，并把生成结果推送到 `gh-pages` 分支。通常等待几秒到一分钟后即可看到更新：

<https://zycrwa.github.io/markdown/>

## 首次安装

环境要求：

- Node.js 20.19.0 或更高版本
- npm 10 或更高版本
- Git

克隆仓库后安装依赖：

```bash
npm install
```

Hexo CLI 已作为项目依赖安装，不需要全局安装 `hexo-cli`。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run new -- "文章标题"` | 新建 Markdown 文章 |
| `npm run server` | 启动本地预览服务器 |
| `npm run build` | 生成静态文件到 `public/` |
| `npm run clean` | 清理生成文件和缓存 |
| `npm run deploy` | 重新生成并发布到 GitHub Pages |

`npm run deploy` 已经包含构建步骤，正常发布时不需要提前执行 `npm run build`。

## 目录说明

```text
source/_posts/  Markdown 文章原稿
scaffolds/      新文章模板
public/         Hexo 生成的网页，不需要手动提交
_config.yml     Hexo 网站和部署配置
_config.next.yml NexT 主题配置
source/_data/   NexT 自定义样式
package.json    npm 命令及项目依赖
```

不要直接修改 `public/`，因为每次构建时其中的文件都会被重新生成。

## 网站外观

本站使用 NexT 的 Gemini 布局，已经启用分类、标签、关于、站内搜索、代码复制和阅读进度。菜单、头像、布局及这些功能都可以在 `_config.next.yml` 中修改；网站标题、地址和发布设置仍在 `_config.yml` 中修改。

## 分支与发布原理

| 分支 | 保存内容 | 用途 |
| --- | --- | --- |
| `master` | Markdown、Hexo 配置和依赖 | 保存博客源码 |
| `gh-pages` | HTML、CSS、JavaScript 和图片 | 由 GitHub Pages 对外发布 |

完整流程如下：

```text
source/_posts/*.md
        ↓ Hexo 生成
public/
        ↓ npm run deploy
gh-pages 分支
        ↓ GitHub Pages
https://zycrwa.github.io/markdown/
```

## GitHub Pages 设置

仓库的 `Settings -> Pages` 应设置为：

- `Source`：`Deploy from a branch`
- `Branch`：`gh-pages`
- 目录：`/ (root)`

## 常见问题

### 端口 4000 被占用

先关闭之前运行的预览服务，或者换一个端口：

```bash
npm run server -- --port 4001
```

然后访问 `http://localhost:4001/markdown/`。

### 发布后没有立即更新

GitHub Pages 通常需要几秒到一分钟处理新内容。稍等后强制刷新浏览器，再检查 `gh-pages` 分支是否产生了新的部署提交。
