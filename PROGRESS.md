# TapeGrade progress

Last verified: November 4, 2026, America/New_York.

## Latest real fallback test

- User-authorized Sam Hauser scan `adbe3ce155e248cd9787ad183f7aebbd` completed with **4/6 actual model calls** and one recorded automatic switch. No additional calls were made during fixes or UI verification.
- Fixed single-highlight coverage: discovery can use a non-overlapping later excerpt when a short source contains enough footage. Explicit source spans, content hashes and overlap checks prevent repeated frames from counting as new footage. The report labels both excerpts as the same play.
- Actual ESPN source `50351816`: first excerpt 0–5s passed target identity but failed defender tracking at 45% quality; the 11–16s alternative failed opening-frame identity and correctly skipped SAM. The final report retained the best available first view, returned MONITOR and staged no move. No thresholds were relaxed to force success.
- Simplified failed-clip explanations to use the real verifier's reason while preserving detailed identity checks in the audit. Both source ranges and rejection reasons were verified in the UI.
- **222 backend tests, 35 frontend tests and production build passed.** Audit: ignored `data/cache/live-fallback-verification.json`; screenshot: `data/cache/live-fallback-report.png`. Latest API and idle worker run locally with scheduling off and six-call cap unchanged.

## Latest automatic clip fallback

- Added automatic evaluation of up to two distinct recent clips per player. Unclear identity, poor tracking or missing supported measurements triggers a switch when enough budget remains.
- Two clips share one request containing separate frame-mapped identity checks. Named-player first-clip tracking failure followed by a successful alternative and final report fits exactly six calls; successful identity fallback takes four. Earlier scouting and candidates reduce available headroom.
- Duplicate content/source URLs are excluded. Clip history preserves each rejection and identifies the selected source. Both failed clips produce a conservative report with unsupported metrics withheld.
- Reserved final-report budget, skipped paid artwork when no call remains, and persisted clip plans/checks/trials plus final decisions for safe resume without resetting call accounting.
- **211 backend tests, 34 frontend tests and production build passed.** New cases cover restart after a completed trial and after the sixth/final decision call, as well as budget limits and source failures. Zero new paid model requests.
- Enabled `MAX_CLIPS_PER_CANDIDATE=2` in this worktree's ignored runtime configuration and live launch profile. API and idle worker use the new code; scheduling remains off, total scan limit remains six. Branch: `feature/backend` in the dedicated linked worktree.

## Latest per-player performance integration

- Every named clip player now joins the dated ESPN roster to a unique statistics-provider identity using full name, team, jersey and a recorded appearance in that game. Shared NBA/Sportradar IDs establish league membership; ambiguous or conflicting joins withhold eligibility.
- Profiles show individual recent game logs, box-score averages, minutes, league-weighted fantasy scoring, sample sizes, source links and availability. Other fantasy teams' rostered players remain distinct from free agents.
- Each player receives an individual continuity check inside the existing critic call. Own-track metrics exclude teammates and failed/unconfirmed opponent tracks. Additional qualified free agents can share the final recommendation call without another clip/model analysis; transaction guardrails remain enforced.
- The saved ESPN report was enriched with zero additional model calls: Hauser 7.00 FPTS/game (PASS), Wagner 24.33 (rostered elsewhere; trade research), Cain 6.33 (MONITOR screening). Each has three sourced games. Original decisions and a backup are preserved. No ADD is supported by this clip's unreliable tracking.
- **197 backend tests, 31 frontend tests, production build and browser/source-download checks passed.** The ESPN test remains at **4/6 model calls**. Latest API and idle worker run locally with scheduling off.

## Latest ESPN end-to-end verification

- User-authorized scan `748cfa61db7d45728ca89233b4083428` completed using the newly discovered five-second ESPN Sam Hauser clip, with **4/6 actual model calls** across the entire test and no further paid calls during fixes.
- Automatic Sleeper and fresh Sportradar refresh preceded four uncached ESPN metadata requests and public MP4 acquisition. The clip hash matched the prepared ESPN excerpt; storage deduplicated it. The older four-second upload was not used.
- Dated game roster plus visible BOS #30 jersey observations and multi-frame continuity now bind the target to SAM ID 1. Proof crops, original frames, roster link and seed-frame player names are visible in the report. Unreadable or conflicting identities remain unnamed; no face matching.
- SAM returned 60 actual tracked frames. The tracking review preserved the target identity but caught defender drift to empty court. Quality 45%, numerical film metrics withheld, PASS, no staged move, no image-generation call.
- Fixed tracking acceptance to respect identity gates, recovery after a supported correction, truthful card progress, and default hiding/labeling of unreliable overlays.
- **181 backend tests, 28 frontend tests, production build passed.** Browser playback and evidence loading verified. Latest code runs locally with idle worker, scheduling off and six-call limit retained.
- See `docs/AUTOMATIC_SCANNING.md` and ignored `data/cache/espn-fullflow-verification.json` for the accounting and limitations. This validates the live pipeline, not fantasy prediction accuracy or complete opponent tracking.

