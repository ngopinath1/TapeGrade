import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Film,
  History,
  LayoutDashboard,
  Loader2,
  Radar,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
  Zap,
  Check,
  CheckCheck,
  Clock3,
} from "lucide-react";
import { FilmPlayer } from "../components/FilmPlayer";
import { Candidates } from "../components/Candidates";
import { PerceptionLog } from "../components/PerceptionLog";
import { Recommendation } from "../components/Recommendation";
import { TapeCard } from "../components/TapeCard";
import { Roster } from "../components/Roster";
import { SleeperDialog } from "../components/SleeperDialog";
import { Settings } from "./Settings";
import { Library } from "./Library";
import { DataSetup } from "./DataSetup";
import { ScanReadiness } from "../components/ScanReadiness";
import { useDashboard } from "../hooks/useDashboard";
import { api, complete } from "../lib/api";
type Page = "desk" | "roster" | "library" | "history" | "settings" | "data";

export default function App() {
  const {
    data,
    history,
    scan,
    scanId,
    error,
    setError,
    run,
    refresh,
    setScanId,
    reloadScan,
  } = useDashboard();
  const [page, setPage] = useState<Page>("desk"),
    [instruction, setInstruction] = useState("Find me an undervalued guard."),
    [selected, setSelected] = useState(""),
    [connecting, setConnecting] = useState(false),
    [toast, setToast] = useState(""),
    [submitting, setSubmitting] = useState(false);
  const candidates = scan?.result?.candidates ?? [];
  const current =
    candidates.find((c) => c.player.id === selected) ?? candidates[0];
  const busy =
    submitting || Boolean(scanId && (!scan || !complete(scan.stage)));
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const nav: { id: Page; label: string; icon: typeof Radar }[] = [
    { id: "desk", label: "Scouting desk", icon: LayoutDashboard },
    { id: "roster", label: "My roster", icon: Users },
    ...(data?.league.is_demo === false
      ? [{ id: "data" as Page, label: "League setup", icon: ShieldCheck }]
      : []),
    { id: "library", label: "Film library", icon: Film },
    { id: "history", label: "Scan history", icon: History },
    { id: "settings", label: "Autopilot", icon: SlidersHorizontal },
  ];
  if (!data)
    return (
      <div className="startup">
        <div className="brand-mark">
          T<span>G</span>
        </div>
        <h1>TapeGrade</h1>
        {error ? (
          <>
            <p>{error}</p>
            <p>Start the backend on localhost:8000, then refresh.</p>
            <button
              className="button primary"
              onClick={() => {
                setError("");
                void refresh();
              }}
            >
              Retry connection
            </button>
          </>
        ) : (
          <p>
            <Loader2 className="spin" size={18} /> Opening the film room…
          </p>
        )}
      </div>
    );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={() => setPage("desk")}>
          <div className="brand-mark">
            T<span>G</span>
          </div>
          <div>
            TapeGrade<small>THE FILM ADVANTAGE</small>
          </div>
        </a>
        <div className="workspace-switch">
          <span className="workspace-icon">
            <Users size={17} />
          </span>
          <div>
            {data.league.name}
            <small>
              {data.league.is_demo === false
                ? "Sleeper NBA · Period points"
                : "Sample NBA · Points"}
            </small>
          </div>
          <ChevronDown size={14} />
        </div>
        <span className="nav-caption">WORKSPACE</span>
        <nav>
          {nav.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? "active" : ""}
              onClick={() => setPage(item.id)}
            >
              <item.icon size={18} />
              {item.label}
              {item.id === "desk" && <span className="nav-dot" />}
              {item.id === "history" && history.length > 0 && (
                <span className="nav-count">{history.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="model-status">
            <span className="live-dot" />
            <span>
              {data.models_mode === "mock"
                ? "Demo environment"
                : "Live model environment"}
              <small>
                {data.models_mode === "mock"
                  ? "No API credits used"
                  : data.league.is_demo === false
                    ? "Real Meta models · Sleeper data"
                    : "Real Meta calls · sample league"}
              </small>
            </span>
          </div>
          <a
            className="help-link"
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
          >
            <CircleHelp size={16} />
            API explorer
            <ArrowUpRight size={13} />
          </a>
          <div className="profile">
            <span>GM</span>
            <div>
              Courtside GM<small>Indie scout workspace</small>
            </div>
            <ShieldCheck size={16} />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <ChevronRight size={12} />
            <b>{nav.find((n) => n.id === page)?.label}</b>
          </div>
          <div className="top-actions">
            <span className={`mode-pill ${data.models_mode}`}>
              <span />
              {data.models_mode === "mock"
                ? data.league.is_demo === false
                  ? "MOCK MODELS"
                  : "DEMO MODE"
                : "LIVE MODELS"}
            </span>
            <button
              className="button connect"
              onClick={() => setConnecting(true)}
            >
              <Users size={14} /> Connect Sleeper <ArrowUpRight size={13} />
            </button>
          </div>
        </header>
        <main className="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                BASKETBALL INTELLIGENCE <span>/</span>{" "}
                {page === "desk" ? "SCOUTING DESK" : page.toUpperCase()}
              </div>
              <h1>
                {page === "desk" ? (
                  <>
                    Your box score <em>is lying to you.</em>
                  </>
                ) : page === "roster" ? (
                  "Know your starting point."
                ) : page === "library" ? (
                  "The evidence room."
                ) : page === "history" ? (
                  "Every scan. Every decision."
                ) : page === "data" ? (
                  "Build a trustworthy league view."
                ) : (
                  "Autonomous, on your terms."
                )}
              </h1>
              <p>
                {page === "desk"
                  ? "Find the opportunity the numbers haven’t caught up to."
                  : page === "roster"
                    ? "Your team’s construction, recent form and protected core."
                    : page === "library"
                      ? "Process video you have permission to analyze."
                      : page === "history"
                        ? "A persistent record of the scout’s work."
                        : page === "data"
                          ? "Connect game logs, confirm rules and inspect coverage."
                          : "Set the rules. Keep the final say."}
              </p>
            </div>
            <span className="edition">
              <span>VOL. 01</span>THE FILM ROOM
            </span>
          </div>
          {error && (
            <div role="alert" className="error-banner">
              <Activity size={17} />
              <span>{error}</span>
              <button
                className="icon-button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {page === "desk" && (
            <>
              <div className="summary-strip">
                <div>
                  <span className="summary-icon">
                    <Users size={19} />
                  </span>
                  <div>
                    <small>YOUR TEAM</small>
                    <strong>{data.league.team_name}</strong>
                  </div>
                  <span className="summary-extra">
                    {data.league.record} <i>·</i> {data.league.standing}
                  </span>
                </div>
                <div>
                  <span className="summary-icon">
                    <Radar size={19} />
                  </span>
                  <div>
                    <small>
                      {data.league.is_demo === false
                        ? "UNROSTERED POOL"
                        : "FREE AGENT POOL"}
                    </small>
                    <strong>
                      {data.league.available.length}
                      <span>
                        {data.league.is_demo === false
                          ? " active players"
                          : " sample players"}
                      </span>
                    </strong>
                  </div>
                </div>
                <div>
                  <span className="summary-icon">
                    <ShieldCheck size={19} />
                  </span>
                  <div>
                    <small>PROTECTED CORE</small>
                    <strong>
                      {data.settings.protected_players.length}
                      <span> players locked</span>
                    </strong>
                  </div>
                </div>
                <div>
                  <span className="summary-icon">
                    <Zap size={18} />
                  </span>
                  <div>
                    <small>
                      {data.league.is_demo === false
                        ? "WAIVER BUDGET"
                        : "FAAB REMAINING"}
                    </small>
                    <strong>
                      {data.league.faab_remaining === null
                        ? "Unavailable"
                        : `$${data.league.faab_remaining}`}
                      {data.league.is_demo !== false && <span> / $100</span>}
                    </strong>
                  </div>
                </div>
              </div>
              {data.league.is_demo === false && (
                <div className="worker-note">
                  <b>{data.league.name} connected.</b> Your roster, scoring
                  rules and reported period points are live Sleeper data.{" "}
                  {data.league.scouting_unavailable_reason}{" "}
                  <button
                    className="text-link"
                    onClick={() => setPage("roster")}
                  >
                    View my roster <ArrowRight size={13} />
                  </button>
                </div>
              )}
              <ScanReadiness data={data} />
              <form
                className="scout-input"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  setSelected("");
                  try {
                    await run(instruction);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <div className="prompt-icon">
                  <Sparkles size={20} />
                </div>
                <div className="prompt-field">
                  <label htmlFor="instruction">GIVE YOUR SCOUT A MISSION</label>
                  <input
                    id="instruction"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Find me a guard before tomorrow’s games."
                    required
                    minLength={3}
                    maxLength={1000}
                  />
                </div>
                <span className="scout-model">
                  Powered by
                  <br />
                  <b>Muse Spark</b>
                </span>
                <button
                  className="button primary scan-button"
                  disabled={
                    busy ||
                    (data.scan_readiness
                      ? !data.scan_readiness.ready
                      : data.league.scouting_ready === false)
                  }
                >
                  {busy ? (
                    <Loader2 size={17} className="spin" />
                  ) : (
                    <Radar size={17} />
                  )}{" "}
                  {busy ? "Scouting…" : "Run scan"}
                  <ArrowRight size={16} />
                </button>
              </form>
              <div className="scan-context">
                <span>
                  <span className={`live-dot ${busy ? "pulsing" : ""}`} />
                  {busy
                    ? `${scan?.stage.replaceAll("_", " ").toLowerCase() ?? "queuing"} · ${scan?.progress ?? 0}%`
                    : scan?.stage === "FAILED"
                      ? "Scan failed"
                      : scan?.stage === "COMPLETED"
                        ? "Scan complete · report ready"
                        : "Ready when you are"}
                </span>
                <span>
                  {data.league.is_demo === false
                    ? data.league.scouting_ready
                      ? "Real Sleeper roster · sourced recent game logs"
                      : "Real Sleeper roster · setup required for recommendations"
                    : (scan?.mode ?? data.models_mode) === "mock"
                      ? "Simulated models, fictional players & original schematic film"
                      : scan?.result?.film_test
                        ? "Real Meta inference · film diagnostic · no fantasy statistics"
                        : "Real Meta inference · fictional sample league statistics"}
                </span>
                {scan?.stage === "FAILED" && (
                  <button
                    className="text-link"
                    onClick={async () => {
                      try {
                        await api(`/scans/${scan.id}/retry`, {
                          method: "POST",
                        });
                        await reloadScan();
                        setScanId(null);
                        setTimeout(() => setScanId(scan.id), 0);
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }}
                  >
                    <RefreshCw size={12} />
                    Retry scan
                  </button>
                )}
              </div>
              {busy && (
                <div className="scan-progress">
                  <i
                    style={{ width: `${Math.max(2, scan?.progress ?? 0)}%` }}
                  />
                </div>
              )}
              {scan?.error && (
                <div role="alert" className="error-banner">
                  {scan.error}
                </div>
              )}
              {scan?.result?.film_test && (
                <div className="worker-note">
                  Film diagnostic · user-provided excerpt · visible jersey
                  target only. Game date, fantasy eligibility and statistics are
                  unverified. No roster move is recommended.
                </div>
              )}
              {scan && !scan.result && !complete(scan.stage) && (
                <div className="worker-note">
                  Keep the separate Python worker running. Jobs and progress are
                  saved in SQLite.
                </div>
              )}
              <div className="analysis-grid">
                <FilmPlayer candidate={current} />
                <Candidates
                  candidates={candidates}
                  selected={current?.player.id ?? ""}
                  onSelect={setSelected}
                  watchlist={data.watchlist}
                  onWatch={async (id) => {
                    try {
                      await api(`/watchlist/${id}`, { method: "POST" });
                      await refresh();
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                />
              </div>
              <div className="evidence-grid">
                <PerceptionLog scan={scan} selected={current} />
                <div className="decision-column">
                  <Recommendation scan={scan} onToast={setToast} />
                  <TapeCard scan={scan} />
                </div>
              </div>
              <div className="section-divider">
                <div className="section-label">
                  THE ROSTER BEHIND THE RECOMMENDATION
                </div>
                <button
                  className="text-link"
                  onClick={() => setPage("settings")}
                >
                  Manage protections <ArrowRight size={12} />
                </button>
              </div>
              <Roster data={data} />
            </>
          )}
          {page === "roster" && <Roster data={data} />}
          {page === "data" && data.league.is_demo === false && (
            <DataSetup
              key={data.league.id}
              data={data}
              onRefresh={refresh}
              onError={setError}
            />
          )}
          {page === "settings" && (
            <Settings
              data={data}
              onSave={async (value) => {
                try {
                  await api("/settings", {
                    method: "PUT",
                    body: JSON.stringify(value),
                  });
                  await refresh();
                  await reloadScan();
                  setToast("Guardrails saved and staged moves revalidated.");
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            />
          )}
          {page === "library" && (
            <Library data={data} onError={setError} onToast={setToast} />
          )}
          {page === "history" && (
            <section className="panel history-panel">
              <div className="panel-head">
                <div className="section-label">
                  <History size={15} /> SCAN ARCHIVE
                </div>
                <span className="count-pill">{history.length} runs</span>
              </div>
              {history.length ? (
                history.map((s) => (
                  <button
                    key={s.id}
                    className="history-row"
                    onClick={() => {
                      setScanId(s.id);
                      setPage("desk");
                      setSelected("");
                    }}
                  >
                    <span className="history-icon">
                      {s.stage === "COMPLETED" ? (
                        <CheckCheck size={19} />
                      ) : (
                        <Clock3 size={19} />
                      )}
                    </span>
                    <div>
                      <strong>{s.instruction}</strong>
                      <small>
                        {new Date(s.created_at).toLocaleString()} ·{" "}
                        {s.mode.toUpperCase()} · {s.live_calls} live calls ·
                        attempt {s.attempts}
                      </small>
                    </div>
                    <span
                      className={`history-stage ${s.stage === "FAILED" ? "failed" : ""}`}
                    >
                      {s.stage.replaceAll("_", " ")}
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                ))
              ) : (
                <div className="board-empty">
                  <History size={28} />
                  <h3>Your first scan is ahead of you.</h3>
                  <p>Completed and interrupted work will be recorded here.</p>
                </div>
              )}
            </section>
          )}
          <footer>
            <span>
              <span className="footer-mark">TG</span> WATCH THE GAME. SEE THE
              EDGE.
            </span>
            <span>
              SAM 3.1 <i>×</i> Muse Spark <i>×</i> Muse Image{" "}
              <span className="footer-separator">/</span>{" "}
              {data.league.is_demo === false
                ? data.league.scouting_ready
                  ? "Sleeper roster · sourced per-game comparisons"
                  : "Sleeper roster · recommendations pending setup"
                : (scan?.mode ?? data.models_mode) === "mock"
                  ? "Simulated demo report"
                  : "Live model report"}{" "}
              · Human-approved moves
            </span>
          </footer>
        </main>
      </div>
      {connecting && (
        <SleeperDialog
          connection={data.league.connection}
          close={() => setConnecting(false)}
          onConnected={async () => {
            await refresh(true);
            setSelected("");
            setPage("roster");
            setToast("League workspace updated.");
          }}
        />
      )}{" "}
      {toast && (
        <div role="status" className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
