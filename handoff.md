# TapeGrade handoff — November 4, 2026

## Objective for the next chat

Add a trustworthy recent NBA statistics feed for rostered and unrostered players,
then complete one bounded, genuine scouting scan for the connected Sleeper league.
Preserve the complete mock demonstration. Do not enable recommendations merely by
changing `scouting_ready` to true.

The user-stated hackathon deadline is **November 4, 2026, 9:00 PM America/New_York**.
Prioritize a defensible one-candidate demonstration over more integrations.

## Read this before changing anything

- Workspace: `/Users/nithingopinath/Desktop/TapeGrade`.
- Read `PROGRESS.md`, `README.md`, and `docs/API_CONTRACTS.md` after this file.
- The user is new to full-stack development and wants working code, clear commands,
  and honest descriptions of limitations. Make routine engineering decisions independently.
- File edits, local commands and reversible development work are authorized. Do not
  deploy, activate subscriptions/trials, push, or run new paid inference automatically.
  Finish implementation and offline checks before requesting any remaining external action.
- The real Meta key is in the existing root `.env`. Do not print it, overwrite that
  file, put keys into React, or ask the user to paste credentials into chat.
- Do not execute fantasy transactions. All moves remain recommendations.
- No subagents were requested. No applicable `AGENTS.md` was found during prior work;
  inspect again if new instructions have been added.

## Current state and verified results

| Area | Current state |
| --- | --- |
| Application | React/Vite/TypeScript/Tailwind; FastAPI/Python 3.12; SQLAlchemy/SQLite; separate persistent worker |
| Mock demonstration | Complete: roster → shortlist → schematic film → simulated tracking correction → stored metrics → guarded move → PNG |
| Real Meta access | All three clients have completed genuine API requests; this is not proof of accurate full-game scouting |
| Sleeper | Actual NBA roster, names/teams/positions, scoring weights and reported period points imported by league ID |
| Connected league | `sixseven`, 8 teams, 14 players on the user's roster; 443 active unrostered players at the last refresh |
| Reported period | Period 3; 195 team points. These are Sleeper's period totals, not per-game averages |
| Missing | Recent per-game box scores, minutes/trends and comparable scoring for free agents and drop candidates |
| Recommendation readiness | Intentionally false; UI disabled and backend returns 409 before creating jobs or spending model credits |
| Last validation | 65 backend tests, 7 frontend tests, production build; browser connection/reload and HTTP guard smoke passed |
| Current runtime | API localhost:8000, frontend localhost:5173, live worker, scheduler off; no active jobs at handoff inspection |

The selected league and its connection identifiers are in the ignored SQLite database.
Read them from `backend.services.state.get_league()`; do not hardcode the user's
username or league ID into provider code, fixtures or environment examples.
If local data is absent in another checkout, ask for the username and league ID again.
No Sleeper password/API key is required for this connection.

### Git and local data

- Branch: `main`; private remote: `https://github.com/ngopinath1/TapeGrade.git`.
- Prior published baseline: `12be15d7ac53fe8344696299bcc0f98e01bd1adf`
  (`Add bounded live film diagnostics and verified Meta integration`).
- **This snapshot bundles the Sleeper integration and handoff for the user's
  explicitly approved November 4 push to the same private repository.** Read
  `git log -1` for the resulting commit and inspect `git status` for any later edits.
  Preserve the integration and `tests/test_sleeper_nba.py`; do not reset, clean,
  stash away or rebuild over newer local work.
- `.env`, databases, source videos, uploads, caches and generated cards are ignored.
  The private repository does not contain the user's footage or runtime connection.
- `data/cache/sleeper/` contains actual API receipts, the daily player cache, a
  pre-connection SQLite backup, `smoke.json`, and `connected-roster.jpg`.
- The latest Sleeper work added an additive `workspaces` table; it did not drop old
  data. General versioned schema migrations remain future work. Back up SQLite via
  its backup API before additional schema changes; copying only the DB can miss WAL data.

## Recommended statistics source: assess coverage before buying

