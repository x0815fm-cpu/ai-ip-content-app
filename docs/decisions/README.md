# Decisions 文档区

这里存放产品和技术上的重要决策记录，也就是 ADR（Architecture Decision Record）。

## 目录职责

本目录主要回答：

> 我们为什么这样设计？为什么不选另一种方案？这个决定以后能不能推翻？

适合存放：

- 是否做 Multi-Agent
- 为什么用户只看见一个小光
- Router 为什么保持轻量
- 故事库为什么叫成长资产库
- 为什么 MVP 先不接复杂模型路由
- 为什么第一版只验证一条可发布内容文案

## 命名建议

```text
ADR-001-one-xiaoguang.md
ADR-002-mvp-no-complex-multi-agent.md
ADR-003-story-library-as-growth-assets.md
```

命名规则：

```text
ADR-序号-英文短名.md
```

## ADR 模板

```markdown
# ADR-XXX：决策标题

日期：YYYY-MM-DD

## 背景

为什么会出现这个问题？

## 决策

我们决定怎么做？

## 原因

为什么这样做？

## 不采用的方案

哪些方案暂时不做？为什么？

## 影响

这个决策会影响哪些产品、代码、Prompt、Router 或后续版本？

## 何时重新评估

什么情况下可以重新讨论这个决策？
```

## 当前已确定的重要决策

1. 用户眼里永远只有一个「小光」。
2. MVP 不做复杂 Multi-Agent。
3. 第一版 Router 保持轻量，只负责状态分发。
4. 故事库不是聊天记录，而是成长资产库。
5. 第一版只验证：用户能不能从「不知道发什么」到拿到一条能发的内容文案。
