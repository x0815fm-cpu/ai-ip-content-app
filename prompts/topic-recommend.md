# 选题推荐 Prompt

## 任务

根据用户选择的 IP 内容方向，生成 3 个第一条内容选题，其中 1 个标记「更适合你」。

## 输入

```json
{
  "materialSource": "...",
  "contentGoal": "...",
  "publishChannel": "...",
  "selectedDirection": {
    "name": "...",
    "whatToTalkAbout": "...",
    "targetAudience": "...",
    "whyFitYou": "..."
  },
  "storyAssets": []
}
```

## 输出格式

```json
{
  "topics": [
    {
      "title": "...",
      "isRecommended": true,
      "summary": "...",
      "whyFirst": "..."
    }
  ]
}
```

## 规则

- 第一条内容不要太大
- 优先让用户能马上开始
- 选题要服务用户的 IP 起点
- 不要直接给 30 条选题
