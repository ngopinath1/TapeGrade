export type Player = {
  id: string;
  name: string;
  team: string;
  positions: string[];
  minutes: number | null;
  previous_minutes: number | null;
  fantasy_points: number | null;
  trend: number[];
  number: number | null;
  source: string;
  is_demo: boolean;
  film_only?: boolean;
  external_id?: string;
  lineup_status?: string;
  injury_status?: string | null;
  stats: Record<string, number>;
  recent_fantasy_average?: number | null;
  recent?: {
    ready: boolean;
    sample_size: number;
    recorded_dnp_count?: number;
    unknown_participation_count?: number;
    window_start: string;
    window_end: string;
    provider: string;
    fetched_at: string;
    reasons: string[];
    games: {
      row_id: string;
      game_id: string;
      date: string;
      minutes: number | null;
      score: number | null;
      source_ref: string;
      coverage: string[];
    }[];
  };
};
export type Guardrails = {
  min_confidence: number;
  max_faab_bid: number;
  protected_players: string[];
  schedule_enabled: boolean;
  pre_waiver_hour: number | null;
};
export type League = {
  id: string;
  name: string;
  team_name: string;
  standing: string;
  record: string;
  faab_remaining: number | null;
  is_demo?: boolean;
  season?: string;
  provider?: string;
  period?: number | null;
  period_points?: number | null;
  points_warning?: string | null;
  scoring?: { type: string; weights: Record<string, number> };
  connection?: {
    username: string;
    league_id: string;
    user_id: string;
    roster_id: number;
  };
  fetched_at?: string;
  compatibility?: string;
  scouting_ready?: boolean;
  scouting_unavailable_reason?: string;
  readiness_reasons?: string[];
  protections_reviewed?: boolean;
  rules?: {
    game_mode?: string;
    waiver_mode?: string;
    point_bonus_mode?: string;
    source_ref?: string;
    faab_budget?: number | null;
  };
  rule_settings?: Record<string, unknown>;
  stats_coverage?: { ready_candidates: number; ready_drops: number };
  roster: Player[];
  available: Player[];
  notice: string;
};
export type Bootstrap = {
  scan_readiness?: {
    ready: boolean;
    blockers: string[];
    notice: string | null;
    eligible_pair_count: number;
    candidates: {
      id: string;
      name: string;
      eligible_drop_ids: string[];
      transaction_issues: string[];
    }[];
  };
  league: League;
  settings: Guardrails;
  watchlist: string[];
  models_mode: "mock" | "live";
  demo_mode: boolean;
  scheduler_available: boolean;
  credentials_configured: boolean;
  limits: {
    candidates: number;
    retries: number;
    live_calls: number;
    clip_seconds?: number;
  };
};
export type Metric = {
  name: string;
  label: string;
  value: number | null;
  unit: string;
  confidence: number;
  description: string;
  evidence_frames: number[];
  unavailable_reason: string | null;
};
export type TrackedObject = {
  id: number;
  role: "target" | "defender" | "ball" | "unknown";
  box: number[];
  centroid: number[];
  mask_url: string | null;
  mask_polygon: number[][] | null;
};
export type Tracking = {
  width: number;
  height: number;
  fps: number;
  simulated: boolean;
  prompt: string;
  frames: { frame: number; time: number; objects: TrackedObject[] }[];
};
export type Clip = {
  subject_name?: string;
  id: string;
  player_id: string;
  url: string;
  is_demo: boolean;
  duration: number;
  width: number;
  height: number;
  fps: number;
  frames: { time: number; frame: number; url: string }[];
  source: string;
};
export type Verdict = {
  player_id: string;
  verdict: "ADD" | "MONITOR" | "PASS";
  confidence: number;
  rationale: string;
  strengths: string[];
  weaknesses: string[];
  metric_refs: string[];
};
export type Critique = {
  attempt: number;
  quality_score: number;
  identity_swaps: string[];
  retry_justified: boolean;
  refined_prompt: string;
  explanation: string;
  prompt: string;
};
export type Candidate = {
  player: Player;
  clip: Clip | null;
  verified: boolean;
  verification?: { reason: string; confidence: number };
  quality: number;
  metrics: Metric[];
  tracking: Tracking | null;
  overlays: string[];
  critiques: Critique[];
  verdict: Verdict;
};
export type Move = {
  add_player: Player;
  drop_player: Player;
  faab_bid: number | null;
  reasoning: string;
  status: string;
  executed: boolean;
};
export type ScanEvent = {
  id: number;
  created_at: string;
  stage: string;
  actor: string;
  message: string;
  detail: Record<string, unknown>;
};
export type Scan = {
  id: string;
  stage: string;
  progress: number;
  instruction: string;
  mode: "mock" | "live";
  created_at: string;
  error: string | null;
  attempts: number;
  live_calls: number;
  events?: ScanEvent[];
  result: {
    film_test?: boolean;
    candidates: Candidate[];
    staged_move: Move | null;
    card: {
      url: string;
      simulated: boolean;
      player_id: string;
      visual_source: string;
    } | null;
    card_error: string | null;
    guardrail_notice?: string;
    simulated: boolean;
    league_is_demo?: boolean;
    shortlist: { roster_need: string; reasoning: string };
  } | null;
};
