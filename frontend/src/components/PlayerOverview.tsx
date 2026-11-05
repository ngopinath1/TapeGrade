import {
  Bookmark,
  Check,
  ChevronDown,
  CircleHelp,
  ShieldCheck,
} from "lucide-react";
import type { Candidate } from "../types";
import { Avatar } from "./Player";
import {
  candidateStatus,
  concise,
  fantasyAverage,
  hasConfirmedIdentity,
  hasVerdictConfidence,
} from "../lib/presentation";

export function PlayerOverview({
  candidate,
  saved,
  onWatch,
}: {
  candidate: Candidate;
  saved: boolean;
  onWatch: () => void;
}) {
  const { player, verdict } = candidate;
  const status = candidateStatus(candidate);
  const average = fantasyAverage(player);
  const identityConfirmed = hasConfirmedIdentity(candidate);
  const trackingAccepted =
    candidate.tracking_accepted ?? candidate.quality >= 0.75;
  const games =
    player.recent?.games.filter((g) => g.score !== null).slice(-7) ?? [];
  const sample =
    player.is_demo === false
      ? games.map((g) => ({
          value: g.score!,
          label: new Date(`${g.date.slice(0, 10)}T12:00:00`).toLocaleDateString(
            undefined,
            { month: "short", day: "numeric" },
          ),
        }))
      : player.trend.map((value, i) => ({ value, label: `G${i + 1}` }));
  const hasStats =
    !player.film_only &&
    (average !== null || player.minutes !== null || Boolean(player.recent));
  const positiveExtent = Math.max(0, ...sample.map((g) => g.value));
  const negativeExtent = Math.abs(Math.min(0, ...sample.map((g) => g.value)));
  const scale = Math.max(1, positiveExtent + negativeExtent);
  const baseline = (negativeExtent / scale) * 100;
  return (
    <section
      id="selected-player-overview"
      className="player-overview"
      aria-label="Player overview"
    >
      <div className="player-profile">
        <Avatar player={player} large />
        <div className="player-profile-name">
          <p className="player-context">
            {player.team}
            <span>·</span>
            {player.positions.join(" / ")}
            {player.number != null && (
              <>
                <span>·</span>#{player.number}
              </>
            )}
            {player.is_demo !== false && (
              <>
                <span>·</span>Sample player
              </>
            )}
          </p>
          <h2>{player.name}</h2>
          <span
            className={`identity-state ${identityConfirmed ? "positive" : ""}`}
          >
            {identityConfirmed ? (
              <ShieldCheck size={13} />
            ) : (
              <CircleHelp size={13} />
            )}
            {identityConfirmed
              ? "Film identity verified"
              : "Film identity unconfirmed"}
          </span>
        </div>
        <button
          className={`button save-player ${saved ? "saved" : ""}`}
          aria-label={`${saved ? "Remove" : "Add"} ${player.name} ${saved ? "from" : "to"} watchlist`}
          aria-pressed={saved}
          onClick={onWatch}
        >
          <Bookmark size={14} />
          {saved ? "Saved" : "Save player"}
        </button>
      </div>
      <div className={`verdict-summary status-${status.tone}`}>
        <div className="verdict-summary-heading">
          <span className="recommendation-symbol">
            {status.tone === "positive" ? (
              <Check size={16} />
            ) : (
              <CircleHelp size={16} />
            )}
          </span>
          <h3>{status.label}</h3>
          <span className="verdict-eyebrow">Scouting verdict</span>
        </div>
        <p>{concise(verdict.rationale)}</p>
        {(!identityConfirmed || !trackingAccepted || player.film_only) && (
          <p className="evidence-limit">
            {player.film_only
              ? "Diagnostic only. Player statistics and roster eligibility are unverified."
              : !identityConfirmed
                ? "Player identity is not confirmed on film. No film-backed action is supported."
                : "Tracking did not meet the quality threshold. Film measurements cannot support a move."}
          </p>
        )}
      </div>
      {hasStats && (
        <>
          <dl className="player-stat-strip">
            <div>
              <dt>
                {player.is_demo === false
                  ? "Recent FPTS / game"
                  : "Sample FPTS"}
              </dt>
              <dd>{average === null ? "—" : average.toFixed(1)}</dd>
              <small>
                {player.is_demo === false
                  ? "Your league scoring"
                  : "Fictional sample"}
              </small>
            </div>
            <div>
              <dt>Minutes / game</dt>
              <dd>
                {player.minutes === null ? "—" : player.minutes.toFixed(1)}
              </dd>
              <small>
                {player.previous_minutes == null || player.minutes == null
                  ? "Available sample"
                  : `${player.minutes - player.previous_minutes >= 0 ? "+" : ""}${(player.minutes - player.previous_minutes).toFixed(1)} vs. previous sample`}
              </small>
            </div>
            <div>
              <dt>Games in sample</dt>
              <dd>
                {player.recent?.sample_size ??
                  (player.is_demo !== false && player.trend.length
                    ? player.trend.length
                    : "—")}
              </dd>
              <small>
                {player.recent
                  ? `${player.recent.window_start} – ${player.recent.window_end}`
                  : "Sample game data"}
              </small>
            </div>
            <div>
              <dt>Verdict confidence</dt>
              <dd
                className={
                  hasVerdictConfidence(candidate) ? "" : "stat-unavailable"
                }
              >
                {hasVerdictConfidence(candidate)
                  ? `${Math.round(verdict.confidence * 100)}%`
                  : "Not established"}
              </dd>
              <small>
                {hasVerdictConfidence(candidate)
                  ? "Model assessment"
                  : "Evidence is insufficient"}
              </small>
            </div>
          </dl>
          {sample.length >= 2 && (
            <div
              className="production-chart"
              role="img"
              aria-label={`${player.name}, ${sample.length}-game sample fantasy points: ${sample.map((g) => `${g.label}: ${g.value}`).join(", ")}. This sample is not a projection.`}
            >
              <div className="production-heading">
                <h3>Recent production</h3>
                <span>
                  {sample.length}-game{" "}
                  {player.is_demo !== false ? "fictional " : ""}sample · FPTS
                </span>
              </div>
              <div className="production-bars">
                {sample.map((game, index) => (
                  <div
                    className={`production-game ${game.value < 0 ? "negative" : ""}`}
                    key={index}
                  >
                    <span>{game.value.toFixed(1)}</span>
                    <div className="production-track">
                      <b style={{ bottom: `${baseline}%` }} />
                      <i
                        style={{
                          height: `${(Math.abs(game.value) / scale) * 100}%`,
                          ...(game.value < 0
                            ? { top: `${100 - baseline}%` }
                            : { bottom: `${baseline}%` }),
                        }}
                      />
                    </div>
                    <small>{game.label}</small>
                  </div>
                ))}
              </div>
              <p>
                Recorded games only. A short sample does not establish a
                long-term trend.
              </p>
            </div>
          )}
        </>
      )}
      <details className="analysis-disclosure">
        <summary>
          <span>Full scouting analysis</span>
          <ChevronDown size={15} />
        </summary>
        <p>{verdict.rationale}</p>
        <div className="analysis-columns">
          <div>
            <h4>What stands out</h4>
            {verdict.strengths.length ? (
              <ul>
                {verdict.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            ) : (
              <p>No supported strengths recorded.</p>
            )}
          </div>
          <div>
            <h4>What to watch</h4>
            {verdict.weaknesses.length ? (
              <ul>
                {verdict.weaknesses.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            ) : (
              <p>No additional limitations recorded.</p>
            )}
          </div>
        </div>
        <p className="analysis-source">
          {player.source} · Stored model verdict: {verdict.verdict}
          {!hasVerdictConfidence(candidate) && " · Confidence not established"}
        </p>
      </details>
    </section>
  );
}
