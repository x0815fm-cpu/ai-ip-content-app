# Review 003：PR #5 DeepSeek Provider 后续推进建议

日期：2026-07-09  
关联 PR：#5 `feat: add DeepSeek provider skeleton and generate API route`  
阶段：Sprint 1 - 真实模型联调

---

## 0. 当前结论

PR #5 的 DeepSeek Provider Skeleton 方向正确，可以作为真实模型接入的基础。

它已经完成了：

- `.env.example`
- `/api/generate` 服务端入口
- `deepseekProvider`
- `mockProvider`
- 前端 `modelService.generate()` 统一调用 `/api/generate`
- 服务端 fallback
- 客户端 fallback

下一步不要继续扩基础设施，也不要加新功能。

下一步目标只有一个：

> 让 DeepSeek 真正使用仓库里的 Prompt，先跑通 `recommend_direction`。

---

## 1. 本轮 Codex 执行目标

请基于最新 `main` 新建 PR：

```text
feat/prompt-registry-recommend-direction
```

PR 标题建议：

```text
feat: wire recommend_direction prompt into DeepSeek provider
```

本轮只做：

```text
三道选择题 → recommend_direction prompt → DeepSeek → 返回 3 个方向 → 页面展示
```

---

## 2. 必须先同步最新 main

执行前先确认：

```bash
git checkout main
git pull
```

确保 PR #4 小光修复和 PR #5 DeepSeek Provider 已合入后，再开始新分支。

---

## 3. 本轮改动范围

### 3.1 新增 Prompt Registry

建议新增：

```text
src/services/prompts/promptRegistry.ts
```

职责：

- 根据 `taskType` 返回对应 prompt 文本。
- 第一版只需要支持 `recommend_direction`。
- 其他 taskType 可以先返回简单 JSON-only placeholder。

建议接口：

```ts
export function getSystemPrompt(taskType: TaskType): string
```

---

### 3.2 让 DeepSeek Provider 使用 Prompt Registry

修改：

```text
src/services/providers/deepseekProvider.ts
```

把当前硬编码的 system prompt：

```ts
content: `You are a helpful assistant. Respond with valid JSON only. Task type: ${taskType}`
```

替换为：

```ts
content: getSystemPrompt(taskType)
```

---

### 3.3 接入 `prompts/recommend_direction.md`

当前仓库已经有：

```text
prompts/recommend_direction.md
```

Codex 需要让 `recommend_direction` 调用时使用这份 Prompt 的内容。

实现方式任选一种：

#### 方案 A：代码内维护 prompt 文本

在 `promptRegistry.ts` 中写入与 `prompts/recommend_direction.md` 同步的 prompt 字符串。

优点：实现简单。

缺点：文档和代码会有重复，后续需要同步维护。

#### 方案 B：服务端读取 prompt 文件

在服务端通过 `fs` 读取：

```text
prompts/recommend_direction.md
```

优点：仓库 prompt 文档就是运行时 prompt，单一事实源更强。

缺点：需要注意 Next.js 构建环境路径。

本轮推荐：**方案 A 先跑通**。

原因：当前目标是快速真实联调，不要被构建路径问题卡住。

后续再做 Prompt loader 重构。

---

## 4. 本轮不要做的事

不要做：

- 不写 `recommend_topic` 正式 Prompt。
- 不写 `generate_content` 正式 Prompt。
- 不写 `revise_content` 正式 Prompt。
- 不写 `extract_story_asset` 正式 Prompt。
- 不改 UI。
- 不改主流程。
- 不做多模型路由。
- 不接 OpenAI / Claude / Gemini。
- 不加数据库。
- 不加登录。

---

## 5. 本轮验收标准

### 5.1 工程验证

必须通过：

```bash
npm run typecheck
npm run lint
npm run build
```

### 5.2 Mock 验证

不配置 `DEEPSEEK_API_KEY` 时：

- 三道选择题后仍能返回 mock 方向。
- 页面不报错。

### 5.3 真实模型验证

配置 `.env.local` 后：

```env
DEEPSEEK_API_KEY=本地真实 key
DEEPSEEK_API_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
MODEL_PROVIDER=deepseek
USE_MOCK_MODEL=false
```

运行：

```bash
npm run dev
```

人工测试：

1. 点击首页「生成一条内容文案」。
2. 完成三道选择题。
3. 确认方向推荐来自 DeepSeek。
4. 页面展示 3 个方向。
5. 其中只有一个方向为 `recommended: true`。
6. 不出现 Markdown。
7. 不出现「爆款」「涨粉」「变现」「流量密码」等禁用词。

---

## 6. 输出质量标准

`recommend_direction` 的真实输出需要符合：

- 3 个方向。
- 方向名称短，不超过 12 个字。
- 像小光，不像营销导师。
- 普通人能看懂。
- 用户看完能产生「这个我好像能讲」的感觉。
- 不要泛泛而谈，如只写「个人成长」「职场经验」「AI 学习」。
- 尽量更贴近用户选择题中的素材来源、内容目标和发布载体。

---

## 7. PR 描述需要包含

Codex 提交 PR 时，请在 PR 描述中写清：

1. 是否新增 `promptRegistry.ts`。
2. `recommend_direction` 是否已经使用正式 Prompt。
3. 是否保留 mock fallback。
4. 不配置 API Key 时是否可跑。
5. 配置 API Key 后是否真实请求 DeepSeek。
6. 三项验证是否通过。
7. 至少贴一组真实模型返回样例，注意不要贴 API Key。

真实返回样例格式：

```json
[
  {
    "name": "...",
    "recommended": true,
    "whatToTalkAbout": "...",
    "targetAudience": "...",
    "whyFitYou": "..."
  }
]
```

---

## 8. 下一轮方向

本轮完成后，不急着继续写代码。

下一步进入产品联调：

```text
用户真实体验方向推荐
↓
截图 / 复制输出
↓
ChatGPT Review 输出质量
↓
修改 Prompt
↓
Codex 更新 Prompt
↓
再次测试
```

目标不是功能完成，而是让用户第一次感觉：

> 小光好像真的懂我适合讲什么。
