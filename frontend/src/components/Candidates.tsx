import { useMemo, useState } from "react";
import { ArrowDownWideNarrow, Bookmark, Search, X } from "lucide-react";
import type { Candidate } from "../types";
import { Avatar, Sparkline } from "./Player";
import { candidateStatus, fantasyAverage } from "../lib/presentation";

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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("report");
  const visible = useMemo(() => {
    const rows = candidates.filter(
      (c) =>
        `${c.player.name} ${c.player.team} ${c.player.positions.join(" ")}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()) &&
        (filter === "all" || watchlist.includes(c.player.id)),
    );
    if (sort === "points")
      rows.sort(
        (a, b) =>
          (fantasyAverage(b.player) ?? -Infinity) -
          (fantasyAverage(a.player) ?? -Infinity),
      );
    if (sort === "name")
      rows.sort((a, b) => a.player.name.localeCompare(b.player.name));
    return rows;
  }, [candidates, query, filter, sort, watchlist]);
  return (
    <section className="candidates-panel" aria-label="Scouted candidates">
      <div className="candidate-heading">
        <h2>Scouted players</h2>
        <span className="result-count">{candidates.length}</span>
      </div>
      <label className="candidate-search">
        <Search size={15} />
        <span className="sr-only">Search scouted players</span>
        <input
          type="search"
          placeholder="Search players…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="candidate-controls">
        <div
          className="candidate-filters"
          role="group"
          aria-label="Candidate filter"
        >
          <button
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All players
          </button>
          <button
            aria-pressed={filter === "saved"}
            onClick={() => setFilter("saved")}
          >
            Saved
          </button>
        </div>
        <label className="candidate-sort">
          <ArrowDownWideNarrow size={14} />
          <span className="sr-only">Sort scouted players</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="report">Report order</option>
            <option value="points">Fantasy points</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>
      <div className="candidate-columns" aria-hidden="true">
        <span>Player</span>
        <span>
          {candidates.every((c) => c.player.is_demo !== false)
            ? "Sample FPTS"
            : "FPTS / G"}
        </span>
      </div>
      {visible.length ? (
        <div className="candidate-list">
          {visible.map((candidate) => {
            const status = candidateStatus(candidate);
            const average = fantasyAverage(candidate.player);
            return (
              <div
                className={`candidate ${selected === candidate.player.id ? "selected" : ""}`}
                key={candidate.player.id}
              >
                <button
                  className="candidate-main"
                  onClick={() => onSelect(candidate.player.id)}
                  aria-pressed={selected === candidate.player.id}
                  aria-label={`Rank ${candidates.indexOf(candidate) + 1} ${candidate.player.name} ${candidate.player.team} ${candidate.verdict.verdict}`}
                >
                  <Avatar player={candidate.player} small />
                  <span className="candidate-name">
                    <strong>{candidate.player.name}</strong>
                    <small>
                      {candidate.player.team}
                      <span className="metadata-dot">·</span>
                      {candidate.player.positions.join(" / ")}
                    </small>
                  </span>
                  <span className="candidate-points">
                    {average === null ? "—" : average.toFixed(1)}
                  </span>
                  <span className={`candidate-status status-${status.tone}`}>
                    <i />
                    {status.label}
                  </span>
                  {candidate.player.trend.length >= 3 &&
                    !candidate.player.film_only && (
                      <span className="candidate-trend">
                        <Sparkline
                          values={candidate.player.trend}
                          muted
                          label={`${candidate.player.name}: ${candidate.player.trend.length}-game sample: ${candidate.player.trend.join(", ")}`}
                        />
                      </span>
                    )}
                  {candidate.player.film_only && (
                    <span className="candidate-film-only">
                      Film test · stats unavailable
                    </span>
                  )}
                </button>
                <button
                  className={`icon-button watch ${watchlist.includes(candidate.player.id) ? "watched" : ""}`}
                  aria-label={`${watchlist.includes(candidate.player.id) ? "Remove" : "Add"} ${candidate.player.name} ${watchlist.includes(candidate.player.id) ? "from" : "to"} watchlist`}
                  aria-pressed={watchlist.includes(candidate.player.id)}
                  onClick={() => onWatch(candidate.player.id)}
                >
                  <Bookmark size={14} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="board-empty">
          <Search size={22} />
          <h3>
            {candidates.length
              ? "No players match"
              : "No candidates in this report"}
          </h3>
          <p>
            {candidates.length
              ? "Try another name, team, or position."
              : (emptyReason ??
                "Review the scan details for missing evidence.")}
          </p>
          {candidates.length > 0 && (
            <button
              className="text-link"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              <X size={13} />
              Clear filters
            </button>
          )}
        </div>
      )}
      <p className="candidate-footnote">
        {candidates.length === 1
          ? "1 player evaluated in this report."
          : `${candidates.length} players evaluated in this report.`}{" "}
        Scores reflect the available game sample.
      </p>
    </section>
  );
}
