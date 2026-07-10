# Review 004：PR-07 技术方案评审与开发执行意见

日期：2026-07-10  
评审对象：`docs/technical/PR-07-technical-plan.md`  
产品依据：`docs/product/v0.2-personality-ip-upgrade.md`  
结论：**技术方向可行，但需按本文修订后再进入开发。**

---

## 1. 本轮真正要解决的问题

昨天产品讨论确定：

> 第一条视频优先从「一次真实的内心失败」开始，通过失败中的选择、变化和新信念，展现用户的人格魅力。

PR-07 的职责不是直接发现完整转折点，也不是完成最终文案升级。

本轮只负责：

> 在推荐第一条选题之前，轻量收集用户的一次真实失败，让后续选题和文案都有真实素材可用。

---

## 2. 技术方案中必须调整的两个关键点

### 2.1 输入步骤的位置需要前移

原技术方案流程：

```text
三道选择题
→ 方向推荐
→ 选题推荐
→ 真实失败输入
→ 文案生成
```

这个顺序存在产品问题：

- 用户的真实失败没有参与选题推荐。
- 推荐出来的选题仍然可能很泛。
- 用户先选了题，再提供故事，故事可能和选题不匹配。

修订后的流程必须是：

```text
首页
→ 三道选择题
→ 3 个内容方向
→ 用户选择方向
→ 一次真实失败输入
→ 基于方向与真实失败推荐 3 个选题
→ 用户选择选题
→ 生成文案
```

即：

> **真实失败输入放在方向之后、选题之前。**

---

### 2.2 原始输入不要命名为 `turningPointInput`

用户此时只是讲述：

- 一次失败；
- 一个低谷；
- 一段内心困境；
- 当时最真实的感受。

这段原始输入还不是“转折点”。

完整转折点需要后续模型继续识别：

```text
低谷
+
选择
+
变化
+
新的信念
=
转折点
```

因此本轮字段统一命名为：

```ts
failureStoryInput?: string;
```

不要使用：

```ts
turningPointInput
```

“转折点”应保留给后续结构化资产和模型提炼结果。

---

## 3. PR-07 修订后的开发目标

本轮新增一个轻量页面：

```text
Failure Story Input / 真实失败输入
```

用户选择内容方向后，进入该页面。

用户可以：

- 写一句话；
- 写一小段；
- 暂时跳过。

无论输入或跳过，都继续进入选题推荐。

---

## 4. 页面文案

### 页面标题

```text
想起一次你真的觉得自己不行了的时候
```

### 辅助说明

```text
不用讲得很完整。写下当时发生了什么，以及你心里最真实的感受。
```

### 输入框 placeholder

```text
比如：那段时间我每天都很累，开始怀疑自己是不是根本做不到……
```

### 按钮

```text
暂时跳过
继续找选题
```

### 产品语气要求

- 不逼迫用户暴露隐私。
- 不使用心理咨询式诊断语言。
- 不强调“创伤”。
- 不要求用户把故事讲完整。
- 让用户感觉只写一句也可以。

---

## 5. 代码变更范围

### 5.1 `src/types/app.ts`

更新 `AppView`：

```ts
export type AppView =
  | "home"
  | "questions"
  | "directions"
  | "failure_story"
  | "topics"
  | "content"
  | "story";
```

本轮不建议只新增一个未被实际使用的 `GenerateContentPayload` 类型。

当前 `modelService.generate()` 仍使用通用 `ModelPayload`，因此本轮只需保证调用 payload 中真实传入字段。

---

### 5.2 `src/components/MvpShell.tsx`

新增 state：

```ts
const [failureStoryInput, setFailureStoryInput] = useState("");
```

新增页面组件：

```text
FailureStoryInputScreen
```

方向页点击“选择这个方向”后：

```text
不要直接调用 recommend_topic
```

应改为：

```ts
setView("failure_story");
```

用户点击“继续找选题”或“暂时跳过”后，调用：

```ts
modelService.generate<TopicRecommendation[]>("recommend_topic", {
  answers,
  selectedDirection: directions[selectedDirection],
  failureStoryInput,
});
```

生成内容时同样传入：

```ts
modelService.generate<GeneratedContent>("generate_content", {
  answers,
  selectedDirection: directions[selectedDirection],
  selectedTopic: topics[selectedTopic],
  failureStoryInput,
});
```

