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
}: {
  candidates: Candidate[];
  selected: string;
  onSelect: (id: string) => void;
  watchlist: string[];
  onWatch: (id: string) => void;
}) {
  return (
    <section className="panel candidates-panel">
      <div className="panel-head">
        <div className="section-label">
          <Radar size={15} /> OPPORTUNITY BOARD
        </div>
        <span className="count-pill">{candidates.length} scouted</span>
      </div>
      <div className="board-heading">
        <h2>Read between the stats.</h2>
        <p>Ranked by role, opportunity and film evidence.</p>
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
                  <b>{c.player.fantasy_points}</b> FPTS <i>·</i>{" "}
                  <b className="positive">
                    {c.player.minutes - c.player.previous_minutes >= 0
                      ? "+"
                      : ""}
                    {c.player.minutes - c.player.previous_minutes}
                  </b>{" "}
                  MIN
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
          <h3>Find your next advantage.</h3>
          <p>
            Tell the scout what your roster needs. Your ranked candidates will
            land here.
          </p>
          <span>
            01 &nbsp; Scout &nbsp; → &nbsp; 02 &nbsp; Watch &nbsp; → &nbsp; 03
            &nbsp; Decide
          </span>
        </div>
      )}
      <div className="board-foot">
        <ShieldCheck size={13} />
        <span>Film supports the verdict. You make the move.</span>
      </div>
    </section>
  );
}
