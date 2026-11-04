# Recent statistics and real-league readiness

The local app now has a **League setup** page. It can refresh a configured NBA
statistics source, import a normalized licensed JSON batch, review athlete IDs,
record league-rule evidence, and inspect roster/free-agent game logs. The complete
fictional sample remains available through Connect Sleeper.

## What is implemented

- Provider-neutral Pydantic game records with source references, provider athlete
  and game IDs, season starting year, season type, final/participation status,
  minutes, fetch timestamps, explicit synthetic flags and observed-field coverage.
- A persistent Sleeper-to-statistics crosswalk. Unique shared NBA IDs can link
  automatically; exact normalized names generate review proposals. Punctuation,
  accents and suffixes normalize; collisions stay ambiguous. Team transfers do
  not reject a match. No fuzzy identity assignment.
- An independent, durable refresh queue processed by the existing worker. Date
  windows are at most 30 days. BALLDONTLIE requests use the documented `/v1/stats`
  route, season/date filters and cursor pagination, with page/time caps and no
  automatic HTTP retries. Incomplete refreshes retain the last complete snapshot.
- Game rows upsert by provider/game/athlete; later final-score corrections replace
  older observations. Older arrivals cannot roll back a newer correction. Explicit
  refreshes re-fetch the bounded window for revisions; scans use persisted data
  and never request hundreds of player feeds individually. Refresh is intentionally
  explicit, rather than an automatic background subscription.
- Per-game scoring normalizes turnovers and threes, derives missed shots and
  double/triple doubles, then applies the current saved league weights. Decimal
  arithmetic avoids prematurely rounding per-game values. Enabled unknown rules
  or missing fields produce an unavailable score, with reasons. Personal fouls
  never substitute for technical/flagrant fouls.
- The most recent five observed final games in the declared window are summarized,
  with at least three required for readiness. Previous minutes require five earlier
  games. DNPs and unfinished games are excluded; unknown participation blocks that
  player's readiness. Actual zero statistics remain zero. Exact displayed averages
  can remain visible with stale/synthetic warnings, while readiness stays false.
- Period points remain in `fantasy_points`; `recent_fantasy_average` is a distinct
  field. Both roster and candidate summaries retain sample size, dates, raw game
  fields, scoring events, cache/source references and persistent row IDs.
- Readiness is derived on each snapshot read, with a 24-hour default freshness
  limit. Synthetic inputs never qualify a real league. At least one supported
  candidate and unprotected supported drop must exist. Rule reviews are keyed to
  scoring/settings/season. Scoring-progress markers do not invalidate confirmed rules;
  existing optional protections are preserved for players still on the roster.
- Real jobs reject mock models and freeze their evidence in the checkpoint. A
  deterministic limit narrows the model's input to at most 12 supported candidates
  with usable uploaded clips before Spark shortlists the configured scan count.

## Connected Sportradar NBA source

The Sportradar NBA v8 adapter is implemented and connected using the trial key the
user supplied. The key is stored only in the ignored backend `.env`, with owner-only
file permissions. The existing Meta credential was preserved; no account, trial or
subscription was created by the app. Public status exposes key presence only.

The first successful complete import covers **October 29–November 4, 2026**:
39 closed games, 1,367 player observations and 527 athletes. Exact recent coverage
supports 100 free agents and 6 rostered players; other players are explicitly
unavailable or have fewer than three observed games. Six supported roster players
are possible comparison subjects, not automatic drop recommendations. Period points
remain separate. The complete network refresh used 38 requests plus two cache hits;
subsequent DNP normalization reused all 39 game receipts with zero network requests.
No Meta inference or fantasy transaction occurred during this connection.

Configuration for a bounded trial refresh:

```dotenv
NBA_STATS_PROVIDER=sportradar
SPORTRADAR_API_KEY=
SPORTRADAR_ACCESS_LEVEL=trial
STATS_WINDOW_DAYS=7
STATS_MAX_PAGES=60
STATS_TIMEOUT_SECONDS=180
SPORTRADAR_MIN_INTERVAL_SECONDS=4
```

The actual key is already present locally; do not replace it with the blank example.
Restart API and worker after changing configuration. Refresh through League setup.
The request-count and time limits are saved on each queued job, including provider,
access level and pacing. No secrets enter the job checkpoint.

