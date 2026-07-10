# Review 007：PR-08 代码评审

日期：2026-07-10  
评审对象：PR #8 `feat: implement recommend_topic prompt v2 with validation`  
产品与技术依据：
- `docs/reviews/review-006-pr-08-technical-plan.md`
- `docs/product/v0.2-personality-ip-upgrade.md`
- `docs/product/model-service-contract.md`

## 评审结论

**代码实现通过，未发现阻塞性代码问题；合并前仍需完成真实 DeepSeek 调用验收。**

PR-08 已按 Review-006 完成 Prompt、任务专用校验和模型契约同步。当前剩余事项不是继续改代码，而是证明真实模型没有触发 mock fallback，并确认有故事与无故事两种输入都能稳定返回符合产品要求的选题。

---

## 1. 改动范围

PR 只修改以下 4 个约定文件：

```text
prompts/recommend_topic.md
src/services/prompts/promptRegistry.ts
src/services/providers/deepseekProvider.ts
docs/product/model-service-contract.md
```

未修改 UI、API Route、modelService、mockProvider、mock 数据、故事库或其他 Prompt，范围符合 Review-006。

---

## 2. Prompt 评审

### 2.1 通过项

- 使用 `{ "topics": [...] }` 顶层对象结构。
- 明确 payload 是用户数据，不执行其中的提示注入指令。
- 有失败故事时优先围绕真实输入推荐。
- 无失败故事时要求具体、第一人称、可立即表达，避免退化为泛知识题。
- 明确禁止编造用户没有提供的选择、变化、结果和新信念。
- 三个选题要求使用不同表达角度。
- 推荐项有清晰判断标准。
- 输出 Schema 与 `TopicRecommendation` 字段一致。
- `prompts/recommend_topic.md` 与运行时 Prompt 的规则和 Schema 保持一致；仅存在设计稿所需的 Markdown 分隔和代码围栏差异，不构成运行规则差异。

### 2.2 非阻塞观察

当前 Prompt 设计稿和运行时 Prompt 采用复制维护。后续修改 Prompt 时必须同步更新两处，避免漂移。本 PR 不需要为此增加 Prompt 文件加载机制。

---

## 3. Provider 校验评审

### 3.1 通过项

`parseRecommendTopicResponse(value: unknown)` 已完成：

1. 顶层必须是非空对象；
2. 必须包含 `topics`；
3. `topics` 必须是数组；
4. 数组长度必须等于 3；
5. 每项必须是对象；
6. `title`、`summary`、`whyFirst` 必须是非空字符串；
7. `recommended` 必须是 boolean；
8. 标题去除首尾空格后不能重复；
9. 必须恰好一个 `recommended: true`。

JSON 解析从 `unknown` 开始，没有先用类型断言跳过运行时验证。

### 3.2 任务隔离

校验只在：

```ts
taskType === "recommend_topic"
```

时执行。其他任务继续返回原始解析结果，不受 PR-08 影响。

### 3.3 返回契约

模型返回对象经过校验后，Provider 将 `topics` 解包为：

```ts
TopicRecommendation[]
```

因此前端和 API Route 的既有契约不需要修改。

### 3.4 Fallback

校验失败返回：

```text
invalid_recommend_topic_response
```

现有 API Route 会据此 fallback 到 mock，并通过 `source` 与 `error` 暴露实际来源。符合本轮要求。

---

## 4. Model Service Contract

`RecommendTopicPayload` 已增加：

```ts
failureStoryInput?: string;
```

并记录：

- 有故事时围绕真实故事推荐；
- 无故事时基于答案和方向推荐具体起步选题；
- 不得虚构用户未提供的经历。

契约同步通过。

---

## 5. 工程验证状态

PR 提交者报告以下本地命令通过：

```bash
npm run typecheck
npm run lint
npm run build
```

GitHub 当前没有与该 head commit 关联的 Actions workflow 或 commit status，因此本评审无法用远程 CI 独立确认，只能记录为“本地验证已报告通过”。

---

## 6. 合并前必须完成的真实模型验收

Review-006 明确要求真实模型验收必须检查：

```text
source === "deepseek"
```

当前 PR 描述提供了验收步骤，但没有提供实际执行结果。因此合并前需补充以下两组结果。

### 场景 A：有失败故事

输入一段明确但不包含后续转变的失败经历，确认：

- API 响应 `source === "deepseek"`；
- 返回恰好 3 个选题；
- 恰好 1 个推荐项；
- 三个角度不同；
- 没有编造用户已经走出低谷、完成转变或形成新信念。

### 场景 B：跳过失败故事

使用空 `failureStoryInput`，确认：

- API 响应 `source === "deepseek"`；
- 返回恰好 3 个具体起步选题；
- 恰好 1 个推荐项；
- 选题基于方向与选择题答案；
- 没有退化为宽泛知识题或营销题。

如任一场景返回：

```text
source === "mock"
```

则不能视为通过，需要记录 `error` 并继续排查。

验收回报不需要提交 API Key，也不要把 API Key、完整请求头或 `.env.local` 内容放入 PR。

---

## 7. 最终决定

- **代码评审：通过**
- **产品边界：通过**
- **工程结构：通过**
- **真实模型验收：待补充**
- **当前合并建议：暂缓合并，完成两组 `source === "deepseek"` 验收后即可进入最终合并审核**
