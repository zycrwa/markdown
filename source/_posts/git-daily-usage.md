---
title: "Git 日常使用指南"
date: 2026-08-03 22:00:00
updated: 2026-08-24 19:56:00
description: "整理 Git 日常工作流、分支与提交原理、差异复核、历史查看、Merge Request，以及 pre-commit 和 GitLab CI 排错。"
permalink: git/daily-usage/
categories:
  - 开发工具
tags:
  - Git
  - 版本控制
  - GitLab
aliases:
  - Git 日常使用
  - Git 工作流
  - GitLab MR
  - Git 分支与提交
  - Git CI 排错
related_posts:
  - motor-embedded-software-roadmap
review_status: unverified
toc: true
mathjax: false
---

本指南整理 Git 日常工作场景，覆盖分支管理、差异检查、提交、推送、Merge Request、临时保存修改、历史查看，以及 pre-commit 和 GitLab CI 排错。

<!-- more -->

> 建议先阅读“日常使用篇”。它覆盖绝大多数开发场景；遇到特殊问题时，再查后面的详细说明和进阶内容。

## 日常使用篇：最常用功能

### 1. 开始工作前查看状态

进入仓库后，首先执行：

```bash
git status -sb
git branch --show-current
```

重点确认：

- 当前在哪个分支。
- 是否有未提交的修改。
- 本地分支是否领先或落后远程分支。

如果输出中出现 `ahead 2`，表示本地有 2 个 Commit 尚未推送；出现 `behind 2`，表示远程有 2 个 Commit 尚未更新到本地。

### 2. 更新 develop 并创建自己的分支

开始新功能前，推荐执行：

```bash
git switch develop
git fetch origin
git pull --ff-only origin develop
git switch -c feature/my-feature
```

含义分别是：

1. 切换到本地 `develop`。
2. 获取远程仓库的最新信息。
3. 将本地 `develop` 快进到远程最新版本。
4. 以当前 `develop` 为起点创建并切换到新分支。

分支名应描述工作内容。本项目使用连字符，不要使用下划线：

```text
feature/add-motor-log
bugfix/fix-encoder-init
```

### 3. 修改后查看代码差异

查看所有尚未暂存的修改：

```bash
git diff
```

查看某个文件：

```bash
git diff firmware/driver/drv_adc/drv_adc.c
```

查看简要状态：

```bash
git status -sb
```

提交前不要只看文件名，还应查看具体代码差异，避免把调试代码和无关修改一起提交。

### 4. 格式化修改过的 C/C++ 文件

如果目标项目在仓库根目录提供 `.clang-format`，提交 C/C++ 文件前应按项目要求格式化：

```bash
clang-format --style=file:./.clang-format -i firmware/driver/drv_adc/drv_adc.c
```

检查格式但不修改文件：

```bash
clang-format --style=file:./.clang-format --dry-run --Werror firmware/driver/drv_adc/drv_adc.c
```

其中 `./.clang-format` 表示使用当前目录下的格式配置文件。具体路径和是否必须执行，应以目标项目的贡献规范与 CI 配置为准。

### 5. 将修改加入暂存区

暂存整个文件：

```bash
git add firmware/driver/drv_adc/drv_adc.c
```

如果一个文件中包含多类修改，可以交互式地逐块选择：

```bash
git add -p firmware/driver/drv_adc/drv_adc.c
```

`git add -p` 中最常用的选择：

- `y`：暂存当前修改块。
- `n`：不暂存当前修改块。
- `s`：尝试把当前修改块继续拆小。
- `e`：手动编辑要暂存的内容。
- `q`：退出。

没有被选择的修改不会丢失，仍然保留在工作区。

### 6. 提交前检查暂存内容

查看下一次 Commit 实际包含什么：

```bash
git diff --cached
git diff --cached --check
git status
```

需要理解两个命令的区别：

- `git diff`：工作区与暂存区之间的差异。
- `git diff --cached`：暂存区与上一次 Commit 之间的差异，也就是下一次 Commit 将包含的内容。

如果格式化工具修改了已经暂存的文件，需要再次执行 `git add`，让暂存区使用格式化后的版本。

