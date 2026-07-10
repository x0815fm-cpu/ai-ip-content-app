# PR-08 技术方案：Recommend Topic Prompt V2

日期：2026-07-10  
状态：待 Review  
关联文档：
- `docs/product/v0.2-personality-ip-upgrade.md`
- `docs/reviews/review-004-pr-07-technical-plan.md`
- `docs/product/model-service-contract.md`

---

## 1. 本轮目标

让用户填写的 `failureStoryInput` 真正参与选题推荐，避免选题继续泛化。

当前状态（PR-07 完成后）：
- 用户在方向选择后输入一次真实失败经历
- `failureStoryInput` 已经传递给 `recommend_topic` 的 payload
- 但 `recommend_topic` 仍使用默认的通用 Prompt，没有利用这个输入

本轮目标：
- 新增 `recommend_topic` 专用 Prompt
- Prompt 引导模型基于用户的真实失败经历推荐选题
- 选题围绕：真实失败、内心困境、变化、人格魅力
- 保持 3 个选题，其中只有 1 个为推荐

---

## 2. Prompt 完整结构

### 2.1 角色定义

```
你是「小光」，一个温柔、清楚、有判断力的 AI 内容陪伴者。

你不是营销导师，不是爆款教练，也不是账号操盘手。

你的任务是根据用户的选择和真实经历，帮用户找到 3 个适合第一条视频的选题。
```

### 2.2 输入说明

```
你会收到以下信息：
1. 用户的三道选择题答案（素材来源、内容目标、发布渠道）
2. 用户选择的内容方向
3. 用户讲述的一次真实失败经历（可能为空）

如果用户没有提供失败经历（failureStoryInput 为空或不存在），
则基于选择题答案和内容方向推荐通用选题。
如果用户提供了失败经历，则优先围绕这次经历推荐选题。
```

### 2.3 工作原则

```
1. 选题必须适合普通人马上开始写。
2. 不要求用户有专家身份或成功经历。
3. 不要太宏大，聚焦一个具体场景或感受。
4. 不要像营销课标题或课程大纲。
5. 如果有失败经历，优先从以下角度切入：
   - 一次真实的失败瞬间
   - 当时的内心困境和感受
   - 用户后来发生的变化或选择
   - 这段经历如何体现用户的人格魅力
6. 如果没有失败经历，从用户选择的方向出发，
   推荐适合普通人第一条表达的选题。
7. 每个选题都要让用户感觉："这个我真的能讲。"
```

### 2.4 输出要求

```
只输出 JSON。

不要输出 Markdown。

不要输出解释文字。

必须返回 3 个选题。

其中一个且只能一个 recommended 为 true。
```

### 2.5 JSON Schema

```json
[
  {
    "title": "选题标题，不超过 20 个字",
    "recommended": true,
    "summary": "选题简介，30 字以内",
    "whyFirst": "为什么适合作为第一条，45 字以内"
  },
  {
    "title": "选题标题，不超过 20 个字",
    "recommended": false,
    "summary": "选题简介，30 字以内",
    "whyFirst": "为什么适合作为第一条，45 字以内"
  },
  {
    "title": "选题标题，不超过 20 个字",
    "recommended": false,
    "summary": "选题简介，30 字以内",
    "whyFirst": "为什么适合作为第一条，45 字以内"
  }
]
```

### 2.6 禁止出现的词

```
爆款、涨粉、变现、私域收割、打造人设、赛道红利、
流量密码、普通人逆袭、必须、一定要、保证火
```

### 2.7 自检清单

```
输出前检查：
1. 是否只有 JSON？
2. 是否正好 3 个选题？
3. 是否只有一个 recommended: true？
4. 选题是否具体、可操作？
5. 是否避免了焦虑和营销感？
6. 如果有失败经历，选题是否围绕这次经历？
```

---

## 3. failureStoryInput 为空时的兼容策略

### 3.1 Prompt 层面的兼容

在 Prompt 中明确说明：

```
如果用户没有提供失败经历（failureStoryInput 为空或不存在），
则基于选择题答案和内容方向推荐通用选题。
```

这样模型会根据输入自动调整：
- 有失败经历 → 围绕经历推荐选题
- 无失败经历 → 基于方向和答案推荐通用选题

### 3.2 Payload 层面的兼容

当前 payload 已经包含 `failureStoryInput`：

