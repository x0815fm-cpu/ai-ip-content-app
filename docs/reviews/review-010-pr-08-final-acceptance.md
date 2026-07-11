# Review 010：PR-08 最终验收结论

日期：2026-07-11  
对象：PR #8 `feat: implement recommend_topic prompt v2 with validation`  
结论：**通过并已合并。**

## 1. 最终实现

PR-08 已完成：

- 新增 `recommend_topic` 专用 Prompt；
- 让 `failureStoryInput` 真正参与选题推荐；
- 使用 `{ "topics": [...] }` 顶层对象输出；
- 对 `recommend_topic` 增加任务专用结构校验；
- 校验成功后解包为现有 `TopicRecommendation[]`；
- 同步更新 Model Service Contract；
- 保留现有 mock fallback。

## 2. 真实模型验收

### 2.1 有失败故事

真实 DeepSeek 调用返回：

- `source === "deepseek"`；
- 恰好 3 个选题；
- 恰好 1 个推荐项；
- 三个角度不同；
- 围绕真实输入；
- 未编造用户没有提供的选择、结果、变化或新信念。

### 2.2 空失败故事

空故事场景经过三轮修订。

前两轮暴露出一个重要问题：模型为了满足“具体”，会替用户虚构时间、场景和事件，例如“入职第一周”“一次被否定的汇报”。

最终 Prompt 已明确区分：

- 有 `failureStoryInput`：聚焦 payload 中已经出现的具体场景；
- 无 `failureStoryInput`：只使用方向、动机、目标、当前状态和开放式问题，不创造过去经历。

第三轮真实 DeepSeek 调用返回：

1. `我为什么想记录职场成长`（recommended）
2. `工作里，我现在最想改变什么`
3. `对我来说，记录成长意味着什么`

验收结果：

- `source === "deepseek"`；
- 恰好 3 个选题；
- 恰好 1 个推荐项；
- 没有虚构时间、人物、场景、事件、结果或变化；
- 每个标题都可以从 payload 中找到依据；
- 没有退化为泛知识题。

## 3. 本轮形成的长期规则

> “具体”不能以虚构为代价。

当用户没有提供故事时，模型应优先使用：

- 动机式表达；
- 当前式表达；
- 开放式问题；
- 用户已经明确选择的方向和目标。

不能为了让标题更像故事，而替用户补造回忆。

## 4. 工程验收

Codex 报告以下本地检查全部通过：

```bash
npm run typecheck
npm run lint
npm run build
```

真实模型两种场景均确认 `source === "deepseek"`，未发生 mock fallback。

## 5. 合并信息

- PR：#8
- 合并方式：Squash merge
- 合并 commit：`dc5479a6ea9f926816f1aa675dfb2aa1ee371c5f`

## 6. 下一步

下一阶段进入 PR-09：Generate Content Prompt V2。

目标是基于：

- 用户答案；
- 已选方向；
- 已选选题；
- `failureStoryInput`；

生成一条真实、可发布、不编造用户经历的第一条内容文案。
