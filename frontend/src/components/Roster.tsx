import { Users, LockKeyhole } from "lucide-react";
import type { Bootstrap } from "../types";
import { Sparkline, Avatar } from "./Player";

export function Roster({ data }: { data: Bootstrap }) {
  return (
    <section className="panel roster-panel">
      <div className="panel-head">
        <div className="section-label">
          <Users size={15} /> {data.league.team_name.toUpperCase()}
        </div>
        <span className="tag">Fictional sample roster</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>PLAYER</th>
              <th>POSITION</th>
              <th>MIN / PREV</th>
              <th>FPTS</th>
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
                  {p.minutes}{" "}
                  <span className="muted">/ {p.previous_minutes}</span>
                </td>
                <td className="numeric">{p.fantasy_points}</td>
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
                    <span className="muted">Flexible</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="data-note">
        {data.league.notice} Points = PTS + 1.2 REB + 1.5 AST + 3 STL + 3 BLK −
        TO.
      </p>
    </section>
  );
}
