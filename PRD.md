# 灵动织造 / 抖你玩 (Animake) MVP 产品需求文档

## 1. Product Vision & Positioning

### 产品定位

灵动织造 / 抖你玩是一款移动优先的 AI 故事与互动轻游戏社区。它不是传统游戏编辑器，而是一个“像刷短视频一样刷 AI 游戏”的内容社区。

### 核心体验

- 刷一刷：用户在全屏垂直信息流中浏览 AI 互动短剧本，每张卡片都是一个可点击、有选项、有视觉氛围的轻量小游戏。
- 玩一玩：每个游戏由结构化 JSON 状态机驱动，用户通过 2-3 个选项推进剧情。
- 改一改：用户看到喜欢的故事后点击“重织 Remix”，输入一句话，让 AI 生成新的衍生剧本。
- 发出去：每个游戏都可以生成公共分享链接，适合在微信、小红书、浏览器等 H5 场景传播。

### MVP 原则

- 不做复杂沙盒游戏生成，优先跑通“文本 + 选项 + 视觉氛围”的互动闭环。
- 不让大模型生成任意前端代码，统一输出标准 JSON，降低运行时崩溃风险。
- 以 Remix 作为社区增长引擎，让用户从消费者自然转化为轻创作者。

## 2. User Growth & Community Flywheel

### 商业飞轮

1. 用户进入 Swipe Feed，低成本试玩 AI 互动故事。
2. 用户对某个故事产生兴趣，点击 Remix。
3. 系统用原始 prompt 与用户新增变量生成新作品。
4. 新作品进入社区信息流，并生成可分享 H5 链接。
5. 新用户通过分享链接进入，继续试玩、Remix、发布。

### 中国本土化内容壁垒

- 内容调性优先贴合国风修仙、微型密室逃脱、网文互动流、赛博国潮等中文互联网语境。
- 使用“结构化 Prompt 矩阵”沉淀可复用的叙事模板，避免只做海外产品的简单汉化。
- 通过本土文化共鸣与 Remix 门槛降低，形成内容社区的长期护城河。

## 3. System Architecture & AI Stack

### 技术栈

- Frontend：Next.js 14 App Router + React + Tailwind CSS + Lucide Icons
- Interaction：移动端优先的 Swipe Feed + 本地 GameEngine 状态机
- Backend & Database：Supabase PostgreSQL + Auth + RLS
- AI Orchestration：DeepSeek-V3 API，用于文本剧情和节点逻辑生成
- Hosting：Zeabur，面向国内访问速度与部署便利性

### 架构原则

- LLM 只输出结构化 JSON 节点，不输出可执行代码。
- 游戏运行由前端固定状态机解释 JSON，保障 MVP 运行成功率。
- 生成、扣费、合规审查、入库尽量在服务端原子化处理。
- 所有用户输入与 AI 输出都经过内容安全检查。

## 4. Data Schema & Core Entities

以下 SQL 可作为 Supabase 初始建表参考。

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    nickname TEXT NOT NULL,
    avatar_url TEXT,
    credits INT DEFAULT 50 CHECK (credits >= 0),
    violation_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    core_prompt TEXT NOT NULL,
    compiled_prompt TEXT NOT NULL,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES public.games(id),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    likes_count INT DEFAULT 0,
    plays_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.game_nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    node_tag TEXT NOT NULL,
    story_text TEXT NOT NULL,
    image_url TEXT,
    bg_color_hex TEXT DEFAULT '#0f172a',
    options JSONB NOT NULL,
    is_ending BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (game_id, node_tag)
);

CREATE TABLE public.user_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    last_node_tag TEXT DEFAULT 'start',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id, game_id)
);

CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
    event_name TEXT NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Credits RPC

```sql
CREATE OR REPLACE FUNCTION public.deduct_credits(target_user_id UUID, amount INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits INT;
BEGIN
    SELECT credits INTO current_credits
    FROM public.profiles
    WHERE id = target_user_id
    FOR UPDATE;

    IF current_credits IS NULL THEN
        RAISE EXCEPTION 'profile_not_found';
    END IF;

    IF current_credits < amount THEN
        RAISE EXCEPTION 'insufficient_credits';
    END IF;

    UPDATE public.profiles
    SET credits = credits - amount,
        updated_at = timezone('utc'::text, now())
    WHERE id = target_user_id;

    RETURN TRUE;
END;
$$;
```

## 5. Core Modules & Vibe Coding Prompts

### 模块 A：Swipe Feed 与极简游戏状态机

功能：实现 TikTok 式全屏垂直信息流，每个卡片内嵌独立 GameEngine 状态机。

Codex Prompt：

```text
I am using React, Tailwind CSS, and Framer Motion to build a mobile-first swipe feed like TikTok for my AI game app.
Create a SwipeFeed component that containerizes a list of games.
Inside each game card, implement a local state machine with currentNodeTag, initially "start".
The card fetches all nodes from the Supabase game_nodes table where game_id matches.
Display story_text with a typing effect, dynamically change the background to bg_color_hex, and map the options array into clickable HTML buttons.
Clicking a button updates currentNodeTag to the option's next_tag with a smooth slide-fade transition.
```

### 模块 B：安全审查与强类型 JSON 游戏生成器

功能：Next.js API Route 接收用户 prompt，完成敏感词审查、credits 扣费、DeepSeek 生成、JSON 解析、数据库写入。

Codex Prompt：

