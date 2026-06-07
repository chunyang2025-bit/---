# 项目进度同步

## 2026-06-07

### 当前状态

- 项目名称：抖你玩 (Animake) MVP
- 项目定位：中国首款“刷着玩”的 AI 故事与互动轻游戏社区
- 当前阶段：手机优先、前后端一体 Demo 已完成
- 已完成：README 项目简介、完整 MVP PRD、Next.js Demo、注册/登录、推荐流、JSON 状态机、生成发布、Remix 二创、credits、举报、收藏、分享页、创作者数据面板

### 已同步资料

- `README.md`：项目定位、核心体验、当前阶段与模块概览
- `PRD.md`：投资人版 + 工程落地版 MVP 产品需求、Supabase Schema、AI 生成、Remix、风控、数据指标、部署路径
- `PROGRESS.md`：阶段进度与下一步任务
- `app/` / `components/` / `lib/` / `public/scenes/`：可运行 Demo 代码与视觉资产

### 已完成 Demo 功能

- [x] 初始化 Next.js 16 + React 19 + Tailwind 前端工程
- [x] 实现注册、登录、退出与游客浏览模式
- [x] 实现前后端 API 拆分：auth/state/generate/events/saved/reports
- [x] 使用 `.demo-state.json` 模拟后端数据库持久化
- [x] 实现移动优先的垂直 Swipe Feed
- [x] 实现 Game Card 内部 JSON 状态机、节点切换和结局重开
- [x] 实现 `/api/generate-game` mock，包含内容审查和标准 JSON 输出
- [x] 实现 Remix 弹窗、`parent_id` 血统模拟和新作品插入 Feed
- [x] 实现 credits 扣费、余额提示、失败返还
- [x] 实现举报、收藏、历史记录、分享链接和 ICP 占位
- [x] 实现 Remix 转化率、平均游玩深度、credits 消耗与事件面板
- [x] 增加 `/share/[gameId]` 公共分享页
- [x] 调整为简洁大气的手机端界面风格
- [x] 通过 `npm run lint` 和 `npm run build`

### 下一步任务

- [ ] 在 Supabase 中建立 `profiles` / `games` / `game_nodes` / `user_history` / `reports` 表
- [ ] 创建 `deduct_credits(user_id, amount)` RPC
- [ ] 把 mock 数据层替换为真实 Supabase CRUD
- [ ] 把内存/文件账号系统替换为 Supabase Auth
- [ ] 把 `/api/generate-game` 的 mock 生成替换为 DeepSeek API
- [ ] 接入真实登录、用户 profiles、RLS 与生产内容安全服务
- [ ] 配置 Zeabur 环境变量并部署公网 Demo

### 风险备注

- 生成内容需要前后端双重审查，避免敏感词与受保护版权 IP。
- MVP 优先跑通“文本 + 图片 + 选项”的单机互动闭环，暂不引入复杂游戏渲染。
- 国内上线前需要补齐备案、举报、内容下线与用户处罚机制。
- `npm audit --omit=dev` 仍报告 Next 最新版本内部 PostCSS 相关 moderate 风险；当前已使用 `next@16.2.7`，等待上游安全补丁，不建议按 audit force 降级。
