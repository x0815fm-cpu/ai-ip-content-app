# Reviews 文档区

这里存放每一轮 PR Review、产品 Review、代码 Review 的正式记录。

## 目录职责

本目录主要回答：

> 这一次改动是否符合产品事实源？还有哪些问题？下一轮 Codex 应该怎么改？

适合存放：

- PR 评审意见
- 合并前检查
- Codex 修改说明
- 版本复审记录
- 技术债记录
- MVP 边界检查

## 命名建议

```text
review-001-pr-1-mvp-shell.md
review-002-pr-1-second-review.md
review-003-xxx.md
```

命名规则：

```text
review-序号-对象-简短说明.md
```

## Review 标准

每次 Review 优先检查：

1. 是否符合 `docs/product/` 下的产品事实源。
2. 是否符合 MVP 边界。
3. 是否出现过度设计。
4. Router / Prompt / 状态机是否仍然轻。
5. UI 是否保持温暖、轻、留白、圆角卡片、小光统一入口。
6. 是否有构建、类型、lint 风险。
7. Codex 是否需要继续修改。

## 协作流程

```text
Codex 提交 PR
↓
ChatGPT Review
↓
写入 docs/reviews/
↓
用户把 Review 文档路径发给 Codex
↓
Codex 按文档修改当前 PR
↓
再次 Review
↓
通过后合并
```

## Codex 使用方式

给 Codex 的固定话术：

```text
请先同步最新仓库，然后阅读 docs/reviews/ 中最新的 Review 文档，再开始修改当前 PR。不要新建 PR，直接更新当前 PR。修改完成后运行 typecheck / lint / build，并说明修改清单和验证结果。
```