```typescript
{
  answers,
  selectedDirection: directions[selectedDirection],
  failureStoryInput: input,  // 可能为空字符串
}
```

空字符串和不存在都是合法的，Prompt 会处理这两种情况。

### 3.3 Mock 层面的兼容

`mockProvider.ts` 中的 `mockTopics` 不需要修改，继续返回固定的 3 个选题。

真实模型接入后，DeepSeek 会根据是否有失败经历返回不同的选题。

---

## 4. 保证只有一个 recommended: true

### 4.1 Prompt 层面的约束

在 Prompt 中明确要求：

```
必须返回 3 个选题。

其中一个且只能一个 recommended 为 true。
```

### 4.2 模型层面的约束

DeepSeek 使用 `response_format: { type: "json_object" }`，会强制输出合法 JSON。

但模型可能不严格遵守"只有一个 true"的约束。

### 4.3 服务端的兜底校验

在 `deepseekProvider.ts` 中增加校验逻辑：

```typescript
// 解析 JSON 后校验
const parsed = JSON.parse(content) as TopicRecommendation[];

// 校验：必须有 3 个选题
if (!Array.isArray(parsed) || parsed.length !== 3) {
  return { ok: false, source: "deepseek", error: "invalid_topic_count" };
}

// 校验：必须有且只有一个 recommended: true
const recommendedCount = parsed.filter(t => t.recommended === true).length;
if (recommendedCount !== 1) {
  return { ok: false, source: "deepseek", error: "invalid_recommended_count" };
}

return { ok: true, data: parsed, source: "deepseek" };
```

如果校验失败，返回 `ok: false`，触发 fallback 到 mock。

---

## 5. Prompt Registry 接入方案

### 5.1 新增 Prompt 常量

在 `src/services/prompts/promptRegistry.ts` 中新增：

```typescript
const RECOMMEND_TOPIC_PROMPT = `...`;  // 完整的 Prompt 文本
```

### 5.2 更新 getSystemPrompt

在 `getSystemPrompt` 函数中增加 case：

```typescript
export function getSystemPrompt(taskType: TaskType): string {
  switch (taskType) {
    case "recommend_direction":
      return RECOMMEND_DIRECTION_PROMPT;
    case "recommend_topic":
      return RECOMMEND_TOPIC_PROMPT;
    default:
      return DEFAULT_PROMPT;
  }
}
```

### 5.3 不需要修改其他文件

- `deepseekProvider.ts` 不需要修改，已经调用 `getSystemPrompt(taskType)`
- `modelService.ts` 不需要修改，已经透传 payload
- `route.ts` 不需要修改，已经透传 payload
- `MvpShell.tsx` 不需要修改，已经传递 `failureStoryInput`

---

## 6. DeepSeek 返回异常时的 fallback 策略

### 6.1 沿用现有 fallback 机制

当前 `deepseekProvider.ts` 已经实现了 fallback：

```typescript
// API 调用失败
if (!response.ok) {
  return { ok: false, source: "deepseek", error: ... };
}

// 响应为空
if (!content) {
  return { ok: false, source: "deepseek", error: "empty_response" };
}

// JSON 解析失败
try {
  const parsed = JSON.parse(content) as T;
} catch (error) {
  return { ok: false, source: "deepseek", error: "json_parse_error" };
}
```

### 6.2 新增校验失败

在 JSON 解析成功后，增加结构和内容校验：

```typescript
// 校验选题数量
if (!Array.isArray(parsed) || parsed.length !== 3) {
  return { ok: false, source: "deepseek", error: "invalid_topic_count" };
}

// 校验 recommended 数量
const recommendedCount = parsed.filter(t => t.recommended === true).length;
if (recommendedCount !== 1) {
  return { ok: false, source: "deepseek", error: "invalid_recommended_count" };
}
```

### 6.3 route.ts 的 fallback 处理

`route.ts` 已经实现了 fallback：

```typescript
const result = await deepseekGenerate(taskType, payload);

if (!result.ok) {
  // fallback 到 mock
  const mockResult = mockGenerate(taskType, payload);
  return NextResponse.json({
    ...mockResult,
    source: "mock",
    error: result.error,
  });
}

return NextResponse.json(result);
```

不需要修改，任何 `ok: false` 都会触发 fallback。

---

## 7. 需要修改的文件

