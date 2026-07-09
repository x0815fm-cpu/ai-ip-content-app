# PR #1 修改建议：MVP 前端壳子对齐产品事实源

日期：2026-07-09  
关联 PR：#1 `Initialize mobile app shell`  
分支：`agent/mobile-app-shell`

---

## 0. 当前判断

PR #1 的方向是对的，可以作为 MVP 前端壳子的基础。

它已经完成了：

- 初始化 Next.js + TypeScript + Tailwind CSS 工程壳
- 搭建移动端 phone-style UI
- 加入首页、选择题、方向推荐、选题推荐、内容结果、故事库、小光浮窗等页面雏形
- 新增 `modelService.generate(taskType, payload)` 预留层
- 加入本地设计图片与 public 图片资源

但是当前 PR 仍然是 Draft，不建议直接合并。

原因不是视觉问题，而是主流程、状态设计、mock 数据结构、反馈改写、小光沉淀能力，还没有完全对齐仓库里的唯一事实源。

---

## 1. 必改：三道选择题必须拆成 3 个连续步骤

产品事实源要求主流程为：

```text
首页
↓
选择题 1：找素材来源
↓
选择题 2：确认内容目标
↓
选择题 3：确认发布载体
↓
第 4 页：AI 推荐 3 个 IP 内容方向
↓
第 5 页：AI 推荐 3 个选题
↓
第 6 页：生成一条内容文案
↓
反馈按钮校准文案
```

当前 PR 中 `questionPage` 只有 `1 | 2`，导致：

- 第 1 题单独一页
- 第 2 题和第 3 题放在同一页
- 用户点击发布载体后直接进入方向页
- 理论上可能没有选择内容目标，也能进入下一步

这不符合产品设计。

### 修改要求

- 用 `questionIndex` 替代 `questionPage: 1 | 2`
- `questionIndex` 从 `0` 到 `2`
- 每次只展示一道题
- 用户完成第 3 题后，才进入方向推荐页
- 返回逻辑支持：第 3 题返回第 2 题，第 2 题返回第 1 题

建议结构：

```ts
const [questionIndex, setQuestionIndex] = useState(0);

function chooseAnswer(id: keyof AnswerMap, value: string) {
  setAnswers((current) => ({ ...current, [id]: value }));

  if (questionIndex < questions.length - 1) {
    setQuestionIndex((current) => current + 1);
    return;
  }

  setView("directions");
}
```

---

## 2. 必改：进度条要对齐 MVP 主流程

当前进度条只写死了 3 个点，并且使用：

```ts
Math.min(progressIndex, 2)
```

这会导致方向、选题、内容页的进度显示不准确。

MVP 主流程应至少体现 4 个阶段：

```text
选择题 → 方向 → 选题 → 文案
```

### 修改要求

- 不要写死 `[0, 1, 2]`
- 不要使用 `Math.min(progressIndex, 2)`
- 使用统一的 `flowSteps`

建议：

```ts
export const flowSteps = ["选择题", "方向", "选题", "文案"];
```

页面对应关系：

```ts
home: 无进度或 0
questions: 0
directions: 1
topics: 2
content: 3
story: 无进度
```

---

## 3. 必改：mock 数据不要硬编码在组件里

当前 `directions`、`topics`、`feedbacks`、`contentRows` 都写在 `MvpShell.tsx` 内部。

这会导致后续接入真实模型时，组件变得越来越重。

### 修改要求

把 mock 数据迁移到：

```text
src/data/mockData.ts
```

建议包含：

```ts
export const questions = [...];
export const flowSteps = ["选择题", "方向", "选题", "文案"];
export const mockDirections = [...];
export const mockTopics = [...];
export const feedbackOptions = [...];
export const mockGeneratedContent = ...;
export const mockStoryCards = ...;
export const storyCategories = ["经历", "想法", "金句", "选题"];
```

`MvpShell.tsx` 只负责：

- 页面状态
- 用户选择
- 调用 `modelService.generate`
- 展示结果

---

## 4. 必改：完善 `modelService.generate(taskType, payload)` 的 mock 分发

当前 `modelService.generate()` 只是原样返回：

```ts
{
  taskType,
  payload,
  source: "mock"
}
```

这一步方向是对的，但还不够。

任务清单要求第一版保留：

```text
modelService.generate(taskType, payload)
```

并为未来接 DeepSeek / OpenAI / Claude / Gemini 预留结构。

### 修改要求

先不接真实模型，只做 mock 分发：

```ts
export async function generate<TResponse = unknown>(
  taskType: TaskType,
  payload: ModelPayload
): Promise<TResponse> {
  switch (taskType) {
    case "recommend_direction":
      return mockDirections as TResponse;
    case "recommend_topic":
      return mockTopics as TResponse;
    case "generate_content":
      return mockGeneratedContent as TResponse;
    case "revise_content":
      return mockRevisedContent(payload) as TResponse;
    case "extract_story_asset":
      return mockExtractedStoryAsset(payload) as TResponse;
    default:
      return { taskType, payload, source: "mock" } as TResponse;
  }
}
```

注意：

- 不做复杂多模型路由
- 不做真实 API key
- 不引入后端
- 不破坏当前前端壳子

---

## 5. 必改：反馈按钮要补齐并触发改写状态

