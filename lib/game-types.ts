export type GameOption = {
  text: string;
  next_tag: string;
};

export type GameNode = {
  node_tag: string;
  story_text: string;
  image_url: string;
  bg_color_hex: string;
  options: GameOption[];
  is_ending: boolean;
};

export type Game = {
  id: string;
  title: string;
  description: string;
  core_prompt: string;
  compiled_prompt: string;
  creator_name: string;
  parent_id?: string;
  likes_count: number;
  plays_count: number;
  remix_count: number;
  created_at: string;
  nodes: GameNode[];
};

export type AnalyticsEvent = {
  event_name: 'play_start' | 'node_advance' | 'remix_created' | 'saved' | 'reported' | 'shared';
  game_id: string;
  properties?: Record<string, string | number | boolean>;
};

export type DemoUser = {
  id: string;
  phone: string;
  nickname: string;
  credits: number;
  created_at: string;
};

export type DemoMetrics = {
  remixRate: number;
  avgDepth: number;
  creditDrainVelocity: number;
  saved: number;
  reported: number;
};

export type DemoSnapshot = {
  games: Game[];
  credits: number;
  user: DemoUser | null;
  savedIds: string[];
  historyIds: string[];
  reportedIds: string[];
  events: AnalyticsEvent[];
  metrics: DemoMetrics;
};
