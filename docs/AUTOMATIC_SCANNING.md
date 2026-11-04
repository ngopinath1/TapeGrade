# Automatic live scanning

The normal app flow is connect Sleeper, run a scan, review the report. Per-player uploads and manual game-log refreshes are no longer scan prerequisites.

## What runs automatically

1. The API records a durable live scan with the selected league ID and the existing call limit.
2. The worker refreshes that league’s roster, available players and settings through Sleeper. It does not change the user’s selected workspace if they switch pages or leagues.
3. Recent game logs are reused within the configured freshness window, or refreshed through the configured statistics provider. Partial, failed, stale and synthetic batches cannot qualify real comparisons. Source timestamps remain visible.
4. Muse Spark shortlists players from supported current comparisons. The worker searches existing permitted uploads and the authorized footage catalog, preferring available film among comparable fits.
5. Missing film triggers bounded, cached player-specific ESPN metadata discovery. When the user enables public-source private analysis, a matching direct public ESPN MP4 is downloaded and prepared as a short excerpt with source attribution and game date. The excerpt still requires visual identity and tracking checks. With this option off, or when media access fails, source links remain viewing links and do not supply measurements.
6. Available permitted video is checked with the actual Spark/SAM clients. If identity, tracking or supported measurements are unclear, the scan automatically tries a different eligible clip within the remaining budget. Identity uncertainty and poor tracking withhold metrics and moves. Image generation is skipped when the evidence or remaining budget does not qualify.
7. Final transaction checks still validate current membership, locks, protections and limits. Unknown acquisition/drop eligibility does not become permission to recommend an executable transaction.

The visible stages are Refresh league → Update scores → Find players → Find footage → Check film → Build report. Errors retain completed work. A deliberate retry of a failed preparation can refresh data again, while paid model caches and the scan’s accumulated call count remain intact.

## Server setup

Use the existing `MODEL_API_KEY` and statistics provider credentials in ignored `.env`. Start `bash scripts/dev-live.sh`. Its one-candidate, six-call, five-second profile remains bounded and scheduling stays off. The explicit `scripts/dev-demo.sh` is the simulated alternative.

`STATS_AUTO_REFRESH_MINUTES=60` controls refresh frequency; it does not relax statistical readiness, sample-size or transaction gates. The existing provider request, time and pacing limits remain enforced. Interrupted refreshes are not automatically replayed as successful data.

## An authorized footage library

A library can supply local files or direct HTTPS media from explicitly allowed hosts. Configure it once, then scans match and prepare clips automatically using the shared NBA player ID and a recent game date.

```dotenv
FOOTAGE_CATALOG_PATH=/absolute/path/to/catalog.json
FOOTAGE_MEDIA_ROOT=/absolute/path/to/permitted-media
FOOTAGE_ALLOWED_HOSTS=["media.your-licensed-provider.example"]
FOOTAGE_MAX_AGE_DAYS=7
FOOTAGE_DISCOVERY_ENABLED=1
```

The catalog is a JSON array. For example:

```json
[
  {
    "nba_id": "1630573",
    "game_date": "2026-11-01",
    "title": "Player-specific possession",
    "source_ref": "https://your-provider.example/original-source",
    "rights_reference": "Your source agreement permitting local and model analysis",
    "path": "permitted-game.mp4",
    "start_seconds": 58,
    "duration_seconds": 4
  }
]
```

Use `url` instead of `path` for a direct HTTPS video file. Only configured hosts are requested; private network addresses, redirects and oversized downloads are rejected. Local paths must remain inside the library root. Processing uses a bounded excerpt, strips audio, retains source/date/rights provenance and leaves identity pending until visual verification. Historical or future-dated catalog entries cannot qualify as current film. Do not put credentials in source references or browser-visible metadata.

The catalog adapter does not create subscriptions or acquire media rights. User-enabled public-source analysis is separate:

```dotenv
PUBLIC_FOOTAGE_ANALYSIS_ENABLED=1
```

This option records the user's choice to analyze public highlights privately, without describing that choice as a publisher license. Direct public ESPN MP4 links are supported. Authentication, geographic restrictions, DRM and rate-limit responses are not bypassed. Public metadata lookup reads official ESPN schedule and game-summary JSON, requires exact full-name references, limits requests and caches responses for 30 minutes. Metadata-only mode does not download video.

The user's suggested YouTube, Twitter/X and Reddit clips can be source material when accessible. This implementation currently retrieves matching ESPN publisher files directly, rather than depending on social reuploads or downloading irrelevant weekly compilations. There is no claim of a comprehensive YouTube/X/Reddit search adapter.

