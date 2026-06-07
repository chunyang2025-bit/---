'use client';

import { useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import type { Game } from '@/lib/game-types';
import GameCard from './game-card';

type ShareExperienceProps = {
  game: Game;
};

export default function ShareExperience({ game }: ShareExperienceProps) {
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <main className="h-dvh bg-[#05070a]">
        <GameCard
          game={game}
          onEvent={() => undefined}
          onRemix={() => undefined}
          onReport={() => undefined}
          onSave={() => undefined}
          onShare={() => undefined}
          saved={false}
        />
      </main>
    );
  }

  const firstNode = game.nodes[0];

  return (
    <main
      className="relative flex h-dvh items-end overflow-hidden px-4 pb-8 text-white"
      style={{ backgroundColor: firstNode.bg_color_hex }}
    >
      <div className="absolute inset-0 scene-ink" />
      <img
        alt=""
        className="absolute inset-x-0 top-[12dvh] mx-auto h-[42dvh] w-[88%] max-w-[460px] object-contain"
        src={firstNode.image_url}
      />
      <a
        className="absolute left-4 top-4 inline-flex h-10 items-center gap-2 rounded-lg bg-black/32 px-3 text-sm"
        href="/"
      >
        <ArrowLeft className="h-4 w-4" />
        Douplay
      </a>
      <section className="glass-line relative z-10 mx-auto w-full max-w-[520px] rounded-lg p-4">
        <p className="text-xs text-teal-100/70">公共分享 H5</p>
        <h1 className="mt-1 text-3xl font-semibold">{game.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-200">{game.description}</p>
        <button
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-300 px-4 text-sm font-semibold text-slate-950"
          onClick={() => setStarted(true)}
          type="button"
        >
          <Play className="h-4 w-4" />
          开始试玩
        </button>
      </section>
    </main>
  );
}
