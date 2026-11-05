import { initials } from "../lib/api";
import { useState } from "react";
import type { Player } from "../types";
export function Sparkline({
  values,
  muted = false,
  label = "Seven-game sample trend",
}: {
  values: number[];
  muted?: boolean;
  label?: string;
}) {
  if (values.length < 2) return <span className="muted">Unavailable</span>;
  const min = Math.min(...values) - 2,
    max = Math.max(...values) + 2;
  const pts = values
    .map(
      (v, i) =>
        `${(i / (values.length - 1)) * 72},${25 - ((v - min) / (max - min)) * 22}`,
    )
    .join(" ");
  return (
    <svg width="74" height="28" viewBox="0 0 74 28" aria-label={label}>
      <polyline
        points={pts}
        fill="none"
        stroke={muted ? "var(--muted)" : "var(--success)"}
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function Avatar({
  player,
  small = false,
  large = false,
}: {
  player: Player;
  small?: boolean;
  large?: boolean;
}) {
  const [failedSource, setFailedSource] = useState("");
  const nbaId = String(player.nba_id ?? "");
  const sleeperId = String(player.external_id ?? "");
  const source =
    player.is_demo === false && !player.film_only
      ? /^\d+$/.test(nbaId)
        ? `https://cdn.nba.com/headshots/nba/latest/260x190/${nbaId}.png`
        : /^\d+$/.test(sleeperId) && player.source.includes("Sleeper")
          ? `https://sleepercdn.com/content/nba/players/${sleeperId}.jpg`
          : ""
      : "";
  return (
    <span
      className={`avatar ${small ? "small" : ""} ${large ? "large" : ""}`}
      aria-hidden="true"
    >
      {source && source !== failedSource ? (
        <img
          src={source}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedSource(source)}
        />
      ) : (
        initials(player.name)
      )}
    </span>
  );
}

export function VerdictBadge({ value }: { value: string }) {
  return (
    <span className={`verdict verdict-${value.toLowerCase()}`}>{value}</span>
  );
}
