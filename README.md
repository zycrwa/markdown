# ZY 的技术笔记

这是一个使用 [Hexo](https://hexo.io/zh-cn/) 生成并部署到 GitHub Pages 的静态博客。

## 环境要求

- Node.js 20.19.0 或更高版本
- npm 10 或更高版本
- Git

本项目已经把 Hexo CLI 安装为本地开发依赖，因此不需要全局安装 `hexo-cli`。所有命令均通过 `npm` 运行，方便不同电脑使用同一版本。

## 本地使用

```bash
npm install
npm run server
```

浏览器访问 `http://localhost:4000/markdown/`。

新建文章：

```bash
npm run new -- "文章标题"
```

文章保存在 `source/_posts/`。生成静态文件：

```bash
npm run build
```

生成结果位于 `public/`。

## 发布到 GitHub Pages

部署配置会将 `public/` 的内容推送到 GitHub 仓库的 `gh-pages` 分支：

```bash
npm run deploy
```

首次发布后，在 GitHub 仓库的 `Settings -> Pages` 中，将 `Source` 设为 `Deploy from a branch`，选择 `gh-pages` 分支和根目录 `/ (root)`。站点地址为：

```text
https://zycrwa.github.io/markdown/
```

源码保存在 `master` 分支，生成的网站保存在 `gh-pages` 分支，两者互不覆盖。
