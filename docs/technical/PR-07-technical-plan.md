# PR-07 技术方案：Turning Point Input V1

日期：2026-07-10  
状态：待开发  
关联文档：`docs/product/v0.2-personality-ip-upgrade.md`

---

## 核心目标

在用户选定选题后、生成文案前，增加一次「真实失败」的轻量输入步骤。这是 V0.2 产品升级的第一步，为后续「转折点发现器」能力打基础。

---

## 技术实现方案

### 1. 流程调整

**当前流程：**
```
首页 → 三道选择题 → 3 个方向 → 3 个选题 → 生成文案
```

**PR-07 后流程：**
```
首页 → 三道选择题 → 3 个方向 → 3 个选题 → 【转折点输入】→ 生成文案
```

### 2. 数据结构变更

在 `src/types/app.ts` 中扩展 payload 类型：

```ts
// 新增字段
export type GenerateContentPayload = {
  answers: AnswerMap;
  selectedDirection: DirectionRecommendation;
  selectedTopic: TopicRecommendation;
  turningPointInput?: string; // PR-07 新增
};
```

### 3. UI 变更

在 `src/components/MvpShell.tsx` 中：

- 新增一个 `view` 状态：`"turning_point"`
- 在选题完成后，不直接进入 `generate_content`，而是先进入 `turning_point` 视图
- 新增一个输入卡片组件 `TurningPointInput`
- 卡片包含：
  - 引导问题：「有没有一次你真的觉得自己不行了？」
  - 副引导：「当时你心里最真实的感受是什么？」
  - 一个 textarea（placeholder: "可以只写一句话，也可以写一段"）
  - 两个按钮：「跳过」和「继续」
- 用户点击「继续」或「跳过」都进入 content 生成步骤
- 输入内容保存到 state，传递给 `generate_content` 的 payload

### 4. 兼容性保证

- **原有流程不受影响**：用户可以选择「跳过」，流程正常继续
- **Mock 不报错**：Mock 实现会忽略 `turningPointInput` 字段（当前 mock 不读取它）
- **不改动现有组件**：只在 MvpShell 中新增一个视图和一个组件
- **不改 DeepSeek Provider**：本轮不写新 Prompt，只是把输入传递进去
- **不改 Story Asset**：本轮不提取转折点，只做输入收集

### 5. 不做的事情

- ❌ 不写 `generate_content` 的新 Prompt（PR-08 做）
- ❌ 不升级 Story Asset 结构（PR-09 做）
- ❌ 不做持久化存储（后续 PR 做）
- ❌ 不改 Router/Provider 架构
- ❌ 不调整其他 taskType 的 payload
- ❌ 不优化 UI 样式（保持简洁即可）

### 6. 文件变更清单

```
src/types/app.ts                          # 扩展 GenerateContentPayload
src/components/MvpShell.tsx               # 新增 turning_point 视图和组件
```

### 7. 验收标准

1. ✅ 原有三道选择题 → 方向 → 选题流程正常
2. ✅ 选定选题后出现转折点输入页
3. ✅ 输入页有引导问题，不强迫写长文
4. ✅ 用户可以点击「跳过」
5. ✅ 输入内容（或空）能进入 `generate_content` payload
6. ✅ Mock 流程不报错
7. ✅ 不改故事库、不改 Provider、不写其他 Prompt
8. ✅ `npm run typecheck / lint / build` 全部通过

---

## 后续 PR 规划

### PR-08：Generate Content Prompt V2
- 新增 `prompts/generate_content.md`
- Prompt Registry 接入 `generate_content`
- 使用 `turningPointInput` 生成围绕真实失败和转折点的文案
- 文案包含：真实案例、转折、认知、轻量钩子

### PR-09：Story Asset V2
- 扩展 `ExtractedStoryAsset` 增加 `turningPoint` 字段
- 更新 `extract_story_asset` Prompt
- 让小光从用户输入中提取转折点资产
- 故事库展示「转折点」卡片