[BALLDONTLIE's official NBA docs](https://docs.balldontlie.io/) were checked on
November 4. Game Player Stats requires at least **ALL-STAR ($9.99/month)**; its free
tier does not include those stats. It requires an API key. Trials require payment
details and convert to paid access. No subscription, key, trial or authenticated
request has been created for this provider. Higher-tier season averages are not
necessary if we calculate rolling summaries from game logs.

Documented resources include `/v1/players`, `/v1/games`, and `/v1/stats` on
`https://api.balldontlie.io`. Consult its current OpenAPI/docs for authentication,
date/player filters and cursor pagination; do not invent requests.
Its sample game-stat response has `min`, `fg3m`, `turnover`, and `pf`; technical and
flagrant foul counts are not established by that sample. Verify field coverage and
current-season availability before treating it as sufficient for exact Sleeper scoring.

Implement the provider, normalized contracts and offline fixtures without needing
a purchase. A provenance-preserving import of licensed real game-log JSON/CSV can
also exercise the same interface. Synthetic fixtures must never count as live readiness.
The user can choose a suitable paid data source and add its key to `.env` manually
after the adapter is concrete and reviewable.

## Important scoring and roster issues

### Actual league weights at the last import

```json
{
  "pts": 0.5, "reb": 1.0, "ast": 1.0,
  "stl": 2.0, "blk": 2.0, "to": -1.0, "tpm": 0.5,
  "dd": 1.0, "td": 2.0,
  "bonus_pt_40p": 2.0, "bonus_pt_50p": 2.0,
  "tf": -2.0, "ff": -2.0
}
```

Always read current weights from the saved/refreshed league; this block records the
observed configuration, not a second source of truth.

- `backend/providers/base.py::ScoringEngine` is currently just a weighted sum. It
  returns null when any weighted key is missing. Add explicit field normalization
  and derived bonus events per game before calculating averages.
- Never treat missing technical/flagrant fouls as zero or substitute personal fouls.
  If required data is absent, exact fantasy scoring remains unavailable; any partial
  estimate must be explicitly labeled and cannot silently satisfy recommendation readiness.
- [Sleeper's scoring guide](https://support.sleeper.com/en/articles/4645009-what-scoring-settings-are-available)
  explicitly says double-double/triple-double bonuses stack. Compute these from each
  complete game's categories, not averaged statistics. Verify the separate 40/50-point
  stacking behavior against an authoritative rule or a known scored game; do not assume.
- Confirm the league's basketball game mode before weekly valuation. The raw receipt
  has `game_mode=1`, whose numeric meaning has not been verified.
  [Sleeper's format guide](https://support.sleeper.com/en/articles/4644860-league-formats-game-modes)
  describes Lock-In as selecting one performance per player each week. Do not assume
  that multiplying a mean by scheduled games gives this league's weekly value.
- Current `faab_remaining` is derived from returned waiver-budget fields. That does
  **not** establish that FAAB bidding applies. Confirm waiver mode and eligibility
  before issuing a bid. A configured $100 budget alone is insufficient evidence.
- The current unrostered pool excludes every roster/reserve/taxi list and requires
  an active player with a returned team. It does not prove that a player is immediately
  addable rather than on waivers or otherwise locked.

## Implementation sequence

### 1. Add player identity mapping and a statistics interface

Suggested new modules: `backend/providers/stats_base.py`, `stats_balldontlie.py`,
`backend/services/player_identity.py`, and `backend/services/stat_enrichment.py`.
These names are proposals; none of these modules exists yet.

- Keep Sleeper as the source of roster membership, scoring and eligibility metadata.
  Keep the game-statistics provider independent from `LeagueProvider`.
- Persist a crosswalk between Sleeper's external athlete ID and the statistics
  provider's ID. Internal app IDs are `sleeper:<league_id>:<player_id>`; they are not
  interchangeable with either provider's numeric IDs.
- Prefer shared verified identifiers. For name-based matches, normalize punctuation
  and suffixes, use other available evidence, and require review for ambiguity.
  Transfers mean a team mismatch is not sufficient by itself to reject an athlete.
  Never silently attach stats to the wrong person through fuzzy matching.
- Validate normalized game records with Pydantic. Preserve provider, athlete/game
  IDs, game date, season/type, completion status, fetch time, field coverage and raw
  source/cache reference. Store game rows idempotently with unique provider/game/player keys.
- Distinguish missing/DNP/not-yet-final observations from actual measured zero.

### 2. Fetch and persist recent game logs economically

- Start with a bounded recent window, for example the last 30 days of relevant
  completed games. Confirm provider season conventions and current data coverage.
- Batch requests, paginate completely with a page/request cap, cache results across
  scans, and incrementally refresh new/finalized games. Do not issue one request per
  free agent per scan. Retain a correction/refetch policy for final-score revisions.
- Enrich rostered players too: add/drop comparisons need the same scoring/window,
  not a candidate's average compared with a roster player's Sleeper period total.
- Support bounded timeouts, rate-limit guidance and sanitized errors. A failed or
  stale fetch should preserve the last snapshot with an explicit quality warning.
- Add proposed blank configuration such as `NBA_STATS_PROVIDER` and
  `BALLDONTLIE_API_KEY` to `.env.example` and backend `Settings` when implementing.
  Never expose these through bootstrap or React. Do not edit the real `.env` for the user.
- An explicit refresh job should own this potentially long operation. Persist its
  status/progress; do not make a long HTTP request or replace existing jobs' evidence
  snapshots while they are running.

### 3. Compute comparable summaries and readiness

- Compute league-specific per-game scores only after validating all required fields
  and bonus rules. Keep reported period points in their own field; do not overwrite
  them with a rolling average under the same UI label.
- Useful initial summaries: actual games observed, recent minutes, previous-window
  minutes when enough games exist, recent fantasy average, and a chronological trend.
  Show the exact window, sample size and source. Early-season samples may be short;
  do not invent a preceding window or label three games as a five-game sample.
- Persist explicit readiness/coverage/freshness reasons. Only mapped, adequately
  supported players should qualify. The whole directory need not be perfect, but
  selected candidates and possible drops must meet the declared coverage threshold.
- `SleeperLeagueProvider.snapshot_for()` currently sets `scouting_ready=False` on
  every refresh. Make readiness the output of validated enrichment, with invalidation
  on scoring/provider/mapping changes, rather than a manual flag that refresh destroys.
- Deterministically narrow candidates before sending evidence to Spark. Avoid sending
  hundreds of enriched player records to a reasoning model. Preserve provenance IDs
  in the actual job checkpoint so every verdict can be audited later.

### 4. Obtain film for an actual eligible candidate

- Statistics alone will not produce an ADD under existing rules. Live `enqueue()`
  also requires a usable local upload associated with a candidate's actual app ID.
- The user's roughly 20-minute local highlights file is available in this workspace
  and ignored by Git. Analyze it locally to find a short continuous segment of a
  qualifying free agent; do not send the entire source to models.
- `scripts/film_check.py` extracts a 1–5 second excerpt from longer MP4/MOV input.
  Its current film-only diagnostic path deliberately does not generate fantasy moves.
- Existing genuine footage diagnostic: `cef273a131eb4588b8af8c718db7183b` in the
  sample workspace. SAM returned 48 frames; Spark rated quality **55%**, finding one
  defender track drifting into empty court. Numeric metrics were withheld. Muse Image
  generated real artwork. Six requests covered the rejected first excerpt and the
  final diagnostic, including a failed critic response and explicit continuation.
- That target was described only as a GSW ball handler. It is **not** a verified
  named free-agent identity and must not be relabeled to fit a new candidate.
- Verify the new clip's target with Spark. Reject uncertainty and camera-cut/identity
  problems. Cache legitimate outputs; never force a failure or an accepted critique.
- Repair multi-object tracking with supported spatial guidance where possible. The
  current critic favors a short concept prompt; a target-only concept retry can lose
  defender/ball role bindings. Review `seed_prompt()` / `parse_tracking()` in
  `backend/models/sam.py` before changing this. Do not assign unsupported roles to masks.
- ADD currently requires verified film, perception quality >=75%, measured metric
  references, and the saved confidence guardrail. Keep those gates. The prior 55%
  result does not qualify; “No recommended transaction” remains a valid outcome.

### 5. Close the live-transaction integration gaps before enabling scans

Known issues from code inspection, currently contained by the readiness block:

| Location | Required work |
| --- | --- |
| `backend/worker/scan.py` | Replace hardcoded `league_is_demo=True` in normal results with snapshot truth; remove sample-statistics wording in real-job events |
| `backend/services/tape_card.py` | The normal live footer still says “FICTIONAL SAMPLE LEAGUE”; use actual provenance and include the correct statistics window |
| `backend/services/staging.py` | `budget` assumes an integer and clamps directly; handle missing/not-applicable FAAB and verify legal add/drop/position constraints |
| `backend/api/types.py`, frontend move types/display | Bid is currently required; represent non-FAAB moves without inventing a dollar amount |
| `backend/api/types.py::ScanRequest` | Its optional/default league selector is still constrained to `demo-nba`; align or remove that stale request field while validating the selected workspace |
| `backend/services/state.py` | Preserve/refresh valid enrichment without mixing stale and current scoring, or keep it in separate keyed tables |
| `backend/agents/scout.py`, `decision.py` | Supply comparable sourced roster/candidate summaries, game-mode context and limitations; keep Pydantic validation |
| Final staging | Recheck current availability, roster membership, protections, relevant locks and bid guardrails; report unknown eligibility instead of guaranteeing an executable transaction |

Have the user review the real league's protected-player selections before a paid
recommendation test. A newly imported real league starts with an empty protection
list; do not infer the user's preferences or reuse fictional protected IDs.
Also inspect card selection: the normal worker checks whether any candidate is
verified but can still choose the first unverified candidate when no move is staged.
Choose an appropriate verified candidate or skip the paid artwork request.

Normal scans and the separate film diagnostic must stay distinct. Neither should
use mock statistics for actual NBA athletes. Ensure zero-candidate/low-confidence
outcomes are safe and skip unnecessary image generation.

### 6. Validate and prepare the submission

1. Offline tests for identity collisions/unmatched players; pagination; duplicates;
   rate limits; stale/missing/DNP stats; final-game corrections; early-season samples;
   every enabled scoring rule and missing fields; period-vs-average labels; workspace
   isolation; readiness; nullable budget/non-FAAB; protected drops; real-data/mock separation.
2. An offline full real-league fixture through all three actual clients, including
   a justified spatial retry that changes the next SAM call. This is a contract test,
   not proof of paid model accuracy.
3. Once source access and scope are explicitly authorized, run one small actual
   scan with one candidate and a stated call budget. Inspect the stored evidence,
   metric references, transaction validation, correct league labels and PNG download.
   Do not force ADD merely to make the demo look successful.
4. The low-usage launcher currently allows six calls and zero SAM retries. A typical
   initial one-candidate full pipeline uses six calls; one SAM+critic retry needs
   two more. Do not silently expand that budget or run paid tests automatically.
5. Keep scheduling off until manual results are credible. Defer cloud deployment,
   automated video scraping and extra fantasy platforms.
6. Update docs and the short hackathon demo script to distinguish mock results,
   observed Sleeper compatibility and actual validated film. Re-audit exclusions and
   credentials before any user-approved commit/push. Do not deploy or push by default.

## Existing entry points and commands

Check whether the local stack is already running before launching duplicate servers:

```bash
cd /Users/nithingopinath/Desktop/TapeGrade
git status --short
lsof -nP -iTCP:8000 -sTCP:LISTEN
lsof -nP -iTCP:5173 -sTCP:LISTEN
```

Run the stack using the existing environment:

```bash
bash scripts/dev.sh
```

For an explicitly chosen live-model profile (does not edit `.env`):

```bash
bash scripts/dev-live.sh
```

That profile sets one candidate, five-second clips, no SAM retries, six calls,
2048 Spark output tokens, minimal reasoning and scheduling off. Inspect outstanding
jobs first: a live worker resumes queued jobs. The current inspection found none.
The default `.env` still selects mock models; the running stack uses launcher overrides.

Separate terminals, if desired, all from the project root with matching mode settings:

```bash
.venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
.venv/bin/python -m backend.worker.scan
npm --prefix frontend run dev
```

The three lines above are separate long-running processes, not one sequential script.
Frontend: <http://localhost:5173>. API explorer: <http://localhost:8000/docs>.
Use Connect Sleeper to refresh the existing league or switch to the preserved sample.

Offline validation (no paid requests; temporary databases):

```bash
.venv/bin/python -m pytest -q
npm --prefix frontend test
npm --prefix frontend run build
git diff --check
```

Relevant files: `backend/providers/sleeper.py`, `backend/services/state.py`,
`backend/db/schema.py`, `backend/worker/scan.py`, `backend/agents/{scout,critic,decision}.py`,
`backend/services/{staging,metrics,clips,tape_card}.py`, `backend/api/{routes,types}.py`,
`frontend/src/components/{Roster,SleeperDialog,Recommendation}.tsx`, and
`tests/test_sleeper_nba.py`. The latter already covers direct-ID import, true period
points, missing values, daily directory caching and workspace/job/guardrail isolation.

## Suggested opening prompt for the new chat

> Read handoff.md, PROGRESS.md and the current Git diff. Preserve the existing
> Sleeper integration and any later local changes. Implement the recent-statistics adapter, player crosswalk,
> exact scoring/coverage validation and readiness pipeline first, using offline
> fixtures. Keep the mock demo working. Fix the listed live-league staging/labeling
> issues before enabling a real scan. Do not buy data access, overwrite .env, run
> paid inference, push or deploy without the relevant authorization. Tell me which
> provider access/fields and candidate footage are still needed after the code is
> implemented and tested.
