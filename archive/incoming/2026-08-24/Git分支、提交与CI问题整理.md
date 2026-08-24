# Git 分支、提交与 CI 问题整理

> 本文档用于本项目的日常 Git 操作、提交整理和 GitLab CI 排错。命令默认在仓库根目录执行。

## 1. 分支、Commit 与 HEAD

- **Commit**：代码历史中的节点，包含文件快照、提交信息和父 Commit。
- **分支**：指向某个 Commit 的可移动指针，不是一份独立的代码复制。
- **HEAD**：当前检出的分支，或 detached HEAD 状态下的当前 Commit。

~~~mermaid
gitGraph
   commit id: "A"
   commit id: "B"
   commit id: "C"
   branch feature/test
   checkout feature/test
   commit id: "D"
   checkout main
~~~

~~~text
A --- B --- C
              ^ main
              ^ HEAD
~~~

## 2. 创建和切换分支

| 目的 | 命令 | 说明 |
| --- | --- | --- |
| 仅创建分支 | git branch feature/test | 创建但不切换 |
| 创建并切换（推荐） | git switch -c feature/test | -c 表示 create |
| 旧版写法 | git checkout -b feature/test | 兼容旧版 Git |
| 切换已有分支 | git switch feature/test | 不创建新分支 |
| 指定基础分支 | git switch -c feature/test develop | 以 develop 为起点 |

## 3. 本地分支、远程分支与推送

origin 是远程仓库名称。origin/feature/motor-log 是本地保存的远程跟踪分支位置，会在 fetch 或 push 后更新。

~~~mermaid
flowchart LR
    L[本地 feature/motor-log] -->|git push| R[origin/feature/motor-log]
    R -->|git fetch| T[更新远程跟踪信息]
~~~

~~~bash
git status -sb
git fetch origin
git status -sb
git push origin feature/motor-log
~~~

| status -sb 标记 | 含义 |
| --- | --- |
| ahead 1 | 本地比远程多 1 个 Commit，尚未推送 |
| behind 1 | 远程比本地多 1 个 Commit |
| ahead 1, behind 2 | 本地和远程各有新 Commit，分支已分叉 |

分支名建议使用短横线：推荐 feature/calib-loop-end-slow，避免 feature/calib_loop_end_slow。

## 4. 未跟踪文件与切换分支

git status 中的 ?? 表示未跟踪文件。它不属于任何分支，通常会在切换分支时保留，也不会被 git push 自动上传。

~~~mermaid
flowchart TD
    S[git status] --> Q{出现 ?? ?}
    Q -->|是| U[未跟踪文件]
    U --> A[git add 后才能进入 Commit]
    U --> P[git push 不会自动上传]
~~~

如果目标分支已有同路径的已跟踪文件，Git 会拒绝切换，以避免覆盖工作区文件。此时应先提交、存储或移走该文件。

## 5. 将多个未推送 Commit 合并为一个

~~~mermaid
gitGraph
   commit id: "origin/base"
   branch feature/motor-log
   checkout feature/motor-log
   commit id: "Commit 1"
   commit id: "Commit 2"
~~~

如果分支比远程跟踪分支领先 2 个未推送 Commit：

~~~bash
git reset --soft origin/feature/motor-log
git status
git diff --cached
git commit -m "feat: 合并后的提交说明"
git push origin feature/motor-log
~~~

--soft 只移动分支指针，保留后续代码改动并放入暂存区。也可以使用 git reset --soft HEAD~2。已推送且可能被他人使用的 Commit 不建议重写历史后强制推送，优先新建修复 Commit。

## 6. pre-commit、style-test 与 clang-format

GitLab CI 的 style-test 阶段主要检查代码风格和静态规范，不是固件功能测试。

~~~mermaid
flowchart LR
    C[git push] --> CI[GitLab CI]
    CI --> ST[style-test]
    ST --> PC[pre-commit run --all-files]
    PC --> CF[clang-format / CMake / Python / 文本规范]
    CI --> B[build]
~~~

检查包括 C/C++ 格式、CMake 格式与检查、Python 风格、拼写、行尾空格、文件末尾换行、YAML 和冲突标记。

~~~bash
clang-format --style=file:./.clang-format -i 文件路径
clang-format --style=file:./.clang-format --dry-run --Werror 文件路径
git diff --cached --check
~~~

若 pre-commit 因 GitHub 网络无法初始化，完成手动检查后可以单次使用 git commit --no-verify -m "提交说明"。这不会跳过 GitLab CI。

## 7. 推荐的日常提交流程

~~~mermaid
flowchart TD
    A[创建 feature/bugfix 分支] --> B[修改代码]
    B --> C[clang-format]
    C --> D[git diff --check / 本地编译]
    D --> E[git add 和复核 staged diff]
    E --> F[git commit]
    F --> G[git fetch origin / git status -sb]
    G --> H[git push]
    H --> I[GitLab style-test 和 build]
~~~

1. 创建 feature/ 或 bugfix/ 分支。
2. 格式化 C/C++ 文件，检查空白并本地编译。
3. 用 git status、git diff 确认修改范围。
4. git add 后复核 git diff --cached。
5. git commit，必要时使用 --no-verify。
6. git fetch origin 后检查 ahead/behind。
7. git push，在 GitLab 查看 style-test 和 build。

## 8. 在同一分支内切换查看 Commit

### 8.1 查看分支全部历史

~~~bash
git log dev/j30-no-brake --oneline --graph --decorate
~~~

即使当前 HEAD 停在旧 Commit，这条命令仍会按 dev/j30-no-brake 分支指向的历史显示后续 Commit，并标出分支指针和 HEAD。

### 8.2 临时查看或编译某个 Commit

~~~bash
git switch --detach <commit ID>
git switch --detach c65b4cfa747cb72ecd70b9d06a001fcc60daea5f
~~~

这会进入 detached HEAD，但不会移动 dev/j30-no-brake 分支指针。可以反复切换到不同 Commit。

~~~mermaid
flowchart LR
    B[dev/j30-no-brake 分支指针] -.-> N[6c9f8ae 最新]
    H[HEAD detached] --> O[c65b4cf 旧版本]
    H --> E[e29c79d 无 LUT 版本]
    H --> F[f53d5dd 恢复 LUT]
~~~

### 8.3 查看完后回到分支

~~~bash
git switch dev/j30-no-brake
git switch -
~~~

### 8.4 基于旧 Commit 继续开发

~~~bash
git switch -c test/from-old-commit <commit ID>
~~~

### 8.5 switch --detach 与 reset --hard

| 操作 | 分支指针 | 适用场景 |
| --- | --- | --- |
| git switch --detach <commit> | 不移动 | 临时查看、编译旧版本（推荐） |
| git reset --hard <commit> | 会移动 | 明确改写当前分支历史；会清除未提交修改 |

只想查看旧版本时不要使用 reset --hard。若误用，先执行 git reflog，再恢复：

~~~bash
git switch dev/j30-no-brake
git reset --hard <恢复前的 commit ID>
~~~

### 8.6 最简操作流程

~~~text
1. git log dev/j30-no-brake --oneline --graph --decorate
2. git switch --detach <commit ID>
3. git switch dev/j30-no-brake
~~~