## Completed milestones

- [x] Inspected empty workspace, parent instructions and available tools.
- [x] Created .gitignore and .env.example before application components.
- [x] Initialized isolated local Git repository; .env and secret-bearing variants are ignored.
- [x] Python 3.12.14 venv; tested Python/npm dependencies and lock files.
- [x] FastAPI health, database initialization, React/Vite and proxy communication.
- [x] Fictional NBA points league with roster, free agents, trends, standings and FAAB.
- [x] Modular ScoutAgent, PerceptionCritic and DecisionAgent with Pydantic JSON.
- [x] Original procedural video, deterministic tracks and failed-then-corrected mock perception example.
- [x] Separate worker, persisted events/stages, leases, checkpoints, retries and caching.
- [x] Screen-pixel defender distance and ball-proximity involvement proxies with source observations.
- [x] Protected drops, bid caps, confidence requirements and withdrawal after tightened settings.
- [x] Downloadable labeled PNG Tape Cards, watchlist, history and copied summaries.
- [x] Official Meta docs verified; actual Spark, SAM and Image clients implemented.
- [x] Official SAM parser decodes masks/boxes and builds spatial seed prompts.
- [x] Critic output controls the subsequent actual SAM request; bounded retries tested.
- [x] Sleeper account and documented NFL league/roster/user reads; NBA limitation explicit.
- [x] Permitted uploads, container/size/duration validation, normalization and exact frame sampling.
- [x] Local nightly Eastern scheduler, optional pre-waiver hour and DST idempotency.
- [x] Responsive dashboard, loading/error/empty states, playback, overlays, timeline and methodology.
- [x] README, API contracts, setup/dev scripts and timed demo script.
- [x] Python/React sources formatted; no broken Python dependency requirements.

## Verified results

- **138 backend tests passed** on Python 3.12.14.
- **11 frontend tests passed**; TypeScript and Vite production build passed.
- One upstream Starlette TestClient deprecation warning; no test failures.
- Offline end-to-end HTTP fixture exercises all three actual clients, with 8 accounted fixture calls.
  Actual critic output changes SAM from frame-0 to frame-6 spatial guidance. This is not paid inference.
- Default mock: Cameron Reed ADD / Theo Martin DROP / FAAB $8.
- Simulated retry: quality 46% → corrected jersey prompt → 91% accepted.
- Stored Cameron observations produce 117.4px defender proximity and 75% ball-proximity involvement.
- Shot opportunity and defensive activity remain unavailable rather than invented.
- Separate-process smoke tests passed through Vite, API and worker: metric references,
  valid move, video range request and PNG attachment.
- Latest full smoke: `5d5bb55454cc4d0cb2d1133c866f3214`, 3 candidates,
  163,254-byte PNG, **0 live API calls**. Combined `bash scripts/dev.sh` launch verified.
- Browser: scan completed, video played, selecting another candidate changed metrics,
  guardrails saved, and the card link downloaded an actual PNG.
- Desktop 1440px and mobile 390px layouts inspected. At 390px, document width is 390px,
  media readyState=4, no media error. Temporary viewport override reset.
- Screenshots: `docs/dashboard.jpg`, `docs/mobile.jpg`.
- Secret env files, databases, caches, dependencies and builds confirmed ignored.
  No .env created/modified, pushes, deployments or fantasy transactions during the build.

## Limitations and remaining work

1. **Real fantasy transaction reasoning remains unverified.** All three models
   completed genuine requests on a short user-provided excerpt, but the critic
   found degraded defender tracking (55% quality). Numerical metrics were withheld
   and no fantasy move was generated. Validate broader footage and licensed player
   statistics before claiming current fantasy scouting accuracy. Do not run paid
   tests automatically.
2. **Recent NBA statistics connected via Sportradar trial.** A genuine seven-day
   import provides 39 closed games and 1,367 observations. Exact recent coverage
   supports 100 free agents and 6 roster players; short samples, DNPs and unknown
   fields remain explicit. Film identity/quality and current eligibility/locks
   still gate the genuine recommendation test. See the latest milestone below.
