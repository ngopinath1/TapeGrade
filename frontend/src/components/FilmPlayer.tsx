import { useEffect, useRef, useState } from "react";
import {
  Crosshair,
  Eye,
  EyeOff,
  Film,
  Maximize2,
  Pause,
  Play,
} from "lucide-react";
import type { Candidate } from "../types";
import { PlayerIdentity } from "./PlayerIdentity";
import { IdentifiedPlayers } from "./IdentifiedPlayers";
import { ClipAttempts } from "./ClipAttempts";

const colors = {
  target: "#bcf87a",
  defender: "#83b7f4",
  ball: "#ffba72",
  unknown: "#c7c7c7",
};
export function FilmPlayer({ candidate }: { candidate?: Candidate }) {
  const video = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [overlay, setOverlay] = useState(true);
  const trackingAccepted =
    candidate?.tracking_accepted ?? (candidate?.quality ?? 0) >= 0.75;
  useEffect(() => {
    setTime(0);
    setPlaying(false);
    setOverlay(trackingAccepted);
  }, [candidate?.clip?.id, trackingAccepted]);
  useEffect(() => {
    if (!playing) return;
    let request: number;
    const tick = () => {
      if (video.current) setTime(video.current.currentTime);
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [playing]);
  const tracking = candidate?.tracking;
  const frames = tracking?.frames ?? [];
  const nearest = frames.length
    ? frames.reduce((a, b) =>
        Math.abs(a.time - time) < Math.abs(b.time - time) ? a : b,
      )
    : undefined;
  const observed =
    nearest &&
    Math.abs(nearest.time - time) <=
      (tracking?.simulated ? 0.26 : 0.51 / (tracking?.fps ?? 12))
      ? nearest
      : undefined;
  const clip = candidate?.clip;
  const seek = (value: number) => {
    if (video.current) {
      video.current.currentTime = value;
      setTime(value);
    }
  };
  return (
    <section className="panel film-panel">
      <div className="panel-head">
        <div className="section-label">
          <Film size={15} /> FILM ROOM
        </div>
        <span className="micro">
          {tracking?.simulated
            ? "SCHEMATIC SIMULATION"
            : clip
              ? clip.public_source
                ? "PUBLIC ESPN HIGHLIGHT"
                : "UPLOADED FOOTAGE"
              : "AWAITING ANALYSIS"}
        </span>
      </div>
      <div className="film-title">
        <div>
          <h2>{candidate?.player.name ?? "The opportunity is on tape."}</h2>
          <p>
            {candidate
              ? `${candidate.player.team}${candidate.player.number === null ? "" : ` · #${candidate.player.number}`} · ${candidate.player.positions.join(" / ")}`
              : "Run a scan to open the film report."}
          </p>
        </div>
        <span className="tag">
          <Crosshair size={12} />{" "}
          {candidate?.identity
            ? candidate.identity.status === "corroborated"
              ? "Identity corroborated"
              : candidate.identity.status === "tracking_rejected"
                ? "Tracking identity uncertain"
                : "Identity unconfirmed"
            : candidate?.verified
              ? "Clip verified"
              : candidate
                ? "Clip unverified"
                : "Local film analysis"}
        </span>
      </div>
      {clip && !clip.is_demo && (
        <p className="film-provenance">
          {clip.source_ref?.startsWith("https://") ? (
            <a href={clip.source_ref} target="_blank" rel="noreferrer">
              {clip.source_title ?? clip.source}
            </a>
          ) : (
            clip.source
          )}
          {" · "}
          {clip.game_date
            ? `Game date: ${clip.game_date}`
            : "Game date not supplied"}
          {" · "}
          {clip.duration.toFixed(1)}s excerpt
          {clip.source_span
            ? ` · source ${clip.source_span.start.toFixed(1)}–${clip.source_span.end.toFixed(1)}s`
            : ""}
        </p>
      )}
      <ClipAttempts candidate={candidate} />
      <PlayerIdentity candidate={candidate} />
      {tracking && !trackingAccepted && (
        <p className="verification-note" role="status">
          Tracking needs review ({Math.round((candidate?.quality ?? 0) * 100)}%
          quality). Film measurements were withheld. Overlays are hidden; use
          the eye button to inspect the unreliable tracks.
        </p>
      )}
      <div className="video-wrap">
        {clip ? (
          <>
            <video
              key={clip.id}
              ref={video}
              src={clip.url}
              playsInline
              preload="auto"
              muted
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              aria-label={`Analyzed clip for ${candidate?.player.name}`}
            />
            {tracking && overlay && observed && (
              <svg
                className="tracking-overlay"
                viewBox={`0 0 ${tracking.width} ${tracking.height}`}
                preserveAspectRatio="xMidYMid meet"
                aria-label="Segmentation and bounding box overlay"
              >
                {observed.objects.map((o) => (
                  <g key={o.id}>
                    {o.mask_url && (
                      <image
                        href={o.mask_url}
                        x={o.box[0]}
                        y={o.box[1]}
                        width={o.box[2] - o.box[0] + 1}
                        height={o.box[3] - o.box[1] + 1}
                        opacity=".38"
                        preserveAspectRatio="none"
                      />
                    )}
                    {o.mask_polygon && (
                      <polygon
                        points={o.mask_polygon
                          .map((p) => p.join(","))
                          .join(" ")}
                        fill={colors[o.role]}
                        fillOpacity=".24"
                      />
                    )}
                    <rect
                      x={o.box[0]}
                      y={o.box[1]}
                      width={Math.max(0, o.box[2] - o.box[0])}
                      height={Math.max(0, o.box[3] - o.box[1])}
                      fill="none"
                      stroke={colors[o.role]}
                      strokeWidth="2"
                    />
                    <text
                      x={o.box[0]}
                      y={Math.max(15, o.box[1] - 8)}
                      fill={colors[o.role]}
                      fontSize="13"
                      fontFamily="monospace"
                    >
                      {trackingAccepted &&
                      candidate?.identity?.status === "corroborated"
                        ? (candidate.identity.tracked_players.find(
                            (p) => p.object_id === o.id,
                          )?.name ?? `${o.role.toUpperCase()} ${o.id}`)
                        : `${o.role.toUpperCase()} ${o.id}`}
                    </text>
                    <circle
                      cx={o.centroid[0]}
                      cy={o.centroid[1]}
                      r="3"
                      fill={colors[o.role]}
                    />
                  </g>
                ))}
              </svg>
            )}
            <div className="film-bug">
              <span className="live-dot" />
              {tracking
                ? tracking.simulated
                  ? "SIMULATED TRACKS"
                  : trackingAccepted
                    ? "SAM 3.1 TRACKS"
                    : overlay
                      ? "UNRELIABLE TRACKS · FOR INSPECTION"
                      : "TRACKING WITHHELD"
                : "NO ACCEPTED TRACKS"}
            </div>
          </>
        ) : (
          <div className="film-empty">
            <div className="court-lines">
              <div />
              <span />
            </div>
            <Crosshair size={36} />
            <p>Better decisions start with a closer look.</p>
            <span>No clip analyzed yet</span>
          </div>
        )}
      </div>
      <div className="film-controls">
        <button
          className="icon-button"
          aria-label={playing ? "Pause clip" : "Play clip"}
          disabled={!clip}
          onClick={() => {
            if (playing) video.current?.pause();
            else video.current?.play().catch(() => {});
          }}
        >
          {playing ? <Pause size={17} /> : <Play size={17} />}
        </button>
        <span className="timecode">
          {time.toFixed(1)} / {clip?.duration.toFixed(1) ?? "0.0"}s
        </span>
        <input
          aria-label="Clip timeline"
          type="range"
          min="0"
          max={clip?.duration ?? 1}
          step="0.05"
          value={time}
          onChange={(e) => seek(Number(e.target.value))}
          disabled={!clip}
        />
        <button
          className="icon-button"
          aria-label="Toggle segmentation overlays"
          aria-pressed={overlay}
          onClick={() => setOverlay((v) => !v)}
        >
          {overlay ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button
          className="icon-button"
          aria-label="Full screen clip"
          disabled={!clip}
          onClick={() => video.current?.requestFullscreen()}
        >
          <Maximize2 size={15} />
        </button>
      </div>
      <div className="film-legend">
        <span>
          <i style={{ background: colors.target }} />
          Target player
        </span>
        <span>
          <i style={{ background: colors.defender }} />
          Defenders
        </span>
        <span>
          <i style={{ background: colors.ball }} />
          Basketball
        </span>
        <span className="muted">
          {frames.length
            ? `${frames.length} observed frames`
            : "Screen-space tracking"}
        </span>
      </div>
      {candidate && !candidate.verified && !candidate.identity && (
        <p className="verification-note">
          {candidate.verification
            ? `Clip rejected: ${candidate.verification.reason}`
            : "No permitted clip available. Upload clearly identified footage in the Film library."}
        </p>
      )}
      <div className="film-metrics">
        {candidate ? (
          candidate.metrics.map((m) => (
            <div key={m.name} title={m.description}>
              <span>{m.label}</span>
              <strong>
                {m.value === null ? (
                  <span className="unavailable">Unavailable</span>
                ) : (
                  <>
                    {m.value}
                    <small>{m.unit}</small>
                  </>
                )}
              </strong>
              <p>
                {m.value === null
                  ? m.unavailable_reason
                  : `${Math.round(m.confidence * 100)}% quality · ${m.evidence_frames.length} observations`}
              </p>
            </div>
          ))
        ) : (
          <div className="metric-empty">
            Tracking-derived proxies will appear here. No estimated numbers
            before analysis.
          </div>
        )}
      </div>
      <IdentifiedPlayers profiles={candidate?.identified_players} />
      {candidate && (
        <details className="method-note">
          <summary>How these film proxies are measured</summary>
          {candidate.metrics.map((m) => (
            <p key={m.name}>
              <b>{m.label}:</b> {m.description}{" "}
              {m.evidence_frames.length > 0 &&
                `Source frames: ${m.evidence_frames.join(", ")}.`}
            </p>
          ))}
        </details>
      )}
    </section>
  );
}
