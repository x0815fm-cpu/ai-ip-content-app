# PR #1 第二轮复审意见

日期：2026-07-09  
关联 PR：#1 `Initialize mobile app shell`  
分支：`agent/mobile-app-shell`  
本轮 head：`1247ec9ba1dfb99f5f70434f6efa178a08a773aa`

---

## 0. 复审结论

这一版已经明显比第一版好，基本按 `docs/pr-1-mvp-shell-review.md` 完成了核心修改。

当前判断：

> **主体流程可以接受，但合并前还需要修一个构建/类型检查风险点。**

修完后重新执行：

```bash
npm run typecheck
npm run lint
npm run build
```

三项通过后，可以考虑从 Draft 转为 Ready for review，并准备合并。

---

## 1. 已完成得比较好的部分

### 1.1 三道选择题已改成连续步骤

当前已使用：

```ts
const [questionIndex, setQuestionIndex] = useState(0);
```

并且每次只渲染：

```ts
questions[questionIndex]
```

这已经符合 MVP 主流程：

```text
选择题 1 → 选择题 2 → 选择题 3 → 方向推荐
```

比上一版把第 2、3 题放在同一页更符合产品事实源。

---

### 1.2 mock 数据已经迁移到 `src/data/mockData.ts`

当前已包含：

- `questions`
- `flowSteps`
- `mockDirections`
- `mockTopics`
- `feedbackOptions`
- `mockGeneratedContent`
- `mockStoryCards`
- `mockRevisedContent`
- `mockExtractedStoryAsset`

这让 `MvpShell.tsx` 更偏向状态流转和 UI 展示，也为后续接真实模型预留了空间。

---

### 1.3 `modelService.generate(taskType, payload)` 已有 mock 分发

当前 `modelService` 已经支持：

```ts
recommend_direction
recommend_topic
generate_content
revise_content
extract_story_asset
```

这符合第一版要求：

> 保留统一模型服务层，但暂时不做复杂多模型路由。

---

### 1.4 反馈改写已补齐

当前反馈项已经补齐为：

```text
不够像我
太官方了
太营销了
太长了
太短了
开头不吸引人
换一种讲法
```

并且点击后会走 `revise_content` mock，不需要让用户重新走完整流程。

这符合 MVP 任务清单。

---

### 1.5 小光已具备轻量故事沉淀能力

当前小光已不只是浮窗文案，而是加入了：

- 输入草稿
- `extract_story_asset`
- mock 故事卡
- 经历 / 想法 / 金句 / 可生成选题

这个方向是对的。

---

### 1.6 进度条已改成 4 阶段

当前 `flowSteps` 已为：

```ts
["选择题", "方向", "选题", "文案"]
```

比上一版 3 个点更符合当前 MVP 流程。

---

## 2. 合并前必须修的点

### 问题：`next-env.d.ts` 不要手动引入 `.next/types/routes.d.ts`

当前 `next-env.d.ts` 里有：

```ts
import "./.next/types/routes.d.ts";
```

这个文件不建议手动维护。

原因：

1. `.next/` 是构建产物，不应该作为源码依赖。
2. 干净环境下，如果还没运行过 Next 构建，`.next/types/routes.d.ts` 可能不存在。
3. `tsconfig.typecheck.json` 又排除了 `.next`，这会让 typecheck 在不同环境下有潜在不稳定风险。
4. Next.js 的 `next-env.d.ts` 应尽量保持默认生成内容。

### 修改要求

把 `next-env.d.ts` 改回默认形态：

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

删除这一行：

```ts
import "./.next/types/routes.d.ts";
```

---

## 3. 建议 Codex 执行指令

可以直接把下面这段交给 Codex：

```text
请基于 PR #1 当前最新版本继续修改。

这轮只修一个合并前风险点：

删除 next-env.d.ts 中的：

import "./.next/types/routes.d.ts";

保持 next-env.d.ts 为 Next.js 默认生成内容：

/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

不要改 UI，不要改产品流程，不要新增功能。

修改完成后运行：

npm run typecheck
npm run lint
npm run build

三项通过后，在 PR 里更新验证结果。
```

---

## 4. 当前合并建议

当前不建议立刻合并。

建议流程：

```text
修 next-env.d.ts
↓
重新跑 typecheck / lint / build
↓
如果全部通过
↓
把 PR 从 Draft 改为 Ready for review
↓
最后再合并
```

如果三项验证全部通过，本 PR 可以作为 MVP 前端壳子的第一版基础合入 main。
