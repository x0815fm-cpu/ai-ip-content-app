# PR-09 验收指南

PR 链接：https://github.com/x0815fm-cpu/ai-ip-content-app/pull/9  
Commit：59de850  
分支：feat/generate-content-prompt-v1

---

## 核心改动

1. `prompts/generate_content.md` - Prompt 设计稿（区分有/无失败故事）
2. `src/services/prompts/promptRegistry.ts` - 添加 GENERATE_CONTENT_PROMPT
3. `src/services/providers/deepseekProvider.ts` - 添加 parseGenerateContentResponse 校验
4. `src/components/MvpShell.tsx` - 添加加载状态和错误处理
5. `docs/product/model-service-contract.md` - 添加 failureStoryInput 字段

---

## 验收场景

### 场景 A：有失败故事

1. 选择题：工作/职业 + 记录成长 + 小红书/图文
2. 方向：职场新人成长记
3. 失败故事："那段时间我每天都很累，工作做不好，也不敢告诉别人。我开始怀疑自己是不是根本没有能力做好这件事。"
4. 选题：任意
5. 点击"生成内容文案"

**验证点：**
- ✅ 看到加载状态："小光正在整理你的第一条内容……"
- ✅ Network 响应 `source === "deepseek"`
- ✅ data.rows 包含标题、开头、正文、结尾
- ✅ publishHint 非空
- ✅ 文案基于真实失败，不编造完整转折

### 场景 B：空失败故事

1. 选择题和方向同上
2. 点击"暂时跳过"
3. 选题：任意
4. 点击"生成内容文案"

**验证点：**
- ✅ 看到加载状态
- ✅ Network 响应 `source === "deepseek"`
- ✅ 文案不虚构用户经历

### 场景 C：无 API Key

1. 删除 `.env.local` 中的 `DEEPSEEK_API_KEY`
2. 重启开发服务器
3. 走完整流程

**验证点：**
- ✅ Network 响应 `source === "mock"`
- ✅ 页面正常展示 mock 文案

---

## 重点检查

1. **加载状态**：点击后立即显示，按钮 disabled
2. **文案质量**：有故事时基于真实输入，无故事时围绕方向/目标/动机
3. **错误处理**：API 异常时自动 fallback，页面不白屏
4. **Network 响应**：真实调用返回 `source: "deepseek"`，mock 返回 `source: "mock"`

---

## 本轮不做

- ❌ revise_content Prompt（PR-10）
- ❌ extract_story_asset Prompt（PR-11）
- ❌ 转折点资产（PR-12）
- ❌ 数据库、长期记忆、30天规划、UI重设计

---

## 验证命令

```bash
npm run typecheck  # 必须通过
npm run lint       # 必须通过
npm run build      # 必须通过
```

---

## 后续 PR

- PR-10：Revise Content Prompt V1（反馈改写）
- PR-11：Extract Story Asset Prompt V1（故事资产提取）
- PR-12：Turning Point Finder / Story Asset V2（转折点资产）
