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
          <SlidersHorizontal size={15} /> AUTOPILOT GUARDRAILS
        </div>
        <ShieldCheck size={16} />
      </div>
      <h2>Keep the scout inside your lines.</h2>
      <p className="muted">
        These rules are persisted and enforced by the backend.
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
            Minimum verdict confidence{" "}
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
            <small>ADD recommendations must meet this threshold.</small>
          </label>
          <label>
            Maximum FAAB bid ($)
            <input
              type="number"
              min="0"
              max="1000"
              value={value.max_faab_bid}
              onChange={(e) =>
                setValue({ ...value, max_faab_bid: Number(e.target.value) })
              }
            />
            <small>Also capped by the league’s remaining budget.</small>
          </label>
        </div>
        <label className="field-label">PROTECTED PLAYERS</label>
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
              onChange={(e) =>
                setValue({ ...value, schedule_enabled: e.target.checked })
              }
            />
            <span>Nightly scan · 1:30 AM America/New_York</span>
          </label>
          <p>
            {data.scheduler_available
              ? "Scheduler environment enabled. Keep the worker running."
              : "Scheduler disabled by environment. Set SCHEDULER_ENABLED=1 and restart the worker to activate saved schedules."}
          </p>
          <label>
            Optional pre-waiver hour (Eastern)
            <select
              value={value.pre_waiver_hour ?? ""}
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
        <div className="mode-settings">
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
        </div>
        <button type="submit" disabled={saving} className="button primary">
          {saving ? (
            <Loader2 className="spin" size={16} />
          ) : (
            <Check size={16} />
          )}
          Save guardrails
        </button>
      </form>
    </section>
  );
}
