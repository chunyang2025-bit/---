# 抖你玩 MVP 最小可行性产品研发文档

## 1. 产品定位与核心体验

### 定位
中国首款“刷着玩”的 AI 故事与互动轻游戏社区。

### 核心玩法循环

- 刷一刷 (Swipe)：首页是垂直信息流，向上滑动切换。
- 每个卡片不是视频，而是一个可点击、带选项、带配图的 AI 互动短剧本/小游戏。
- 改一改 (Remix)：喜欢的剧本可点击“重织 (Remix)”，输入一句话，AI 自动生成新游戏并发布。
- 目标：极简主义跑通“单机文本+图片+选项循环”的 MVP。

## 2. 数据库设计 (Supabase Schema)

以下 SQL 可直接复制到 Supabase SQL Editor 执行：

```sql
-- 1. 用户表 (Users)
CREATE TABLE users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE,
    nickname TEXT,
    avatar_url TEXT,
    violation_count INT DEFAULT 0 -- 违规次数，用于封号机制
);

-- 2. 游戏/剧本主表 (Games)
CREATE TABLE games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    prompt_template TEXT NOT NULL, -- 促使AI生成该游戏的初始核心Prompt
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES games(id), -- 用于建立 Remix 的继承血统树
    likes_count INT DEFAULT 0,
    plays_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 互动节点表 (Game_Nodes)
CREATE TABLE game_nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    node_tag TEXT, -- 类似 'start', 'room_1', 'ending_A'
    story_text TEXT NOT NULL, -- AI 生成的剧情文本
    image_url TEXT, -- AI 生成的场景配图
    options JSONB -- 存放选项数组：[{'text': '向左走', 'next_tag': 'room_2'}]
);
```

## 3. 核心功能模块与 Codex 提示词指南

### 模块 A：信息流卡片容器 (Swipe Feed Container)

功能：实现类似 TikTok 的全屏垂直滚动，每个卡片内部嵌入一个独立 GameEngine 状态机。

Codex 指令：

> I am vibe-coding a mobile-first Web app with React and Tailwind CSS. Please create a vertical swipe-feed component (like TikTok) where each slide is an interactive game card. The card should read a JSON state machine of a story node from Supabase, displaying the text, a top image placeholder, and 2-3 clickable option buttons. When an option is clicked, it smoothly transitions to the next state within that card without reloading the feed.

### 模块 B：安全过滤与 AI 剧本生成器 (Moderated LLM API Route)

功能：在后端 Next.js API Route 集成 DeepSeek-V3/R1 接口，调用前后自动拦截敏感内容。

Codex 指令：

> Please write a Next.js API route /api/generate-game that integrates the DeepSeek API. The API needs to receive a user's creative prompt (e.g., 'A ghost story set in Cyberpunk Shanghai'). Crucially, include a hardcoded Chinese text moderation middleware or Regex array to block sensitive keywords and protected gaming IPs (like Genshin, Nintendo). If safe, use a strict system prompt to force DeepSeek to return a standardized JSON structure containing: title, initial_story_text, and an options array with keys text and next_tag.

### 模块 C：一键二创逻辑 (The Remix Pipeline)

功能：读取原游戏的 prompt_template，把用户的新输入缝合进去，生成新游戏记录。

Codex 指令：

> Write a frontend-to-backend remix function for Supabase. When a user clicks the 'Remix' button on an existing game, the system fetches the original prompt_template, combines it with the user's new tweak modifier, and inserts a new row into the games table with parent_id pointed to the original game. Then, redirect the user to the newly created game session.

## 4. 彻底规避侵权与合规的“防护墙”设计

- UI 视觉去 Aippy 化：不要使用任何亮面多色二次元视觉。
- 推荐风格：新中式黑白水墨，或赛博国潮风（暗黑底色 + 霓虹青/红）。
- 输入端双重安全净化：提交前进行关键词过滤。

示例拦截词：

```js
const bannedKeywords = ['原神', '米哈游', '宝可梦', '任天堂', /* ...国内常规政治敏感词... */];
```

检测到后弹窗提示：

> 检测到包含受保护的版权 IP 或敏感词，请换个充满创意的词汇吧！

## 5. 敏捷部署路径

1. 本地开发：VS Code + `npm run dev`
2. 代码托管：GitHub 私有仓库
3. 中国本土化部署：推荐 Zeabur，配置 Supabase 数据库密钥与 `DEEPSEEK_API_KEY`。

## 6. 额外推荐功能

### 功能一：Credits（算力/积分防爆机制）

- 在 users 表加字段 `credits INT DEFAULT 50`
- 新用户注册送 50 点，每次 Remix 或生成消耗 5 点
- 写 Supabase RPC `deduct_credits(user_id, amount)`，检查余额后执行扣费

### 功能二：Play History & Saved Projects（历史记录与收藏）

- 建立 `user_history` 关联表，存储用户游玩记录和重织作品。
- 在个人中心展示“玩过的”“重织的”游戏。

### 功能三：Share via Public Links（分享链接）

- 创建 `/share/[gameId]` 页面，SSR 拉取游戏第一个节点并渲染
- 让用户生成可直接分享的 H5 入口

## 7. 国内上线前必加补丁

- 用户举报按钮：右下角添加 `🏳️` 按钮，记录到 `reports` 表，超过 3 次自动下线游戏。
- 页面底部占位 ICP：`© 2026 灵动织造 | 浙ICP备xxxxxx号-1`

## 8. 建议的 PRD 结构

1. PRODUCT VISION & POSITIONING
2. USER GROWTH & COMMUNITY FLYWHEEL
3. SYSTEM ARCHITECTURE & AI STACK
4. DATA SCHEMA & CORE ENTITIES
5. RISK MANAGEMENT & COMPLIANCE POLICY
6. KPI & BI DATA FUNNEL

## 9. 立即可执行的任务

- [ ] 在 Supabase 中建立 users / games / game_nodes 表
- [ ] 设计 React/Tailwind 垂直 Swipe Feed
- [ ] 实现 `/api/generate-game`，包含敏感词审查与 DeepSeek 生成
- [ ] 完成 Remix 前端+后端逻辑
- [ ] 加入 credits 防爆机制与用户历史记录
- [ ] 设计 `/share/[gameId]` 动态分享页
- [ ] 增加举报系统与底部 ICP 占位

---

> 这个文档已按你提供的 PRD 要求整理完成，适合直接同步到 GitHub 仓库并作为后续开发基础。