### 7.1 必须修改

```
src/services/prompts/promptRegistry.ts
```

- 新增 `RECOMMEND_TOPIC_PROMPT` 常量
- 更新 `getSystemPrompt` 函数，增加 `recommend_topic` case

### 7.2 建议修改

```
src/services/providers/deepseekProvider.ts
```

- 在 JSON 解析后增加选题数量和 recommended 数量的校验
- 校验失败时返回 `ok: false`，触发 fallback

### 7.3 不需要修改

```
src/services/modelService.ts
src/app/api/generate/route.ts
src/services/providers/mockProvider.ts
src/components/MvpShell.tsx
src/types/app.ts
src/data/mockData.ts
src/app/globals.css
```

---

## 8. 明确本轮不做的事情

本轮严格不做：

- ❌ 不写 `generate_content` Prompt（PR-09 做）
- ❌ 不写 `revise_content` Prompt（后续 PR 做）
- ❌ 不写 `extract_story_asset` Prompt（PR-10 做）
- ❌ 不升级故事库数据模型
- ❌ 不实现完整转折点提取
- ❌ 不改 UI
- ❌ 不新增数据库
- ❌ 不做复杂 Agent 编排
- ❌ 不做一个月内容规划
- ❌ 不修改 DeepSeek Provider 的调用逻辑（只增加校验）
- ❌ 不修改 API Route
- ❌ 不修改 mock 数据

---

## 9. 验收标准

### 9.1 工程验收

```bash
npm run typecheck  # 必须通过
npm run lint       # 必须通过（0 errors, 0 warnings）
npm run build      # 必须通过
```

### 9.2 功能验收

#### 场景 1：用户提供失败经历

1. 用户完成三道选择题
2. 用户选择一个方向
3. 用户在失败故事页面输入一段真实经历
4. 用户点击"继续找选题"
5. DeepSeek 返回 3 个选题，围绕用户的失败经历
6. 其中只有 1 个 `recommended: true`
7. 选题具体、可操作、不泛化

#### 场景 2：用户跳过失败经历

1. 用户完成三道选择题
2. 用户选择一个方向
3. 用户在失败故事页面点击"暂时跳过"
4. DeepSeek 返回 3 个选题，基于方向和选择题答案
5. 其中只有 1 个 `recommended: true`
6. 选题通用但不泛化

#### 场景 3：DeepSeek 返回异常

1. DeepSeek 返回的选题数量不是 3 个
2. 或 recommended 数量不是 1 个
3. 系统 fallback 到 mock
4. 用户看到 mock 选题，流程不中断

### 9.3 Mock 兼容验收

1. 不配置 API Key 时，mock 流程正常
2. Mock 选题不受 `failureStoryInput` 影响
3. 页面不报错

---

## 10. 后续 PR 规划

### PR-09：Generate Content Prompt V2

- 新增 `generate_content` Prompt
- 围绕用户的失败经历生成第一条视频文案
- 文案结构：失败瞬间 → 内心困境 → 转向 → 新认知 → 当下影响 → 给同频者的价值 → 轻量钩子

### PR-10：Turning Point Finder / Story Asset V2

- 新增 `extract_story_asset` Prompt
- 从用户的失败经历中提取结构化转折点资产
- 扩展 `ExtractedStoryAsset` 类型
- 故事库展示转折点卡片

---

## 11. 核心结论

1. **Prompt 策略**：在 Prompt 中明确说明如何处理空 `failureStoryInput`，让模型自动适配
2. **数据结构**：不需要修改，现有 `TopicRecommendation` 已经满足需求
3. **校验机制**：在 `deepseekProvider.ts` 中增加选题数量和 recommended 数量的校验
4. **Fallback**：沿用现有机制，任何 `ok: false` 都会触发 fallback 到 mock
5. **改动范围**：只修改 `promptRegistry.ts` 和 `deepseekProvider.ts`，其他文件不动
6. **风险控制**：不提前做后续 PR 的工作，保持 PR 边界清晰

---

## 12. Review 要点

请 Review 时重点关注：

1. Prompt 是否清晰、完整、可执行？
2. 空 `failureStoryInput` 的处理是否合理？
3. 校验逻辑是否足够严格？
4. Fallback 策略是否可靠？
5. 改动范围是否最小化？
6. 是否明确排除了后续 PR 的工作？
