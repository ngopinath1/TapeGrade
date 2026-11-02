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
