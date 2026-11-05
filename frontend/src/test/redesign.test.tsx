import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Candidates } from "../components/Candidates";
import { PlayerOverview } from "../components/PlayerOverview";
import { Avatar } from "../components/Player";
import { candidateStatus } from "../lib/presentation";
import fixture from "./fixture.json";
import type { Candidate } from "../types";

const base = () =>
  structuredClone(fixture.scan.result.candidates[0]) as Candidate;

describe("player discovery and honest evidence", () => {
  it("does not promote a stored ADD when the clip identity is unconfirmed", () => {
    const candidate = base();
    candidate.verified = false;
    candidate.verdict.verdict = "ADD";
    candidate.verdict.confidence = 0;
    render(
      <PlayerOverview candidate={candidate} saved={false} onWatch={vi.fn()} />,
    );
    expect(
      screen.getByRole("heading", { name: "Needs verification" }),
    ).toBeVisible();
    expect(screen.getByText("Not established")).toBeVisible();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Consider adding" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/No film-backed action is supported/),
    ).toBeVisible();
    expect(candidate.verdict.verdict).toBe("ADD");
  });

  it("keeps period totals separate from recent averages and does not invent a chart", () => {
    const candidate = base();
    candidate.player.is_demo = false;
    candidate.player.fantasy_points = 192;
    candidate.player.recent_fantasy_average = null;
    candidate.player.recent = undefined;
    candidate.player.trend = [];
    render(
      <PlayerOverview candidate={candidate} saved={false} onWatch={vi.fn()} />,
    );
    expect(screen.queryByText("192.0")).not.toBeInTheDocument();
    expect(
      screen.getByText("Recent FPTS / game").closest("div"),
    ).toHaveTextContent("—");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("labels a short actual game sample and preserves zero scores", () => {
    const candidate = base();
    candidate.player.is_demo = false;
    candidate.player.recent_fantasy_average = 10;
    candidate.player.recent = {
      ready: true,
      sample_size: 2,
      provider: "saved provider",
      fetched_at: "2026-11-04",
      window_start: "2026-10-29",
      window_end: "2026-11-04",
      reasons: [],
      games: [
        {
          row_id: "a",
          game_id: "a",
          date: "2026-11-01",
          minutes: 20,
          score: 0,
          source_ref: "source-a",
          coverage: [],
        },
        {
          row_id: "b",
          game_id: "b",
          date: "2026-11-03",
          minutes: 22,
          score: 20,
          source_ref: "source-b",
          coverage: [],
        },
      ],
    };
    render(
      <PlayerOverview candidate={candidate} saved={false} onWatch={vi.fn()} />,
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      expect.stringContaining("2-game sample"),
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Nov 1: 0"),
    );
    expect(
      screen.getByText(/short sample does not establish a long-term trend/),
    ).toBeVisible();
  });

  it("does not show fantasy statistics for film-only diagnostics", () => {
    const candidate = base();
    candidate.player.film_only = true;
    render(
      <PlayerOverview candidate={candidate} saved={false} onWatch={vi.fn()} />,
    );
    expect(
      screen.getByRole("heading", { name: "Film review only" }),
    ).toBeVisible();
    expect(screen.queryByRole("definition")).not.toBeInTheDocument();
    expect(screen.queryByText("Sample FPTS")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("requires a clip and accepted tracking before presenting a positive verdict", () => {
    const candidate = base();
    candidate.verdict.verdict = "ADD";
    candidate.clip = null;
    expect(candidateStatus(candidate).label).toBe("Insufficient evidence");
    candidate.clip = base().clip;
    candidate.verified = true;
    candidate.tracking_accepted = false;
    expect(candidateStatus(candidate).label).toBe("Insufficient evidence");
  });

  it("does not treat a verified clip as proof of a real player's identity", () => {
    const candidate = base();
    candidate.player.is_demo = false;
    candidate.verified = true;
    candidate.verdict.verdict = "ADD";
    candidate.identity = undefined;
    render(
      <PlayerOverview candidate={candidate} saved={false} onWatch={vi.fn()} />,
    );
    expect(
      screen.getByRole("heading", { name: "Needs verification" }),
    ).toBeVisible();
    expect(screen.getByText("Not established")).toBeVisible();
    expect(
      screen.queryByText("Film identity verified"),
    ).not.toBeInTheDocument();
  });
});

it("searches, sorts and filters only the evaluated players, while selecting the correct ID", () => {
  const candidates = structuredClone(
    fixture.scan.result.candidates,
  ) as Candidate[];
  const onSelect = vi.fn();
  const onWatch = vi.fn();
  render(
    <Candidates
      candidates={candidates}
      selected={candidates[0].player.id}
      onSelect={onSelect}
      watchlist={[candidates[1].player.id]}
      onWatch={onWatch}
    />,
  );
  fireEvent.change(screen.getByLabelText("Search scouted players"), {
    target: { value: candidates[1].player.name },
  });
  expect(screen.getAllByRole("button", { name: /^Rank/ })).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: /^Rank/ }));
  expect(onSelect).toHaveBeenCalledWith(candidates[1].player.id);
  fireEvent.change(screen.getByLabelText("Search scouted players"), {
    target: { value: "" },
  });
  fireEvent.change(screen.getByLabelText("Sort scouted players"), {
    target: { value: "points" },
  });
  const highest = [...candidates].sort(
    (a, b) => b.player.fantasy_points! - a.player.fantasy_points!,
  )[0];
  expect(
    screen.getAllByRole("button", { name: /^Rank/ })[0],
  ).toHaveAccessibleName(expect.stringContaining(highest.player.name));
  fireEvent.click(
    within(screen.getByRole("group", { name: "Candidate filter" })).getByRole(
      "button",
      { name: "Saved" },
    ),
  );
  expect(screen.getAllByRole("button", { name: /^Rank/ })).toHaveLength(1);
  fireEvent.click(
    screen.getByRole("button", {
      name: new RegExp(`Remove ${candidates[1].player.name}`),
    }),
  );
  expect(onWatch).toHaveBeenCalledWith(candidates[1].player.id);
});

it("does not imply extra candidates for a single-player report", () => {
  render(
    <Candidates
      candidates={[base()]}
      selected={base().player.id}
      onSelect={vi.fn()}
      watchlist={[]}
      onWatch={vi.fn()}
    />,
  );
  expect(screen.getAllByRole("button", { name: /^Rank/ })).toHaveLength(1);
  expect(screen.getByText(/1 player evaluated in this report/)).toBeVisible();
});

it("uses a provider ID for a real headshot and gracefully falls back without applying it to demo players", () => {
  const player = { ...base().player, is_demo: false, nba_id: "2544" };
  const view = render(<Avatar player={player} />);
  const img = view.container.querySelector("img")!;
  expect(img).toHaveAttribute(
    "src",
    "https://cdn.nba.com/headshots/nba/latest/260x190/2544.png",
  );
  fireEvent.error(img);
  expect(view.container.querySelector("img")).toBeNull();
  expect(view.container.textContent).not.toBe("");
  view.rerender(<Avatar player={{ ...player, is_demo: true }} />);
  expect(view.container.querySelector("img")).toBeNull();
});
