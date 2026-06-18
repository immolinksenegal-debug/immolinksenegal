import { useEffect, useState } from "react";

/**
 * Dev-only floating perf overlay.
 * Shows live FPS, long-task count, FCP and LCP in a tiny corner badge.
 * Click to toggle compact / expanded; double-click to hide for the session.
 */

type Stats = {
  fps: number;
  minFps: number;
  longTasks: number;
  fcp?: number;
  lcp?: number;
};

const HIDE_KEY = "__perf_overlay_hidden";

export default function PerfOverlay() {
  const [stats, setStats] = useState<Stats>({ fps: 0, minFps: Infinity, longTasks: 0 });
  const [expanded, setExpanded] = useState(true);
  const [hidden, setHidden] = useState<boolean>(
    () => typeof sessionStorage !== "undefined" && sessionStorage.getItem(HIDE_KEY) === "1"
  );

  useEffect(() => {
    if (hidden) return;
    let frames = 0;
    let last = performance.now();
    let rafId = 0;
    let minFps = Infinity;
    let longTasks = 0;
    let fcp: number | undefined;
    let lcp: number | undefined;

    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 500) {
        const fps = Math.round((frames * 1000) / (now - last));
        minFps = Math.min(minFps, fps);
        setStats({ fps, minFps, longTasks, fcp, lcp });
        frames = 0;
        last = now;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const observers: PerformanceObserver[] = [];
    const safeObserve = (type: string, cb: (e: PerformanceEntry[]) => void) => {
      try {
        const o = new PerformanceObserver((list) => cb(list.getEntries()));
        o.observe({ type, buffered: true } as PerformanceObserverInit);
        observers.push(o);
      } catch {
        /* unsupported */
      }
    };

    safeObserve("longtask", (entries) => {
      longTasks += entries.length;
    });
    safeObserve("paint", (entries) => {
      for (const e of entries) if (e.name === "first-contentful-paint") fcp = Math.round(e.startTime);
    });
    safeObserve("largest-contentful-paint", (entries) => {
      const last = entries[entries.length - 1];
      if (last) lcp = Math.round(last.startTime);
    });

    return () => {
      cancelAnimationFrame(rafId);
      observers.forEach((o) => o.disconnect());
    };
  }, [hidden]);

  if (hidden) return null;

  const fpsColor =
    stats.fps >= 55 ? "#10b981" : stats.fps >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      onDoubleClick={() => {
        sessionStorage.setItem(HIDE_KEY, "1");
        setHidden(true);
      }}
      title="Click: toggle • Double-click: hide for session"
      style={{
        position: "fixed",
        bottom: 8,
        right: 8,
        zIndex: 2147483647,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        lineHeight: 1.4,
        background: "rgba(15,23,42,0.85)",
        color: "#e2e8f0",
        padding: expanded ? "6px 10px" : "4px 8px",
        borderRadius: 6,
        border: "1px solid rgba(148,163,184,0.3)",
        backdropFilter: "blur(6px)",
        userSelect: "none",
        cursor: "pointer",
        pointerEvents: "auto",
      }}
    >
      <div>
        <span style={{ color: fpsColor, fontWeight: 700 }}>{stats.fps} FPS</span>
        {expanded && (
          <span style={{ opacity: 0.6 }}>
            {" "}
            (min {Number.isFinite(stats.minFps) ? stats.minFps : "—"})
          </span>
        )}
      </div>
      {expanded && (
        <>
          <div>
            Long tasks:{" "}
            <span style={{ color: stats.longTasks > 0 ? "#f59e0b" : "#10b981" }}>
              {stats.longTasks}
            </span>
          </div>
          <div>FCP: {stats.fcp ? `${stats.fcp}ms` : "—"}</div>
          <div>LCP: {stats.lcp ? `${stats.lcp}ms` : "—"}</div>
        </>
      )}
    </div>
  );
}
