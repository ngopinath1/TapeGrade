import { Fingerprint, Activity, Target, Sparkles } from "lucide-react";
import type { Candidate, Scan } from "../types";
import { percent } from "../lib/api";

export function PerceptionLog({
  scan,
  selected,
}: {
  scan: Scan | null;
  selected?: Candidate;
}) {
  const events = (scan?.events ?? []).filter((e) =>
    ["TRACKING", "CRITIQUING"].includes(e.stage),
  );
  return (
    <section className="panel perception-panel">
      <div className="panel-head">
        <div className="section-label">
          <Fingerprint size={15} /> PERCEPTION LOOP
        </div>
        <span className="tag">
          <span className="live-dot" />{" "}
          {scan?.mode === "live" ? "Actual operations" : "Simulated example"}
        </span>
      </div>
      <div className="log-intro">
        <h2>An agent that checks its own eyes.</h2>
        <p>SAM tracks. Muse Spark critiques. The prompt gets smarter.</p>
      </div>
      {events.length ? (
        <div className="log-list">
          {events.map((e, i) => (
            <div className="log-row" key={e.id}>
              <span
                className={`log-node ${e.message.includes("insufficient") ? "warning" : ""}`}
              >
                {e.actor === "SAM 3.1" ? (
                  <Target size={12} />
                ) : (
                  <Sparkles size={12} />
                )}
              </span>
              <div>
                <span className="log-actor">
                  {e.actor}{" "}
                  <small>
                    {e.stage === "TRACKING" ? "PERCEPTION" : "REASONING"}
                  </small>
                </span>
                <p>{e.message}</p>
                {typeof e.detail.prompt === "string" && (
                  <code>“{e.detail.prompt}”</code>
                )}
              </div>
              <span className="log-index">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="log-idle">
          <Activity size={24} />
          <p>
            The full tracking and critique audit trail will appear during your
            scan.
          </p>
        </div>
      )}
      {selected && (
        <div className="quality-row">
          <span>Selected player · final perception quality</span>
          <b>{percent(selected.quality)}</b>
          <div>
            <i style={{ width: percent(selected.quality) }} />
          </div>
        </div>
      )}
    </section>
  );
}