MVP 任务清单中的反馈按钮是：

```text
不够像我
太官方了
太营销了
太长了
太短了
开头不吸引人
换一种讲法
```

当前 PR 只有：

```text
不够像我
太官方了
太长了
换一种讲法
```

并且点击按钮没有实际逻辑。

### 修改要求

- 补齐全部反馈按钮
- 点击后调用 `revise_content`
- 不让用户重新走完整流程
- 页面可以显示“已根据你的反馈改写”或直接替换内容

建议调用：

```ts
await modelService.generate("revise_content", {
  answers,
  selectedDirection,
  selectedTopic,
  currentContent,
  feedbackType,
});
```

---

## 6. 必改：小光浮窗要具备最轻量的沉淀能力

当前 PR 中小光浮窗已经对齐两句关键文案：

```text
想起什么，都可以跟我说。
你愿意留下来的内容，我会帮你整理成故事卡。
```

这很好。

但 MVP 任务清单要求小光至少支持：

- 用户自由讲故事
- 生成沉淀卡
- 沉淀卡包含：经历、想法、金句、可生成选题

### 修改要求

在小光浮窗里增加：

- 一个轻量输入框
- 一个按钮：`沉淀成故事卡`
- 点击后展示 mock 故事卡

故事卡格式：

```markdown
已沉淀到你的故事库

**经历**
...

**想法**
...

**金句**
...

**可生成选题**
1. ...
2. ...
3. ...
```

隐私表达保持：

```text
你愿意留下来的内容，我会帮你整理成故事卡。
```

不要说：

```text
我会保存你的聊天记录
```

---

## 7. 应保持不变的部分

不要推翻当前 UI。

当前视觉方向符合仓库里的 UI 参考：

```text
温暖
轻
留白
圆角卡片
柔和渐变
小光漂浮入口
主流程清晰
故事库轻入口
```

本轮修改不应改成后台系统风格，也不应变成普通 AI 工具风格。

需要保留：

- phone-style 手机壳展示
- 首页主按钮：生成一条内容文案
- 我的故事库轻入口
- 每页右下角小光浮窗
- 温暖浅色视觉
- 圆角卡片布局

---

## 8. 暂时不要做的事情

本轮不要做：

- 真实 DeepSeek API 接入
- OpenAI / Claude / Gemini 多模型路由
- 复杂 Multi-Agent
- 登录系统
- 数据库
- 账号完整规划
- 30 条选题
- 自动发布
- 短视频剪辑
- 复杂故事库编辑器
- 涨粉 / 变现承诺

当前目标只有一个：

> 把 MVP 前端壳子的流程、状态、mock 数据和小光沉淀能力对齐产品事实源。

---

## 9. 给 Codex 的执行指令

可以直接把下面这段交给 Codex：

```text
请基于 PR #1 修改，不要改变当前 UI 风格，重点修正 MVP 流程与代码结构。

修改要求：

1. 三道选择题必须拆成 3 个连续步骤：
   - 第 1 题：素材来源
   - 第 2 题：内容目标
   - 第 3 题：发布载体
   不要把第 2、3 题放在同一页。
   只有三题都完成后，才进入方向推荐页。

2. 重构 MvpShell.tsx：
   - 用 questionIndex 替代 questionPage: 1 | 2
   - 选择题渲染使用 questions[questionIndex]
   - goBack 支持从第 3 题退回第 2 题，从第 2 题退回第 1 题。

3. 修正进度条：
   - 使用 4 个阶段：选择题、方向、选题、文案
   - 不要 Math.min(progressIndex, 2)
   - 保证方向、选题、文案页面进度显示正确。

4. 把 directions、topics、feedbacks、contentRows 从 MvpShell.tsx 移到 src/data/mockData.ts。
   MvpShell.tsx 只负责状态流转和 UI 展示。

5. 完善 src/services/modelService.ts：
   - 保留 generate(taskType, payload)
   - 根据 taskType 返回 mockDirections、mockTopics、mockGeneratedContent、mockRevisedContent。
   - 不接真实模型，不做复杂多模型路由。

6. 反馈按钮补齐：
   - 不够像我
   - 太官方了
   - 太营销了
   - 太长了
   - 太短了
   - 开头不吸引人
   - 换一种讲法
   点击后调用 revise_content mock，不重新走完整流程。

7. 小光浮窗增加一个轻量输入框和“沉淀成故事卡”按钮。
   点击后展示 mock 故事卡，包含：
   - 经历
   - 想法
   - 金句
   - 可生成选题

8. 保持当前视觉方向：
   温暖、轻、留白、圆角卡片、柔和渐变、小光漂浮入口。
   不要改成后台系统风格。

完成后运行：
npm run typecheck
npm run lint
npm run build
```

---

## 10. 合并建议

当前建议：

```text
先不合并 PR #1。
让 Codex 按本文档修改完成后，再 review 一次。
通过 typecheck / lint / build 后，再考虑合并。
```

合并标准：

- 三道选择题是 3 个连续步骤
- 方向 / 选题 / 文案流程完整
- 反馈按钮可以触发 mock 改写
- 小光可以 mock 沉淀故事卡
- 数据与服务层结构为后续接模型预留
- UI 风格不被破坏
