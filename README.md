# AI IP Content App

一个帮助普通人找到适合自己的 IP 内容方向，并生成第一条可发布内容文案的 AI 产品。

## 当前唯一事实源

- 产品说明：`docs/AI_IP_content_app_spec_v2.md`
- 交接文档：`docs/handoff.md`
- MVP 任务：`tasks/mvp-task-list.md`
- Prompt 设计：`prompts/`
- UI 参考：`design/ui-reference.md`

## MVP 主流程

```text
首页
↓
三道选择题
↓
AI 推荐 3 个 IP 内容方向
↓
AI 推荐 3 个选题
↓
生成一条内容文案
↓
反馈按钮改写
↓
小光沉淀故事到故事库
```

## 核心原则

- 用户眼里只有一个「小光」
- 后台用 `taskType / step / promptType` 区分状态
- 第一版不做复杂 Multi-Agent
- 第一版只验证：用户能不能从「不知道发什么」到拿到一条能发的内容文案
