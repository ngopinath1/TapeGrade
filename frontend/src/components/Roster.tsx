import { Users, LockKeyhole } from "lucide-react";
import type { Bootstrap } from "../types";
import { Sparkline, Avatar } from "./Player";

export function Roster({ data }: { data: Bootstrap }) {
  const live = data.league.is_demo === false;
  return (
    <section className="panel roster-panel">
      <div className="panel-head">
        <div className="section-label">
          <Users size={15} /> {data.league.team_name.toUpperCase()}
        </div>
        <span className="tag">
          {live
            ? `Sleeper · period ${data.league.period ?? "—"}`
            : "Fictional sample roster"}
        </span>
      </div>
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
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>PLAYER</th>
              <th>POSITION</th>
              <th>MIN / PREV</th>
              <th>
                {live ? `PERIOD ${data.league.period ?? "—"} FPTS` : "FPTS"}
              </th>
              <th>7-GAME TREND</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {data.league.roster.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="table-player">
                    <Avatar player={p} small />
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
                <td>
                  <Sparkline
                    values={p.trend}
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