## Validation and current local state

Offline coverage exercises automatic enqueue, refresh ordering, source failures, freshness, workspace isolation, targeted refresh jobs, exact athlete matching, source provenance, local excerpt extraction and all three actual HTTP clients through the complete scan path. These are fixtures, not a paid accuracy benchmark.

The connected local league and existing credentials have been copied into this checkout’s ignored runtime files; the original checkout is preserved. Live mode and the six-call limit were verified. A read-only Sleeper refresh succeeded, preserved confirmed rules and retained supported Sportradar comparisons. Actual ESPN metadata lookup found a Sam Hauser highlight dated November 1. Following the user’s explicit public-source selection, a five-second excerpt was downloaded, normalized and visually inspected locally with zero model calls. The first bounded Meta verification used the previously supplied four-second upload. The subsequent ESPN verification below uses the newly discovered five-second highlight throughout.

Automatic approval review initially blocked the live worker. The user then approved the specific Sam Hauser payload and six-call cap. The bounded verification runs only its own scan, with scheduling off. Its plan, source preparation and final accounting are stored in ignored `data/cache/live-workflow-verification-plan.json`, `public-footage-check.json`, and `approved-live-scan.json`.

The first actual scout call exposed a separation bug: it skipped an explicitly requested inspection because the player was not already a strong add. Explicit named reviews now select the player deterministically without a scouting call. The original scout response is preserved, and continuation stays inside the same accumulated six-call budget. Film selection never forces a positive identity, tracking score or roster verdict.

## Earlier upload verification

The approved Sam Hauser scan completed with five actual Meta calls inside the six-call cap. Automatic Sleeper refresh and the bounded Sportradar update completed first. The test used the previously approved four-second upload; direct ESPN acquisition was separately verified without model calls, and the dated five-second ESPN excerpt is now ready in the film library.

Two production behaviors were corrected during verification: explicit named inspections no longer spend a scouting call deciding whether to inspect, and invalid model evidence references become a withheld interpretation rather than an unusable failed screen. The test’s original scout output and invalid-reference warning remain saved. Recovery consumed cached output with additional paid calls disabled.

The completed report deliberately recommends no move. It contains the stored verification and tracking evidence, unavailable metrics remain unavailable, and the unsupported interpretation has zero claimed confidence. No image-generation call or roster transaction was made. Live inference, including accepted model responses, is not by itself validation of fantasy prediction accuracy.

The API and an idle live worker are running, with scheduling disabled. Starting another scan is an explicit user action and retains the configured six-call limit. Offline checks: 161 backend tests, 24 frontend tests and the production build passed.

## Completed ESPN discovery-to-report verification

The user requested a fresh end-to-end test of the ESPN highlight under a six-call total cap. Scan `748cfa61db7d45728ca89233b4083428` completed with **four actual Meta calls**, all successful: Spark verification, SAM tracking, Spark tracking review, and Spark decision. No further model calls were made during fixes or UI checks. No generated artwork or roster transaction was requested.

Automatic Sleeper refresh and a fresh Sportradar batch ran before analysis. Forced ESPN discovery made four uncached metadata requests, found clip `50351816`, downloaded the public publisher MP4, and prepared the five-second excerpt. Its content hash matched the existing normalized ESPN excerpt, so storage deduplicated it; the old four-second upload was not analyzed. The source game roster matched Sam Hauser, BOS #30. The report saved actual tracking over 60 frames, source references, identity crops, statistics, critiques, a PASS verdict, and a locally rendered PNG.

Player identification now combines the source game's dated roster, a clear visible jersey/team reading spatially bound to frame-zero target ID 1, and continuity across multiple inspected frames. Spark reads the jerseys in its existing verification call; this is not a separate trained OCR service. The tracking review explicitly checks target identity and opposing-team roles. Names resolve only when a visible team/number uniquely matches the game roster; unreadable players remain unnamed. No face matching is used. Publisher titles or expected roster numbers alone cannot satisfy the identity gate.

For this clip, target identity was corroborated from visible BOS #30 at 0.0 and 2.0 seconds, with continuity inspected at 0.0, 1.0 and 2.0 seconds. The independent tracking review retained target identity but found an opponent track drifting onto empty court in later frames. Final tracking quality was 45%; all numerical film measurements were withheld. The report therefore recommends PASS and stages no move. Identifying the target does not establish accurate tracking of every opponent or fantasy predictive accuracy.

