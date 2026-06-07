# 抖你玩 (Animake) MVP

中国首款“刷着玩”的 AI 故事与互动轻游戏社区。

## 项目定位

- 目标：构建一款移动优先的极简 AI 游戏社区，用户可在垂直信息流中“刷剧本”、“玩故事”、“重织 Remix”。
- 核心体验：
  - 刷一刷：全屏垂直卡片式沉浸体验，每个卡片是一段互动剧本。
  - 改一改：用户可对喜欢的剧本进行 Remix，输入一句话让 AI 生成新游戏。
  - 极简 MVP：优先实现“单机文本+图片+选项”循环，不堆砌复杂渲染。

## 当前阶段

- PRD 已完成
- 下一步：在 Supabase 中建表、设计前端 Swipe Feed、实现 AI 生成与 Remix 流程

## 核心模块

- Swipe Feed Container：TikTok 式垂直滑动互动卡片
- AI 剧本生成器：Next.js API route + DeepSeek + 内容审查
- Remix Pipeline：复制原始 prompt 并生成父子继承游戏
- 风控+合规：前端敏感词过滤、版权 IP 屏蔽、举报机制、ICP备案占位
- 算力防爆：用户积分/credits 机制、生成前扣费

## 结构

- `README.md`：项目简介与当前状态
- `PRD.md`：完整 MVP 产品需求文档与技术方案
- `PROGRESS.md`：项目阶段进度、已完成事项与下一步任务

## 部署建议

- 本地开发：`npm run dev`
- 代码托管：GitHub 私有仓库
- 生产部署：推荐 Zeabur + Supabase

---

更多细节请查看 `PRD.md`。
