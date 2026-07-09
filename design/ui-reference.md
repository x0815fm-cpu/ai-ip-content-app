# UI 参考图说明

## 1. 图片来源约定

用户以后会把所有产品相关图片统一存到本地目录：

```text
/Users/mac/Documents/new app/图片专用
```

Codex / 本地开发环境需要图片时，优先从这个目录查找最新图片。

重要说明：

- ChatGPT 不能直接读取用户 Mac 本地目录。
- Codex 或本地开发环境如果运行在用户电脑上，可以直接访问该目录。
- 需要提交到 GitHub 的图片，应从本地目录复制到仓库内。

建议 GitHub 仓库图片存放位置：

```text
/design/images/
```

如果是前端项目需要直接引用，也可以同步复制到：

```text
/public/images/
```

---

## 2. 当前 UI 参考图位置

UI 参考图文件建议放在：

```text
/design/app_ui_reference.png
```

或后续统一放入：

```text
/design/images/app_ui_reference.png
```

当前连接器更适合提交文本文件。图片文件可以由 Codex 或开发者从本地图片目录复制后提交。

---

## 3. Codex 处理图片的建议指令

当需要同步最新图片时，可让 Codex 执行：

```text
从 /Users/mac/Documents/new app/图片专用 读取最新产品图片，
复制到当前 GitHub 仓库的 /design/images/ 目录，
必要时再复制一份到 /public/images/ 供前端引用，
并更新 design/ui-reference.md 中的图片说明。
```

---

## 4. 当前 UI 方向关键词

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

页面应覆盖：

```text
首页
三道选择题
3 个 IP 内容方向
3 个选题
内容文案生成结果
小光
故事库
```

---

## 5. 设计原则

- 首页主按钮是「生成一条内容文案」
- 「我的故事库」是轻入口，不要抢主流程
- 小光每页右下角漂浮，不频繁弹出
- 主流程选择题要有目的性
- 页面气质不要像后台系统，也不要像普通 AI 工具
- 图片资产以 `/Users/mac/Documents/new app/图片专用` 为本地源目录
