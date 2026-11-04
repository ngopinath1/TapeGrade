import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../pages/App";
import { FilmPlayer } from "../components/FilmPlayer";
import { Recommendation } from "../components/Recommendation";
import fixture from "./fixture.json";
import type { Candidate, Scan } from "../types";

const scan = fixture.scan as Scan;
describe("scouting dashboard", () => {
  it("shows empty film without inventing measurements", () => {
    render(<FilmPlayer />);
    expect(screen.getByText("No clip analyzed yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play clip" })).toBeDisabled();
    expect(screen.queryByText("75")).not.toBeInTheDocument();
  });
  it("renders stored measurements, unavailable metrics and toggles overlays", () => {
    render(<FilmPlayer candidate={scan.result!.candidates[0] as Candidate} />);
    expect(screen.getByText("On-ball involvement")).toBeInTheDocument();
    expect(screen.getAllByText("Unavailable")).toHaveLength(2);
    expect(
      screen.getByLabelText("Segmentation and bounding box overlay"),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Toggle segmentation overlays" }),
    );
    expect(
      screen.queryByLabelText("Segmentation and bounding box overlay"),
    ).not.toBeInTheDocument();
  });
  it("copies a labeled recommendation without offering transaction submission", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<Recommendation scan={scan} onToast={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Copy move summary/ }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining("SIMULATED DEMO"),
      ),
    );
    expect(writeText.mock.calls[0][0]).toContain("FAAB $8");
    expect(screen.getByText("Awaiting your tap.")).toBeInTheDocument();
  });
  it("submits the user mission and displays the persisted scan and guardrails", async () => {
    let submitted = false;
    const fetcher = vi.fn(async (url: string, options?: RequestInit) => {
      let data: unknown;
      if (url === "/api/bootstrap") data = fixture.bootstrap;
      else if (url === "/api/scans" && options?.method === "POST") {
        submitted = true;
        data = { id: scan.id };
      } else if (url === "/api/scans") data = submitted ? [scan] : [];
      else if (url === `/api/scans/${scan.id}`) data = scan;
      else throw new Error(`Unexpected URL ${url}`);
      return { ok: true, json: async () => data };
    });
    vi.stubGlobal("fetch", fetcher);
    render(<App />);
    await screen.findByRole("button", { name: /Run scan/ });
    fireEvent.change(screen.getByLabelText("GIVE YOUR SCOUT A MISSION"), {
      target: { value: "Find me a guard" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Run scan/ }));
    await screen.findByText("Awaiting your tap.");
    expect(
      fetcher.mock.calls.some(
        ([url, options]) =>
          url === "/api/scans" &&
          options?.body === JSON.stringify({ instruction: "Find me a guard" }),
      ),
    ).toBe(true);
    expect(
      screen.getByText(/Tracking quality insufficient/),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Download PNG/ })).toHaveAttribute(
      "href",
      `/api/scans/${scan.id}/card`,
    );
    fireEvent.click(screen.getByRole("button", { name: "Autopilot" }));
    expect(
      screen.getByRole("button", { name: /Save guardrails/ }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Jordan Sterling/)).toBeChecked();
  });
  it("keeps real film diagnostics separate from fictional statistics and moves", async () => {
    const diagnostic = structuredClone(scan);
    diagnostic.mode = "live";
    diagnostic.result!.film_test = true;
    diagnostic.result!.simulated = false;
    diagnostic.result!.staged_move = null;
    diagnostic.result!.card = null;
    const subject = diagnostic.result!.candidates[0].player;
    subject.name = "Visible ball handler";
    subject.film_only = true;
    subject.is_demo = false;
    subject.number = null;
    subject.minutes = subject.previous_minutes = subject.fantasy_points = null;
    subject.stats = {};
    diagnostic.result!.candidates = [diagnostic.result!.candidates[0]];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => ({
        ok: true,
        json: async () =>
          url === "/api/bootstrap"
            ? { ...fixture.bootstrap, models_mode: "live" }
            : url === "/api/scans"
              ? [diagnostic]
              : diagnostic,
      })),
    );
    render(<App />);
    await screen.findByText("Film test · stats unavailable");
    expect(screen.getByText("No recommended transaction")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Game date, fantasy eligibility and statistics are unverified/,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/#null/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Copy move summary/ }),
    ).not.toBeInTheDocument();
  });
  it("connects a direct NBA league and shows actual period points without fabricated trends", async () => {
    let connected = false;
    const live = structuredClone(
      fixture.bootstrap,
    ) as import("../types").Bootstrap;
    live.demo_mode = false;
    live.league = {
      ...live.league,
      id: "sleeper:123",
      name: "Live test league",
      team_name: "Scout",
      is_demo: false,
      period: 3,
      period_points: 24.5,
      scouting_ready: false,
      scouting_unavailable_reason: "Recent statistics unavailable.",
      connection: {
        username: "scout",
        league_id: "123",
        user_id: "7",
        roster_id: 1,
      },
      notice: "Sleeper-reported period points; minutes and trends unavailable.",
      roster: live.league.roster.slice(0, 2).map((p, i) => ({
        ...p,
        id: `sleeper:123:${i}`,
        name: `Live Player ${i}`,
        is_demo: false,
        fantasy_points: i === 0 ? 24.5 : 0,
        minutes: null,
        previous_minutes: null,
        stats: {},
        trend: [],
        lineup_status: "Starter",
      })),
      available: [],
    };
    live.settings.protected_players = [];
    const fetcher = vi.fn(async (url: string, options?: RequestInit) => {
      let data: unknown;
      if (url === "/api/sleeper/connect") {
        connected = true;
        data = { connected: true };
      } else if (url === "/api/bootstrap")
        data = connected ? live : fixture.bootstrap;
      else if (url === "/api/scans") data = [];
      else throw new Error(`Unexpected URL ${url}`);
      return { ok: true, json: async () => data };
    });
    vi.stubGlobal("fetch", fetcher);
    render(<App />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Connect Sleeper/ }),
    );
    fireEvent.change(screen.getByLabelText("Sleeper username"), {
      target: { value: "scout" },
    });
    fireEvent.change(screen.getByLabelText("NBA league ID"), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Connect NBA league" }));
    await screen.findByText("Live Player 0");
    expect(screen.getByText("PERIOD 3 FPTS")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "24.5" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "0" })).toBeInTheDocument();
    expect(screen.getAllByText("Unavailable")).toHaveLength(2);
    expect(
      screen.queryByText("Fictional sample roster"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "Seven-game sample trend" }),
    ).not.toBeInTheDocument();
    expect(
      fetcher.mock.calls.some(
        ([url, options]) =>
          url === "/api/sleeper/connect" &&
          options?.body ===
            JSON.stringify({ username: "scout", league_id: "123" }),
      ),
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Scouting desk" }));
    expect(screen.getByRole("button", { name: /Run scan/ })).toBeDisabled();
  });
  it("shows backend errors without marking a failed request complete", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ detail: "Backend unavailable" }),
      }),
    );
    render(<App />);
    expect(await screen.findByText("Backend unavailable")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Retry connection" }),
    ).toBeInTheDocument();
  });
});