### 7. 创建 Commit

```bash
git commit -m "feat: add ADC version definitions"
```

常见提交类型：

- `feat`：增加功能。
- `fix`：修复问题。
- `refactor`：重构代码，但不改变功能。
- `docs`：修改文档。
- `style`：只调整代码格式。
- `test`：增加或修改测试。

若目标项目配置了 pre-commit hook，提交时可能自动运行检查。如果看到：

```text
files were modified by this hook
```

说明格式化工具已经修改了文件，当前提交会停止。这不是代码丢失，也不是 Git 故障。应执行：

```bash
git diff
git add path/to/formatted-file
git diff --cached
git commit -m "原来的提交信息"
```

### 8. 推送自己的分支

第一次推送本地分支：

```bash
git push -u origin feature/my-feature
```

`-u` 会建立本地分支与远程分支的跟踪关系。以后在这个分支上可以直接执行：

```bash
git push
```

推送后可以使用下面的命令确认状态：

```bash
git status -sb
git log --oneline --decorate -5
```

### 9. 在 GitLab 创建 Merge Request

推送完成后，在 GitLab 中创建 Merge Request：

1. 源分支选择自己的功能或修复分支。
2. 目标分支通常选择 `develop`，但应以项目要求为准。
3. 检查提交内容和文件差异。
4. 等待 `style-test`、编译等流水线通过。
5. 处理审查意见和冲突。
6. 由有权限的人员执行合并。

分支从哪里创建，并不限制它只能合并回哪里；能否合并到目标分支取决于代码差异、冲突和团队规范。

### 10. 拉取远程已有分支

先更新远程信息：

```bash
git fetch origin
```

如果本地还没有该分支：

```bash
git switch -c feature/example --track origin/feature/example
```

较新版本的 Git 通常也可以直接执行：

```bash
git switch feature/example
```

Git 会根据同名远程分支自动建立本地跟踪分支。

### 11. 暂时保存未完成的修改

需要切换分支，但当前修改还不能提交时：

```bash
git stash push -u -m "wip: unfinished ADC changes"
```

恢复修改：

```bash
git stash pop
```

执行前后都应使用 `git status` 检查状态。

### 12. 最常用命令速查

| 目的 | 命令 |
| --- | --- |
| 查看状态 | `git status -sb` |
| 查看当前分支 | `git branch --show-current` |
| 获取远程信息 | `git fetch origin` |
| 更新当前分支 | `git pull --ff-only` |
| 创建并切换分支 | `git switch -c feature/example` |
| 切换分支 | `git switch branch-name` |
| 查看未暂存修改 | `git diff` |
| 暂存整个文件 | `git add path/to/file` |
| 分块暂存 | `git add -p path/to/file` |
| 查看已暂存内容 | `git diff --cached` |
| 创建 Commit | `git commit -m "提交说明"` |
| 首次推送分支 | `git push -u origin branch-name` |
| 后续推送 | `git push` |
| 临时保存修改 | `git stash push -u -m "说明"` |
| 恢复临时修改 | `git stash pop` |

### 13. 推荐的完整日常流程

```bash
# 1. 从最新 develop 创建工作分支
git switch develop
git fetch origin
git pull --ff-only origin develop
git switch -c feature/my-feature

# 2. 修改代码后查看差异
git status -sb
git diff

# 3. 按目标项目规范格式化和测试
clang-format --style=file:./.clang-format -i path/to/changed-file.c
git diff --check

# 4. 暂存并复核下一次提交的内容
git add -p path/to/changed-file.c
git diff --cached
git diff --cached --check

# 5. 提交和推送
git commit -m "feat: describe the change"
git push -u origin feature/my-feature
```

上面的分支名、基础分支、格式化命令和测试命令都只是示例，应以目标项目的规范为准。

## 原理与进阶篇

### 14. Commit、分支与 HEAD

- **Commit** 是历史中的一个节点，记录文件快照、提交信息及父 Commit。
- **分支** 是指向某个 Commit 的可移动引用，并不是另一份独立代码副本。
- **HEAD** 通常指向当前检出的分支；在 detached HEAD 状态下，它直接指向某个 Commit。

