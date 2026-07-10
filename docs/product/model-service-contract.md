# Model Service Contract

日期：2026-07-09  
阶段：Sprint 1  
状态：v0.1 草案

---

## 1. 文档目的

本文档定义 APP 中 AI 模型服务层的统一契约。

它回答：

> 前端页面如何请求 AI？AI 应该返回什么？如果模型失败怎么办？后续换模型时哪些代码不该动？

本项目的 AI 调用统一经过：

```text
modelService.generate(taskType, payload)
```

前端组件不直接调用 DeepSeek / OpenAI / Claude / Gemini。

---

## 2. 总体原则

### 2.1 前端只认识 taskType

前端只关心：

```ts
modelService.generate(taskType, payload)
```

前端不关心：

- 使用哪个模型
- API Key 是什么
- Prompt 怎么拼
- 是否 fallback 到 mock

---

### 2.2 API Key 只能在服务端使用

DeepSeek API Key 不能出现在：

- 前端组件
- 浏览器 bundle
- GitHub 仓库
- PR 描述
- 文档正文
- 提交历史

真实 Key 只能放在本地：

```text
.env.local
```

并且 `.env.local` 不提交。

---

### 2.3 必须保留 mock fallback

如果出现以下情况，系统必须能回退到 mock：

- 没有配置 `DEEPSEEK_API_KEY`
- DeepSeek 请求失败
- 模型输出 JSON 解析失败
- 模型返回字段不完整
- 网络错误
- 超时

fallback 不应让用户看到报错页面。

---

### 2.4 输出必须结构化

所有模型输出必须是 JSON。

禁止让前端从大段自然语言里手工截取内容。

---

### 2.5 小光不是万能聊天机器人

所有输出都必须服务于当前 MVP 目标：

> 帮普通人找到适合自己的 IP 内容方向，并生成第一条可发布内容文案。

不要把小光做成泛聊天助手。

---

## 3. 统一调用形式

### 3.1 TypeScript 形式

```ts
modelService.generate<TResponse>(taskType, payload): Promise<TResponse>
```

### 3.2 TaskType

```ts
type TaskType =
  | "collect_profile"
  | "recommend_direction"
  | "recommend_topic"
  | "generate_content"
  | "revise_content"
  | "chat_with_xiaoguang"
  | "extract_story_asset"
  | "save_story_asset";
```

Sprint 1 只实现：

```text
recommend_direction
recommend_topic
generate_content
revise_content
extract_story_asset
```

---

## 4. 推荐目录结构

```text
src/
  services/
    modelService.ts
    providers/
      deepseekProvider.ts
      mockProvider.ts
    prompts/
      promptRegistry.ts
  app/
    api/
      generate/
        route.ts
```

说明：

- `modelService.ts`：前端统一入口。
- `route.ts`：服务端 API 入口，保护 API Key。
- `deepseekProvider.ts`：DeepSeek 请求实现。
- `mockProvider.ts`：mock fallback。
- `promptRegistry.ts`：根据 taskType 获取 Prompt。

---

## 5. 环境变量契约

新增 `.env.example`：

```env
DEEPSEEK_API_KEY=
DEEPSEEK_API_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
MODEL_PROVIDER=deepseek
USE_MOCK_MODEL=false
```

本地真实配置：

```text
.env.local
```

禁止提交 `.env.local`。

---

## 6. 通用请求 Payload

所有 task 的 payload 可以共享部分上下文：

```ts
type BasePayload = {
  answers?: AnswerMap;
  selectedDirection?: DirectionRecommendation;
  selectedTopic?: TopicRecommendation;
  currentContent?: GeneratedContent;
  feedbackType?: string;
  input?: string;
};
```

---

## 7. Task Contract：recommend_direction

### 7.1 用途

根据用户三道选择题，推荐 3 个内容方向。

### 7.2 输入

```ts
type RecommendDirectionPayload = {
  answers: {
    materialSource: string;
    contentGoal: string;
    publishChannel: string;
  };
};
```

### 7.3 输出

```ts
type DirectionRecommendation = {
  name: string;
  recommended: boolean;
  whatToTalkAbout: string;
  targetAudience: string;
  whyFitYou: string;
};

type RecommendDirectionResponse = DirectionRecommendation[];
```

### 7.4 输出要求

必须返回 3 个方向。

其中一个且只能一个：

```ts
recommended: true
```

语言要求：

- 温和
- 清楚
- 不制造焦虑
- 不承诺涨粉
- 不承诺变现

---

## 8. Task Contract：recommend_topic

### 8.1 用途

根据用户答案和选择的方向，推荐 3 个适合第一条内容的选题。

### 8.2 输入

```ts
type RecommendTopicPayload = {
  answers: AnswerMap;
  selectedDirection: DirectionRecommendation;
  failureStoryInput?: string;
};
```

**说明：**
- 有故事时（failureStoryInput 非空），优先围绕真实故事推荐选题
- 无故事时（failureStoryInput 为空或不存在），基于答案和方向推荐具体起步选题
- 不得虚构用户未提供的经历

### 8.3 输出

```ts
type TopicRecommendation = {
  title: string;
  recommended: boolean;
  summary: string;
  whyFirst: string;
};

type RecommendTopicResponse = TopicRecommendation[];
```

### 8.4 输出要求

必须返回 3 个选题。

其中一个且只能一个：

```ts
recommended: true
```

选题必须：

- 适合普通人马上开始写
- 不要求用户有专家身份
- 不要太宏大
- 不要像营销课标题

---

## 9. Task Contract：generate_content

### 9.1 用途

根据答案、方向、选题，生成一条可发布内容文案。

### 9.2 输入

