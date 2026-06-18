/**
 * Lightweight performance monitor (dev-only).
 * - Measures average FPS via requestAnimationFrame.
 * - Logs warnings if FPS drops below threshold or long tasks occur.
 * - Reports paint / LCP timings via PerformanceObserver.
 *
 * Zero impact in production: the entry point only imports this in DEV.
 */

type PerfSnapshot = {
  fps: number;
  minFps: number;
  longTasks: number;
  lcp?: number;
  fcp?: number;
};

const FPS_WARN_THRESHOLD = 45;

export function startPerfMonitor(): () => void {
  if (typeof window === "undefined") return () => {};

  let frames = 0;
  let lastSample = performance.now();
  let minFps = Infinity;
  let longTasks = 0;
  let lcp: number | undefined;
  let fcp: number | undefined;
  let rafId = 0;
  let intervalId: number | undefined;

  const loop = () => {
    frames++;
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);

  intervalId = window.setInterval(() => {
    const now = performance.now();
    const elapsed = (now - lastSample) / 1000;
    const fps = Math.round(frames / elapsed);
    minFps = Math.min(minFps, fps);
    frames = 0;
    lastSample = now;

    const snap: PerfSnapshot = { fps, minFps, longTasks, lcp, fcp };
    if (fps < FPS_WARN_THRESHOLD) {
      console.warn("[perf] Low FPS", snap);
    } else {
      console.debug("[perf] sample", snap);
    }
  }, 5000);

  // Long-task observer (jank > 50ms)
  let ltObs: PerformanceObserver | undefined;
  try {
    ltObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        longTasks++;
        console.warn(`[perf] Long task ${Math.round(entry.duration)}ms`, entry.name);
      }
    });
    ltObs.observe({ type: "longtask", buffered: true });
  } catch {
    /* not supported */
  }

  // Paint observer (FCP / LCP)
  let paintObs: PerformanceObserver | undefined;
  try {
    paintObs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.name === "first-contentful-paint") fcp = Math.round(e.startTime);
      }
    });
    paintObs.observe({ type: "paint", buffered: true });
  } catch {
    /* noop */
  }

  let lcpObs: PerformanceObserver | undefined;
  try {
    lcpObs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) lcp = Math.round(last.startTime);
    });
    lcpObs.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    /* noop */
  }

  console.info("[perf] Monitoring started (dev only). Samples every 5s.");

  return () => {
    cancelAnimationFrame(rafId);
    if (intervalId) clearInterval(intervalId);
    ltObs?.disconnect();
    paintObs?.disconnect();
    lcpObs?.disconnect();
  };
}
