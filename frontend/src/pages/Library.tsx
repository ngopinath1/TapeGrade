import { useState, useEffect } from "react";
import { Film, Upload, Loader2 } from "lucide-react";
import type { Bootstrap, Clip } from "../types";
import { api } from "../lib/api";

export function Library({
  data,
  onError,
  onToast,
}: {
  data: Bootstrap;
  onError: (error: string) => void;
  onToast: (s: string) => void;
}) {
  const [clips, setClips] = useState<Clip[]>([]),
    [uploading, setUploading] = useState(false);
  const refresh = () =>
    api<Clip[]>("/clips")
      .then(setClips)
      .catch((e) => onError(e.message));
  useEffect(() => {
    void refresh();
  }, []);
  return (
    <section className="panel library-panel">
      <div className="panel-head">
        <div className="section-label">
          <Film size={15} /> FILM LIBRARY
        </div>
        <span className="tag">Local, permitted footage only</span>
      </div>
      <h2>Bring your own evidence.</h2>
      <p className="muted">
        MP4 or MOV · up to 100 MB · first 30 seconds · normalized to 12 fps.
      </p>
      <form
        className="upload-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setUploading(true);
          try {
            const form = new FormData(e.currentTarget);
            form.set("rights_confirmed", "true");
            await api("/clips", { method: "POST", body: form });
            await refresh();
            onToast("Clip processed. It will be selected on the next scan.");
          } catch (err) {
            onError((err as Error).message);
          } finally {
            setUploading(false);
          }
        }}
      >
        <label>
          Target player
          <select name="player_id">
            {data.league.available.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · fictional demo player
              </option>
            ))}
          </select>
        </label>
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
          Mock models cannot verify real footage. Live mode sends this clip and
          selected frames to Meta for analysis. The sample identities are
          fictional; use matching permitted footage or update the demo player
          metadata first.
        </p>
        <button className="button primary" disabled={uploading}>
          {uploading ? (
            <Loader2 size={16} className="spin" />
          ) : (
            <Upload size={16} />
          )}{" "}
          {uploading ? "Processing video…" : "Process local clip"}
        </button>
      </form>
      <div className="clip-grid">
        {clips.map((c) => (
          <div key={c.id}>
            <video src={c.url} controls preload="metadata" />
            <p>
              {data.league.available.find((p) => p.id === c.player_id)?.name ??
                c.player_id}{" "}
              <span>{c.duration.toFixed(1)}s</span>
            </p>
            <small>{c.source}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
