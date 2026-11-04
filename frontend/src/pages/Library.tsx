import { useState, useEffect } from "react";
import { ArrowRight, Film, Upload, Loader2 } from "lucide-react";
import type { Bootstrap, Clip } from "../types";
import { api } from "../lib/api";

export function Library({
  data,
  onError,
  onToast,
  onRefresh,
  onDone,
}: {
  data: Bootstrap;
  onError: (error: string) => void;
  onToast: (s: string) => void;
  onRefresh: () => Promise<void>;
  onDone: () => void;
}) {
  const [clips, setClips] = useState<Clip[]>([]),
    [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [saved, setSaved] = useState(false);
  const automatic = data.workflow?.public_footage_analysis_enabled === true;
  const available = data.league.available.filter(
    (p) => data.league.is_demo !== false || p.recent?.ready,
  );
  const matches = available.filter(
    (p) =>
      p.id === playerId || p.name.toLowerCase().includes(query.toLowerCase()),
  );
  const refresh = () =>
    api<Clip[]>("/clips")
      .then(setClips)
      .catch((e) => onError(e.message));
  useEffect(() => {
    void refresh();
  }, []);
  const savedClips = (
    <>
      <h2 className="saved-clips-heading">
        Saved clips <span className="count-pill">{clips.length}</span>
      </h2>
      {!clips.length && (
        <p className="data-note">
          No clips saved yet. Your uploaded clips will appear here after
          processing.
        </p>
      )}
      <div className="clip-grid">
        {clips.map((c) => (
          <div key={c.id}>
            <video src={c.url} controls preload="metadata" />
            <p>
              {c.subject_name ??
                data.league.available.find((p) => p.id === c.player_id)?.name ??
                c.player_id}{" "}
              <span>{c.duration.toFixed(1)}s</span>
            </p>
            <small>
              {c.source}
              {c.game_date ? ` · Game date: ${c.game_date}` : ""}
            </small>
            {c.source_ref?.startsWith("https://") && (
              <a
                className="text-link"
                href={c.source_ref}
                target="_blank"
                rel="noreferrer"
              >
                {c.source_title ?? "View original source"}
                <ArrowRight size={13} />
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  );
  return (
    <section className="panel library-panel">
      <div className="panel-head">
        <div className="section-label">
          <Film size={15} /> FILM LIBRARY
        </div>
        <span className="tag">
          {automatic ? "Automatic highlight collection" : "Local footage"}
        </span>
      </div>
      <h2>
        {automatic
          ? "Your scout collects matching highlights."
          : "Choose a player, then add their clip."}
      </h2>
      <p className="muted">
        {automatic
          ? "Scans find recent player-specific ESPN clips and save short excerpts here. Source dates and attribution stay attached; identity and tracking are checked during analysis."
          : `MP4 or MOV · up to 100 MB · first ${data.limits.clip_seconds ?? 30} seconds are analyzed. Choose a continuous view where the player is clearly visible.`}
      </p>
      {data.models_mode === "mock" && (
        <p className="library-explanation">
          The sample scan already includes film. Uploaded footage can be stored
          here, but simulated models cannot verify it. Use the sample’s included
          clips for a complete demo.
        </p>
      )}
      {saved && (
        <div className="upload-success" role="status">
          <h3>Clip saved. Return to scouting to check readiness.</h3>
          <p>
            Player identity and tracking quality will be checked during the next
            live scan.
          </p>
          <button className="button primary" onClick={onDone}>
            Back to scouting
            <ArrowRight size={15} />
          </button>
        </div>
      )}
      {automatic && savedClips}
      <details
        className={`manual-upload ${automatic ? "optional" : ""}`}
        open={!automatic}
      >
        <summary>Add your own clip (optional)</summary>
        <form
          className="upload-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setUploading(true);
            setSaved(false);
            try {
              const form = new FormData(e.currentTarget);
              form.set("rights_confirmed", "true");
              await api("/clips", { method: "POST", body: form });
              await refresh();
              await onRefresh();
              setSaved(true);
              onToast("Clip saved. Return to scouting to review readiness.");
            } catch (err) {
              onError((err as Error).message);
            } finally {
              setUploading(false);
            }
          }}
        >
          <label>
            Find a player
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search free agents by name"
            />
          </label>
          <label>
            Target player
            <select
              name="player_id"
              required
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
            >
              <option value="">Choose the player visible in your clip</option>
              {matches.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ·{" "}
                  {p.is_demo ? "fictional demo player" : "Sleeper player"}
                </option>
              ))}
            </select>
          </label>
          {data.league.is_demo === false && (
            <p className="data-note">
              Showing {matches.length} free agents with comparable recent
              scores. Players without sufficient statistics must be prepared in
              League setup first.
            </p>
          )}
          <label className="dropzone">
            <Upload size={24} />
            <span>Select a video file</span>
            <input type="file" name="file" accept=".mp4,.mov" required />
          </label>
          <label className="check-label">
            <input type="checkbox" required />
            <span>
              I have the rights and consent needed to process this footage.
            </span>
          </label>
          <p className="data-note">
            Mock models cannot verify real footage. Live mode sends this clip
            and selected frames to Meta for analysis. Target identity must match
            visible evidence. Sample-league identities are fictional; Sleeper
            identities come from the player directory.
          </p>
          <button className="button primary" disabled={uploading || !playerId}>
            {uploading ? (
              <Loader2 size={16} className="spin" />
            ) : (
              <Upload size={16} />
            )}{" "}
            {uploading ? "Processing video…" : "Process local clip"}
          </button>
        </form>
      </details>
      {!automatic && savedClips}
    </section>
  );
}
