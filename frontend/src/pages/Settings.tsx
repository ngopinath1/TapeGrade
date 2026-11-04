import { useState } from "react";
import { Loader2 } from "lucide-react";
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
  const changed = JSON.stringify(value) !== JSON.stringify(data.settings);
  return (
    <section className="guardrails-panel settings-panel">
      <div className="settings-toolbar">
        <p className="page-description">
          Choose the limits your recommendations must respect.
        </p>
        <div>
          <span className="save-state" role="status">
            {changed ? "Unsaved changes" : "All changes saved"}
          </span>
          <button
            type="submit"
            form="guardrails-form"
            disabled={saving || !changed}
            className="button primary"
          >
            {saving && <Loader2 className="spin" size={15} />}
            {saving ? "Saving…" : "Save guardrails"}
          </button>
        </div>
      </div>
      <form
        id="guardrails-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          try {
            await onSave(value);
          } finally {
            setSaving(false);
          }
        }}
      >
        <fieldset className="settings-section">
          <legend>Recommendation limits</legend>
          <div className="settings-group">
            <label className="setting-row">
              <span>
                Minimum verdict confidence
                <small>Required for an ADD recommendation.</small>
              </span>
              <span className="range-control">
                <input
                  type="range"
                  aria-label="Minimum verdict confidence"
                  min="0"
                  max="1"
                  step=".01"
                  value={value.min_confidence}
                  aria-valuetext={percent(value.min_confidence)}
                  onChange={(event) =>
                    setValue({
                      ...value,
                      min_confidence: Number(event.target.value),
                    })
                  }
                />
                <output>{percent(value.min_confidence)}</output>
              </span>
            </label>
            <label className="setting-row">
              <span>
                Maximum FAAB bid ($)
                <small>Also capped by your remaining league budget.</small>
              </span>
              <input
                type="number"
                min="0"
                max="1000"
                required
                value={value.max_faab_bid}
                onChange={(event) =>
                  setValue({
                    ...value,
                    max_faab_bid: Number(event.target.value),
                  })
                }
              />
            </label>
          </div>
        </fieldset>
        <fieldset className="settings-section">
          <legend>
            Protected players{" "}
            <span className="section-count">
              {value.protected_players.length} selected
            </span>
          </legend>
          <p className="settings-description">
            Selected players will never be recommended as a drop. Others can be
            evaluated using{" "}
            {data.league.is_demo === false
              ? "current, verified game statistics"
              : "the fictional sample statistics"}
            .
          </p>
          <div className="settings-group protected-list">
            {data.league.roster.map((player) => (
              <label key={player.id} className="setting-row check-label">
                <span>
                  {player.name}
                  <small>
                    {player.team} · {player.positions.join(" / ")}
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={value.protected_players.includes(player.id)}
                  onChange={(event) =>
                    setValue({
                      ...value,
                      protected_players: event.target.checked
                        ? [...value.protected_players, player.id]
                        : value.protected_players.filter(
                            (id) => id !== player.id,
                          ),
                    })
                  }
                />
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="settings-section">
          <legend>Scheduled scouting</legend>
          <div className="settings-group">
            <label className="setting-row check-label">
              <span>
                Nightly scan<small>1:30 AM · Eastern time</small>
              </span>
              <input
                type="checkbox"
                checked={value.schedule_enabled}
                onChange={(event) =>
                  setValue({ ...value, schedule_enabled: event.target.checked })
                }
              />
            </label>
            <label className="setting-row">
              <span>
                Additional pre-waiver scan<small>Eastern time</small>
              </span>
              <select
                aria-label="Additional pre-waiver scan (Eastern)"
                value={value.pre_waiver_hour ?? ""}
                onChange={(event) =>
                  setValue({
                    ...value,
                    pre_waiver_hour:
                      event.target.value === ""
                        ? null
                        : Number(event.target.value),
                  })
                }
              >
                <option value="">Off</option>
                {Array.from({ length: 24 }, (_, index) => (
                  <option key={index} value={index}>
                    {String(index).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="settings-description">
            {data.scheduler_available
              ? "Keep the worker running for scheduled scans."
              : "Scheduling is unavailable in this environment. Your preferences will be saved for when it is enabled."}
          </p>
        </fieldset>
        <details className="mode-settings">
          <summary>Model environment & scan limits</summary>
          <p>
            Models:{" "}
            <b>
              {data.models_mode === "mock"
                ? "Simulated demo"
                : "Live Meta models"}
            </b>{" "}
            · League:{" "}
            <b>
              {data.league.is_demo === false
                ? "Sleeper NBA"
                : "Fictional NBA sample"}
            </b>
          </p>
          <p>
            {data.limits.candidates} candidates · up to {data.limits.retries}{" "}
            SAM retries · {data.limits.live_calls} live calls per scan
          </p>
          <p>
            Credentials stay on the backend. Change MOCK_MODELS and restart the
            API and worker to switch environments. Enable SCHEDULER_ENABLED to
            activate scheduling.
          </p>
        </details>
      </form>
    </section>
  );
}
