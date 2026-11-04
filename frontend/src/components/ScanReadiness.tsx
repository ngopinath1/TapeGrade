import type { Bootstrap } from "../types";

export function ScanReadiness({ data }: { data: Bootstrap }) {
  const status = data.scan_readiness;
  if (!status || data.league.is_demo !== false) return null;
  return (
    <div className="worker-note" role="status">
      <b>{status.ready ? "Ready to scan." : "Before you scan."}</b>{" "}
      {status.blockers.join(" ")}
      {status.candidates.length > 0 && (
        <span>
          {status.candidates.length} player
          {status.candidates.length === 1 ? "" : "s"} with recent scores and
          usable film: {status.candidates.map((p) => p.name).join(", ")}.
          Footage identity and tracking quality are checked during the
          scan.{" "}
        </span>
      )}
      {status.notice && <p>{status.notice}</p>}
      {status.eligible_pair_count > 0 && (
        <p>
          {status.eligible_pair_count} add/drop pairs currently have eligibility
          evidence. Eligibility is checked again before a move is recommended.
        </p>
      )}
    </div>
  );
}
