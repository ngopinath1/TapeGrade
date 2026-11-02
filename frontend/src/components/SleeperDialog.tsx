import { useState } from "react";
import {
  Users,
  X,
  Loader2,
  Search,
  Check,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { api } from "../lib/api";

export function SleeperDialog({ close }: { close: () => void }) {
  const [username, setUsername] = useState(""),
    [result, setResult] = useState<Record<string, unknown> | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  const [leagueDetail, setLeagueDetail] = useState<{
    league: { name: string };
    rosters: unknown[];
    users: unknown[];
    source: string;
  } | null>(null);
  return (
    <div className="modal-backdrop" onClick={close}>
      <section
        className="modal panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sleeper-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="icon-button modal-close"
          onClick={close}
          aria-label="Close league connection"
        >
          <X size={20} />
        </button>
        <div className="section-label">
          <Users size={16} /> LEAGUE CONNECTION
        </div>
        <h2 id="sleeper-title">Find your Sleeper account.</h2>
        <p>
          Public account lookup and documented NFL league data are supported.
          Sleeper documents NFL-only league discovery, so TapeGrade cannot
          import a live basketball roster.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");
            try {
              setResult(
                await api("/sleeper/connect", {
                  method: "POST",
                  body: JSON.stringify({ username }),
                }),
              );
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <label>
            Sleeper username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="your_username"
            />
          </label>
          <button className="button primary" disabled={loading}>
            {loading ? (
              <Loader2 size={16} className="spin" />
            ) : (
              <Search size={16} />
            )}
            Look up account
          </button>
        </form>
        {error && <p className="inline-error">{error}</p>}
        {result && (
          <div className="connection-result">
            <Check size={18} />
            <strong>
              {String(
                (result.user as Record<string, unknown>)?.display_name ??
                  username,
              )}
            </strong>
            <p>{String(result.notice)}</p>
            {Array.isArray(result.leagues) && (
              <label>
                Documented NFL leagues
                <select
                  defaultValue=""
                  onChange={async (e) => {
                    setLeagueDetail(null);
                    if (!e.target.value) return;
                    setError("");
                    try {
                      setLeagueDetail(
                        await api(`/sleeper/leagues/${e.target.value}`),
                      );
                    } catch (err) {
                      setError((err as Error).message);
                    }
                  }}
                >
                  <option value="">Select a league (view only)</option>
                  {(result.leagues as Record<string, unknown>[]).map((l) => (
                    <option
                      key={String(l.league_id)}
                      value={String(l.league_id)}
                    >
                      {String(l.name)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {leagueDetail && (
              <div className="league-readout">
                <strong>{leagueDetail.league.name}</strong>
                <p>
                  {leagueDetail.rosters.length} rosters ·{" "}
                  {leagueDetail.users.length} managers
                </p>
                <small>
                  {leagueDetail.source}. NFL view only; basketball scouting uses
                  the sample league.
                </small>
              </div>
            )}
          </div>
        )}
        <a
          className="text-link"
          href="https://docs.sleeper.com/#get-all-leagues-for-user"
          target="_blank"
          rel="noreferrer"
        >
          Read Sleeper API limitations <ExternalLink size={12} />
        </a>
        <button className="button subtle full" onClick={close}>
          Continue with the sample NBA league <ArrowRight size={15} />
        </button>
      </section>
    </div>
  );
}