```text
Write a Next.js API route /api/generate-game that interacts with DeepSeek API and Supabase.
1. Compliance Check: Check the user's input string against a regex array of restricted keywords, including NSFW terms and major protected gaming IPs such as Genshin, Mihoyo, Pokemon, Nintendo, Tencent, and NetEase.
2. Credits Validation: Verify if the user's profile has credits >= 5. Deduct 5 credits before calling the AI.
3. LLM Structured Output: Invoke DeepSeek using a strict system prompt that demands raw JSON only.
4. DB Transaction: Parse the returned JSON, insert a new record into public.games, and mass-insert rows into public.game_nodes linked by the new game_id.
5. Return the game_id to the frontend.
```

推荐系统提示词：

```text
You are a Chinese interactive storytelling text game compiler. You must output raw JSON ONLY. No markdown wrappers. No prose.
Required JSON Structure:
[
  {
    "node_tag": "start",
    "story_text": "【国风修仙】你在破庙醒来...",
    "bg_color_hex": "#1e1b4b",
    "is_ending": false,
    "options": [
      {"text": "出庙看看", "next_tag": "outside"},
      {"text": "继续睡觉", "next_tag": "end_sleep"}
    ]
  }
]
```

### 模块 C：Remix 血统追踪

功能：读取父游戏 `core_prompt`，将用户新增变量拼接成新的生成 prompt，并用 `parent_id` 记录继承关系。

Codex Prompt：

```text
Implement a Remix pipeline in my Next.js frontend.
When a user clicks the Remix button on a game card, open a micro-modal.
Fetch the parent game's core_prompt.
Provide one input field: "你想为这段故事注入什么新变量？"
When submitted, call /api/generate-game with:
"基于原设定：[Parent Prompt]，引入全新变量：[User Input Modifier]，重新织造一个全新的互动剧本。"
Ensure the mutation body sends parent_id so Supabase tracks the game inheritance lineage tree for community metrics.
```

### 模块 D：历史记录与收藏

- 用户开始游玩时写入 `user_history`。
- 用户再次进入可恢复到 `last_node_tag`。
- 个人中心展示“玩过的”“重织的”“收藏的”作品。

### 模块 E：公共分享页

功能：创建 `/share/[gameId]` H5 页面，服务端读取游戏标题和开始节点，适合社交平台分享预览。

Codex Prompt：

```text
Create a dynamic Next.js page app/share/[gameId]/page.js.
Fetch the game details from Supabase during server-side rendering.
Render the game title, first node story_text, visual background, and start button.
Make sure metadata is available for social sharing previews.
```

## 6. Risk Management & Compliance Policy

### 输入端审查

- 前端先做轻量关键词拦截，减少无效请求。
- 服务端必须再次审查，前端审查不能作为唯一防线。
- 关键词覆盖政治敏感、色情暴力、未成年人风险、受保护版权 IP。

示例：

```js
const bannedKeywords = [
  '原神',
  '米哈游',
  '宝可梦',
  '任天堂',
  '腾讯游戏',
  '网易游戏'
];
```

命中提示：

```text
检测到包含受保护的版权 IP 或敏感词，请换个充满创意的词汇吧！
```

### 输出端审查

- AI 返回后先解析 JSON，再审查所有 `story_text` 与选项文本。
- 审查未通过时不入库，并返还或补偿 credits。
- 后续生产版本可接入百度内容安全、网易易盾等第三方审核服务。

### 版权隔离

- 禁止直接复刻 Aippy 的视觉风格、文案和产品素材。
- UI 方向优先采用新中式黑白水墨或赛博国潮，避免亮面多色二次元资产。
- Prompt 模板避免引导用户生成知名游戏 IP 的同人衍生内容。

### 国内上线补丁

- 游戏卡片右下角必须提供举报入口。
- `reports` 达到阈值后自动将 `games.visibility` 更新为 `private`。
- 页面底部预留 ICP 信息：`© 2026 灵动织造 | 浙ICP备xxxxxx号-1`。

## 7. KPI & BI Data Funnel

### Remix Conversion Rate

- 计算：Remix 触发次数 / 游戏总游玩次数。
- 价值：验证社区创作者飞轮是否启动。

### D1 Retention

- 计算：首日访问用户在第二天再次访问的比例。
- 价值：衡量刷游戏与互动剧情是否具备持续吸引力。

### Avg Node Depth

- 计算：用户在一个游戏卡片内点击选项的平均次数。
- 价值：判断 AI 剧情是否足够可玩。

### Credit Drain Velocity

- 计算：每日全站消耗 credits 总量 / 活跃用户数。
- 价值：估算 API 成本与商业可持续性。

### AI Generation ROI

- 计算：单次生成成本与该作品带来的游玩、Remix、分享回流之间的关系。
- 价值：判断生成式内容是否值得继续分发。

## 8. Agile Deployment Path

### 本地开发

```bash
npm run dev
```

### GitHub 同步

```bash
git add .
git commit -m "feat: animake mvp demo initialized"
git push -u origin main
```

### Zeabur 部署

1. 登录 Zeabur。
2. Create Project，选择 Deploy from GitHub。
3. 绑定 GitHub 私有仓库。
4. 配置 Supabase URL、Supabase anon key、service role key、`DEEPSEEK_API_KEY`。
5. 部署并获取公网访问 URL。

## 9. Immediate Backlog

- [ ] 初始化 Next.js 14 + Tailwind CSS 工程。
- [ ] 创建 Supabase 表、RPC 与基础 RLS。
- [ ] 实现 Swipe Feed 与 GameEngine 状态机。
- [ ] 实现 `/api/generate-game`。
- [ ] 实现 Remix 模态框与生成链路。
- [ ] 实现 credits 扣费、余额提示与失败回滚。
- [ ] 实现历史记录、收藏和个人中心。
- [ ] 实现 `/share/[gameId]` 分享页。
- [ ] 实现举报系统与自动下线规则。
- [ ] 配置 Zeabur 部署与环境变量。
