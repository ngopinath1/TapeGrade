import { useCallback, useEffect, useState } from "react";
import { api, complete } from "../lib/api";
import type { Bootstrap, Scan } from "../types";

export function useDashboard() {
  const [data, setData] = useState<Bootstrap | null>(null);
  const [history, setHistory] = useState<Scan[]>([]);
  const [scan, setScan] = useState<Scan | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const refresh = useCallback(async (resetWorkspace = false) => {
    try {
      const [bootstrap, scans] = await Promise.all([
        api<Bootstrap>("/bootstrap"),
        api<Scan[]>("/scans"),
      ]);
      setData(bootstrap);
      setHistory(scans);
      if (resetWorkspace) {
        setScan(null);
        setError("");
      }
      setScanId(
        (current) => (resetWorkspace ? null : current) ?? scans[0]?.id ?? null,
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    if (!scanId) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const next = await api<Scan>(`/scans/${scanId}`);
        if (!alive) return;
        setScan(next);
        if (!complete(next.stage)) timer = setTimeout(poll, 850);
        else void refresh();
      } catch (e) {
        if (alive) setError((e as Error).message);
      }
    };
    void poll();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [scanId, refresh]);
  const run = async (instruction: string) => {
    setError("");
    try {
      const next = await api<{ id: string }>("/scans", {
        method: "POST",
        body: JSON.stringify({ instruction }),
        headers: { "Idempotency-Key": crypto.randomUUID() },
      });
      setScan(null);
      setScanId(next.id);
      void refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const reloadScan = async () => {
    if (scanId) setScan(await api<Scan>(`/scans/${scanId}`));
  };
  return {
    data,
    history,
    scan,
    scanId,
    error,
    setError,
    run,
    refresh,
    setScanId,
    reloadScan,
  };
}