```text
A --- B --- C
              ^ develop
              ^ HEAD
```

常用的创建与切换命令如下：

| 目的 | 命令 | 说明 |
| --- | --- | --- |
| 只创建分支 | `git branch feature/test` | 创建但不切换 |
| 创建并切换 | `git switch -c feature/test` | 推荐的新式写法 |
| 兼容旧版 Git | `git checkout -b feature/test` | 同时创建和切换 |
| 切换已有分支 | `git switch feature/test` | 不创建分支 |
| 指定起点 | `git switch -c feature/test develop` | 以 `develop` 为起点 |

分支命名规则不是 Git 强制规定。原稿所在项目建议使用 `feature/`、`bugfix/` 前缀和短横线，例如 `feature/calib-loop-end-slow`；其他仓库应遵循各自规范。

### 15. 本地分支、远程跟踪分支与 upstream

`origin` 通常是克隆时创建的远程名称，但它可以被改名，也不保证一定存在。`origin/feature/motor-log` 是本地保存的远程跟踪引用；`git fetch origin` 会根据远端状态更新它。

```bash
git remote -v
git branch -vv
git fetch origin
git status -sb
```

当当前分支已经设置 upstream 时，`git status -sb` 可能显示：

| 标记 | 含义 |
| --- | --- |
| `ahead 1` | 本地比 upstream 多 1 个 Commit |
| `behind 1` | upstream 比本地多 1 个 Commit |
| `ahead 1, behind 2` | 两边各有新 Commit，历史已经分叉 |

`git fetch` 只更新远程跟踪信息，不会把远端 Commit 合并进当前分支。`git pull` 通常等价于先 fetch，再按配置 merge 或 rebase；如果只允许快进，可显式使用：

```bash
git pull --ff-only
```

它在分支已经分叉时会停止，让操作者明确选择 merge 或 rebase。

### 16. 未跟踪文件与切换分支

`git status` 中的 `??` 表示未跟踪文件。它不属于任何 Commit，不会因为普通 `git push` 自动上传。切换分支时它通常留在工作区，但如果目标分支已有同路径的已跟踪文件，Git 会拒绝切换以避免覆盖。

处理前先确认文件是否应该纳入版本控制：

```bash
git status --short
git add path/to/file       # 需要跟踪
git stash push -u -m "wip" # 需要临时收起，包括未跟踪文件
```

不要为了切换分支随意删除不认识的未跟踪文件；它可能是尚未备份的本地资料。

### 17. 合并多个尚未推送的 Commit

如果若干 Commit 确认只存在于本地，可以用交互式 rebase 整理，也可以把分支指针软重置到明确的基点后重新提交：

```bash
git fetch origin
git log --oneline --graph --decorate --all -20
git reset --soft origin/feature/motor-log
git status
git diff --cached
git commit -m "feat: 合并后的提交说明"
```

`--soft` 会移动当前分支指针，但保留文件内容，并把基点之后的差异放在暂存区。执行前必须确认：

- `origin/feature/motor-log` 正是希望保留的基点；
- 要整理的 Commit 尚未被他人基于其继续工作；
- `git diff --cached` 的内容完整且没有混入无关修改。

已经推送并可能被他人使用的 Commit，不应轻率重写后强制推送；通常应新增修复 Commit。是否允许 force push 由项目规范决定。

### 18. 临时查看或编译旧 Commit

先查看指定分支的历史：

```bash
git log dev/j30-no-brake --oneline --graph --decorate
```

即使当前 HEAD 不在该分支尖端，这条命令仍会从 `dev/j30-no-brake` 当前指向的位置显示可达历史。

只想查看或编译旧版本时，使用 detached HEAD，不移动原分支：

```bash
git status --short
git switch --detach <commit-id>
# 查看或编译
git switch dev/j30-no-brake
```

如果要基于旧 Commit 继续开发，应立即创建分支：

```bash
git switch -c test/from-old-commit <commit-id>
```

