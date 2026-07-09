# Changelog

本文件记录项目的重要版本变化。

格式参考 Keep a Changelog，但按本项目节奏做轻量化管理。

---

## v0.0.1 - 2026-07-09

### Milestone

项目启动完成，MVP 前端壳子落地。

### Added

- 初始化 Next.js + TypeScript + Tailwind CSS 应用壳。
- 搭建移动端 phone-style 产品界面。
- 完成首页、三道选择题、方向推荐、选题推荐、内容生成结果、反馈改写、小光浮窗、故事库等 MVP 页面雏形。
- 新增 `modelService.generate(taskType, payload)` 统一模型服务入口。
- 新增 mock 数据结构，为后续真实模型接入预留接口。
- 建立 `docs/product/`、`docs/reviews/`、`docs/decisions/` 文档管理体系。
- 建立 PR Review 与 ADR 决策记录流程。

### Fixed

- 修复小光入口显示为方块截图的问题。
- 将小光入口调整为更圆润、温暖、适合漂浮按钮的形象。

### Architecture

- 明确用户眼里只有一个「小光」。
- 明确 MVP 阶段不做复杂 Multi-Agent。
- 明确 Router 第一版只做轻量状态分发。
- 明确故事库定位为成长资产库，而不是聊天记录。

### Notes

- 当前版本仍以 mock 数据为主。
- 下一阶段目标是定义模型服务契约，并逐步接入 DeepSeek。
