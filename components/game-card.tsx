'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, Flag, Heart, Repeat2, RotateCcw, Send, Share2 } from 'lucide-react';
import type { AnalyticsEvent, Game } from '@/lib/game-types';
import TypingText from './typing-text';

type GameCardProps = {
  game: Game;
  saved: boolean;
  onSave: (game: Game) => void;
  onReport: (game: Game) => void;
  onRemix: (game: Game) => void;
  onShare: (game: Game) => void;
  onEvent: (event: AnalyticsEvent) => void;
};

export default function GameCard({
  game,
  saved,
  onSave,
  onReport,
  onRemix,
  onShare,
  onEvent
}: GameCardProps) {
  const [currentNodeTag, setCurrentNodeTag] = useState('start');
  const [started, setStarted] = useState(false);
  const nodeMap = useMemo(
    () => new Map(game.nodes.map((node) => [node.node_tag, node])),
    [game.nodes]
  );
  const currentNode = nodeMap.get(currentNodeTag) ?? game.nodes[0];

  function advance(nextTag: string) {
    if (!started) {
      setStarted(true);
      onEvent({ event_name: 'play_start', game_id: game.id });
    }

    setCurrentNodeTag(nextTag);
    onEvent({
      event_name: 'node_advance',
      game_id: game.id,
      properties: { next_tag: nextTag }
    });
  }

  function restart() {
    setStarted(false);
    setCurrentNodeTag('start');
  }

  return (
    <section
      className="relative h-dvh w-full snap-start overflow-hidden"
      style={{
        backgroundColor: currentNode.bg_color_hex
      }}
    >
      <div className="absolute inset-0 scene-ink" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,10,0.12),rgba(5,7,10,0.16)_42%,rgba(5,7,10,0.78))]" />
      <img
        alt=""
        className="absolute inset-x-0 top-[8dvh] mx-auto h-[38dvh] max-h-[360px] w-[86%] max-w-[460px] object-contain opacity-95 drop-shadow-[0_28px_40px_rgba(0,0,0,0.42)]"
        src={currentNode.image_url}
      />

      <div className="absolute right-3 top-[25dvh] z-20 flex w-12 flex-col items-center gap-3 sm:right-[calc(50%-230px)]">
        <RailButton label="喜欢" value={game.likes_count} onClick={() => onEvent({ event_name: 'saved', game_id: game.id })}>
          <Heart className="h-5 w-5" />
        </RailButton>
        <RailButton label="重织" value={game.remix_count} onClick={() => onRemix(game)}>
          <Repeat2 className="h-5 w-5" />
        </RailButton>
        <RailButton label="收藏" active={saved} onClick={() => onSave(game)}>
          <Bookmark className="h-5 w-5" />
        </RailButton>
        <RailButton label="分享" onClick={() => onShare(game)}>
          <Share2 className="h-5 w-5" />
        </RailButton>
        <RailButton label="举报" onClick={() => onReport(game)}>
          <Flag className="h-5 w-5" />
        </RailButton>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto flex h-[54dvh] max-w-[520px] flex-col justify-end px-4 pb-5">
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-teal-100/75">
            <span className="rounded-full border border-teal-200/20 px-2 py-1">{game.creator_name}</span>
            <span>{game.plays_count.toLocaleString()} plays</span>
            {game.parent_id ? <span>Remix 血统</span> : null}
          </div>
          <h2 className="text-3xl font-semibold tracking-normal text-white">{game.title}</h2>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-200/76">{game.description}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${game.id}-${currentNode.node_tag}`}
            animate={{ opacity: 1, y: 0 }}
            className="glass-line min-h-[238px] rounded-lg p-4 shadow-glow"
            exit={{ opacity: 0, y: -14 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22 }}
          >
            <TypingText className="min-h-[96px] text-lg leading-8 text-slate-50" text={currentNode.story_text} />

            <div className="mt-5 grid gap-2">
              {currentNode.options.map((option) => (
                <button
                  className="min-h-12 rounded-lg border border-white/14 bg-white/[0.08] px-4 py-3 text-left text-sm font-medium text-white transition hover:border-teal-200/50 hover:bg-teal-200/12"
                  key={option.next_tag}
                  onClick={() => advance(option.next_tag)}
                  type="button"
                >
                  {option.text}
                </button>
              ))}

              {currentNode.is_ending ? (
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <button
                    className="min-h-12 rounded-lg bg-teal-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
                    onClick={() => onRemix(game)}
                    type="button"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      重织这个结局
                    </span>
                  </button>
                  <button
                    aria-label="重新开始"
                    className="h-12 w-12 rounded-lg border border-white/14 bg-white/[0.08] text-white transition hover:bg-white/[0.14]"
                    onClick={restart}
                    type="button"
                  >
                    <RotateCcw className="mx-auto h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

type RailButtonProps = {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  value?: number;
  onClick: () => void;
};

function RailButton({ children, label, active, value, onClick }: RailButtonProps) {
  return (
    <button
      aria-label={label}
      className={`flex w-12 flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[10px] transition ${
        active
          ? 'border-teal-200/60 bg-teal-200/22 text-teal-50'
          : 'border-white/12 bg-black/24 text-slate-100 hover:bg-white/12'
      }`}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
      {value !== undefined ? <span>{value > 999 ? `${Math.round(value / 100) / 10}k` : value}</span> : null}
    </button>
  );
}
