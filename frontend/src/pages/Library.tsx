import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { Bootstrap, Clip } from "../types";
import { api } from "../lib/api";

export function Library({
  data,
  onError,
  onToast,
  onRefresh,
}: {
  data: Bootstrap;
  onError: (error: string) => void;
  onToast: (message: string) => void;
  onRefresh?: () => Promise<void>;
}) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [filename, setFilename] = useState("");
  const refresh = async () => {
    const next = await api<Clip[]>("/clips");
    setClips(next);
  };
  useEffect(() => {
    void refresh()
      .catch((error) => onError(error.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <section className="library-panel">
      <div className="collection-toolbar">
        <p>
          {loading
            ? "Loading your library…"
            : clips.length
              ? `${clips.length} ${clips.length === 1 ? "clip" : "clips"} available for scouting`
              : "No clips in your library"}
        </p>
        {clips.length > 0 && !adding && (
          <button className="button primary" onClick={() => setAdding(true)}>
            Add footage
          </button>
        )}
      </div>
      {(!clips.length || adding) && (
        <section className="upload-section" aria-labelledby="upload-title">
          <div className="section-heading">
            <h2 id="upload-title">Add footage</h2>
            {clips.length > 0 && (
              <button
                className="text-link"
                disabled={uploading}
                onClick={() => setAdding(false)}
              >
                Cancel
              </button>
            )}
          </div>
          <p className="page-description">
            Choose the player in your clip and upload footage you have
            permission to analyze.
          </p>
          <form
            className="upload-form"
            onSubmit={async (event) => {
              event.preventDefault();
              const formElement = event.currentTarget;
              setUploading(true);
              onError("");
              try {
                const form = new FormData(formElement);
                form.set("rights_confirmed", "true");
                await api("/clips", { method: "POST", body: form });
                await refresh();
                await onRefresh?.();
                formElement.reset();
                setFilename("");
                setAdding(false);
                onToast(
                  "Clip processed. It will be selected on the next scan.",
                );
              } catch (error) {
                onError((error as Error).message);
              } finally {
                setUploading(false);
              }
            }}
          >
            <div className="settings-group">
              <label className="upload-row">
                <span>Target player</span>
                <select name="player_id" disabled={uploading} required>
                  <option value="">Choose player</option>
                  {data.league.available.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name} ·{" "}
                      {player.is_demo
                        ? "fictional demo player"
                        : "Sleeper player"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="upload-row file-row">
                <span>
                  Video file<small>MP4 or MOV · up to 100 MB</small>
                </span>
                <input
                  type="file"
                  name="file"
                  aria-label="Video file"
                  accept=".mp4,.mov"
                  required
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file && file.size > 100 * 1024 * 1024) {
                      event.target.value = "";
                      setFilename("");
                      onError("Choose a video under 100 MB.");
                    } else {
                      setFilename(file?.name ?? "");
                      onError("");
                    }
                  }}
                />
              </label>
            </div>
            {filename && <p className="selected-file">{filename}</p>}
            <p className="data-note">
              The first {data.limits.clip_seconds ?? 30} seconds are normalized
              and analyzed. Live mode sends the clip and selected frames to
              Meta. The visible player must match the target; mock models cannot
              verify real footage, and sample-league players are fictional.
            </p>
            <label className="check-label rights-confirmation">
              <input type="checkbox" required disabled={uploading} />
              <span>
                I have the rights and consent needed to process this footage.
              </span>
            </label>
            <div className="form-actions">
              <button
                className="button primary"
                disabled={uploading || !data.league.available.length}
              >
                {uploading && <Loader2 size={16} className="spin" />}
                {uploading ? "Processing video…" : "Process local clip"}
              </button>
            </div>
          </form>
        </section>
      )}
      {clips.length > 0 && (
        <div className="clip-grid">
          {clips.map((clip) => (
            <article key={clip.id}>
              <video
                src={clip.url}
                controls
                preload="metadata"
                aria-label={`Clip of ${clip.subject_name ?? data.league.available.find((player) => player.id === clip.player_id)?.name ?? clip.player_id}`}
              />
              <div className="clip-info">
                <h2>
                  {clip.subject_name ??
                    data.league.available.find(
                      (player) => player.id === clip.player_id,
                    )?.name ??
                    clip.player_id}
                </h2>
                <span>{clip.duration.toFixed(1)}s</span>
                <p>{clip.source}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
