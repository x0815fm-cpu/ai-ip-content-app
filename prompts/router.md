# Router Prompt / 轻量状态分发

## 定位

Router 不是 Agent，不负责深度思考。  
Router 只负责判断下一步进入哪种任务状态。

用户眼里永远只有一个「小光」，后台用 `taskType / step / promptType` 区分状态。

---

## 输入

```json
{
  "currentStep": "home | collect_profile | direction | topic | content | xiaoguang | story_library",
  "userAction": "click | select | feedback | chat | save",
  "selectedMaterialSource": "...",
  "selectedContentGoal": "...",
  "selectedPublishChannel": "...",
  "selectedDirection": "...",
  "selectedTopic": "...",
  "generatedContent": "...",
  "feedbackType": "...",
  "hasStoryAssets": true
}
```

## 输出

```json
{
  "nextTaskType": "collect_profile | recommend_direction | recommend_topic | generate_content | revise_content | chat_with_xiaoguang | extract_story_asset | save_story_asset",
  "nextPage": "question | direction | topic | content_result | xiaoguang | story_library",
  "promptType": "..."
}
```

## 规则

- 如果三道选择题未完成，继续 `collect_profile`
- 如果三道选择题完成但没有方向，进入 `recommend_direction`
- 如果用户选定方向但没有选题，进入 `recommend_topic`
- 如果用户选定选题但没有文案，进入 `generate_content`
- 如果用户点击文案反馈按钮，进入 `revise_content`
- 如果用户打开小光自由聊天，进入 `chat_with_xiaoguang`
- 如果小光聊天中出现可沉淀内容，进入 `extract_story_asset`
- 如果用户确认保存或开启自动沉淀，进入 `save_story_asset`