3. Shot/defensive action detection, calibration and category scoring are future work.
4. Original sample footage is schematic, not a real-game benchmark. Mock models reject
   uploaded-footage identity verification rather than fabricate an analysis.
5. Local single-user service: no public authentication, migrations, distributed storage,
   Modal deployment, notifications delivery, YouTube integration or transaction execution.
6. Scheduling defaults off and requires environment + saved setting, an awake Mac,
   and a running worker. No cloud backfill while offline.

## Resume

Read README.md and docs/API_CONTRACTS.md. Dependencies are already installed here.
From the project root run `bash scripts/dev.sh`, then open http://localhost:5173.
The README also provides separate API, worker and frontend commands.
Use “Find me an undervalued guard.” and default guardrails for the expected $8 move.
If the saved workspace is Sleeper, first use Connect Sleeper → Continue with the
sample NBA league to return to the full sample scouting workflow.

After code changes:

```bash
.venv/bin/python -m pytest -q
npm --prefix frontend test
npm --prefix frontend run build
```

With all three services running in mock mode:

```bash
.venv/bin/python scripts/smoke.py
```

## GitHub publication

- User requested a private GitHub repository, a local commit, and explicit approval before pushing.
- Private repository: `ngopinath1/TapeGrade`.
- Verified Git exclusions for environment files, private keys, credential files,
  SQLite databases, cached media, uploads, dependencies and build outputs.
- Scanned all publishable text files for credential patterns and authenticated
  dependency URLs; no secrets detected. The only binary source assets are the
  previously reviewed mock dashboard screenshots. `.env.example` keys are blank.
- The initial publication audit preceded creation of the real `.env`. Subsequent
  audits compare publishable files against the configured key without displaying
  it or modifying `.env`.
- After explicit user approval, initial commit `f0ab311579005540fe7f7dabf987ed891e74f4be`
  was pushed to `main`; the remote SHA and private visibility were verified.
- On November 3 the user explicitly approved publishing the live-check and
  film-diagnostic follow-up to the existing private repository's `main` branch.
- The follow-up publication audit examined 90 publishable files, including an
  exact configured-key comparison and common credential patterns: no secrets
  detected. `.env`, source footage, generated cards/overlays, local reports and
  SQLite databases are excluded. Only the two original mock UI screenshots are
  binary repository assets. Local runtime data is not part of the Git snapshot.
- On November 4 the user explicitly approved publishing the Sleeper integration
  and `handoff.md` to the same private repository's `main` branch. The prepared
  snapshot contains both; read `git log -1` for its resulting commit. A new audit
  covered 92 publishable files, including the configured-key comparison, with no
  secrets detected. Live connection data, databases, footage and generated media
  remain excluded.

## November 3: minimal live check and clip discovery

- User created their API key in `.env`. Verified presence, backend loading, expected
  format and Git exclusion without printing any credential or modifying `.env`.
- Authenticated `GET /v1/models` returned HTTP 200 with all three expected model IDs.
- One explicitly authorized Spark request passed through the actual MuseSpark client
  and ScoutAgent: 436 prompt + 264 completion = **700 total tokens**. No SAM or Image
  inference was attempted. Sanitized reports are in ignored `data/cache/`.
- Added `python -m scripts.live_check`: catalog-only by default; `--spark` explicitly
  permits one bounded, no-retry inference attempt with a 512-token output cap.
- Added `bash scripts/dev-live.sh`: temporary live-model profile, fictional league,
  one candidate, five-second clips, zero SAM retries, six-call scan cap, 1024 Spark
  output-token cap, minimal reasoning and scheduling disabled. `.env` is unchanged.
- Live scans only shortlist players with usable uploaded clips. An empty library
  returns HTTP 409 before queueing or inference. Rejected film skips paid card art.
- API, worker and frontend launched in that profile. Health and public configuration
  verified through Vite; browser Film library shows LIVE MODELS and the five-second
  limit. Previous mock reports remain labeled simulated.
- New checks cover credential-catalog separation, explicit bounded Spark requests,
  sanitized authentication failures and pre-inference film validation. Frontend tests
  and production build passed. No external transactions, deployments or new pushes.
- Searched official ESPN/SportsCenter and public social sources. Saved viewing links,
  provenance and two archival Creative Commons examples in `docs/VIDEO_SOURCES.md`.
  No ESPN/X/Reddit media was imported or represented as licensed analysis input.
