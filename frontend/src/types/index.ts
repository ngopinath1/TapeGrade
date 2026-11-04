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
  stats: Record<string, number>;
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
  faab_remaining: number;
  roster: Player[];
  available: Player[];
  notice: string;
};
export type Bootstrap = {
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
  faab_bid: number;
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
    shortlist: { roster_need: string; reasoning: string };
  } | null;
};
