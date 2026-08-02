# AI 知识入库规则

本仓库中的文章默认由 AI 辅助整理。处理新资料时，必须遵循以下流程。

1. 原始资料只进入 `inbox/`，不要直接复制到 `source/_posts/`。
2. 先阅读 `KNOWLEDGE_INDEX.md`，按标题、分类、标签和别名筛选候选文章，再精读候选正文。
3. 优先把相同主题合并到已有文章；只有没有合适主文章时才新建文章。有关联但边界不同的主题保持独立，并维护双方的 `related_posts`。
4. 入库前将原稿移动到 `archive/incoming/YYYY-MM-DD/`，并把归档路径加入目标文章的 `source_docs`。
5. 保留原资料中的来源链接、条件和不确定性。AI 不得把未核实的推断写成确定事实；仅经 AI 整理的文章使用 `review_status: unverified`。
6. 图片必须本地化到 `source/images/posts/<文章英文 ID>/`，不得在发布正文中保留远程图片引用。
7. 英文文件名去掉 `.md` 后就是文章 ID。新增或修改文章时必须维护 `updated`、`description`、`aliases`、`related_posts`、`source_docs` 和 `review_status`。
8. 完成后依次运行 `npm run knowledge:index`、`npm run check:posts` 和 `npm run build`。
9. 未经用户明确要求，不执行提交、推送或 `npm run deploy`。

`scripts/organize-posts.js` 和 `scripts/localize-post-images.js` 是首次迁移使用的历史脚本，不得再次对当前知识库运行。