The Film room exposes roster provenance, original-frame links, jersey crops and seed-frame names. Unreliable overlays are hidden by default and explicitly labeled when opened for inspection; resolved names are not applied to rejected tracks. Tracking acceptance now uses the final identity and quality gates, and card progress names image generation only when an image call is actually permitted. A corrected tracking review can recover an earlier tracking rejection without upgrading an unconfirmed seed.

Final validation: **181 offline backend tests, 28 frontend tests and the production build passed**. Browser verification confirmed five-second playback with no media error, loaded jersey images, and hidden unreliable overlays. The current local API and idle worker run the updated code with scheduling off and the six-call cap retained. Full accounting is in ignored `data/cache/espn-fullflow-verification.json`; the persisted result is in `data/cache/espn-fullflow-result.json`.

## Named players, statistics and recommendations

Scans now build a profile for every named, readable seed player in the clip. Each ESPN game-roster identity must uniquely match the statistics feed's full name, team and jersey number, and the provider must record that athlete as having played in the dated game. Statistics are read from the scan's original completed batch, not an unrelated newer refresh. League membership is joined using shared NBA/Sportradar IDs; conflicting IDs, ambiguous matches and unknown membership cannot turn into an available-player recommendation. The automatic Sleeper snapshot now retains other teams' rostered players for this membership check.

Each profile includes up to five completed observed games, points/rebounds/assists/steals/blocks/threes, minutes, exact fantasy scoring, sample sizes, retrieval times and links to the saved source box scores. Missing values remain missing. Fewer than three games, synthetic, incomplete or stale data cannot qualify recommendations. These joins do not write a guessed global player crosswalk.

The existing tracking-review call now checks each named ID independently. Per-player measurements recenter the same tracking output on that player's ID, exclude teammates and exclude unconfirmed or failed opponent tracks. A positive general target check cannot override a contradictory per-ID check. Only a player with accepted identity continuity, reliable measured film, ready statistics and a confirmed available-player ID can join the final recommendation call. Up to six candidates can share the final comparison; reusing an accepted track does not require another verification or SAM call. The configured separate-clip and total model-call budgets remain enforced. Raw tracking stays in the segmentation cache; accepted displayed tracks omit IDs that failed review.

The decision receives each candidate's own metrics, statistics, ownership context and source evidence. Raw frame-by-frame tracking is omitted from this reasoning payload to reduce unnecessary input tokens. Existing current-eligibility, scoring, protected-drop, confidence and final transaction checks still apply. Players on another fantasy roster are labeled for trade research rather than promoted to free-agent adds. Other profile statuses are explicitly evidence screening until included in the final comparison.

The existing ESPN report was enriched with **zero additional model calls**, preserving its original decision and a backup of the original result. A read-only Sleeper refresh established current membership; all performance data came from the saved Sportradar batch. Sam Hauser has 7.00 fantasy points/game over three games (unrostered, original PASS), Franz Wagner 24.33 (rostered elsewhere, trade research), and Jamal Cain 6.33 (unrostered, MONITOR screening because his individual tracking continuity has not qualified). These are the connected league's weighted fantasy scores, not NBA points averages. The source clip still does not support an ADD.

`python -m scripts.enrich_players --scan-id ID` previews a completed report's saved-data enrichment without network or model calls; `--write` stores the profiles after backing up the result and checking for concurrent changes. Existing decisions are preserved. New scans perform this enrichment automatically before their final model comparison. The enrichment audit is in ignored `data/cache/player-profiles-verification.json`.

Latest validation: **197 backend tests, 31 frontend tests and the production build passed**. Coverage includes separate-player scoring, shared-ID conflicts, dated appearances, missing data, stale/synthetic batches, opponent attribution, failed-track exclusion and multiple available players sharing one final decision call. Browser checks confirmed all three profiles, league membership labels and Cain's three source-linked game rows. Total live model calls for the ESPN test remain **4 of 6**; no new paid inference or roster transaction ran during enrichment.

## Automatic alternative-clip evaluation

`MAX_CLIPS_PER_CANDIDATE=2` enables automatic fallback by default. A scan prepares up to two relevant clips for the same player from existing uploads, the configured catalog and the bounded ESPN lookup. Clip IDs, content hashes and source time ranges prevent duplicate or overlapping footage from counting as different clips. The same URL requires explicit non-overlapping ranges; without range evidence it remains a duplicate. Media preparation is bounded, and access-denied or rate-limit responses stop further imports from that source. Sources retain their date, attribution and identity checks.