反馈改写时也应保留该上下文：

```ts
modelService.generate<GeneratedContent>("revise_content", {
  answers,
  selectedDirection: directions[selectedDirection],
  selectedTopic: topics[selectedTopic],
  currentContent: generatedContent,
  feedbackType,
  failureStoryInput,
});
```

原因：后续真实 Prompt 接入后，第一次生成和反馈改写都需要基于同一段真实经历。

---

## 6. 返回逻辑

返回路径必须完整：

```text
failure_story → directions
topics → failure_story
content → topics
```

如果用户从选题页返回真实失败页，之前填写的内容必须保留。

重新从首页开启一次全新流程时，可以重置：

```ts
setFailureStoryInput("");
```

---

## 7. 进度条调整

当前流程已有 4 个阶段：

```text
选择题 / 方向 / 选题 / 文案
```

加入真实故事输入后，建议调整为 5 个阶段：

```ts
export const flowSteps = ["选择题", "方向", "故事", "选题", "文案"];
```

页面映射：

```text
questions      → 0
directions     → 1
failure_story  → 2
topics         → 3
content        → 4
```

这是流程准确性调整，不是视觉重做。

---

## 8. Mock 兼容

本轮不改 Mock 输出内容。

`mockProvider` 可以暂时忽略：

```ts
failureStoryInput
```

但 payload 必须已经传递完整，方便后续 Prompt PR 直接使用。

不配置 API Key 时：

- 真实失败页面正常显示；
- 点击继续或跳过后，mock 选题正常返回；
- 后续文案流程正常；
- 页面不能报错。

---

## 9. 本轮不做

本轮严格不做：

- 不提取完整转折点结构。
- 不升级故事库数据模型。
- 不新增数据库。
- 不持久化用户输入。
- 不写 `recommend_topic` 正式 Prompt。
- 不写 `generate_content` 正式 Prompt。
- 不修改 DeepSeek Provider。
- 不做一个月内容规划。
- 不做复杂 Router。
- 不做 UI 重设计。

---

## 10. 文件变更清单

本轮预计只修改：

```text
src/types/app.ts
src/components/MvpShell.tsx
src/data/mockData.ts
src/app/globals.css
```

说明：

- `mockData.ts` 只调整 `flowSteps`。
- `globals.css` 只增加真实失败输入页面需要的最小样式。
- 不应修改 Provider、API Route、Prompt Registry。

---

## 11. 验收标准

### 流程验收

1. 三道选择题流程正常。
2. 方向推荐流程正常。
3. 选定方向后进入真实失败输入页。
4. 输入页文案与本文一致。
5. 用户可以输入一句或一段文字。
6. 用户可以点击“暂时跳过”。
7. 点击“继续找选题”后进入选题推荐。
8. 从选题页返回时，输入内容仍然保留。
9. `recommend_topic` payload 包含 `failureStoryInput`。
10. `generate_content` payload 包含 `failureStoryInput`。
11. `revise_content` payload 包含 `failureStoryInput`。
12. Mock 全流程正常。

### 工程验收

```bash
npm run typecheck
npm run lint
npm run build
```

必须全部通过。

---

## 12. 后续 PR 顺序

PR-07 完成后，建议按以下顺序推进：

### PR-08：Recommend Topic Prompt V2

让真实失败参与 3 个选题推荐，避免选题泛化。

输入：

```text
用户答案 + 方向 + failureStoryInput
```

输出：

```text
3 个围绕真实失败、变化和人格表达的第一条视频选题
```

### PR-09：Generate Content Prompt V2

使用真实失败生成第一条视频文案：

```text
失败瞬间
→ 内心困境
→ 转向
→ 新认知
→ 当下影响
→ 给同频者的价值
→ 轻量拆书会钩子
```

### PR-10：Turning Point Finder / Story Asset V2

再把原始故事提炼为结构化转折点资产。

不要在 PR-07 提前完成 PR-08、PR-09、PR-10 的工作。

---

## 13. 最终评审结论

原技术方案的“轻量输入、可跳过、不影响旧流程”思路正确。

但必须修订为：

```text
方向
→ 真实失败输入
→ 选题
→ 文案
```

并统一使用：

```ts
failureStoryInput
```

完成上述调整后，PR-07 可以进入开发。
