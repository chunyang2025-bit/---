# Douplay / 灵动织造 / 抖你玩 (Animake) MVP

游戏版的抖音，游戏内容生态社区。中国首款“刷着玩”的 AI 故事与互动轻游戏社区。

## 项目定位

- 目标：构建一款移动优先的极简 AI 游戏社区，用户可在垂直信息流中“刷剧本”、“玩故事”、“重织 Remix”。
- 核心体验：
  - 刷一刷：全屏垂直卡片式沉浸体验，每个卡片是一段互动剧本。
  - 改一改：用户可对喜欢的剧本进行 Remix，输入一句话让 AI 生成新游戏。
  - 极简 MVP：优先实现“单机文本+图片+选项”循环，不堆砌复杂渲染。

## 当前阶段

- 投资人版 + 工程落地版 PRD 已完成
- Next.js Demo 已完成，可本地预览
- 已跑通 Swipe Feed、JSON 状态机、生成/Remix 模拟、credits、举报、收藏、分享页和数据面板
- 下一步：接入真实 Supabase、DeepSeek API 与 Zeabur 部署

## 核心模块

- Swipe Feed Container：TikTok 式垂直滑动互动卡片
- JSON State Machine：用结构化剧情节点保证 MVP 运行成功率
- AI 剧本生成器：Next.js API route + 内容审查 + 输出校验（当前为本地 mock，预留 DeepSeek 接入）
- Remix Pipeline：复制原始 prompt，并通过 `parent_id` 追踪父子继承
- 风控+合规：前后端敏感词过滤、版权 IP 屏蔽、举报机制、ICP备案占位
- 算力防爆：用户 credits 机制、生成前扣费
- 数据漏斗：Remix 转化率、D1 留存、平均节点深度、算力消耗速率

## 本地预览

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:3033`。

## 验证

```bash
npm run lint
npm run build
```

## 结构

- `README.md`：项目简介与当前状态
- `PRD.md`：完整 MVP 产品需求文档与技术方案
- `PROGRESS.md`：项目阶段进度、已完成事项与下一步任务
- `app/`：Next.js App Router 页面与 API route
- `components/`：Swipe Feed、Game Card、弹窗、分享页组件
- `lib/`：Demo 数据、类型与内容审查逻辑
- `public/scenes/`：本地场景视觉资产

## 部署建议

- 技术栈：Next.js 16 + React 19 + Tailwind CSS + Supabase + DeepSeek + Zeabur
- 本地开发：`npm run dev`
- 代码托管：GitHub 私有仓库
- 生产部署：推荐 Zeabur + Supabase

---

更多细节请查看 `PRD.md`。
