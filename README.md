# ZY 的技术笔记

这是一个使用 [Hexo](https://hexo.io/zh-cn/) 生成并部署到 Gitee Pages 的静态博客。

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

## 发布到 Gitee Pages

部署配置会将 `public/` 的内容推送到当前 Gitee 仓库的 `pages` 分支：

```bash
npm run deploy
```

首次发布后，在 Gitee 仓库的“服务 -> Gitee Pages”中选择 `pages` 分支和根目录，点击启动或更新。站点地址为：

```text
https://zy19917620057.gitee.io/markdown/
```

源码保存在 `master` 分支，生成的网站保存在 `pages` 分支，两者互不覆盖。
