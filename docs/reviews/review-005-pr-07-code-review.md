# Review 005：PR #7 代码评审

日期：2026-07-10  
评审对象：PR #7 `feat: add failure story input step (PR-07)`  
产品与技术依据：`docs/reviews/review-004-pr-07-technical-plan.md`

---

## 0. 评审结论

PR #7 的主体实现符合 Review-004：

- 真实失败输入位于方向之后、选题之前。
- 字段统一使用 `failureStoryInput`。
- 输入传递给 `recommend_topic`、`generate_content`、`revise_content`。
- 返回路径与输入保留逻辑正确。
- 进度条已调整为五步。
- 页面文案与 Review-004 一致。
- 没有修改 Provider、API Route、Prompt Registry 或 Story Asset。

但合并前需要修正两个小问题。

结论：

> **Request minor changes：修完以下两点后即可合并。**

---

## 1. 必修：`暂时跳过` 要真正忽略已输入内容

当前 `暂时跳过` 和 `继续找选题` 两个按钮都直接调用同一个 `onNext`：

```tsx
<button onClick={onNext}>暂时跳过</button>
<button onClick={onNext}>继续找选题</button>
```

当用户已经输入了一段文字，之后又决定点击「暂时跳过」时，当前实现仍会把这段文字作为 `failureStoryInput` 传给 `recommend_topic`。

这与「暂时跳过」的产品语义不一致。

### 修改要求

给页面组件拆分两个回调：

```ts
onSkip: () => void;
onContinue: () => void;
```

推荐实现：

```ts
async function continueToTopics(input = failureStoryInput) {
  const nextTopics = await modelService.generate<TopicRecommendation[]>("recommend_topic", {
    answers,
    selectedDirection: directions[selectedDirection],
    failureStoryInput: input,
  });

  setTopics(nextTopics);
  setSelectedTopic(0);
  setView("topics");
}

function skipFailureStory() {
  setFailureStoryInput("");
  void continueToTopics("");
}
```

组件调用：

```tsx
<FailureStoryInputScreen
  input={failureStoryInput}
  onChange={setFailureStoryInput}
  onBack={goBack}
  onSkip={skipFailureStory}
  onContinue={() => void continueToTopics()}
  progressIndex={progressIndex}
/>
```

按钮：

```tsx
<button onClick={onSkip}>暂时跳过</button>
<button onClick={onContinue}>继续找选题</button>
```

验收：

1. 输入内容后点击「继续找选题」，payload 包含输入内容。
2. 输入内容后点击「暂时跳过」，payload 中 `failureStoryInput` 必须为空字符串。
3. 跳过后返回真实失败页，输入框为空。

---

## 2. 必修：撤回与本功能无关的引号修改

本 PR 在两处把中文弯引号改成了英文直引号：

### `src/data/mockData.ts`

当前改动：

```ts
`按"${feedbackType}"改了一版...`
```

应恢复为原来的：

```ts
`按“${feedbackType}”改了一版...`
```

### `src/components/MvpShell.tsx`

当前改动：

```tsx
`已根据"${activeFeedback}"改写`
```

应恢复为：

```tsx
`已根据“${activeFeedback}”改写`
```

原因：

- 与 PR-07 功能无关。
- Review-004 明确要求 `mockData.ts` 只调整 `flowSteps`。
- 保持 PR 范围干净，避免无关文案变化混入功能提交。

---

## 3. Review-004 验收对照

### 已通过

1. 三道选择题流程正常。
2. 方向推荐流程正常。
3. 选定方向后进入真实失败输入页。
4. 输入页文案与 Review-004 一致。
5. 用户可输入一句或一段文字。
6. 用户可进入后续选题流程。
7. 点击「继续找选题」后调用 `recommend_topic`。
8. 从选题返回时输入内容保留。
9. `recommend_topic` payload 包含 `failureStoryInput`。
10. `generate_content` payload 包含 `failureStoryInput`。
11. `revise_content` payload 包含 `failureStoryInput`。
12. 进度条映射为：选择题 / 方向 / 故事 / 选题 / 文案。
13. 文件范围基本符合 Review-004。
14. typecheck / lint / build 据 PR 描述均已通过。

### 待修后通过

1. 「暂时跳过」必须真正忽略并清空输入内容。
2. 撤回两处无关的引号样式修改。

---

## 4. 修复后验收

修复完成后重新运行：

```bash
npm run typecheck
npm run lint
npm run build
```

并人工验证：

```text
输入故事 → 继续找选题 → 内容被传递
输入故事 → 暂时跳过 → 内容被清空且不传递
选题页 → 返回 → 未跳过的内容仍保留
```

三项验证通过后，本 PR 可以合并。
