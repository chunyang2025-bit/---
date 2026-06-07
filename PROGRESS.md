# 项目进度同步

## 2026-06-07

### 当前状态

- 项目名称：抖你玩 (Animake) MVP
- 项目定位：中国首款“刷着玩”的 AI 故事与互动轻游戏社区
- 当前阶段：项目启动、投资人版 PRD 与工程方案沉淀
- 已完成：README 项目简介、完整 MVP PRD、核心技术路径、数据库方案、Credits 机制、合规风控、增长指标与部署路径

### 已同步资料

- `README.md`：项目定位、核心体验、当前阶段与模块概览
- `PRD.md`：投资人版 + 工程落地版 MVP 产品需求、Supabase Schema、AI 生成、Remix、风控、数据指标、部署路径
- `PROGRESS.md`：阶段进度与下一步任务

### 下一步任务

- [ ] 初始化 Next.js 14 + React + Tailwind 前端工程
- [ ] 在 Supabase 中建立 `profiles` / `games` / `game_nodes` / `user_history` / `reports` 表
- [ ] 创建 `deduct_credits(user_id, amount)` RPC
- [ ] 实现移动优先的垂直 Swipe Feed
- [ ] 实现 `/api/generate-game`，接入 DeepSeek、内容审查、credits 扣费和 JSON 输出校验
- [ ] 实现 Remix 生成链路与 `parent_id` 继承关系
- [ ] 增加举报系统、历史记录、收藏、分享页与 ICP 占位
- [ ] 添加 Remix 转化率、平均游玩深度、credits 消耗速率与次留指标打点

### 风险备注

- 生成内容需要前后端双重审查，避免敏感词与受保护版权 IP。
- MVP 优先跑通“文本 + 图片 + 选项”的单机互动闭环，暂不引入复杂游戏渲染。
- 国内上线前需要补齐备案、举报、内容下线与用户处罚机制。
