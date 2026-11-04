import { Radar, ArrowUpRight, ShieldCheck, Bookmark } from "lucide-react";
import type { Candidate } from "../types";
import { percent } from "../lib/api";
import { Avatar, VerdictBadge } from "./Player";

export function Candidates({
  candidates,
  selected,
  onSelect,
  watchlist,
  onWatch,
  emptyReason,
}: {
  candidates: Candidate[];
  selected: string;
  onSelect: (id: string) => void;
  watchlist: string[];
  onWatch: (id: string) => void;
  emptyReason?: string;
}) {
  return (
    <section className="panel candidates-panel">
      <div className="panel-head">
        <div className="section-label">
          <Radar size={15} /> PLAYER VERDICTS
        </div>
        <span className="count-pill">{candidates.length} scouted</span>
      </div>
      <div className="board-heading">
        <h2>Players in this report</h2>
        <p>
          Select a player to see their film below. ADD: consider adding ·
          MONITOR: keep watching · PASS: no add supported.
        </p>
      </div>
      {candidates.length ? (
        <div className="candidate-list">
          {candidates.map((c, i) => (
            <div
              className={`candidate ${selected === c.player.id ? "selected" : ""}`}
              key={c.player.id}
            >
              <button
                className="candidate-main"
                onClick={() => onSelect(c.player.id)}
                aria-pressed={selected === c.player.id}
              >
                <span className="rank">{String(i + 1).padStart(2, "0")}</span>
                <Avatar player={c.player} />
                <span className="candidate-name">
                  <strong>{c.player.name}</strong>
                  <small>
                    {c.player.team} <span>·</span>{" "}
                    {c.player.positions.join(" / ")}
                  </small>
                </span>
                <VerdictBadge value={c.verdict.verdict} />
              </button>
              <p className="candidate-rationale">{c.verdict.rationale}</p>
              <div className="candidate-bottom">
                <span>
                  {c.player.film_only ? (
                    "Film test · stats unavailable"
                  ) : c.player.is_demo === false ? (
                    <>
                      <b>{c.player.recent_fantasy_average ?? "—"}</b> FPTS/game{" "}
                      <i>·</i> n={c.player.recent?.sample_size ?? 0}
                      <i>·</i>{" "}
                      {c.player.minutes !== null &&
                      c.player.previous_minutes !== null
                        ? `${c.player.minutes - c.player.previous_minutes >= 0 ? "+" : ""}${(c.player.minutes - c.player.previous_minutes).toFixed(1)} MIN`
                        : "Minute trend unavailable"}
                    </>
                  ) : (
                    <>
                      <b>{c.player.fantasy_points}</b> FPTS <i>·</i>{" "}
                      <b className="positive">
                        {(c.player.minutes ?? 0) -
                          (c.player.previous_minutes ?? 0) >=
                        0
                          ? "+"
                          : ""}
                        {(c.player.minutes ?? 0) -
                          (c.player.previous_minutes ?? 0)}
                      </b>{" "}
                      MIN
                    </>
                  )}
                </span>
                <span className="confidence">
                  <i
                    style={
                      {
                        "--confidence": `${c.verdict.confidence * 100}%`,
                      } as React.CSSProperties
                    }
                  />
                  {percent(c.verdict.confidence)}
                </span>
                <button
                  className={`icon-button watch ${watchlist.includes(c.player.id) ? "watched" : ""}`}
                  aria-label={`${watchlist.includes(c.player.id) ? "Remove" : "Add"} ${c.player.name} ${watchlist.includes(c.player.id) ? "from" : "to"} watchlist`}
                  onClick={() => onWatch(c.player.id)}
                >
                  <Bookmark size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="board-empty">
          <Radar size={32} />
          <h3>No players matched this request.</h3>
          <p>
            {emptyReason ??
              "Try a broader request or another position. The scout will explain any missing statistics or film."}
          </p>
        </div>
      )}
      <div className="board-foot">
        <ShieldCheck size={13} />
        <span>Review the evidence. You make the move.</span>
      </div>
    </section>
  );
}
