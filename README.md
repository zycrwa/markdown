# ZY 的技术知识库

这是一个由 AI 辅助整理、使用 [Hexo](https://hexo.io/zh-cn/) 生成并部署到 GitHub Pages 的知识库。

线上地址：<https://zycrwa.github.io/markdown/>

## 日常使用：把新资料交给 AI

以后不要先判断资料属于哪篇文章，也不要把原稿直接放进 `source/_posts/`。只需要完成下面四步。

### 1. 把原始资料放进 inbox

建议一个主题使用一个子目录，Markdown、图片和附件放在一起：

```text
inbox/
  motor-current-loop/
    notes.md
    waveform.png
```

原稿可以是零散笔记，不要求 Front Matter，也不要求提前整理好格式。为了让 AI 少猜测，尽量保留：

- 想解决的问题和使用场景；
- 原始结论、计算过程、代码和参数单位；
- 参考链接、书名、数据手册型号等来源；
- 尚未确认、互相冲突或需要验证的内容；
- 图片的含义，而不只是一个没有说明的文件。

不要放入密码、密钥、个人隐私、无权公开的资料、视频或大型安装包。

### 2. 让 AI 检索并入库

资料放好后，可以直接对 AI 说：

```text
处理 inbox/motor-current-loop 中的新资料。先检索现有知识库，判断应该合并到已有文章还是新建文章；保留来源和不确定性，本地化图片，更新知识索引并完成检查和构建。先不要提交、推送或发布。
```

AI 会按照 [AGENTS.md](AGENTS.md) 的规则执行以下工作：

1. 先读 `KNOWLEDGE_INDEX.md`，再精读最相关的已有文章；
2. 相同主题优先合并，只有没有合适文章时才新建；
3. 重写结构和表述，去重并补充必要的上下文，不简单复制原稿；
4. 冲突或未经验证的结论会明确标记，不会被改写成确定事实；
5. 原稿归档到 `archive/incoming/YYYY-MM-DD/`，图片保存到仓库内；
6. 更新文章元数据和知识索引，并运行文档检查与 Hexo 构建。

默认情况下，AI 不会替你提交、推送或部署。

### 3. 检查和预览结果

先查看 AI 改了什么：

```bash
git status
git diff
```

需要浏览器预览时运行：

```bash
npm run server
```

访问 `http://localhost:4000/markdown/`。确认后，在运行服务器的终端按 `Ctrl+C` 停止预览。端口被占用时可改用：

```bash
npm run server -- --port 4001
```

此时访问 `http://localhost:4001/markdown/`。

### 4. 保存源码并发布

确认没有密钥、隐私或误加入的大文件后再提交：

```bash
git add -A
git status
git commit -m "docs: update knowledge base"
git push origin master
npm run deploy
```

`git push` 保存 Markdown、图片、索引和配置；`npm run deploy` 生成网页并把结果推送到 `gh-pages` 分支。GitHub Pages 通常会在几秒到一分钟后更新。

## 原始资料怎么写

原始资料不必像正式文章。信息完整比排版漂亮更重要，可以参考下面的可选结构：

```markdown
# 主题或暂定标题

## 我想解决的问题

说明应用场景、目标和已知条件。

## 原始记录

放入笔记、公式、代码、实验现象、参数和自己的推理。

## 来源

- [资料名称](https://example.com)
- 数据手册型号、书名和页码

## 待确认

- 哪些结论没有实际验证？
- 哪些资料互相冲突？
```

如果一批资料包含多个互不相关的主题，拆成多个 `inbox/` 子目录会让归类更准确。关于同一问题的文字、代码和图片则应放在同一子目录中。

## AI 如何决定合并还是新建

- 与已有文章解决同一个核心问题：合并到已有文章，并重新组织相关章节。
- 只是补充例子、参数、代码或另一种解释：通常仍然合并。
- 主题有关联，但目标、前提或读者任务明显不同：新建文章，并通过 `related_posts` 双向关联。
- 新资料与旧结论冲突：保留适用条件和来源，明确列出差异，等待验证。
- 只有 AI 整理、尚未人工验证：保持 `review_status: unverified`。

英文文件名去掉 `.md` 后就是稳定的文章 ID。标题可以调整，但不要因为标题变化随意重命名文件或修改永久链接。

## 首次安装

环境要求：

- Node.js 20.19.0 或更高版本；
- npm 10 或更高版本；
- Git。

克隆仓库后安装依赖：

```bash
npm install
```

Hexo CLI 已作为项目依赖安装，不需要全局安装 `hexo-cli`。

## 手动维护文章

AI 入库是默认方式。确实需要手动新建文章时，可以运行：

```bash
npm run new -- "文章标题"
```

该命令会在 `source/_posts/` 中生成带占位值的文件。发布前必须替换所有占位值、归档原稿、更新知识索引并通过检查，不能直接发布模板内容。

完整的文章结构如下：

````markdown
---
title: "电流环带宽与 PI 参数整定"
date: 2026-08-02 10:00:00
updated: 2026-08-02 10:00:00
description: "覆盖电流环带宽选择和 PI 参数推导；速度环整定与电机参数测量由关联文章维护。"
permalink: motor-control/current-loop-pi-tuning/
categories:
  - 电机控制
tags:
  - PMSM
  - 电流环
  - PI 控制
aliases:
  - 电流环 PI
  - Current Loop Tuning
related_posts:
  - three-phase-pmsm
  - pmsm-speed-loop-pi-tuning
source_docs:
  - archive/incoming/2026-08-02/motor-current-loop/notes.md
review_status: unverified
toc: true
mathjax: true
---

这里用一段话说明文章解决的问题、适用条件和主要内容。

<!-- more -->

## 二级标题

正文从二级标题开始，可以使用普通 Markdown、代码块和公式。

```c
#include <stdio.h>

int main(void) {
    printf("Hello, Hexo!\n");
    return 0;
}
```
````

Front Matter 字段说明：

| 字段 | 要求 |
| --- | --- |
| `title` | 网页标题，可以使用中文 |
| `date` | 首次发布或首次入库时间，格式为 `年-月-日 时:分:秒` |
| `updated` | 正文知识最后一次实质修改的时间，不能早于 `date` |
| `description` | 说明覆盖范围以及不覆盖的相邻主题，至少 20 个字符 |
| `permalink` | 唯一永久链接，使用英文并以 `/` 结尾 |
| `categories` | 至少一个分类 |
| `tags` | 至少一个便于检索的标签 |
| `aliases` | 中英文全称、缩写和常见别名；没有时写 `[]` |
| `related_posts` | 相关文章 ID；没有时写 `[]`，有关联时必须双向维护 |
| `source_docs` | 至少一个真实存在于 `archive/` 下的原稿路径 |
| `review_status` | 审核状态，只能使用下表中的三个值 |
| `toc` | 是否显示目录，只能写 `true` 或 `false` |
| `mathjax` | 使用公式时写 `true`，没有公式时可以省略 |

审核状态：

| 值 | 含义 |
| --- | --- |
| `unverified` | 经过 AI 整理，但技术结论尚未人工核验 |
| `partially-verified` | 只有部分结论、公式或实验结果已核验 |
| `human-verified` | 全文已由人工按照来源或实验完成核验 |

文章正文应包含 `<!-- more -->` 作为首页摘要分隔符。文件统一使用 UTF-8 编码，文件名使用小写英文、数字和连字符，例如 `current-loop-pi-tuning.md`。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run knowledge:index` | 根据全部文章元数据重建 `KNOWLEDGE_INDEX.md` |
| `npm run check:posts` | 检查元数据、关联、原稿、图片、公式、标题和知识索引 |
| `npm run build` | 检查通过后生成静态网页到 `public/` |
| `npm run server` | 启动本地预览服务器 |
| `npm run clean` | 清理 Hexo 生成文件和缓存 |
| `npm run deploy` | 检查、重新生成并发布到 GitHub Pages |
| `npm run new -- "文章标题"` | 手动创建带占位值的文章 |

文章或其元数据变化后，应依次运行：

```bash
npm run knowledge:index
npm run check:posts
npm run build
```

`build` 和 `deploy` 都会先运行检查，但不会自动改写知识索引；索引过期时会停止并提示运行 `npm run knowledge:index`。

## 目录说明

```text
AGENTS.md                         后续 AI 必须遵守的入库规则
inbox/                            尚未整理的原始资料
KNOWLEDGE_INDEX.md                自动生成的知识检索索引
archive/original-posts/           第一次迁移前的原稿
archive/incoming/YYYY-MM-DD/      后续每次入库后的原稿归档
source/_posts/                    整理完成、可发布的 Markdown 文章
source/images/posts/<文章 ID>/    正文使用的本地图片
scaffolds/                        Hexo 新文章模板
scripts/                          索引、检查及历史迁移脚本
public/                           Hexo 生成的网页，不手工修改或提交
_config.yml                       Hexo 网站和部署配置
_config.next.yml                  NexT 主题配置
source/_data/                     NexT 自定义样式
package.json                      npm 命令及项目依赖
```

`scripts/organize-posts.js` 和 `scripts/localize-post-images.js` 只用于第一次迁移，不要再次对当前知识库运行。

## 图片和仓库容量

发布正文中的远程图片应下载到 `source/images/posts/<文章 ID>/`，避免外链失效。图片应裁掉无关区域并适度压缩；不要把视频、安装包、工程构建产物或重复原图提交到仓库。Git 会永久保留历史版本，因此反复提交大文件会比当前目录大小更快地增加仓库体积。

可以用下面的命令查看 Git 对象和工作目录的大致体积：

```bash
git count-objects -vH
Get-ChildItem -Recurse -File | Measure-Object -Property Length -Sum
```

## 网站外观

本站使用 NexT 的 Gemini 布局，已启用分类、标签、关于、站内搜索、代码复制和阅读进度。菜单、头像、布局及这些功能在 `_config.next.yml` 中修改；网站标题、地址和发布设置在 `_config.yml` 中修改。

## 分支与发布原理

| 分支 | 保存内容 | 用途 |
| --- | --- | --- |
| `master` | Markdown、图片、原稿归档、Hexo 配置和依赖 | 保存知识库源码 |
| `gh-pages` | HTML、CSS、JavaScript 和图片 | 由 GitHub Pages 对外发布 |

```text
inbox/ 中的原始资料
        ↓ AI 检索、合并或新建、归档
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

- `Source`：`Deploy from a branch`；
- `Branch`：`gh-pages`；
- 目录：`/ (root)`。

发布后如未立即更新，稍等后强制刷新浏览器，并检查 `gh-pages` 分支是否产生了新的部署提交。
