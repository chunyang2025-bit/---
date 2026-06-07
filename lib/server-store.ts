import { seedGames } from './demo-data';
import { createMockGame } from './game-factory';
import type { AnalyticsEvent, DemoMetrics, DemoSnapshot, DemoUser, Game } from './game-types';
import { moderateText } from './moderation';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export type DemoState = {
  games: Game[];
  users: Array<DemoUser & { password: string }>;
  currentUserId: string | null;
  savedIds: string[];
  historyIds: string[];
  reportedIds: string[];
  events: AnalyticsEvent[];
};

declare global {
  var douplayDemoState: DemoState | undefined;
}

type LegacyDemoState = Partial<DemoState> & {
  credits?: number;
};

function createInitialState(): DemoState {
  return {
    games: seedGames,
    users: [],
    currentUserId: null,
    savedIds: [],
    historyIds: [],
    reportedIds: [],
    events: []
  };
}

const storePath = join(process.cwd(), '.demo-state.json');

function normalizeState(state: LegacyDemoState): DemoState {
  return {
    games: state.games?.length ? state.games : seedGames,
    users: Array.isArray(state.users) ? state.users : [],
    currentUserId: state.currentUserId ?? null,
    savedIds: Array.isArray(state.savedIds) ? state.savedIds : [],
    historyIds: Array.isArray(state.historyIds) ? state.historyIds : [],
    reportedIds: Array.isArray(state.reportedIds) ? state.reportedIds : [],
    events: Array.isArray(state.events) ? state.events : []
  };
}

export function getState() {
  if (existsSync(storePath)) {
    try {
      globalThis.douplayDemoState = normalizeState(
        JSON.parse(readFileSync(storePath, 'utf8')) as LegacyDemoState
      );
      return globalThis.douplayDemoState;
    } catch {
      globalThis.douplayDemoState = createInitialState();
      saveState(globalThis.douplayDemoState);
      return globalThis.douplayDemoState;
    }
  }

  globalThis.douplayDemoState = normalizeState(globalThis.douplayDemoState ?? createInitialState());
  saveState(globalThis.douplayDemoState);
  return globalThis.douplayDemoState;
}

function saveState(state: DemoState) {
  const currentDiskState =
    existsSync(storePath)
      ? normalizeState(JSON.parse(readFileSync(storePath, 'utf8')) as LegacyDemoState)
      : createInitialState();
  const nextState = mergeState(currentDiskState, normalizeState(state));

  globalThis.douplayDemoState = nextState;
  writeFileSync(storePath, JSON.stringify(globalThis.douplayDemoState, null, 2));
}

function mergeState(previous: DemoState, next: DemoState): DemoState {
  return {
    games: mergeById(next.games, previous.games),
    users: mergeById(next.users, previous.users),
    currentUserId: next.currentUserId,
    savedIds: unique([...next.savedIds, ...previous.savedIds]),
    historyIds: unique([...next.historyIds, ...previous.historyIds]).slice(0, 24),
    reportedIds: unique([...next.reportedIds, ...previous.reportedIds]),
    events: mergeEvents(next.events, previous.events).slice(0, 80)
  };
}

