# Git 使用笔记

## 常用命令

- `git clone`：克隆仓库
- `git pull`：拉取最新代码
- `git add .`：暂存修改
- `git commit -m "msg"`：提交变更
- `git push`：推送到远端

## 分支管理

```bash
git checkout -b feature/demo
git merge main
git branch -d feature/demo
```

## 协作建议

1. 提交前先查看差异
2. 保持提交信息清晰
3. 及时同步主分支
