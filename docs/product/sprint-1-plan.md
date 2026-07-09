# Sprint 1 计划：跑通真实 MVP 流程

日期：2026-07-09  
阶段：MVP 可用性验证  
状态：规划中

---

## 1. Sprint 1 目标

Sprint 1 的目标不是做大而全的 AI 产品，而是让当前 MVP 从静态 mock 壳子，进入「可真实试用」状态。

核心目标：

> 用户完成三道选择题后，能通过真实模型获得 3 个方向、3 个选题、一条内容文案，并能根据反馈完成改写，最后把故事沉淀到故事库。

---

## 2. 本阶段只验证一件事

```text
普通人能不能从“不知道发什么”
走到“拿到一条适合自己、可以发出去的内容文案”
```

所有开发都围绕这个验证目标展开。

---

## 3. Sprint 1 范围

### 3.1 必做

- 定义模型服务输入输出契约。
- 建立 DeepSeek 接入结构。
- 新增 `.env.example`。
- 使用 `.env.local` 存放真实 API Key，不提交密钥。
- 保留 mock fallback。
- 为以下 taskType 接入真实模型调用：
  - `recommend_direction`
  - `recommend_topic`
  - `generate_content`
  - `revise_content`
  - `extract_story_asset`
- 建立第一版 Prompt 文件。
- 页面继续沿用当前 UI，不重做视觉。

### 3.2 暂不做

- 不做登录。
- 不做数据库。
- 不做用户账号体系。
- 不做复杂 Multi-Agent。
- 不做多模型路由。
- 不接 OpenAI / Claude / Gemini。
- 不做自动发布。
- 不做完整个人 IP 规划。
- 不做短视频剪辑。
- 不做复杂故事库编辑器。

---

## 4. 技术路线

Sprint 1 保持轻量：

```text
前端页面
  ↓
modelService.generate(taskType, payload)
  ↓
DeepSeek Provider
  ↓
结构化返回
  ↓
页面展示
```

保留 mock fallback：

```text
如果没有配置 DEEPSEEK_API_KEY
或者请求失败
则返回 mock 数据
```

---

## 5. 任务拆分

### Task 1：模型服务契约

新增或完善：

```text
docs/product/model-service-contract.md
```

定义每个 taskType 的：

- 输入字段
- 输出字段
- 页面使用方式
- fallback 策略

---

### Task 2：DeepSeek Provider

建议新增：

```text
src/services/providers/deepseekProvider.ts
src/services/modelService.ts
```

要求：

- `modelService.generate(taskType, payload)` 保持统一入口。
- DeepSeek provider 只负责请求模型。
- 不在组件里直接写 fetch。
- 不在前端泄露 API Key。

注意：如果当前项目仍是纯前端，需要先评估是否需要 Next.js route handler：

```text
src/app/api/generate/route.ts
```

真实 API Key 应只在服务端使用。

---

### Task 3：环境变量

新增：

```text
.env.example
```

内容：

```env
DEEPSEEK_API_KEY=
DEEPSEEK_API_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
MODEL_PROVIDER=deepseek
USE_MOCK_MODEL=false
```

不要提交：

```text
.env.local
.env
```

---

### Task 4：Prompt 第一版

建议新增：

```text
prompts/recommend_direction.md
prompts/recommend_topic.md
prompts/generate_content.md
prompts/revise_content.md
prompts/extract_story_asset.md
```

要求：

- 输出必须结构化，方便前端解析。
- 不要输出长篇理论。
- 不要承诺涨粉、变现、爆款。
- 语气要像「小光」，温柔、清楚、有方向。

---

### Task 5：页面联调

页面无需重做 UI，只需要把 mock 调用替换为真实调用。

需要验证：

- 三道选择题后能返回 3 个方向。
- 选择方向后能返回 3 个选题。
- 选择选题后能生成文案。
- 点击反馈后能改写。
- 小光输入后能提取故事卡。
- 没有 API Key 时仍能跑 mock。

---

## 6. 验收标准

Sprint 1 完成时，必须满足：

```text
npm run typecheck
npm run lint
npm run build
```

全部通过。

同时人工验证：

1. 不配置 DeepSeek Key 时，mock 流程可跑通。
2. 配置 DeepSeek Key 后，真实模型流程可跑通。
3. 页面不出现明显报错。
4. 输出内容符合产品定位。
5. 小光不变成万能聊天机器人。

---

## 7. 风险提醒

### 7.1 API Key 泄露风险

DeepSeek API Key 不能出现在：

- GitHub 代码
- GitHub 文档
- 前端 bundle
- 提交记录
- PR 描述

### 7.2 前端直连风险

如果 API Key 放在浏览器端，会泄露。

因此真实模型调用应通过服务端 route handler 或 server action。

### 7.3 Prompt 输出不稳定

第一版必须要求模型输出 JSON，前端再做解析与 fallback。

### 7.4 过度设计风险

Sprint 1 不做多模型、不做 Agent 编排、不做复杂状态机。

---

## 8. 下一轮建议 PR

建议新建：

```text
PR #next: feat: add model service contract and DeepSeek provider skeleton
```

范围：

- 新增 `.env.example`
- 新增 DeepSeek provider skeleton
- 新增 Next.js API route 或服务端调用层
- 保留 mock fallback
- 暂不打磨最终 Prompt