function mergeById<T extends { id: string }>(preferred: T[], fallback: T[]) {
  const seen = new Set<string>();
  return [...preferred, ...fallback].filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function unique(items: string[]) {
  return Array.from(new Set(items));
}

function mergeEvents(preferred: AnalyticsEvent[], fallback: AnalyticsEvent[]) {
  const seen = new Set<string>();
  return [...preferred, ...fallback].filter((event) => {
    const key = `${event.event_name}:${event.game_id}:${JSON.stringify(event.properties ?? {})}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function snapshot(): DemoSnapshot {
  const state = getState();
  const currentUser = getCurrentUser();
  return {
    games: state.games,
    credits: currentUser?.credits ?? 0,
    user: currentUser ? sanitizeUser(currentUser) : null,
    savedIds: state.savedIds,
    historyIds: state.historyIds,
    reportedIds: state.reportedIds,
    events: state.events,
    metrics: getMetrics()
  };
}

export function getMetrics(): DemoMetrics {
  const state = getState();
  const playStarts = state.events.filter((event) => event.event_name === 'play_start').length;
  const remixes = state.events.filter((event) => event.event_name === 'remix_created').length;
  const nodeAdvances = state.events.filter((event) => event.event_name === 'node_advance').length;

  return {
    remixRate: playStarts ? Math.round((remixes / playStarts) * 100) : 0,
    avgDepth: playStarts ? Math.round((nodeAdvances / playStarts) * 10) / 10 : 0,
    creditDrainVelocity: state.users.reduce((sum, user) => sum + (50 - user.credits), 0),
    saved: state.savedIds.length,
    reported: state.reportedIds.length
  };
}

function getCurrentUser() {
  const state = getState();
  return state.users.find((user) => user.id === state.currentUserId) ?? null;
}

function sanitizeUser(user: DemoUser & { password: string }): DemoUser {
  return {
    id: user.id,
    phone: user.phone,
    nickname: user.nickname,
    credits: user.credits,
    created_at: user.created_at
  };
}

export function registerUser(phone: string, nickname: string, password: string) {
  const state = getState();
  const normalizedPhone = phone.trim();
  const trimmedNickname = nickname.trim() || `玩家${normalizedPhone.slice(-4)}`;

  if (!/^1\d{10}$/.test(normalizedPhone)) {
    return { ok: false, error: '请输入 11 位手机号。' };
  }

  if (password.length < 6) {
    return { ok: false, error: '密码至少 6 位。' };
  }

  if (state.users.some((user) => user.phone === normalizedPhone)) {
    return { ok: false, error: '这个手机号已注册，请直接登录。' };
  }

  const user = {
    id: `user-${Date.now()}-${normalizedPhone.slice(-4)}`,
    phone: normalizedPhone,
    nickname: trimmedNickname,
    password,
    credits: 50,
    created_at: new Date().toISOString()
  };

  state.users = [user, ...state.users];
  state.currentUserId = user.id;
  saveState(state);
  return { ok: true, state: snapshot() };
}

export function loginUser(phone: string, password: string) {
  const state = getState();
  const user = state.users.find((item) => item.phone === phone.trim());

  if (!user || user.password !== password) {
    return { ok: false, error: '手机号或密码不正确。Demo 可先注册一个新账号。' };
  }

  state.currentUserId = user.id;
  saveState(state);
  return { ok: true, state: snapshot() };
}

export function logoutUser() {
  const state = getState();
  state.currentUserId = null;
  saveState(state);
  return snapshot();
}

export function recordEvent(event: AnalyticsEvent) {
  const state = getState();
  state.events = [event, ...state.events].slice(0, 80);

  if (event.event_name === 'play_start') {
    state.historyIds = getCurrentUser() && state.historyIds.includes(event.game_id)
      ? state.historyIds
      : getCurrentUser()
        ? [event.game_id, ...state.historyIds].slice(0, 24)
        : state.historyIds;
  }

  saveState(state);
  return snapshot();
}

export function toggleSave(gameId: string) {
  if (!getCurrentUser()) {
    throw new Error('请先登录后再收藏。');
  }

  const state = getState();
  state.savedIds = state.savedIds.includes(gameId)
    ? state.savedIds.filter((id) => id !== gameId)
    : [gameId, ...state.savedIds];
  saveState(state);
  return recordEvent({ event_name: 'saved', game_id: gameId });
}

export function reportGame(gameId: string) {
  if (!getCurrentUser()) {
    throw new Error('请先登录后再举报。');
  }

  const state = getState();
  state.reportedIds = state.reportedIds.includes(gameId)
    ? state.reportedIds
    : [gameId, ...state.reportedIds];
  saveState(state);
  return recordEvent({ event_name: 'reported', game_id: gameId });
}

export function generateGame(prompt: string, parentId?: string) {
  const state = getState();
  const user = getCurrentUser();
  const moderation = moderateText(prompt);

  if (!user) {
    return {
      ok: false,
      error: '请先注册或登录，再发布作品。'
    };
  }

  if (!moderation.safe) {
    return {
      ok: false,
      error: moderation.reason
    };
  }

  if (user.credits < 5) {
    return {
      ok: false,
      error: 'Credits 不足，生产版会阻止调用 LLM，避免 API 账单失控。'
    };
  }

  state.users = state.users.map((item) =>
    item.id === user.id ? { ...item, credits: item.credits - 5 } : item
  );
  const game = createMockGame(prompt, parentId);
  game.creator_name = user.nickname;
  state.games = [game, ...state.games];
  state.historyIds = [game.id, ...state.historyIds].slice(0, 24);

  if (parentId) {
    state.games = state.games.map((item) =>
      item.id === parentId ? { ...item, remix_count: item.remix_count + 1 } : item
    );
  }

  const remixEvent: AnalyticsEvent = {
    event_name: 'remix_created',
    game_id: game.id,
    properties: { parent_id: parentId ?? '' }
  };

  state.events = [remixEvent, ...state.events].slice(0, 80);
  saveState(state);

  return {
    ok: true,
    game,
    state: snapshot()
  };
}