The adapter uses the documented [NBA Schedule](https://developer.sportradar.com/basketball/reference/nba-schedule)
and [Game Summary](https://developer.sportradar.com/basketball/reference/nba-game-summary)
routes with `x-api-key` header authentication. It retrieves each closed game's full
player list once, rather than requesting each athlete individually. It validates
season/year, IDs, completion, Eastern game date, participation and box-score counts.
Sleeper's `sportradar_id` supplies a shared identifier for automatic unambiguous
matches; names alone still require review. Request bodies and auth headers are not
logged. Successful response bodies are hashed and cached with original observation
times and source references.

Trial calls use a conservative four-second gap after each response completes.
The initially faster profiles encountered 429s; each attempt stopped without an
HTTP retry or partial snapshot replacement. Their failed refresh records remain in
SQLite. The slower bounded refresh completed. Cached schedules expire after ten
minutes; closed-game receipts are rechecked after ten minutes (four hours for older
games) when an explicit refresh needs them. Scans reuse persisted logs.

Sportradar distinguishes `tech_fouls` from `tech_fouls_non_unsportsmanlike`. When the
latter is explicitly zero, technical scoring is unambiguous. A missing subtype or
nonzero non-unsportsmanlike count leaves TF unavailable pending verified Sleeper
semantics. Flagrant fouls map from the player's `flagrant_fouls`; personal/team/coach
fouls never substitute. Raw subtype counts remain in the source receipt.

Explicit inactive/not-playing reasons are recorded as DNPs, excluded from played
game averages and visible as recorded DNP counts. Missing participation without such
evidence remains unknown; it does not count toward the played-game sample size.

The BALLDONTLIE adapter and licensed JSON import remain alternatives. The
[official BALLDONTLIE documentation](https://docs.balldontlie.io/) does not establish
technical/flagrant foul coverage in its game-stat sample; that adapter leaves those
fields missing and cannot independently qualify exact scoring for this league.

For imports, POST a `StatsBatch` JSON to `/api/stats/import`, or use the file picker
in League setup. `/docs` exposes the full schema. Required batch fields are
`provider`, `start_date`, `end_date`, `fetched_at`, `complete`, `source_ref`,
`athletes`, `games` and `synthetic`. Each game identifies its athlete and game,
season/type, status, participation, nullable minutes, box-score fields, fetch time,
source reference and synthetic flag. Use `synthetic: true` for fixtures, including
all fixture games. Only a complete, correctly attributed real feed can qualify.
The upload must cover the whole declared window for the supplied athletes, rather
than a favorable hand-picked subset.

## Rules and transactions

[Sleeper's scoring guide](https://support.sleeper.com/en/articles/4645009-what-scoring-settings-are-available)
confirms double-double/triple-double stacking. Separate 40/50-point stacking still
requires authoritative or known-game evidence. League setup records `stack`,
`highest_only`, or `unknown`; the engine does not assume a default.

[Sleeper's format guide](https://support.sleeper.com/en/articles/4644860-league-formats-game-modes)
explains one counted game per player per week in Lock-In. The app compares per-game
scores; it does not multiply them by scheduled games for weekly value. The actual
connection reports raw `game_mode=1` and `waiver_type=0`; these numeric enums are
not decoded globally. The league owner confirmed Lock-In, FAAB with a $100 season
budget, and stacking 40/50-point bonuses in this chat on November 4. These are now
saved as source-backed, league-specific rules. A returned $100 budget does not prove
FAAB applies. [Sleeper's waiver guide](https://support.sleeper.com/en/articles/4678615-how-do-faab-and-waivers-work)
describes the distinction between bidding and priority waivers.

Protections are optional user overrides selected in Autopilot. An empty list does
not block recommendations: unprotected players are evaluated from current verified
statistics. Existing explicit selections remain enforced. The current Sleeper
connection has no verified do-not-drop field; it does not infer protections from
roster membership, starters or reserves.

Scan preflight requires supported statistics and an existing usable uploaded clip.
Unknown transaction eligibility allows a **scouting report only** scan. The bootstrap
response and both Scouting desk and League setup show the candidates with film and
the transaction-review notice before inference. Unknown eligibility never produces
an ADD verdict or staged move, even if a model returns ADD without a proposed move.
Final staging checks fresh membership, supported comparable statistics, current
protections, add permission, capacity and a bipartite position assignment. Player
availability and drop/Lock-In locks are not exposed by this public integration.
League setup therefore accepts explicit user-reviewed eligibility evidence with a
source reference, expiring after five minutes; a fresh Sleeper roster refresh is
also required. Unknown eligibility produces no move. Priority/free-agent moves
have `faab_bid: null`; verified FAAB claims require a known remaining budget and
respect the user's cap. No transaction is executed.

In League setup, use **Refresh Sleeper roster** for current roster membership and
rules, then save eligibility for the free agent and the proposed rostered drop in
**Current transaction eligibility**. The drop must have supported recent scores and
fit the position slots after the swap. Run within five minutes of these checks.
**Refresh game logs** is separate: it updates statistics, not waiver status or locks.
Successful setup actions clear stale scan errors. The saved connection refresh uses
a fresh Sleeper client so cached membership is not stamped as newly fetched.

## Film and bounded testing

Structured critic corrections specify a source frame and boxes for every verified
object ID while retaining target/defender/ball roles. They must refer to an inspected
frame and pass bounds checks. Multi-object tracking never follows a target-only
concept retry that would lose those bindings. Numeric metrics still require at
least 75% quality; ADD also requires verified identity, measured references and the
saved confidence threshold. The earlier genuine 55% result remains ineligible.

A four-second **provisional**, unverified Sam Hauser excerpt is prepared from the
user-provided local video at source 58–62 seconds. Its game date and season are
unknown. It has not been sent to Spark or SAM and cannot yet support an ADD. The
full 20-minute source remains local. Do not confuse this with verified named film.

The offline real-league contract test first proves synthetic statistics are blocked,
then uses an explicit test-only snapshot patch to exercise all three actual HTTP
clients, a spatial retry, nullable-bid staging and downloads. There is no production
switch permitting synthetic readiness. Eight fixture requests cover that test;
**zero paid requests** occur. Its card is visibly labeled synthetic/offline.

```bash
TAPEGRADE_CONTRACT_ARTIFACT_DIR="$PWD/data/cache/contract-scan" \
  .venv/bin/python -m pytest tests/test_real_contract_scan.py -q
```

Artifacts: ignored `data/cache/contract-scan/tapegrade-offline-contract.png` and
`evidence.json`, referenced media and `tapegrade-offline-contract.zip`. The evidence
includes both players’ normalized game rows and the actual retry prompts. `live-readiness.json` records the actual local API's HTTP 409,
missing prerequisites, current limits, and zero new jobs/model calls.

The live profile remains one candidate, five seconds, six maximum calls, zero SAM
retries and scheduling off. One retry requires two more calls; do not silently
expand the budget. The genuine recommendation test still requires verified named film and current
player availability/lock evidence. Statistics and the owner-confirmed rules are connected.

Every completed scan exposes a PNG attachment and a JSON evidence download containing
the frozen checkpoint, source rows, results, events and model-call ledger. Low-quality
or low-confidence normal outcomes use a local evidence card without paid artwork.
This is an implemented local workflow with external prerequisites, not a claim of
validated current NBA recommendations.


## Source access and evidence

The user obtained NBA trial access through [Sportradar Marketplace](https://marketplace.sportradar.com/signup).
Its [account guide](https://developer.sportradar.com/getting-started/docs/your-account)
lists default trials of 30 days, 1,000 requests and one request per second; actual
entitlements remain account-specific. Authentication and 2026 regular-season
coverage were verified with real API receipts before the complete import.

Ignored `data/cache/sportradar/connection-report.json` records the normalized
roster/free-agent comparisons, window, provenance IDs, request audit, earlier rate
limit stops and zero new model calls. `live-job.json` identifies the source fetch
and cache-only normalization jobs. Raw API bodies are under
`data/cache/stats/sportradar/`; the pre-import SQLite backup is under
`data/cache/sportradar/`. The genuine 55% film result is still ineligible for ADD.