When two clips are available, a single Spark request returns separate identity checks using explicitly mapped frame indices for each clip. It never transfers a jersey reading or seed box between clips. The worker evaluates the first clip, then automatically switches when identity, tracking, or usable measured evidence is insufficient. A different prepared clip takes priority over refining an unclear first clip. Same-clip SAM correction remains available on the last clip when configured and budgeted.

The final report's call is reserved before any tracking pass or fallback starts. For a named-player inspection, the shared verification, two SAM passes, two critic passes and final decision total six calls. Paid scouting, earlier candidates and failed requests consume that same accumulated budget; if a full alternate analysis cannot fit, the worker finishes the report with an explicit budget notice. Generated artwork is replaced with a local evidence card when no call remains. The limit is never renewed by switching footage or restarting the worker.

Clip plans, identity checks, completed clip trials and final decisions are checkpointed. A resume does not reanalyze an already-completed clip or repay a saved final decision. Perception logs use separate attempt IDs and clip references, retaining the first clip's rejected evidence. The selected clip and its player profiles supply the final measurements; unsupported observations from rejected footage are not averaged into them. If both clips are unclear, the report retains the best available clip, explains the failed checks and withholds unsupported measurements. Network/schema errors do not trigger automatic paid retries.

Progress explicitly says when footage is switching. The Film room includes an automatic clip-selection notice and expandable checks showing which clip is used and why each attempt passed or failed. Old reports without fallback metadata remain unchanged.

Validation: **211 backend tests, 34 frontend tests and the production build passed**. Offline worker contracts exercise tracking failure → alternate success at exactly six calls, identity rejection → alternate success at four calls, successful-first-clip early exit, missing measurements, both clips failing, unavailable/duplicate sources, insufficient budget, access/rate limits, and recovery after the first clip or final decision. No paid model calls were used for this feature's tests. The existing ESPN verification remains at four calls; live mode now allows two clips while retaining the six-call cap and disabled scheduling.

## Real Sam Hauser fallback verification

The user authorized a new six-call live test. Scan `adbe3ce155e248cd9787ad183f7aebbd` completed with **four actual, successful Meta calls**: shared clip identity verification, SAM tracking of the first excerpt, Spark tracking review, and Spark final decision. Automatic Sleeper and Sportradar refresh completed first. A persisted `SWITCHING_CLIPS` event confirms that the first failed evaluation triggered the alternative. No further model calls were made during fixes or report verification.

Source discovery exposed a coverage gap: only one recent player-specific ESPN highlight was available, and its importer previously retained only the opening five seconds. The 16-second source contains a later camera view. When only one short publisher highlight exists and it contains at least two analysis-window lengths, discovery now offers a non-overlapping ending excerpt. Source spans, canonical source keys and overlap checks preserve the distinction between a new excerpt and repeated footage. Separate highlights remain preferred. The UI explicitly labels shared-highlight excerpts as the same play, not independent game samples.

This test used source clip `50351816`, game date November 1: **0–5 seconds** first and **11–16 seconds** second. The first excerpt passed Hauser identity verification but its defender tracks drifted, yielding 45% quality and no qualifying measurements. The worker automatically checked the second excerpt; its opening frame did not establish a readable BOS #30 identity, so it was rejected without an unnecessary SAM request. Both checks remain saved, with the original visual rejection reason shown directly rather than a list of internal seed requirements.

The final verdict is **MONITOR**, confidence 45%, no staged move, no paid artwork, and all unsupported film measurements withheld. The report retains the first excerpt as the best available view and displays both outcomes and source ranges. This verifies the real automatic-switch behavior; it does not claim that the alternative supplied usable film measurements. No identity or quality threshold was relaxed to force an outcome.

Latest validation: **222 backend tests, 35 frontend tests, production build, saved-report UI and source playback/download checks**. The ignored audit `data/cache/live-fallback-verification.json` includes call accounting, clip ranges, outcomes, actual model operations, the switch event and final result. `data/cache/live-fallback-report.png` captures the report's two checks. The local API and idle worker run the fixes with scheduling off and the six-call cap retained.

The completion review also fixed an overlapping alternative prematurely ending clip selection when a later distinct clip existed, and repeated imports leaving an unused normalized video after content-hash reuse. The bounded discovery search now skips rejected overlaps, and imports retain the existing clip while removing only the new unused output. Regression tests cover both cases. Final validation: **225 backend tests, 35 frontend tests, production build, formatting, dependency, shell syntax and whitespace checks passed**, with one upstream Starlette TestClient deprecation warning. This review used no additional paid model calls.