在 detached HEAD 状态下直接创建的新 Commit 不会自动属于原分支；离开前应创建分支或标签保存它。

### 19. `switch --detach` 与 `reset --hard`

| 操作 | 是否移动当前分支 | 对工作区的影响 | 典型用途 |
| --- | --- | --- | --- |
| `git switch --detach <commit>` | 否 | 工作区切换到目标 Commit；有冲突风险时 Git 通常会拒绝 | 临时查看、编译旧版本 |
| `git reset --hard <commit>` | 是 | 丢弃已跟踪文件的未提交修改，并把分支移到目标 Commit | 明确改写本地分支历史 |

因此，只想查看旧版本时不要使用 `reset --hard`。执行任何切换前先运行 `git status`；对重要的本地修改，先提交或建立可靠备份。

若误移动了分支，可先用 reflog 查找原位置：

```bash
git reflog
```

确认正确 Commit 后再恢复。恢复命令会改动分支和工作区，不能仅凭示例 Commit ID 直接执行。

## pre-commit 与 GitLab CI 排错

### 20. 区分本地 hook 与 CI 阶段

- **pre-commit hook** 在本地提交前运行；不同仓库的 hook 内容不同。
- **GitLab CI** 在推送后由服务端流水线运行，具体阶段由 `.gitlab-ci.yml` 及其引用配置决定。
- 名为 `style-test` 的 job 通常检查格式或静态规范，但名称没有统一语义，不能据此断定检查内容。

常见检查可能包括 C/C++ 格式、CMake/Python 风格、拼写、行尾空格、文件末尾换行、YAML 语法和冲突标记。应直接阅读项目配置确认：

```bash
git diff --check
git diff --cached --check
git status --short
```

如果项目使用 pre-commit，可在安装依赖后主动运行：

```bash
pre-commit run --all-files
```

### 21. hook 自动修改文件时怎么办

如果输出包含 `files were modified by this hook`，通常表示格式化工具改了工作区文件，当前提交因此停止。应重新检查并暂存修改：

```bash
git status --short
git diff
git add path/to/formatted-file
git diff --cached
git commit -m "原来的提交信息"
```

不要在未查看差异的情况下直接 `git add -A`，以免把生成物、密钥或调试文件一并提交。

### 22. 网络问题与 `--no-verify`

某些 hook 首次运行时需要下载环境，网络问题可能导致初始化失败。应优先恢复网络、使用项目提供的镜像或复用已安装环境。

只有在团队规范允许、确认失败仅由 hook 基础设施导致，并且已经完成等价人工检查时，才考虑单次使用：

```bash
git commit --no-verify -m "提交说明"
```

`--no-verify` 会跳过本地 hook，但不会跳过 GitLab CI，也不能证明代码正确。不得用它绕过已发现的真实格式、测试或安全问题。

### 23. CI 失败的最小排查顺序

1. 打开失败 job，记录第一个实质错误，而不是只看最后的退出码。
2. 确认 CI 检出的 Commit 与本地预期一致。
3. 阅读 `.gitlab-ci.yml` 和被引用配置，找到实际执行命令。
4. 在与 CI 尽量一致的工具版本和工作目录中复现。
5. 修复后重新运行本地检查，提交并推送新的 Commit。

```bash
git rev-parse HEAD
git log --oneline --decorate -5
git status -sb
```

如果本地通过、CI 失败，应重点比较操作系统、容器镜像、编译器版本、环境变量、子模块、缓存和生成文件，而不是默认 CI 本身出错。

## 安全检查清单

进行 pull、切换、历史整理或推送前，至少确认：

- `git status -sb` 显示的分支和工作区状态符合预期；
- `git remote -v` 中的目标远程正确；
- `git diff` 与 `git diff --cached` 都已复核；
- 不会重写已共享历史；
- 未跟踪文件和本地生成物已经妥善处理；
- 将执行的命令中没有从别处照抄的未知 Commit ID 或路径。

Git 的高风险操作通常不是因为命令本身“错误”，而是目标分支、基点或工作区状态没有核对清楚。先读取状态，再执行改变历史或工作区的命令，是最可靠的习惯。
