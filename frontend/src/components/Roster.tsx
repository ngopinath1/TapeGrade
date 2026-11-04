import { useState } from "react";
import { LockKeyhole, Search, X } from "lucide-react";
import type { Bootstrap } from "../types";
import { Sparkline } from "./Player";

export function Roster({
  data,
  onManageProtections,
}: {
  data: Bootstrap;
  onManageProtections?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [protectedOnly, setProtectedOnly] = useState(false);
  const players = data.league.roster.filter(
    (p) =>
      (!protectedOnly || data.settings.protected_players.includes(p.id)) &&
      `${p.name} ${p.team} ${p.positions.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  const live = data.league.is_demo === false;
  return (
    <section className="roster-panel">
      <div className="panel-head">
        <h2 className="roster-team-name">{data.league.team_name}</h2>
        <span className="tag">
          {live
            ? `Sleeper · period ${data.league.period ?? "—"}`
            : "Fictional sample roster"}
        </span>
      </div>
      {!live && (
        <p className="roster-overview">
          {data.league.record} · {data.league.standing} ·{" "}
          {data.league.faab_remaining === null
            ? "Budget unavailable"
            : `$${data.league.faab_remaining} remaining`}{" "}
          · {data.settings.protected_players.length} protected players
        </p>
      )}
      {live && (
        <div className="sleeper-roster-summary">
          <div>
            <span className="section-label">
              {data.league.name} · {data.league.season}
            </span>
            <h2>
              {data.league.period_points ?? "—"} <small>team points</small>
            </h2>
            <p>
              {data.league.roster.length} players · Sleeper-reported scoring
              period {data.league.period ?? "unavailable"}. These are period
              totals, not averages.
            </p>
          </div>
          <span className="tag">READ ONLY · NBA COMPATIBILITY</span>
        </div>
      )}
      <div className="roster-toolbar">
        <label className="search-field">
          <Search size={18} />
          <span className="sr-only">Search roster</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, team, or position"
          />
        </label>
        <div className="filter-group" role="group" aria-label="Roster filter">
          <button
            aria-pressed={!protectedOnly}
            onClick={() => setProtectedOnly(false)}
          >
            All players
          </button>
          <button
            aria-pressed={protectedOnly}
            onClick={() => setProtectedOnly(true)}
          >
            Protected
          </button>
        </div>
        {onManageProtections && (
          <button className="button subtle" onClick={onManageProtections}>
            Manage protections
          </button>
        )}
      </div>
      <p className="roster-count" role="status">
        {players.length} of {data.league.roster.length} players
      </p>
      <div
        className="table-scroll"
        role="region"
        aria-label="Roster table"
        tabIndex={0}
      >
        <table>
          <caption className="sr-only">
            {data.league.team_name} player statistics and protection status
          </caption>
          <thead>
            <tr>
              <th scope="col">Player</th>
              <th scope="col">Position</th>
              <th scope="col">Min / prev</th>
              <th scope="col">
                {live ? `PERIOD ${data.league.period ?? "—"} FPTS` : "FPTS"}
              </th>
              {live && <th scope="col">RECENT FPTS / GAME</th>}
              <th scope="col">{live ? "Observed trend" : "7-game trend"}</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="table-player">
                    <span>
                      <b>{p.name}</b>
                      <small>{p.team}</small>
                    </span>
                  </div>
                </td>
                <td>{p.positions.join(" / ")}</td>
                <td>
                  {p.minutes ?? "—"}{" "}
                  <span className="muted">/ {p.previous_minutes ?? "—"}</span>
                </td>
                <td className="numeric">{p.fantasy_points ?? "—"}</td>
                {live && (
                  <td className="numeric" title={p.recent?.reasons.join(" ")}>
                    {p.recent_fantasy_average ?? "—"}
                    <small className="muted">
                      {p.recent
                        ? ` · n=${p.recent.sample_size}`
                        : " · no game logs"}
                    </small>
                  </td>
                )}
                <td>
                  <Sparkline
                    values={p.trend}
                    label={
                      live ? `${p.trend.length}-game observed trend` : undefined
                    }
                    muted={p.trend.at(-1)! < p.trend[0]}
                  />
                </td>
                <td>
                  {data.settings.protected_players.includes(p.id) ? (
                    <span className="protected">
                      <LockKeyhole size={12} /> Protected
                    </span>
                  ) : (
                    <span className="muted">
                      {p.lineup_status ?? "Flexible"}
                      {p.injury_status ? ` · ${p.injury_status}` : ""}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!players.length && (
        <div className="board-empty">
          <Search size={28} />
          <h3>No players match</h3>
          <p>Try another name, team, or position.</p>
          <button
            className="button subtle"
            onClick={() => {
              setQuery("");
              setProtectedOnly(false);
            }}
          >
            <X size={15} /> Clear filters
          </button>
        </div>
      )}
      <p className="data-note">
        {data.league.notice}
        {!live && " Points = PTS + 1.2 REB + 1.5 AST + 3 STL + 3 BLK − TO."}
      </p>
      {live && (
        <>
          <p className="data-note">
            <b>Your scoring weights:</b>{" "}
            {Object.entries(data.league.scoring?.weights ?? {})
              .map(([key, value]) => `${key.toUpperCase()} × ${value}`)
              .join(" · ")}
          </p>
          {data.league.points_warning && (
            <p className="data-note">
              Points unavailable: {data.league.points_warning}
            </p>
          )}
          <p className="data-note">
            Saved{" "}
            {data.league.fetched_at
              ? new Date(data.league.fetched_at).toLocaleString()
              : "locally"}
            . Refresh through Connect Sleeper. Player names are cached for 24
            hours; league reads for up to five minutes.
          </p>
        </>
      )}
    </section>
  );
}
