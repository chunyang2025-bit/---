'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Coins, History, Plus, Search, ShieldCheck, Sparkles, X } from 'lucide-react';
import { seedGames } from '@/lib/demo-data';
import { moderateText } from '@/lib/moderation';
import type { AnalyticsEvent, Game } from '@/lib/game-types';
import GameCard from './game-card';

type GenerateResponse = {
  game?: Game;
  error?: string;
};

export default function DouplayDemo() {
  const [games, setGames] = useState<Game[]>(seedGames);
  const [credits, setCredits] = useState(50);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [modal, setModal] = useState<'generate' | 'remix' | 'metrics' | null>(null);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [prompt, setPrompt] = useState('');
  const [toast, setToast] = useState('Demo 使用本地模拟数据，生成一次消耗 5 credits。');
  const [loading, setLoading] = useState(false);

  const metrics = useMemo(() => {
    const playStarts = events.filter((event) => event.event_name === 'play_start').length;
    const remixes = events.filter((event) => event.event_name === 'remix_created').length;
    const nodeAdvances = events.filter((event) => event.event_name === 'node_advance').length;
    const creditDrainVelocity = 50 - credits;

    return {
      remixRate: playStarts ? Math.round((remixes / playStarts) * 100) : 0,
      avgDepth: playStarts ? Math.round((nodeAdvances / playStarts) * 10) / 10 : 0,
      creditDrainVelocity,
      saved: savedIds.length,
      reported: reportedIds.length
    };
  }, [credits, events, reportedIds.length, savedIds.length]);

  function emit(event: AnalyticsEvent) {
    setEvents((current) => [event, ...current].slice(0, 40));

    if (event.event_name === 'play_start') {
      setHistoryIds((current) =>
        current.includes(event.game_id) ? current : [event.game_id, ...current].slice(0, 16)
      );
    }
  }

  function saveGame(game: Game) {
    setSavedIds((current) =>
      current.includes(game.id) ? current.filter((id) => id !== game.id) : [game.id, ...current]
    );
    emit({ event_name: 'saved', game_id: game.id });
    setToast(savedIds.includes(game.id) ? '已取消收藏。' : '已加入收藏，个人中心会显示这个作品。');
  }

  function reportGame(game: Game) {
    setReportedIds((current) => (current.includes(game.id) ? current : [game.id, ...current]));
    emit({ event_name: 'reported', game_id: game.id });
    setToast('举报已记录。Demo 中累计举报会进入风控指标，生产版将写入 reports 表。');
  }

  function shareGame(game: Game) {
    const path = `/share/${game.id}`;
    emit({ event_name: 'shared', game_id: game.id });
    window.history.replaceState(null, '', '/');
    void navigator.clipboard?.writeText(`${window.location.origin}${path}`);
    setToast(`分享链接已复制：${path}`);
  }

  function openRemix(game: Game) {
    setActiveGame(game);
    setPrompt('');
    setModal('remix');
  }

  async function submitGeneration() {
    const moderation = moderateText(prompt);

    if (!moderation.safe) {
      setToast(moderation.reason);
      return;
    }

    if (credits < 5) {
      setToast('Credits 不足，生产版会阻止调用 LLM，避免 API 账单失控。');
      return;
    }

    setLoading(true);
    setCredits((current) => current - 5);

    const combinedPrompt =
      modal === 'remix' && activeGame
        ? `基于原设定：${activeGame.core_prompt}，引入全新变量：${prompt}，重新织造一个全新的互动剧本。`
        : prompt;

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

      if (!response.ok || !payload.game) {
        setCredits((current) => current + 5);
        setToast(payload.error ?? '生成失败，credits 已返还。');
        return;
      }

      setGames((current) => [payload.game!, ...current]);
      setHistoryIds((current) => [payload.game!.id, ...current]);
      emit({ event_name: 'remix_created', game_id: payload.game.id, properties: { parent_id: activeGame?.id ?? '' } });
      setToast(activeGame ? '重织成功，新作品已插入信息流顶部。' : '生成成功，新互动剧本已插入信息流顶部。');
      setModal(null);
      setActiveGame(null);
      setPrompt('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-[#05070a] text-white">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 mx-auto flex max-w-[520px] items-center justify-between px-4 pt-3">
        <div>
          <p className="text-[11px] uppercase text-teal-100/65">Douplay MVP</p>
          <h1 className="text-lg font-semibold tracking-normal">刷着玩的 AI 故事社区</h1>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-teal-200/24 bg-black/32 px-3 text-sm text-teal-50"
            onClick={() => setModal('metrics')}
            type="button"
          >
            <Coins className="h-4 w-4" />
            {credits}
          </button>
          <button
            aria-label="生成游戏"
            className="h-10 w-10 rounded-lg bg-teal-300 text-slate-950 shadow-glow"
            onClick={() => {
              setPrompt('');
              setActiveGame(null);
              setModal('generate');
            }}
            type="button"
          >
            <Plus className="mx-auto h-5 w-5" />
          </button>
        </div>
      </header>

      <section className="snap-feed h-dvh snap-y snap-mandatory overflow-y-auto">
        {games.map((game) => (
          <GameCard
            game={game}
            key={game.id}
            onEvent={emit}
            onRemix={openRemix}
            onReport={reportGame}
            onSave={saveGame}
            onShare={shareGame}
            saved={savedIds.includes(game.id)}
          />
        ))}
      </section>

      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 mx-auto max-w-[520px] px-4">
        <div className="glass-line rounded-lg px-3 py-2 text-xs leading-5 text-slate-200">{toast}</div>
      </div>

      <AnimatePresence>
        {modal === 'generate' || modal === 'remix' ? (
          <PromptModal
            activeGame={activeGame}
            credits={credits}
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
            events={events}
            historyIds={historyIds}
            metrics={metrics}
            onClose={() => setModal(null)}
            savedIds={savedIds}
          />
        ) : null}
      </AnimatePresence>
    </main>
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
      className="fixed inset-0 z-50 bg-black/64 px-4 py-6"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <motion.div
        animate={{ y: 0 }}
        className="glass-line mx-auto mt-[12dvh] max-w-[520px] rounded-lg p-4"
        exit={{ y: 24 }}
        initial={{ y: 24 }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-teal-100/70">{mode === 'remix' ? 'Remix Pipeline' : 'Generate Game'}</p>
            <h2 className="text-xl font-semibold">{mode === 'remix' ? '重织这个故事' : '生成一个互动短剧本'}</h2>
          </div>
          <button aria-label="关闭" className="h-9 w-9 rounded-lg bg-white/10" onClick={onClose} type="button">
            <X className="mx-auto h-4 w-4" />
          </button>
        </div>

        {activeGame ? (
          <div className="mb-3 rounded-lg border border-white/12 bg-white/[0.06] p-3 text-sm text-slate-200">
            <p className="text-slate-400">原设定</p>
            <p>{activeGame.core_prompt}</p>
          </div>
        ) : null}

        <label className="text-sm text-slate-200" htmlFor="prompt">
          {mode === 'remix' ? '你想为这段故事注入什么新变量？' : '输入一个原创故事创意'}
        </label>
        <textarea
          className="mt-2 min-h-28 w-full resize-none rounded-lg border border-white/14 bg-black/28 p-3 text-base text-white outline-none focus:border-teal-200/70"
          id="prompt"
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={mode === 'remix' ? '例如：让主角变成一个时间旅行者' : '例如：赛博城隍庙里的失眠审判'}
          value={prompt}
        />

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-teal-200" />
            生成前审查，消耗 5 credits。当前余额 {credits}
          </div>
          <button
            className="min-h-11 rounded-lg bg-teal-300 px-4 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
            onClick={onSubmit}
            type="button"
          >
            {loading ? '生成中' : mode === 'remix' ? '重织' : '生成'}
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
  onClose: () => void;
};

function MetricsPanel({ events, historyIds, metrics, onClose, savedIds }: MetricsPanelProps) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/64 px-4 py-6"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <motion.div
        animate={{ y: 0 }}
        className="glass-line mx-auto mt-[7dvh] max-h-[86dvh] max-w-[520px] overflow-y-auto rounded-lg p-4"
        exit={{ y: 24 }}
        initial={{ y: 24 }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-teal-100/70">Investor Demo Data</p>
            <h2 className="text-xl font-semibold">社区飞轮仪表盘</h2>
          </div>
          <button aria-label="关闭" className="h-9 w-9 rounded-lg bg-white/10" onClick={onClose} type="button">
            <X className="mx-auto h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Metric icon={<Sparkles className="h-4 w-4" />} label="Remix 转化率" value={`${metrics.remixRate}%`} />
          <Metric icon={<Search className="h-4 w-4" />} label="平均游玩深度" value={String(metrics.avgDepth)} />
          <Metric icon={<Coins className="h-4 w-4" />} label="Credits 消耗" value={String(metrics.creditDrainVelocity)} />
          <Metric icon={<ShieldCheck className="h-4 w-4" />} label="举报记录" value={String(metrics.reported)} />
          <Metric icon={<History className="h-4 w-4" />} label="玩过作品" value={String(historyIds.length)} />
          <Metric icon={<BarChart3 className="h-4 w-4" />} label="收藏作品" value={String(savedIds.length)} />
        </div>

        <div className="mt-4 rounded-lg border border-white/12 bg-white/[0.05] p-3">
          <h3 className="mb-2 text-sm font-semibold">最近事件</h3>
          <div className="grid gap-2 text-xs text-slate-300">
            {events.length ? (
              events.slice(0, 8).map((event, index) => (
                <div className="flex items-center justify-between gap-3" key={`${event.event_name}-${index}`}>
                  <span>{event.event_name}</span>
                  <span className="truncate text-slate-500">{event.game_id}</span>
                </div>
              ))
            ) : (
              <p>开始试玩后，这里会显示 play_start、node_advance、remix_created 等打点。</p>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-400">
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
    <div className="rounded-lg border border-white/12 bg-white/[0.06] p-3">
      <div className="mb-2 flex items-center gap-2 text-xs text-teal-100/72">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
