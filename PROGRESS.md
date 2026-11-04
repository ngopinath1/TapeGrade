# TapeGrade progress

Last verified: November 3, 2026, America/New_York.

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

- **57 backend tests passed** on Python 3.12.14; affected diagnostic/route checks
  rerun after the final local changes.
- **6 frontend tests passed**; TypeScript and Vite production build passed.
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
2. **Live NBA provider unavailable.** Sleeper documents NFL league discovery. Both
   inference modes use the clearly fictional basketball league; DEMO_MODE=0 refuses
   scans until a supported basketball provider is added.
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
