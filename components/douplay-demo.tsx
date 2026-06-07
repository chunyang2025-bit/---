'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Coins,
  History,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  X
} from 'lucide-react';
import type { AnalyticsEvent, DemoSnapshot, DemoUser, Game } from '@/lib/game-types';
import GameCard from './game-card';

type DouplayDemoProps = {
  initialState: DemoSnapshot;
};

type GenerateResponse = {
  game?: Game;
  state?: DemoSnapshot;
  error?: string;
};

type AuthMode = 'login' | 'register';

export default function DouplayDemo({ initialState }: DouplayDemoProps) {
  const [state, setState] = useState<DemoSnapshot>(initialState);
  const [modal, setModal] = useState<'auth' | 'generate' | 'remix' | 'metrics' | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('register');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [prompt, setPrompt] = useState('');
  const [toast, setToast] = useState(
    initialState.user ? '已登录，可生成、收藏、举报和重织内容。' : '游客可直接刷内容，登录后可发布和二创。'
  );
  const [loading, setLoading] = useState(false);

  async function postSnapshot(path: string, body: unknown) {
    const response = await fetch(path, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });
    const payload = (await response.json()) as DemoSnapshot | { error: string };

    if (!response.ok || isErrorPayload(payload)) {
      throw new Error(isErrorPayload(payload) ? payload.error : '请求失败');
    }

    setState(payload as DemoSnapshot);
    return payload as DemoSnapshot;
  }

  function requireLogin(message = '请先注册或登录。') {
    if (state.user) {
      return true;
    }

    setAuthMode('register');
    setModal('auth');
    setToast(message);
    return false;
  }

  async function emit(event: AnalyticsEvent) {
    try {
      await postSnapshot('/api/events', event);
    } catch {
      setToast('事件记录失败，但不影响继续试玩。');
    }
  }

  async function saveGame(game: Game) {
    if (!requireLogin('登录后可收藏作品，系统会沉淀到个人资产。')) {
      return;
    }

    try {
      const wasSaved = state.savedIds.includes(game.id);
      await postSnapshot('/api/saved', { game_id: game.id });
      setToast(wasSaved ? '已取消收藏。' : '已收藏到个人主页。');
    } catch (error) {
      setToast(error instanceof Error ? error.message : '收藏失败');
    }
  }

  async function reportGame(game: Game) {
    if (!requireLogin('登录后可举报有害内容，方便平台风控追踪。')) {
      return;
    }

    try {
      await postSnapshot('/api/reports', { game_id: game.id });
      setToast('举报已记录，生产版将进入内容风控队列。');
    } catch (error) {
      setToast(error instanceof Error ? error.message : '举报失败');
    }
  }

  async function shareGame(game: Game) {
    const path = `/share/${game.id}`;
    await emit({ event_name: 'shared', game_id: game.id });

    try {
      await navigator.clipboard?.writeText(`${window.location.origin}${path}`);
      setToast(`分享链接已复制：${path}`);
    } catch {
      setToast(`分享页：${path}`);
    }
  }

  function openRemix(game: Game) {
    if (!requireLogin('登录后可基于喜欢的作品重织二创。')) {
      return;
    }

    setActiveGame(game);
    setPrompt('');
    setModal('remix');
  }

  function openGenerate() {
    if (!requireLogin('登录后可发布自己的 AI 互动作品。')) {
      return;
    }

    setPrompt('');
    setActiveGame(null);
    setModal('generate');
  }

  async function submitGeneration() {
    if (!requireLogin('请先登录后再发布作品。')) {
      return;
    }

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setToast('请输入一个故事创意。');
      return;
    }

    setLoading(true);

    const combinedPrompt =
      modal === 'remix' && activeGame
        ? `基于原设定：${activeGame.core_prompt}，引入全新变量：${trimmedPrompt}，重新织造一个全新的互动剧本。`
        : trimmedPrompt;

    try {
      const response = await fetch('/api/generate-game', {
        body: JSON.stringify({
          prompt: combinedPrompt,
          parent_id: activeGame?.id
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      });
      const payload = (await response.json()) as GenerateResponse;

      if (!response.ok || !payload.game || !payload.state) {
        setToast(payload.error ?? '生成失败，credits 未扣除。');
        return;
      }

      setState(payload.state);
      setToast(activeGame ? '重织成功，新作品已进入推荐流。' : '发布成功，新作品已进入推荐流。');
      setModal(null);
      setActiveGame(null);
      setPrompt('');
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      const nextState = await postSnapshot('/api/auth', { action: 'logout' });
      setState(nextState);
      setAuthMode('login');
      setModal('auth');
      setToast('已退出登录，当前为游客浏览模式。');
    } catch (error) {
      setToast(error instanceof Error ? error.message : '退出失败');
    }
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-[#090b0f] text-white">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 mx-auto flex max-w-[520px] items-center justify-between px-4 pt-[max(0.9rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">Douplay</p>
          <h1 className="truncate text-lg font-semibold tracking-normal">推荐</h1>
        </div>
        <div className="pointer-events-auto flex shrink-0 items-center gap-2">
          <button
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/12 bg-black/35 px-3 text-sm text-white shadow-sm backdrop-blur-md"
            onClick={() => setModal('metrics')}
            type="button"
          >
            <Coins className="h-4 w-4 text-[#d7c79f]" />
            {state.user ? state.credits : '游客'}
          </button>
          <button
            aria-label={state.user ? '个人账号' : '登录注册'}
            className="h-10 min-w-10 rounded-full bg-white px-3 text-sm font-semibold text-slate-950 shadow-lg shadow-black/20"
            onClick={() => {
              setAuthMode(state.user ? 'login' : 'register');
              setModal('auth');
            }}
            type="button"
          >
            {state.user ? state.user.nickname.slice(0, 4) : <UserRound className="mx-auto h-5 w-5" />}
          </button>
        </div>
      </header>

      <section className="snap-feed h-dvh snap-y snap-mandatory overflow-y-auto">
        {state.games.map((game) => (
          <GameCard
            game={game}
            key={game.id}
            onEvent={emit}
            onRemix={openRemix}
            onReport={reportGame}
            onSave={saveGame}
            onShare={shareGame}
            saved={state.savedIds.includes(game.id)}
          />
        ))}
      </section>

      <nav className="fixed inset-x-0 bottom-[max(0.65rem,env(safe-area-inset-bottom))] z-40 mx-auto grid max-w-[520px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-5">
        <button
          className="h-11 rounded-full border border-white/10 bg-black/45 text-sm font-medium text-white/82 backdrop-blur-md"
          onClick={() => setModal('metrics')}
          type="button"
        >
          我的
        </button>
        <button
          aria-label="发布作品"
          className="grid h-14 w-14 place-items-center rounded-full bg-white text-slate-950 shadow-xl shadow-black/30"
          onClick={openGenerate}
          type="button"
        >
          <Plus className="h-6 w-6" />
        </button>
        <button
          className="h-11 rounded-full border border-white/10 bg-black/45 text-sm font-medium text-white/82 backdrop-blur-md"
          onClick={() => setToast('当前 Demo 展示推荐流，后续可扩展关注/同城分发。')}
          type="button"
        >
          推荐
        </button>
      </nav>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(max(0.65rem,env(safe-area-inset-bottom))+4.4rem)] z-50 mx-auto max-w-[520px] px-5">
        <div className="rounded-full border border-white/10 bg-black/58 px-4 py-2 text-center text-xs leading-5 text-white/78 shadow-lg backdrop-blur-md">
          {toast}
        </div>
      </div>

      <AnimatePresence>
        {modal === 'auth' ? (
          <AuthModal
            loading={loading}
            mode={authMode}
            onClose={() => setModal(null)}
            onLogout={logout}
            onModeChange={setAuthMode}
            onSubmit={async (payload) => {
              setLoading(true);

              try {
                const nextState = await postSnapshot('/api/auth', payload);
                setState(nextState);
                setModal(null);
                setToast(payload.action === 'register' ? '注册成功，已获得 50 credits。' : '登录成功，欢迎回来。');
              } catch (error) {
                setToast(error instanceof Error ? error.message : '登录失败');
              } finally {
                setLoading(false);
              }
            }}
            user={state.user}
          />
        ) : null}

        {modal === 'generate' || modal === 'remix' ? (
          <PromptModal
            activeGame={activeGame}
            credits={state.credits}
            loading={loading}
            mode={modal}
            onClose={() => setModal(null)}
            onSubmit={submitGeneration}
            prompt={prompt}
            setPrompt={setPrompt}
          />
        ) : null}

        {modal === 'metrics' ? (
          <MetricsPanel
            events={state.events}
            historyIds={state.historyIds}
            metrics={state.metrics}
            onClose={() => setModal(null)}
            savedIds={state.savedIds}
            user={state.user}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function isErrorPayload(payload: DemoSnapshot | { error: string }): payload is { error: string } {
  return 'error' in payload;
}

type AuthModalProps = {
  mode: AuthMode;
  loading: boolean;
  user: DemoUser | null;
  onClose: () => void;
  onLogout: () => void;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (payload: { action: AuthMode; phone: string; nickname?: string; password: string }) => Promise<void>;
};

function AuthModal({ loading, mode, onClose, onLogout, onModeChange, onSubmit, user }: AuthModalProps) {
  const [phone, setPhone] = useState('13800000000');
  const [nickname, setNickname] = useState('灵动玩家');
  const [password, setPassword] = useState('123456');

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/58 px-4 py-6 backdrop-blur-sm"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <motion.div
        animate={{ y: 0 }}
        className="mx-auto mt-[8dvh] max-w-[520px] rounded-2xl border border-white/10 bg-[#f7f3ea] p-4 text-slate-950 shadow-2xl"
        exit={{ y: 24 }}
        initial={{ y: 24 }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Account</p>
            <h2 className="mt-1 text-xl font-semibold">{user ? '账号与资产' : mode === 'register' ? '注册后开始创作' : '登录 Douplay'}</h2>
          </div>
          <button aria-label="关闭" className="h-9 w-9 rounded-full bg-slate-950/8" onClick={onClose} type="button">
            <X className="mx-auto h-4 w-4" />
          </button>
        </div>

        {user ? (
          <div className="rounded-xl border border-slate-950/10 bg-white/72 p-3">
            <p className="text-sm text-slate-500">当前账号</p>
            <p className="mt-1 text-lg font-semibold">{user.nickname}</p>
            <p className="mt-1 text-sm text-slate-600">{user.phone} · {user.credits} credits</p>
            <button
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white"
              onClick={onLogout}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              退出登录
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 rounded-full bg-slate-950/8 p-1">
              <button
                className={`h-9 rounded-full text-sm font-medium ${mode === 'register' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
                onClick={() => onModeChange('register')}
                type="button"
              >
                注册
              </button>
              <button
                className={`h-9 rounded-full text-sm font-medium ${mode === 'login' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
                onClick={() => onModeChange('login')}
                type="button"
              >
                登录
              </button>
            </div>

            <div className="grid gap-3">
              <Field label="手机号" onChange={setPhone} value={phone} />
              {mode === 'register' ? <Field label="昵称" onChange={setNickname} value={nickname} /> : null}
              <Field label="密码" onChange={setPassword} type="password" value={password} />
            </div>

            <button
              className="mt-4 min-h-11 w-full rounded-full bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-50"
              disabled={loading}
              onClick={() =>
                onSubmit({
                  action: mode,
                  phone,
                  nickname,
                  password
                })
              }
              type="button"
            >
              {loading ? '处理中' : mode === 'register' ? '注册并领取 50 credits' : '登录'}
            </button>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Demo 使用内存账号系统，便于验证注册、登录、发布、二创和资产沉淀逻辑。
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function Field({
  label,
  onChange,
  type = 'text',
  value
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      {label}
      <input
        className="h-11 rounded-xl border border-slate-950/10 bg-white px-3 text-base text-slate-950 outline-none focus:border-slate-950/40"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

type PromptModalProps = {
  mode: 'generate' | 'remix';
  activeGame: Game | null;
  prompt: string;
  setPrompt: (value: string) => void;
  credits: number;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

function PromptModal({
  activeGame,
  credits,
  loading,
  mode,
  onClose,
  onSubmit,
  prompt,
  setPrompt
}: PromptModalProps) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/58 px-4 py-6 backdrop-blur-sm"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <motion.div
        animate={{ y: 0 }}
        className="mx-auto mt-[10dvh] max-w-[520px] rounded-2xl border border-white/10 bg-[#f7f3ea] p-4 text-slate-950 shadow-2xl"
        exit={{ y: 24 }}
        initial={{ y: 24 }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              {mode === 'remix' ? 'Remix' : 'Publish'}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{mode === 'remix' ? '二创重织' : '生成并发布'}</h2>
          </div>
          <button aria-label="关闭" className="h-9 w-9 rounded-full bg-slate-950/8" onClick={onClose} type="button">
            <X className="mx-auto h-4 w-4" />
          </button>
        </div>

        {activeGame ? (
          <div className="mb-3 rounded-xl border border-slate-950/10 bg-white/72 p-3 text-sm text-slate-700">
            <p className="mb-1 text-xs font-medium text-slate-500">原作品设定</p>
            <p>{activeGame.core_prompt}</p>
          </div>
        ) : null}

        <label className="text-sm font-medium text-slate-700" htmlFor="prompt">
          {mode === 'remix' ? '输入你要加入的新变量' : '输入原创故事创意'}
        </label>
        <textarea
          className="mt-2 min-h-32 w-full resize-none rounded-xl border border-slate-950/10 bg-white p-3 text-base text-slate-950 outline-none focus:border-slate-950/40"
          id="prompt"
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={mode === 'remix' ? '例如：让主角变成时间旅行者' : '例如：赛博城隍庙里的失眠审判'}
          value={prompt}
        />

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
          <div className="flex items-center gap-2 text-xs leading-5 text-slate-600">
            <ShieldCheck className="h-4 w-4 text-slate-950" />
            后端审查，发布消耗 5 credits。当前 {credits}
          </div>
          <button
            className="min-h-11 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
            onClick={onSubmit}
            type="button"
          >
            {loading ? '生成中' : mode === 'remix' ? '重织发布' : '发布'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

type MetricsPanelProps = {
  metrics: {
    remixRate: number;
    avgDepth: number;
    creditDrainVelocity: number;
    saved: number;
    reported: number;
  };
  events: AnalyticsEvent[];
  historyIds: string[];
  savedIds: string[];
  user: DemoUser | null;
  onClose: () => void;
};

function MetricsPanel({ events, historyIds, metrics, onClose, savedIds, user }: MetricsPanelProps) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/58 px-4 py-6 backdrop-blur-sm"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <motion.div
        animate={{ y: 0 }}
        className="mx-auto mt-[6dvh] max-h-[88dvh] max-w-[520px] overflow-y-auto rounded-2xl border border-white/10 bg-[#f7f3ea] p-4 text-slate-950 shadow-2xl"
        exit={{ y: 24 }}
        initial={{ y: 24 }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Creator Center</p>
            <h2 className="mt-1 text-xl font-semibold">{user ? `${user.nickname} 的主页` : '游客数据看板'}</h2>
          </div>
          <button aria-label="关闭" className="h-9 w-9 rounded-full bg-slate-950/8" onClick={onClose} type="button">
            <X className="mx-auto h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 rounded-xl border border-slate-950/10 bg-white/72 p-3">
          <p className="text-xs font-medium text-slate-500">账号状态</p>
          <p className="mt-1 text-sm text-slate-700">
            {user ? `${user.phone} · ${user.credits} credits` : '游客可刷推荐内容，登录后沉淀收藏、历史和作品。'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Metric icon={<Sparkles className="h-4 w-4" />} label="Remix 转化率" value={`${metrics.remixRate}%`} />
          <Metric icon={<Search className="h-4 w-4" />} label="平均游玩深度" value={String(metrics.avgDepth)} />
          <Metric icon={<Coins className="h-4 w-4" />} label="Credits 消耗" value={String(metrics.creditDrainVelocity)} />
          <Metric icon={<ShieldCheck className="h-4 w-4" />} label="举报记录" value={String(metrics.reported)} />
          <Metric icon={<History className="h-4 w-4" />} label="玩过作品" value={String(historyIds.length)} />
          <Metric icon={<BarChart3 className="h-4 w-4" />} label="收藏作品" value={String(savedIds.length)} />
        </div>

        <div className="mt-4 rounded-xl border border-slate-950/10 bg-white/72 p-3">
          <h3 className="mb-2 text-sm font-semibold">最近行为</h3>
          <div className="grid gap-2 text-xs text-slate-600">
            {events.length ? (
              events.slice(0, 8).map((event, index) => (
                <div className="flex items-center justify-between gap-3" key={`${event.event_name}-${index}`}>
                  <span>{event.event_name}</span>
                  <span className="truncate text-slate-400">{event.game_id}</span>
                </div>
              ))
            ) : (
              <p>开始试玩后，这里会显示 play_start、node_advance、remix_created 等后端打点。</p>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          © 2026 灵动织造 | 浙ICP备xxxxxx号-1
        </p>
      </motion.div>
    </motion.div>
  );
}

type MetricProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function Metric({ icon, label, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-slate-950/10 bg-white/72 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
