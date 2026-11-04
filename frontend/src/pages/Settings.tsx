import { useState } from "react";
import {
  SlidersHorizontal,
  ShieldCheck,
  LockKeyhole,
  Check,
  Loader2,
} from "lucide-react";
import type { Bootstrap, Guardrails } from "../types";
import { percent } from "../lib/api";

export function Settings({
  data,
  onSave,
}: {
  data: Bootstrap;
  onSave: (settings: Guardrails) => Promise<void>;
}) {
  const [value, setValue] = useState(data.settings);
  const [saving, setSaving] = useState(false);
  return (
    <section className="panel settings-panel">
      <div className="panel-head">
        <div className="section-label">
          <SlidersHorizontal size={15} /> SCOUTING PREFERENCES
        </div>
        <ShieldCheck size={16} />
      </div>
      <h2>Decide what the scout can recommend.</h2>
      <p className="muted">
        Protected players will never be suggested as drops. Bid limits and
        confidence requirements apply to every recommendation.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            await onSave(value);
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="settings-grid">
          <label>
            Minimum recommendation confidence{" "}
            <strong>{percent(value.min_confidence)}</strong>
            <input
              type="range"
              min="0"
              max="1"
              step=".01"
              value={value.min_confidence}
              onChange={(e) =>
                setValue({ ...value, min_confidence: Number(e.target.value) })
              }
            />
            <small>
              ADD recommendations must meet this threshold. This is analysis
              confidence, not a probability of future success.
            </small>
          </label>
          <label>
            Maximum waiver bid ($)
            <input
              type="number"
              min="0"
              max="1000"
              value={value.max_faab_bid}
              onChange={(e) =>
                setValue({ ...value, max_faab_bid: Number(e.target.value) })
              }
            />
            <small>
              For leagues using FAAB (a waiver bidding budget). Also capped by
              the remaining league budget.
            </small>
          </label>
        </div>
        <label className="field-label">PROTECTED PLAYERS (OPTIONAL)</label>
        <p className="data-note">
          {data.league.is_demo === false
            ? "TapeGrade compares current, verified game statistics for players you leave unprotected. Select anyone you never want recommended as a drop. These choices are saved in TapeGrade; the Sleeper connection does not currently supply a verified do-not-drop list."
            : "Unprotected fictional players are evaluated from sample statistics. Select anyone you never want recommended as a drop in this demonstration."}
        </p>
        <div className="protected-grid">
          {data.league.roster.map((p) => (
            <label key={p.id} className="check-label">
              <input
                type="checkbox"
                checked={value.protected_players.includes(p.id)}
                onChange={(e) =>
                  setValue({
                    ...value,
                    protected_players: e.target.checked
                      ? [...value.protected_players, p.id]
                      : value.protected_players.filter((id) => id !== p.id),
                  })
                }
              />
              <span>{p.name}</span>
              <LockKeyhole size={13} />
            </label>
          ))}
        </div>
        <div className="schedule-settings">
          <label className="check-label">
            <input
              type="checkbox"
              checked={value.schedule_enabled}
              disabled={!data.scheduler_available}
              onChange={(e) =>
                setValue({ ...value, schedule_enabled: e.target.checked })
              }
            />
            <span>Nightly scan · 1:30 AM Eastern</span>
          </label>
          <p>
            {data.scheduler_available
              ? "Available while this Mac is awake and TapeGrade’s worker is running. Recommendations still need your review."
              : "Scheduled scans are unavailable in this environment. Run a manual scan from the scouting desk."}
          </p>
          <label>
            Optional pre-waiver hour (Eastern)
            <select
              value={value.pre_waiver_hour ?? ""}
              disabled={!data.scheduler_available}
              onChange={(e) =>
                setValue({
                  ...value,
                  pre_waiver_hour:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
            >
              <option value="">Off</option>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>
        </div>
        <details className="mode-settings">
          <summary>Advanced environment details</summary>
          <h3>Models & data</h3>
          <p>
            Models: <b>{data.models_mode.toUpperCase()}</b> · League:{" "}
            <b>
              {data.league.is_demo === false
                ? "LIVE SLEEPER NBA"
                : "FICTIONAL NBA SAMPLE"}
            </b>
          </p>
          <p>
            Change MOCK_MODELS in the backend environment and restart API +
            worker. Credentials stay on the backend. NBA leagues can be imported
            by ID where compatible; automatic NBA discovery is not documented.
          </p>
          <p>
            {data.limits.candidates} candidates · up to {data.limits.retries}{" "}
            SAM retries · {data.limits.live_calls} live calls per scan
          </p>
        </details>
        <button type="submit" disabled={saving} className="button primary">
          {saving ? (
            <Loader2 className="spin" size={16} />
          ) : (
            <Check size={16} />
          )}
          Save scouting preferences
        </button>
      </form>
    </section>
  );
}
