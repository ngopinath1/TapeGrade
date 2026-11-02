import { Clapperboard, ArrowDownToLine } from "lucide-react";
import type { Scan } from "../types";

export function TapeCard({ scan }: { scan: Scan | null }) {
  const card = scan?.result?.card;
  return (
    <section className="panel tape-card-panel">
      <div className="panel-head">
        <div className="section-label">
          <Clapperboard size={15} /> TAPE CARD
        </div>
        <span className="micro">
          {card
            ? card.simulated
              ? "MOCK ARTWORK"
              : "MUSE IMAGE"
            : "AWAITING REPORT"}
        </span>
      </div>
      {card ? (
        <>
          <a
            href={`/api/scans/${scan?.id}/card`}
            download
            className="card-image"
          >
            <img
              src={card.url}
              alt="Downloadable scouting Tape Card with verified report metrics"
            />
          </a>
          <a
            className="button subtle full"
            href={`/api/scans/${scan?.id}/card`}
            download
          >
            <ArrowDownToLine size={15} /> Download PNG <span>1080 × 1350</span>
          </a>
        </>
      ) : (
        <div className="card-empty">
          <div className="mini-card">
            <Clapperboard size={24} />
            <span>TAPE / GRADE</span>
            <i />
            <i />
          </div>
          <p>
            {scan?.result?.card_error ?? "Your film report, ready to share."}
          </p>
        </div>
      )}
    </section>
  );
}
