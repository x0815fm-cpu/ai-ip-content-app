# 故事沉淀 Prompt

## 任务

从用户和小光的聊天内容中，提取可沉淀到故事库的内容。

## 输入

```json
{
  "conversation": "...",
  "autoSaveEnabled": false
}
```

## 输出格式

```json
{
  "experience": {
    "title": "...",
    "content": "..."
  },
  "thought": {
    "title": "...",
    "content": "..."
  },
  "quote": {
    "title": "...",
    "content": "..."
  },
  "topics": [
    {
      "title": "...",
      "content": "..."
    }
  ]
}
```

## 提取原则

- 经历：真实发生过的事
- 想法：用户对事情的理解和判断
- 金句：有表达力、传播力的话
- 选题：可以转成内容的主题
- 不要编造用户没说过的经历
- 可以适度整理语言，但不要改变意思