- The 3.8-second Kobe sample download returned HTTP 429. Honored Retry-After, made
  one bounded retry, then stopped on another 429. **No video was downloaded** and
  no additional Meta inference was used. Archival footage cannot be relabeled as
  a current fictional free agent or used as current fantasy-performance evidence.

## November 3: actual user-video diagnostic

- User supplied a readable 1235.914-second (20m36s), 1920×1080 H.264 source, about
  911 MB. Original remains untouched/local. All source video extensions are now
  Git-ignored, including this root-level file.
- Added a CLI excerpt utility and a separate durable film-diagnostic path using
  existing scan jobs, model clients, caches, masks, critic, metrics and card services.
  Actual video-only subjects have null fantasy statistics and never enter the
  fictional league's free-agent list. No fantasy decision or transaction is forced.
- First excerpt (source 00:02–00:06, target GSW #30) was rejected by actual Spark
  verification. This used one request; no SAM/Image call followed.
- Selected clearer source 00:04–00:08, described only as the visible GSW ball handler.
  Spark verified the subject at 90%; no real-name identity, season or jersey number
  was asserted. Only the four-second normalized excerpt and selected frames were
  sent to Meta, never the full source.
- Actual SAM 3.1 completed in about 15 seconds and returned masks/boxes for 48 frames.
  Parsed by the official parser; masks, geometry, sampled frames and overlays saved.
- The first critic response did not satisfy the finish contract at the 1024-token
  output cap. The job failed safely with tracking retained. No raw refusal/partial
  JSON was accepted or substituted. Default low-usage cap raised to 2048 and critic
  wording made concise. `.env` was not edited.
- Explicit continuation allowed only two more calls (five total for the second
  diagnostic). It reused saved SAM tracking; **no additional SAM request** occurred.
- Actual Spark criticism scored tracking **55%**, reported a defender shrinking to
  empty court and target/defender overlap, and requested re-segmentation. This
  budget-limited diagnostic did not retry SAM. All four numerical basketball metrics
  remain unavailable; no fabricated observations, retry or accepted quality.
- Actual Muse Image generated card artwork. Pillow composited a verified source
  frame, diagnostic label, AI quality (55%) and observed-frame count (48). A later
  local typography update reused the same saved artwork with zero model requests.
- Total new inference attempts: **6** across both diagnostics (1 rejected verify;
  1 accepted verify; 1 SAM; 1 failed critic; 1 accepted critic; 1 Image). Previous
  credential test remains the separate 700-token Spark request. Dollar costs and
  aggregate tokens for film inference were not measured; do not infer them.
- Completed diagnostic: `cef273a131eb4588b8af8c718db7183b`. Safe local results in
  ignored `data/cache/live-film/results.json`; persisted stages/results in SQLite.
- Browser played the entire four-second excerpt (readyState=4, no error), rendered
  live masks and truthful unavailable metrics, and downloaded a real 1080×1350 PNG.
  Screenshot: ignored `data/cache/live-film/dashboard.jpg`. Report left open locally.
- Eight diagnostic tests cover all three actual clients with offline HTTP fixtures,
  low-quality suppression, rejected identities, a failed critic with persisted
  masks, explicit bounded continuation through REST, idempotency and source bounds.
  Frontend test confirms diagnostics show no invented statistics or transaction.
- Still no public deployment, new Git push, external fantasy transaction or full
  20-minute analysis. No additional inference is needed to view/replay/download.

## November 4: actual Sleeper NBA connection

- User supplied a username and NBA league ID. The documented generic user,
  league-ID, roster, league-user, `/players/{sport}` and matchup resource paths
  returned HTTP 200. No guessed NBA discovery or undocumented statistics route was
  used. Official discovery documentation remains NFL-only; the app labels direct
  NBA-by-ID access as observed compatibility.
- Retrieved an eight-team NBA league, its owned 14-player roster, jersey/team/position
  metadata, scoring weights, starters/bench/injury labels and period-3 fantasy points.
  API-reported team points: **195**. Example returned player totals: Mitchell 24.5,
  Towns 24, Kessler 28.5. These are period totals, not per-game averages/projections.
- Imported 443 active, assigned-team players absent from every roster/reserve/taxi
  list as the unrostered pool. This does not guarantee waiver eligibility. No minutes,
  recent raw box scores or statistical trends were returned; they remain null/empty.
- Added a persisted Workspace selector, ownership-verified read-only NBA import,
  namespaced Player IDs, League and RosterSnapshot persistence, and a sample switch.
  The existing SQLite database was backed up locally before the additive table
  initialization. No existing table/record was dropped and `.env` was unchanged.
- Guardrails, watchlist views and scan history follow the selected league. A queued
  job retains its original league's guardrails even after the active workspace changes.
  Refreshing a connection preserves that league's protections and bid limits.
- Real-roster recommendation scans are disabled in the UI and return **HTTP 409**
  before enqueue/inference until recent candidate statistics exist. Scheduling skips
  this incomplete source. The connected roster is never routed through mock models
  to invent statistics. The complete original sample scan remains available.
- Player directory persisted for 24-hour reuse; league/account/matchup reads use
  five-minute caches. The initial real directory response was reused for the first
  app import rather than downloading it twice. Cache writes are atomic.
- **65 backend tests, 7 frontend tests and production build passed.** Eight new
  backend cases cover documented paths, actual-point semantics, zero versus missing,
  ownership, malformed inputs, reserve exclusions, cross-process directory cache,
  SQLite persistence and workspace/job/guardrail isolation. A UI test connects an NBA
  fixture and checks labels, absent trends and disabled recommendations.
- Browser used the actual connect form, displayed all 14 rows and the 195-point
  summary, then reloaded successfully into the saved league. Live API smoke through
  Vite confirmed connected health, an empty per-league scan history and a 409 guard
  with **zero new jobs and zero model calls**. Total model-call rows stayed at 26.
- Receipt/cache/SQLite backup and screenshot are under ignored `data/cache/sleeper/`;
  screenshot `connected-roster.jpg`, HTTP smoke `smoke.json`. Account/league identifiers
  are saved only in local data, not hardcoded into source or environment examples.
- API, frontend and worker remain running with scheduling disabled. No deployment
  or paid data-provider request was made. The integration is included in the
  November 4 user-approved publication snapshot described above.

## November 4: next-chat handoff

- Created root `handoff.md` with the current working state and Sleeper changes,
  local run/check commands, known real-scan integration gaps and an ordered statistics,
  identity mapping, scoring, film and staging implementation plan.
- Rechecked official statistics-provider access/pricing and Sleeper scoring/format
  documentation. Provider field coverage, exact bonus rules, basketball game mode,
  FAAB applicability and a qualifying candidate's film remain important preconditions.
- No statistics subscription/key/trial was created and no new Meta inference was
  requested. This documentation turn did not change product code, restart services,
  commit, push or deploy. Existing test results remain the last executed validation.


## November 4: statistics, exact scoring and live preflight

- Added independent BALLDONTLIE statistics and normalized JSON-import adapters,
  validated per-game records, persistent identity/game tables, durable explicit
  refresh jobs, bounded pagination/timeouts, source receipts and correction upserts.
- Implemented exact per-game bonuses/aliases, missing-field reasons and comparable
  sourced recent summaries for rostered and unrostered players. Period totals keep
  their original field. Missing technical/flagrant fouls remain unavailable.
- Readiness is computed from fresh real coverage, mapping and rule/protection
  evidence. Synthetic fixtures cannot enable a real league. Refreshes retain
  separate statistics and frozen job checkpoints rather than overwriting evidence.
- Added League setup for refresh/import, identity review, rule review, current
  eligibility and game-log inspection. Protected choices must be explicitly saved.
- Fixed normal live league provenance/events/cards, optional workspace selector,
  nullable bids, current membership/protection/lock/position checks and artwork
  selection. Preflight blocks scans without a supported legal reviewed pair before
  inference. Final staging repeats the checks after model work.
- Structured spatial retries retain verified object IDs/roles and use an inspected
  frame. Target-only concept retries cannot silently lose defender/ball bindings.
  Existing 75% quality and confidence gates remain; the prior genuine 55% result
  still cannot support an ADD.
- Actual read-only Sleeper refresh succeeded: 14 rostered players and 413 active
  unrostered athletes, excluding 30 team-defense entries in the directory.
  Raw `game_mode=1`, `waiver_type=0` remain uninterpreted pending source-backed review.
- Prepared a four-second provisional Sam Hauser excerpt at source seconds 58–62.
  Identity/date/season and acquisition eligibility remain unverified; zero new
  Spark/SAM/Image requests were made for this footage. Full source stays local.
- **108 backend tests, 9 frontend tests, TypeScript/Vite build and diff checks passed.**
  The real-league-shaped offline contract uses all three actual clients and an
  actual structured spatial retry within eight fixture calls, zero paid requests.
  Synthetic gates are overridden only inside that isolated test after confirming
  the production path rejects them. A labeled PNG, full game/film evidence JSON,
  referenced media and ZIP are under ignored `data/cache/contract-scan/`.
- Actual API preflight returns HTTP 409 with zero new scan jobs/model-call rows.
  The genuine recommendation test is **not run**: no statistics source key/import,
  no verified 40/50 rule behavior or mode/waiver review, no protection selections,
  no verified named candidate film or current player-lock evidence.
- Local API/frontend/worker remain available, scheduler off, one candidate/five-second
  clips/zero retries/six-call live cap. SQLite was backed up using its backup API
  before additive tables/index initialization. No .env edits, subscriptions,
  transactions, commits, pushes or deployments.
- See docs/STATISTICS.md for setup, coverage policy, endpoints and remaining work.


## November 4: owner-confirmed rules and optional protections

- Saved the owner's explicit confirmation: Lock-In, FAAB with a $100 season budget,
  and stacking 40/50-point bonuses. Kept the evidence scoped to this league rather
  than treating numeric API codes as universal meanings. Returned remaining FAAB
  remains sourced from Sleeper; a configured season budget is not assumed to be
  the amount remaining.
- Removed the mandatory protection-review gate. Existing user-selected protections
  remain enforced; all other players can be considered from verified current stats.
  The frontend picker explains the optional policy and retains manual choices.
  The current Sleeper connection does not provide a verified do-not-drop list.
- Added a confirmed FAAB season-budget field and reject a value that conflicts
  with Sleeper's reported season budget. The missing statistics feed remains a
  real blocker; these confirmations do not invent current game logs.
- Researched source options against official documentation. Sportradar NBA's game
  summary explicitly includes player technical/flagrant foul fields; marketplace
  trial access is a candidate for evaluation. No account/trial/subscription was
  started. A Sportradar adapter is still required; its key cannot be used in the
  existing BALLDONTLIE adapter. See docs/STATISTICS.md.

- Follow-up validation: 110 backend tests, 10 frontend tests and production build
  passed. Read-only HTTP verification confirms the saved rules and that only the
  missing recent-statistics snapshot remains in the league readiness reasons.


## November 4: connected Sportradar NBA adapter

- User supplied the NBA trial key and authorized connecting real game logs. Saved
  it only in ignored `.env` with mode 0600, preserved the existing Meta key, and
  selected Sportradar trial access with a seven-day window. No account, trial or
  paid subscription was created by the app; the user obtained access.
- Implemented the official NBA v8 Schedule/Game Summary adapter with header auth,
  Eastern game dates, closed-game filtering, strict normalized counts, source
  hashes, original observation timestamps, correction-aware cache and complete
  window validation. Queued jobs retain provider/access/window/request/time/pacing
  limits without credentials. Scans read the persisted snapshot.
- Added unique shared Sportradar IDs from Sleeper for identity mapping. Names alone
  remain review proposals; conflicts remain ambiguous. Source changes invalidate
  readiness until a matching snapshot exists. No fabricated zeros fill fouls.
- Trial requests at the initial faster intervals encountered 429s and stopped.
  A four-second post-response gap and 180-second timeout completed the same bounded
  window under the unchanged 60-request cap. Failed jobs remain in history.
- Successful complete network refresh: 39 games, 1,367 player observations,
  527 athletes, 38 requests and 2 cache hits. Cache-only DNP normalization reused
  all 39 receipts with zero additional network requests and kept original per-game
  fetch timestamps. Idempotent storage remains 1,367 rows.
- Readiness now derives true for the actual data snapshot: 100 supported unrostered
  candidates and 6 supported roster comparison subjects. Other roster members have
  two played games or explicit DNPs; no short sample or DNP is represented as a
  three/five-game average. Period totals remain separate from recent per-game scores.
- Nonzero non-unsportsmanlike technical fouls remain unavailable until their Sleeper
  scoring treatment is verified. Personal/team/coach fouls never substitute.
- Sleeper added `last_scored_leg` on refresh. Classified it as scoring progress,
  retained the owner's confirmed Lock-In/FAAB-$100/stacking rules, and added a
  regression test for rule preservation.
- **134 backend tests, 10 frontend tests, production build and diff checks passed.**
  Browser verification shows the connected source, actual roster averages and
  explicit DNP counts. HTTP checks confirm source/player-log endpoints, credential
  redaction, zero active scans and zero new model-call rows. Current reviewed legal
  add/drop pair count remains zero; no recommendation scan was forced.
- Evidence: ignored `data/cache/sportradar/connection-report.json`, `http-smoke.json`,
  `connected-game-logs.jpg`, `live-job.json`; raw hashes/manifests under
  `data/cache/stats/sportradar/`. A SQLite backup preceded the real import.
- Local API/frontend/worker remain running. Scheduling is off; the Meta profile
  still permits one candidate, five seconds, zero SAM retries and six maximum calls.
  No new Meta inference, fantasy transaction, commit, push or deployment occurred.


## Scan usability fix — November 4, 2026

- The user's latest game-log refresh completed successfully; the displayed error
  came from scan transaction preflight and persisted during unrelated actions.
- Separate statistics/film readiness from transaction readiness. Unknown waiver
  status or drop locks permits a scouting report, with a visible report-only notice.
- Unknown eligibility withholds every ADD verdict and staged move, including a
  model ADD with no proposed move. Current rules, membership, protections,
  comparable scores, budget and position fit remain required for recommendations.
- Bootstrap and enqueue share read-only preflight. Both the desk and League setup
  show the actual filmed candidate: currently Sam Hauser, with provisional footage
  whose identity must pass model verification. This is not verified ADD evidence.
- Added Refresh Sleeper roster with a fresh provider client, distinct from game-log
  refresh. Added concrete candidate/drop review steps; successful setup actions
  clear old scan errors. Preserved live limits in ignored `.env` for future restarts:
  1 candidate, 0 SAM retries, 6 calls, 5-second clips, scheduler off. Keys preserved.
- Validation: 138 backend tests, 11 frontend tests, production build, actual
  localhost preflight ready with zero legal pairs; no scan was started and no
  new inference was requested. Offline HTTP contracts cover both reviewed and
  unknown eligibility paths through a completed scan, PNG and evidence download.
- API/worker reloaded. Audit: `data/cache/scan-usability/verified-readiness.json`.

## November 4: guided product workflow

- Reworked first use around a clearly labeled sample scan and editable position requests. Empty analysis panels no longer precede a result.
- Added readiness-based next actions, direct links to focused league setup sections, and a clear distinction between scouting reports and actionable add/drop recommendations.
- Put the recommended move and player verdicts before film. Collapsed the next request, technical audit, downloads and league overview after report completion.
- Renamed Autopilot to Scouting preferences, clarified verdicts/confidence and the Sleeper handoff, and disabled unavailable scheduling controls.
- Added explicit player selection/search for film uploads, global readiness refresh after processing, and a return to scouting.
- Added labeled mobile navigation, retained tablet labels, named progress phases, keyboard access and reduced-motion handling.
- Product rationale, design review, contrast measurements and the remaining input/reliability gaps are recorded in `docs/PRODUCT_DIRECTION.md`.
- Validation uses an isolated mock preview database and cached local dependencies. Existing live league data and credentials are untouched. No paid inference, transaction, push or deployment is part of this change.
- Checks passed: 138 offline backend tests, 19 frontend tests, TypeScript/Vite production build and mock-only HTTP smoke (three candidates, PNG/video verified, zero live calls). Browser checks cover the completed sample, changing players, playback, mobile navigation and 390px/320px layouts without horizontal overflow. Preview screenshots are ignored under `data/cache/usability-*.jpg`.

## November 4: automatic live scan preparation

- Live API scans now perform durable worker-side Sleeper refresh and conditional bounded game-log refresh before freezing the scan snapshot. They preserve league selection, rules and protections. Missing preloaded clips or stale cached scores no longer prevent starting a scan.
- Added an authorized footage-catalog adapter with exact NBA ID/date matching, bounded local/HTTPS extraction, provenance and visual verification. Added bounded cached ESPN player-highlight metadata discovery; public viewing links remain separate from analyzed media.
- Live models are the default, with explicit demo startup. The local checkout now uses existing live credentials and a copied league database, preserving the original checkout, the one-candidate/six-call cap, five-second clips and disabled scheduling. Credentials and runtime data remain ignored.
- Updated the interface for connect → Run live scan → six understandable processing stages → evidence/report. Reports surface missing film, source links, real call counts and focused recovery steps.
- Offline validation: 153 backend tests and 22 frontend tests passed; TypeScript/Vite build passed. Full HTTP contracts exercise automatic preparation and all three actual model clients without paid inference. Tests isolate live runtime limits so the personal five-second profile does not alter the sample fixtures.
- Read-only live checks: Sleeper roster refreshed with confirmed rules preserved; 100 supported recent-stat candidates retained; ESPN metadata returned one player-specific Sam Hauser viewing link. Source timestamps are preserved; stale game logs will be refreshed when the worker is permitted to run.
- Automatic approval review rejected starting the live worker because the specific league/footage payload and Meta destination require approval before paid requests. No worker was started and no new paid scan was enqueued. The reviewable six-call verification plan is in ignored `data/cache/live-workflow-verification-plan.json`.
- Remaining external input: a current footage source with processing permission is needed for automatic video acquisition beyond existing authorized uploads. The source question is pending; no public video download permission was invented.

## November 4: approved public footage and bounded live verification

- User chose recent public ESPN/social clips for private analysis and explicitly approved the one-candidate, six-call Sam Hauser verification. Public ESPN import is enabled only in ignored local `.env`; the example defaults off. No publisher license is inferred from this preference.
- Added direct public ESPN MP4 acquisition with exact player metadata matching, recent game dates, bounded excerpts, attribution and visual-verification status. Auth/DRM/rate-limit restrictions are not bypassed. A five-second November 1 Hauser clip was downloaded and inspected locally with zero model calls, then made available in the main film library for future scans. Dated public sources take priority over undated legacy uploads in this mode.
- Approved scan `851f03c574bc422faf73f4c1ca4b0ae0` completed with **5 actual Meta calls** under its original six-call cap: scout, visible identity verification, SAM tracking, critic and decision. It used the approved existing four-second upload. No paid image request, automatic paid retry, transaction, push or deployment occurred.
- Automatic source refresh completed: 40 bounded Sportradar requests, complete persisted game logs, confirmed rules retained. Sleeper membership/scoring refresh also succeeded. The scan keeps original source timestamps and its frozen inputs.
- The first scout call conflated player inspection with a strong-add decision. Exact named inspection requests now select that player deterministically without a scouting call. The original scout output remains in the checkpoint; continuation stayed in the same accumulated budget.
- The decision response put sourced-statistics identifiers (`minutes`, `recent_fantasy_average`) in the film-metric reference field. Strict validation rejected them. Unsupported interpretations now yield a conservative MONITOR/withheld report, zero claimed verdict confidence and no move. Raw output and warnings remain auditable. This case was recovered from cached outputs with the process cap set to the five calls already used, preventing additional paid requests.
- Decision prompts now supply per-player allowed film-metric names. Underlying strict validation still rejects unsupported metric references directly; missing metrics are never invented or converted to measurements.
- Final result: one Sam Hauser report, accepted identity check, stored tracking and an available screen-space defender-distance proxy; no roster move recommended. This verifies live execution and conservative handling, not fantasy prediction accuracy.
- Final validation: **161 backend tests, 24 frontend tests and production build passed**. Actual public download and source provenance were also checked. Idle live worker and API are running; zero pending jobs and scheduling off were verified before worker startup. Future scans require an explicit app action and retain the one-candidate/six-call limit.
- Evidence is ignored under `data/cache/`: `approved-live-scan.json`, `live-workflow-result.json`, `public-footage-check.json`, and the updated verification plan. The original checkout and credentials remain preserved.

## November 4: backend completion review

- Completed dated jersey/team roster matching, per-player sourced statistics, independently reviewed tracking and guarded recommendations. Automatic alternative-clip evaluation shares identity verification and reserves the final report within the accumulated six-call live profile.
- The real Sam Hauser fallback scan used four of six calls and switched from 0–5 seconds to 11–16 seconds of the same ESPN highlight. Neither excerpt supplied reliable measurements; the final MONITOR report withheld unsupported film evidence and staged no move. Details and remaining coverage limits are in `docs/AUTOMATIC_SCANNING.md`.
- Review fixed overlapping alternatives prematurely ending discovery and repeated imports leaving unused normalized videos. Regression tests cover a later distinct clip and idempotent imports that preserve the retained media.
- Final checks: **225 backend tests, 35 frontend tests, TypeScript/Vite production build, Python/frontend formatting, dependency validation, shell syntax and whitespace checks passed**. One upstream Starlette TestClient deprecation warning remains. No additional paid model requests ran during this review.
- The completed code, supporting interface, tests and documentation are prepared on the isolated `feature/backend` worktree. Local Codex configuration remains untracked; credentials, databases, source footage and runtime audits remain ignored and preserved. No merge or push is part of this work.
