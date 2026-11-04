import { ArrowRight, Loader2, Radar, Sparkles } from "lucide-react";
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
  onRun: () => Promise<void>;
  onNavigate: (destination: GuideDestination, section?: SetupSection) => void;
}) {
  return (
    <details
      className={`new-report ${!hasReport || busy ? "first-report" : ""}`}
      open={!hasReport || busy}
      key={hasReport ? "report-ready" : "request"}
    >
      <summary>Start another report</summary>
      {!busy && (
        <ScoutingGuide
          data={data}
          hasReport={hasReport}
          onNavigate={onNavigate}
        />
      )}
      <div className="mission-heading">
        <h2>
          {data.workflow?.automatic
            ? "Run a scouting report"
            : "What does your team need?"}
        </h2>
        <p>
          {canScan
            ? simulated
              ? "Try a sample report. Everything you need is already loaded."
              : data.workflow?.automatic
                ? "Use the request below, or choose a position to focus the search. Data refresh and footage lookup happen automatically."
                : "Choose a need or describe your own. Only players with the required data and film can be analyzed."
            : "Complete the next step above to unlock scouting."}
        </p>
      </div>
      <div className="mission-options" aria-label="Suggested scouting requests">
        {[
          {
            label: "Find a guard",
            value: "Find me an undervalued guard.",
          },
          {
            label: "Find a wing",
            value: "Find me an undervalued wing.",
          },
          {
            label: "Find a big",
            value: "Find me an undervalued big with rebounding upside.",
          },
        ].map((option) => (
          <button
            key={option.label}
            disabled={busy}
            aria-pressed={instruction === option.value}
            onClick={() => setInstruction(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <form
        className="scout-input"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy || !canScan) return;
          await onRun();
        }}
      >
        <div className="prompt-icon">
          <Sparkles size={20} />
        </div>
        <div className="prompt-field">
          <label htmlFor="instruction">SCOUTING REQUEST</label>
          <input
            id="instruction"
            value={instruction}
            disabled={busy}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Find me an undervalued guard."
            required
            minLength={3}
            maxLength={1000}
            aria-describedby="scan-expectation"
          />
        </div>
        <button
          className="button primary scan-button"
          disabled={busy || !canScan || instruction.trim().length < 3}
        >
          {busy ? <Loader2 size={17} className="spin" /> : <Radar size={17} />}
          {busy
            ? "Scouting…"
            : simulated
              ? "Run sample scan"
              : data.workflow?.automatic
                ? "Run live scan"
                : "Run scan"}
          <ArrowRight size={16} />
        </button>
      </form>
      <p id="scan-expectation" className="scan-expectation">
        {simulated
          ? "Simulated report · fictional players · no credits used."
          : data.models_mode === "mock"
            ? "Live analysis is unavailable for this league in the current environment."
            : `Live analysis · up to ${data.limits.live_calls} model calls per scan.`}{" "}
        Recommendations are reviewed here; you make any move in Sleeper.
      </p>
    </details>
  );
}
