import type { Ref } from "react";
import { ArrowRight, Crosshair, Loader2, ShieldCheck } from "lucide-react";
import { Avatar } from "./Player";
import { fantasyAverage } from "../lib/presentation";
import type { Bootstrap } from "../types";
import {
  ScoutingGuide,
  type GuideDestination,
  type SetupSection,
} from "./ScoutingGuide";

export function ScoutingRequest({
  data,
  hasReport,
  busy,
  canScan,
  simulated,
  instruction,
  setInstruction,
  inputRef,
  onRun,
  onNavigate,
}: {
  data: Bootstrap;
  hasReport: boolean;
  busy: boolean;
  canScan: boolean;
  simulated: boolean;
  instruction: string;
  setInstruction: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
  onRun: () => Promise<void>;
  onNavigate: (destination: GuideDestination, section?: SetupSection) => void;
}) {
  return (
    <section
      className={`mission-panel ${hasReport ? "mission-inline" : "mission-welcome"}`}
      aria-label="New scouting report"
    >
      {!hasReport && (
        <div className="mission-emblem" aria-hidden="true">
          <Crosshair size={25} strokeWidth={1.3} />
        </div>
      )}
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
        {hasReport ? (
          <h2>A new scouting mission</h2>
        ) : simulated ? (
          <>
            <h2>Find your next opportunity.</h2>
            <p>
              Describe the player your team needs. Review the film before you
              make a move.
            </p>
          </>
        ) : (
          <ScoutingGuide
            data={data}
            hasReport={false}
            onNavigate={onNavigate}
          />
        )}
      </div>
      <form
        className="scout-input"
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy || !canScan || instruction.trim().length < 3) return;
          await onRun();
        }}
      >
        <label htmlFor="instruction">Scouting mission</label>
        <div className="mission-entry">
          <input
            id="instruction"
            ref={inputRef}
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="Find an undervalued guard…"
            required
            minLength={3}
            maxLength={1000}
            disabled={busy}
            aria-describedby="scan-expectation"
          />
          <button
            className="button primary scan-button"
            disabled={busy || !canScan || instruction.trim().length < 3}
          >
            {busy && <Loader2 size={16} className="spin" />}
            {busy
              ? "Scouting…"
              : simulated
                ? "Run sample scan"
                : data.workflow?.automatic
                  ? "Run live scan"
                  : "Run scan"}
            {!busy && <ArrowRight size={16} />}
          </button>
        </div>
      </form>
      <div
        className="mission-suggestions"
        aria-label="Suggested scouting missions"
      >
        {[
          {
            label: "Find a guard",
            instruction: "Find me an undervalued guard.",
          },
          { label: "Find a wing", instruction: "Find me an undervalued wing." },
          {
            label: "Find a big",
            instruction: "Find me an undervalued big with rebounding upside.",
          },
        ].map((mission) => (
          <button
            key={mission.label}
            disabled={busy}
            aria-pressed={instruction === mission.instruction}
            onClick={() => {
              setInstruction(mission.instruction);
              document.getElementById("instruction")?.focus();
            }}
          >
            {mission.label}
          </button>
        ))}
      </div>
      {!hasReport && (
        <details className="scouting-help">
          <summary>How scouting works</summary>
          <p>
            Your mission produces a ranked shortlist. Choose a player to inspect
            the film, tracking quality, and measured signals. ADD means consider
            adding; MONITOR means keep watching; PASS means no add is supported.
            Any proposed roster move is checked against your guardrails. You
            make the move in Sleeper.
          </p>
        </details>
      )}
      <p id="scan-expectation" className="mission-provenance">
        <ShieldCheck size={13} />
        {simulated
          ? "Demo report · fictional players and simulated models · no credits used."
          : data.models_mode === "mock"
            ? "Live analysis is unavailable for this league in the current environment."
            : `Live analysis · up to ${data.limits.live_calls} model calls per scan.`}
      </p>
      {!hasReport && data.league.roster.length > 0 && (
        <div className="welcome-roster">
          <div className="welcome-roster-heading">
            <h3>Your roster at a glance</h3>
            <button className="text-link" onClick={() => onNavigate("roster")}>
              View roster
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="welcome-roster-list">
            {data.league.roster.slice(0, 3).map((player) => (
              <div className="welcome-roster-player" key={player.id}>
                <Avatar player={player} small />
                <span>
                  <strong>{player.name}</strong>
                  <small>
                    {player.team} · {player.positions.join(" / ")}
                  </small>
                </span>
                <span className="welcome-points">
                  {fantasyAverage(player)?.toFixed(1) ?? "—"}
                  <small>
                    {player.is_demo === false ? "FPTS / game" : "Sample FPTS"}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
