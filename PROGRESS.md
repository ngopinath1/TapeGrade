# TapeGrade progress

Last verified: November 4, 2026, America/New_York.

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
