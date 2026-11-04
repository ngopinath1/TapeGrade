import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Loader2, RefreshCw } from "lucide-react";
import type { Bootstrap, Scan } from "../types";
import { Candidates } from "../components/Candidates";
import { FilmPlayer } from "../components/FilmPlayer";
import { Recommendation } from "../components/Recommendation";
import { PerceptionLog } from "../components/PerceptionLog";
import { TapeCard } from "../components/TapeCard";
import { ScanReadiness } from "../components/ScanReadiness";
import type { Page } from "../components/WorkspaceShell";

const missions = [
  { label: "Find a guard", instruction: "Find me an undervalued guard." },
  { label: "Find a wing", instruction: "Find me an undervalued wing." },
  { label: "Find a big", instruction: "Find me an undervalued center." },
];

export function ScoutingDesk({
  data,
  scan,
  busy,
  instruction,
  onInstruction,
  selected,
  onSelect,
  onRun,
  onRetry,
  onWatch,
  onNavigate,
  onToast,
}: {
  data: Bootstrap;
  scan: Scan | null;
  busy: boolean;
  instruction: string;
  onInstruction: (value: string) => void;
  selected: string;
  onSelect: (id: string) => void;
  onRun: () => Promise<void>;
  onRetry: () => Promise<void>;
  onWatch: (id: string) => Promise<void>;
  onNavigate: (page: Page) => void;
  onToast: (message: string) => void;
}) {
  const [missionOpen, setMissionOpen] = useState(!scan?.result);
  const input = useRef<HTMLInputElement>(null);
  const detail = useRef<HTMLDivElement>(null);
  const ready = data.scan_readiness
    ? data.scan_readiness.ready
    : data.league.scouting_ready !== false;
  const candidates = scan?.result?.candidates ?? [];
  const current =
    candidates.find((c) => c.player.id === selected) ?? candidates[0];
  useEffect(() => {
    if (detail.current) detail.current.scrollTop = 0;
  }, [current?.player.id]);
  useEffect(() => {
    if (scan?.result) setMissionOpen(false);
  }, [scan?.id, Boolean(scan?.result)]);
  const provenance = scan?.result?.film_test
    ? "Film diagnostic · game date and fantasy statistics unverified"
    : data.league.is_demo === false
      ? "Sleeper NBA · sourced game logs required"
      : (scan?.mode ?? data.models_mode) === "mock"
        ? "Demo report · fictional players and simulated models"
        : "Live model report · fictional sample league statistics";
  return (
    <>
      <ScanReadiness
        data={data}
        onSetup={() =>
          onNavigate(data.league.is_demo === false ? "data" : "library")
        }
      />
      {data.league.is_demo === false && !data.scan_readiness && !ready && (
        <div className="worker-note">
          <strong>Finish league setup to scan.</strong>
          <p>{data.league.scouting_unavailable_reason}</p>
          <button className="text-link" onClick={() => onNavigate("data")}>
            Open league setup
          </button>
        </div>
      )}
      {scan?.result && (
        <div className="report-toolbar">
          <div>
            <h2>{scan.instruction}</h2>
            <p>
              {new Date(scan.created_at).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
              <span>·</span>
              {provenance}
            </p>
          </div>
          <button
            className="button"
            aria-expanded={missionOpen}
            onClick={() => {
              setMissionOpen(!missionOpen);
              if (!missionOpen)
                requestAnimationFrame(() => input.current?.focus());
            }}
          >
            {missionOpen ? "Close new scan" : "Start another scan"}
          </button>
        </div>
      )}
      {!busy && (!scan?.result || missionOpen) && (
        <section
          className={`mission-panel ${scan?.result ? "mission-inline" : "mission-welcome"}`}
          aria-labelledby="mission-title"
        >
          <div className="mission-intro">
            <p className="workspace-context">
              <button onClick={() => onNavigate("roster")}>
                {data.league.team_name}
              </button>
              <span>·</span>
              {data.league.faab_remaining === null
                ? "Waiver budget unavailable"
                : `$${data.league.faab_remaining} remaining`}
            </p>
            <h2 id="mission-title">
              {scan?.result
                ? "A new scouting mission"
                : "Find your next opportunity."}
            </h2>
            <p>
              Describe the player your team needs. Review the film before you
              make a move.
            </p>
          </div>
          <form
            className="scout-input"
            onSubmit={async (event) => {
              event.preventDefault();
              await onRun();
            }}
          >
            <label htmlFor="instruction">Scouting mission</label>
            <div className="mission-entry">
              <input
                id="instruction"
                ref={input}
                value={instruction}
                onChange={(event) => onInstruction(event.target.value)}
                placeholder="Find an undervalued guard…"
                required
                minLength={3}
                maxLength={1000}
                disabled={busy}
              />
              <button
                className="button primary scan-button"
                disabled={busy || !ready || instruction.trim().length < 3}
              >
                {busy && <Loader2 size={16} className="spin" />}
                {busy ? "Scouting…" : "Run scan"}
                {!busy && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
          <div
            className="mission-suggestions"
            aria-label="Suggested scouting missions"
          >
            {missions.map((mission) => (
              <button
                key={mission.label}
                disabled={busy}
                onClick={() => {
                  onInstruction(mission.instruction);
                  input.current?.focus();
                }}
              >
                {mission.label}
              </button>
            ))}
          </div>
          {!ready && (
            <p className="scan-blocked">
              {data.league.is_demo === false
                ? "Complete league setup to enable scanning."
                : "Add permitted footage in Film library to enable scanning."}
            </p>
          )}
          {!scan?.result && (
            <details className="scouting-help">
              <summary>How scouting works</summary>
              <p>
                Your mission produces a ranked shortlist. Choose a player to
                inspect the film, tracking quality, and measured signals. Any
                proposed roster move is checked against your guardrails and
                remains yours to make.
              </p>
            </details>
          )}
          {!scan?.result && <p className="mission-provenance">{provenance}</p>}
        </section>
      )}
      {busy && (
        <section className="scan-loading" aria-label="Scan progress">
          <div className="progress-heading">
            <Loader2 size={18} className="spin" />
            <h2>Reviewing the evidence</h2>
            <span role="status">
              {scan?.stage.replaceAll("_", " ").toLowerCase() ?? "Queuing"} ·{" "}
              {scan?.progress ?? 0}%
            </span>
          </div>
          <div
            className="scan-progress"
            role="progressbar"
            aria-label="Scouting progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={scan?.progress ?? 0}
          >
            <i style={{ width: `${Math.max(2, scan?.progress ?? 0)}%` }} />
          </div>
          <p>You can keep using the workspace while this scan runs.</p>
        </section>
      )}
      {scan?.stage === "FAILED" && (
        <div className="error-banner" role="alert">
          <span>
            {scan.error ??
              "This scan could not finish. Check the connection and retry."}
          </span>
          <button className="button" onClick={() => void onRetry()}>
            <RefreshCw size={15} /> Retry scan
          </button>
        </div>
      )}
      {scan?.result?.film_test && (
        <div className="worker-note">
          Film diagnostic · user-provided excerpt · visible jersey target only.
          Game date, fantasy eligibility and statistics are unverified. No
          roster move is recommended.
        </div>
      )}
      {scan?.result && (
        <div className="report-workspace">
          <Candidates
            candidates={candidates}
            selected={current?.player.id ?? ""}
            onSelect={onSelect}
            watchlist={data.watchlist}
            onWatch={(id) => void onWatch(id)}
          />
          <div
            ref={detail}
            className="report-detail"
            role="region"
            aria-label="Selected player report"
            tabIndex={0}
          >
            <FilmPlayer candidate={current} />
            <Recommendation scan={scan} onToast={onToast} />
            <details className="audit-disclosure">
              <summary>
                <span>Tracking & evidence details</span>
                <ChevronDown size={16} />
              </summary>
              <PerceptionLog scan={scan} selected={current} />
            </details>
            <TapeCard scan={scan} />
          </div>
        </div>
      )}
    </>
  );
}