```ts
type GenerateContentPayload = {
  answers: AnswerMap;
  selectedDirection: DirectionRecommendation;
  selectedTopic: TopicRecommendation;
};
```

### 9.3 输出

```ts
type ContentRow = {
  label: string;
  value: string;
};

type GeneratedContent = {
  rows: ContentRow[];
  publishHint: string;
  revisedBy?: string;
};
```

### 9.4 rows 字段要求

至少包含：

```text
标题
开头
正文
结尾
```

可选包含：

```text
拍摄提示
发布建议
```

### 9.5 内容要求

- 可以直接复制发布。
- 不要过度正式。
- 不要强营销。
- 不要像鸡汤。
- 不要承诺结果。
- 要像普通人第一次真实表达。

---

## 10. Task Contract：revise_content

### 10.1 用途

根据用户反馈，改写当前文案。

### 10.2 输入

```ts
type ReviseContentPayload = {
  answers: AnswerMap;
  selectedDirection: DirectionRecommendation;
  selectedTopic: TopicRecommendation;
  currentContent: GeneratedContent;
  feedbackType: string;
};
```

### 10.3 feedbackType 可选值

```text
不够像我
太官方了
太营销了
太长了
太短了
开头不吸引人
换一种讲法
```

### 10.4 输出

```ts
type ReviseContentResponse = GeneratedContent;
```

### 10.5 要求

- 不重新推荐方向。
- 不重新推荐选题。
- 只改写当前文案。
- 保留用户原始意图。
- 明确体现本次反馈方向。

---

## 11. Task Contract：extract_story_asset

### 11.1 用途

把用户讲给小光的一段话，整理成故事资产。

### 11.2 输入

```ts
type ExtractStoryAssetPayload = {
  input: string;
  autoSaveEnabled?: boolean;
};
```

### 11.3 输出

```ts
type ExtractedStoryAsset = {
  experience: {
    title: string;
    content: string;
  };
  thought: {
    title: string;
    content: string;
  };
  quote: {
    title: string;
    content: string;
  };
  topics: Array<{
    title: string;
    content: string;
  }>;
};
```

### 11.4 输出要求

必须包含：

- 经历
- 想法
- 金句
- 可生成选题

其中 topics 建议返回 3 条。

### 11.5 隐私表达

产品文案应保持：

```text
你愿意留下来的内容，我会帮你整理成故事卡。
```

不要说：

```text
我会保存你的聊天记录。
```

---

## 12. API Route 契约

建议新增：

```text
src/app/api/generate/route.ts
```

### 12.1 请求

```ts
type GenerateApiRequest = {
  taskType: TaskType;
  payload: ModelPayload;
};
```

### 12.2 响应

```ts
type GenerateApiResponse<T = unknown> = {
  ok: boolean;
  data?: T;
  source: "deepseek" | "mock";
  error?: string;
};
```

### 12.3 失败策略

如果 DeepSeek 失败，API route 不应直接返回 500 给前端。

建议返回：

```ts
{
  ok: true,
  data: mockData,
  source: "mock",
  error: "deepseek_failed_fallback_to_mock"
}
```

---

## 13. DeepSeek Provider 契约

### 13.1 请求模型

DeepSeek provider 只负责：

- 读取环境变量
- 根据 taskType 获取 prompt
- 发起请求
- 解析 JSON
- 返回结构化数据

### 13.2 不负责

DeepSeek provider 不负责：

- 页面状态
- UI 展示
- 用户流程跳转
- 保存故事库
- 多模型选择

---

## 14. Prompt 文件契约

Prompt 文件建议放在：

```text
prompts/
  recommend_direction.md
  recommend_topic.md
  generate_content.md
  revise_content.md
  extract_story_asset.md
```

每个 Prompt 必须说明：

- 角色
- 输入
- 输出 JSON 格式
- 风格限制
- 禁止事项

---

## 15. JSON 输出规范

模型必须只输出 JSON。

不要输出：

```text
下面是结果：
```

不要输出 Markdown code block：

```markdown
```json
...
```
```

只输出纯 JSON。

如果模型输出不合法，服务端应 fallback 到 mock。

---

## 16. Mock Fallback 契约

mock fallback 必须和真实模型输出结构完全一致。

这样前端无需关心数据来源。

```ts
source: "deepseek" | "mock"
```

只用于调试，不用于页面强展示。

---

## 17. 安全边界

### 17.1 禁止

- 禁止在前端写 DeepSeek API Key。
- 禁止把 Key 写进 GitHub。
- 禁止把用户输入直接拼成危险系统 Prompt。
- 禁止模型输出不经过校验就进入页面。

### 17.2 应该

- 服务端读取环境变量。
- 统一错误处理。
- 输出结构校验。
- fallback 到 mock。

---

## 18. Sprint 1 验收标准

完成 DeepSeek 接入后，必须验证：

```bash
npm run typecheck
npm run lint
npm run build
```

并人工验证：

1. 不配置 API Key 时，mock 流程可跑通。
2. 配置 API Key 后，真实模型流程可跑通。
3. 模型失败时，页面不崩溃。
4. 输出内容符合小光语气。
5. 所有输出结构与本文档一致。

---

## 19. 下一步

下一轮 Codex 可执行：

```text
feat: add DeepSeek provider skeleton and generate API route
```

范围：

- 新增 `.env.example`
- 新增 `src/app/api/generate/route.ts`
- 新增 `src/services/providers/deepseekProvider.ts`
- 新增 `src/services/providers/mockProvider.ts`
- 调整 `modelService.generate()` 为调用 `/api/generate`
- 保留现有 mock 数据
- 不改 UI 主流程
