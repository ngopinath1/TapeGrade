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
import {
  type SetupSection,
  type GuideDestination,
} from "../components/ScoutingGuide";
import { ScoutingRequest } from "../components/ScoutingRequest";
import { ScanProgress } from "../components/ScanProgress";
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
    [instruction, setInstruction] = useState(
      "Find the best available upgrade for my roster.",
    ),
    [selected, setSelected] = useState(""),
    [connecting, setConnecting] = useState(false),
    [toast, setToast] = useState(""),
    [submitting, setSubmitting] = useState(false);
  const [setupSection, setSetupSection] = useState<SetupSection>("statistics");
  const navigate = (destination: GuideDestination, section?: SetupSection) => {
    if (destination === "connect") setConnecting(true);
    else {
      if (section) setSetupSection(section);
      setPage(destination);
    }
  };
  const candidates = scan?.result?.candidates ?? [];
  const hasCandidates = candidates.length > 0;
  const current =
    candidates.find((c) => c.player.id === selected) ?? candidates[0];
  const busy =
    submitting || Boolean(scanId && (!scan || !complete(scan.stage)));
  const canScan =
    data?.workflow && data.models_mode === "live"
      ? data.workflow.can_start
      : (data?.scan_readiness?.ready ?? data?.league.scouting_ready !== false);
  const simulated =
    data?.models_mode === "mock" && data?.league.is_demo !== false;
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
    { id: "settings", label: "Scouting preferences", icon: SlidersHorizontal },
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
  const scoutingRequest = (
    <ScoutingRequest
      data={data}
      hasReport={hasCandidates}
      busy={busy}
      canScan={canScan}
      simulated={simulated}
      instruction={instruction}
      setInstruction={setInstruction}
      onNavigate={navigate}
      onRun={async () => {
        setSubmitting(true);
        setSelected("");
        try {
          await run(instruction);
        } finally {
          setSubmitting(false);
        }
      }}
    />
  );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <a className="brand" href="#" onClick={() => setPage("desk")}>
          <div className="brand-mark">
            T<span>G</span>
          </div>
          <div>
            TapeGrade<small>THE FILM ADVANTAGE</small>
          </div>
        </a>
        <button
          className="workspace-switch"
          onClick={() => setConnecting(true)}
          aria-label="Switch league"
        >
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
        </button>
        <span className="nav-caption">WORKSPACE</span>
        <nav aria-label="Primary navigation">
          {nav.map((item) => (
            <button
              key={item.id}
              aria-label={item.label}
              className={page === item.id ? "active" : ""}
              onClick={() => {
                if (item.id === "data") setSetupSection("statistics");
                setPage(item.id);
              }}
              aria-current={page === item.id ? "page" : undefined}
            >
              <item.icon size={18} />
              <span className="nav-label">{item.label}</span>
              <span className="mobile-nav-label" aria-hidden="true">
                {
                  {
                    desk: "Scout",
                    roster: "Roster",
                    data: "Setup",
                    library: "Film",
                    history: "History",
                    settings: "Settings",
                  }[item.id]
                }
              </span>
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
                ? "Simulated analysis"
                : "Live analysis"}
              <small>
                {data.models_mode === "mock"
                  ? "No API credits used"
                  : data.league.is_demo === false
                    ? "Real Meta models · Sleeper data"
                    : "Real Meta calls · sample league"}
              </small>
            </span>
          </div>
          <button
            className="help-link"
            onClick={() => {
              setPage("desk");
              requestAnimationFrame(() => {
                const guide = document.getElementById(
                  "how-it-works",
                ) as HTMLDetailsElement | null;
                if (guide) {
                  guide.open = true;
                  guide.scrollIntoView?.({ block: "center" });
                  guide.focus();
                }
              });
            }}
          >
            <CircleHelp size={16} />
            How TapeGrade works
          </button>
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
          <button
            className="mobile-brand"
            aria-label="TapeGrade home"
            onClick={() => setPage("desk")}
          >
            <span className="footer-mark">TG</span> TapeGrade
          </button>
          <div className="breadcrumb">
            Workspace <ChevronRight size={12} />
            <b>{nav.find((n) => n.id === page)?.label}</b>
          </div>
          <div className="top-actions">
            <span className={`mode-pill ${data.models_mode}`}>
              <span />
              {data.models_mode === "mock"
                ? data.league.is_demo === false
                  ? "ANALYSIS UNAVAILABLE"
                  : "DEMO MODE"
                : "LIVE ANALYSIS"}
            </span>
            <button
              className="button connect"
              onClick={() => setConnecting(true)}
            >
              <Users size={14} />{" "}
              {data.league.is_demo === false
                ? "Manage league"
                : "Connect Sleeper"}{" "}
              <ArrowUpRight size={13} />
            </button>
          </div>
        </header>
        <main className="main-content" id="main-content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                BASKETBALL INTELLIGENCE <span>/</span>{" "}
                {page === "desk" ? "SCOUTING DESK" : page.toUpperCase()}
              </div>
              <h1>
                {page === "desk"
                  ? "Find your next roster move."
                  : page === "roster"
                    ? "Your roster."
                    : page === "library"
                      ? "Your film library."
                      : page === "history"
                        ? "Every scan. Every decision."
                        : page === "data"
                          ? "Get your league ready."
                          : "Set your scouting preferences."}
              </h1>
              <p>
                {page === "desk"
                  ? "Compare free agents, check the film, and review a recommendation for your team."
                  : page === "roster"
                    ? "Your team’s construction, recent form and protected core."
                    : page === "library"
                      ? "Recent highlights and uploads behind your scouting reports."
                      : page === "history"
                        ? "A persistent record of the scout’s work."
                        : page === "data"
                          ? "Connect game logs, confirm rules and inspect coverage."
                          : "Choose who to protect and how confident a recommendation must be."}
              </p>
            </div>
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
              <div className="workspace-context">
                <span className="tag">
                  {data.league.is_demo === false
                    ? "CONNECTED LEAGUE"
                    : "SAMPLE LEAGUE"}
                </span>
                <span>
                  <b>{data.league.name}</b> · {data.league.team_name}
                </span>
                {data.league.is_demo !== false && (
                  <span>
                    {simulated
                      ? "Fictional players · no API credits used"
                      : "Fictional players · live analysis uses API credits"}
                  </span>
                )}
              </div>
              {(!hasCandidates || busy) && scoutingRequest}
              {busy && <ScanProgress scan={scan} />}
              {scan?.stage === "FAILED" && (
                <div className="scan-failure" role="alert">
                  <h2>This scan couldn’t finish.</h2>
                  <p>
                    {scan.error ??
                      "The scan stopped before a report was ready."}
                  </p>
                  <p>
                    Saved work is retained. Retrying a live scan may use
                    additional API credits within its call limit.
                  </p>
                  <button
                    className="button subtle"
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
                    <RefreshCw size={14} />
                    Retry scan
                  </button>
                  {scan.action_needed && (
                    <button
                      className="button subtle"
                      onClick={() =>
                        navigate(
                          scan.action_needed!.destination,
                          scan.action_needed!.section,
                        )
                      }
                    >
                      {scan.action_needed.label}
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              )}
              {scan?.result && !busy && (
                <>
                  <div className="report-heading">
                    <div>
                      <span className="section-label">
                        {scan.result.film_test
                          ? "FILM DIAGNOSTIC"
                          : "YOUR SCOUTING REPORT"}
                      </span>
                      <h2>{scan.instruction}</h2>
                      <p>
                        {new Date(scan.created_at).toLocaleString()} ·{" "}
                        {scan.mode === "mock"
                          ? "Simulated analysis"
                          : `Live analysis · ${scan.live_calls} API call${scan.live_calls === 1 ? "" : "s"}`}
                      </p>
                    </div>
                    <span className="tag">
                      <Check size={13} /> Report saved
                    </span>
                  </div>
                  {scan.result.film_test && (
                    <div className="worker-note">
                      Film diagnostic · user-provided excerpt · visible jersey
                      target only. Game date, fantasy eligibility and statistics
                      are unverified. No roster move is recommended.
                    </div>
                  )}
                  <div className="report-overview">
                    <Recommendation scan={scan} onToast={setToast} />
                    <Candidates
                      emptyReason={scan.result.shortlist.reasoning}
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
                  {current && (
                    <div className="report-film">
                      <div className="section-divider">
                        <div>
                          <h2>Why this verdict?</h2>
                          <p>
                            Select a player above to inspect their film and
                            measurements.
                          </p>
                        </div>
                      </div>
                      {current.clip ? (
                        <FilmPlayer candidate={current} />
                      ) : (
                        <section className="panel footage-evidence">
                          <h2>No footage analyzed for {current.player.name}</h2>
                          <p>
                            {current.footage_notice ??
                              "No permitted clip was available. Film measurements and film-backed add recommendations are withheld."}
                          </p>
                          {Boolean(current.footage_sources?.length) && (
                            <>
                              <h3>Footage found on the publisher’s site</h3>
                              <p>
                                Viewing links only. These clips were not
                                downloaded or analyzed.
                              </p>
                              <ul>
                                {current.footage_sources!.map((source) => (
                                  <li key={source.url}>
                                    <a
                                      href={source.url}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {source.title}
                                      <ArrowUpRight size={13} />
                                    </a>
                                    <small>
                                      {source.publisher} · {source.game_date}
                                    </small>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          <button
                            className="button subtle"
                            onClick={() => setPage("library")}
                          >
                            Add permitted footage
                            <ArrowRight size={14} />
                          </button>
                        </section>
                      )}
                    </div>
                  )}
                  {hasCandidates && (
                    <details className="report-details">
                      <summary>
                        Tracking checks and analysis log
                        <span>See how the film evidence was checked</span>
                      </summary>
                      <PerceptionLog scan={scan} selected={current} />
                    </details>
                  )}
                  <details className="report-details">
                    <summary>
                      Download and share this report
                      <span>Scouting card and source evidence</span>
                    </summary>
                    <TapeCard scan={scan} />
                  </details>
                </>
              )}
              {hasCandidates && !busy && scoutingRequest}
              <details
                id="how-it-works"
                className="report-details how-it-works"
                tabIndex={-1}
              >
                <summary>
                  How does TapeGrade work?
                  <span>
                    From your team’s needs to a decision you can review
                  </span>
                </summary>
                <div className="how-content">
                  <h3>1. Tell the scout what you need</h3>
                  <p>
                    Choose a position or write a request. TapeGrade compares
                    eligible data for free agents and your roster using your
                    league’s scoring.
                  </p>
                  <h3>2. Review the evidence</h3>
                  <p>
                    The scout checks the player’s identity in the clip and the
                    quality of the tracking. ADD means the evidence supports
                    adding a player; MONITOR means keep watching; PASS means no
                    add is supported. A confidence percentage describes the
                    analysis, not a prediction of future performance.
                  </p>
                  <h3>3. Make the roster decision</h3>
                  <p>
                    A move appears only when the evidence, availability checks
                    and your preferences allow it. Copy the summary and make the
                    move in Sleeper. TapeGrade never submits a transaction.
                  </p>
                  <button
                    className="text-link"
                    onClick={() => setPage("settings")}
                  >
                    Choose protected players and bid limits
                    <ArrowRight size={14} />
                  </button>
                </div>
              </details>
              <details className="report-details league-overview">
                <summary>
                  League at a glance
                  <span>Roster, protections and waiver budget</span>
                </summary>
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
              </details>
            </>
          )}
          {page === "roster" && <Roster data={data} />}
          {page === "data" && data.league.is_demo === false && (
            <DataSetup
              key={data.league.id}
              data={data}
              initialSection={setupSection}
              onDone={() => setPage("desk")}
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
                  setToast(
                    "Scouting preferences saved. Existing recommendations checked again.",
                  );
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            />
          )}
          {page === "library" && (
            <Library
              data={data}
              onError={setError}
              onToast={setToast}
              onRefresh={refresh}
              onDone={() => setPage("desk")}
            />
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
            setPage("desk");
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
