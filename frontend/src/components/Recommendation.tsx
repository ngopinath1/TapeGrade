import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  Copy,
  Zap,
  ShieldCheck,
} from "lucide-react";
import type { Scan } from "../types";
import { Avatar } from "./Player";

export function Recommendation({
  scan,
  onToast,
}: {
  scan: Scan | null;
  onToast: (message: string) => void;
}) {
  const move = scan?.result?.staged_move;
  const copy = async () => {
    if (!move) return;
    try {
      await navigator.clipboard.writeText(
        `TapeGrade ${scan?.mode === "mock" ? "SIMULATED DEMO" : "live model report (sample league)"}\nADD ${move.add_player.name}\nDROP ${move.drop_player.name}\nFAAB $${move.faab_bid}\n${move.reasoning}\nAwaiting your tap. Recommendation only.`,
      );
      onToast("Recommendation copied.");
    } catch {
      onToast("Clipboard unavailable in this browser.");
    }
  };
  return (
    <section className="panel recommendation">
      <div className="panel-head">
        <div className="section-label">
          <Zap size={15} /> YOUR NEXT MOVE
        </div>
        <ShieldCheck size={15} className="positive" />
      </div>
      {move ? (
        <>
          <div className="move-player">
            <span className="move-direction">
              <ArrowUpRight size={17} /> ADD
            </span>
            <Avatar player={move.add_player} />
            <div>
              <strong>{move.add_player.name}</strong>
              <small>
                {move.add_player.team} · {move.add_player.positions.join(" / ")}
              </small>
            </div>
          </div>
          <div className="move-player drop">
            <span className="move-direction">
              <ArrowDownLeft size={17} /> DROP
            </span>
            <Avatar player={move.drop_player} />
            <div>
              <strong>{move.drop_player.name}</strong>
              <small>
                {move.drop_player.team} ·{" "}
                {move.drop_player.positions.join(" / ")}
              </small>
            </div>
          </div>
          <div className="bid-row">
            <span>Recommended FAAB bid</span>
            <b>
              ${move.faab_bid}
              <small> sample FAAB</small>
            </b>
          </div>
          <p className="move-reason">{move.reasoning}</p>
          <div className="awaiting">
            <span className="live-dot" />
            Awaiting your tap.<span>Recommendation only</span>
          </div>
          <button className="button primary full" onClick={copy}>
            <Copy size={15} /> Copy move summary <ArrowRight size={15} />
          </button>
        </>
      ) : (
        <div className="move-empty">
          <ShieldCheck size={30} />
          <h3>
            {scan?.result
              ? "No recommended transaction"
              : "Your roster. Your final call."}
          </h3>
          <p>
            {scan?.result?.guardrail_notice ??
              (scan?.result
                ? "No move cleared the film evidence and your guardrails."
                : "A validated add, drop and bid will be staged after your scan.")}
          </p>
        </div>
      )}
    </section>
  );
}
