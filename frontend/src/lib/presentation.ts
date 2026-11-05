import type { Candidate, Player } from "../types";

export function fantasyAverage(player: Player) {
  if (player.film_only) return null;
  return player.is_demo === false
    ? (player.recent_fantasy_average ?? null)
    : player.fantasy_points;
}

export function hasConfirmedIdentity(candidate: Candidate) {
  return candidate.identity
    ? candidate.identity.status === "corroborated"
    : candidate.player.is_demo !== false && candidate.verified;
}

export function candidateStatus(candidate: Candidate) {
  if (candidate.player.film_only)
    return { label: "Film review only", tone: "neutral" };
  if (!candidate.clip)
    return { label: "Insufficient evidence", tone: "warning" };
  if (!candidate.verified || !hasConfirmedIdentity(candidate))
    return { label: "Needs verification", tone: "warning" };
  if (
    !(candidate.tracking_accepted ?? candidate.quality >= 0.75) ||
    candidate.verdict.confidence <= 0
  )
    return { label: "Insufficient evidence", tone: "warning" };
  return candidate.verdict.verdict === "ADD"
    ? { label: "Consider adding", tone: "positive" }
    : candidate.verdict.verdict === "MONITOR"
      ? { label: "Monitor", tone: "neutral" }
      : { label: "Pass", tone: "neutral" };
}

export function hasVerdictConfidence(candidate: Candidate) {
  return (
    candidate.verified &&
    candidate.verdict.confidence > 0 &&
    hasConfirmedIdentity(candidate)
  );
}

export function concise(text: string, limit = 160) {
  if (text.length <= limit) return text;
  const sentence = text.match(/^.{35,}?[.!?](?:\s|$)/)?.[0]?.trim();
  if (sentence && sentence.length <= limit) return sentence;
  return `${text.slice(0, limit).replace(/\s+\S*$/, "")}…`;
}
