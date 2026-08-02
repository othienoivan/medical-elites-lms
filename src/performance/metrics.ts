type MetricName = "LCP" | "CLS" | "LONG_TASK";
function record(name: MetricName, value: number): void {
  if (!Number.isFinite(value)) return;
  const entry = { name, value, path: location.pathname, at: new Date().toISOString() };
  try { sessionStorage.setItem(`me:perf:${name}`, JSON.stringify(entry)); } catch { /* storage unavailable */ }
  if (import.meta.env.DEV) console.info("[performance]", entry);
}
export function startPerformanceMonitoring(): void {
  if (!("PerformanceObserver" in window)) return;
  try {
    const lcp = new PerformanceObserver((list) => { const e=list.getEntries().at(-1); if(e) record("LCP", e.startTime); });
    lcp.observe({ type: "largest-contentful-paint", buffered: true });
  } catch { /* unsupported */ }
  try {
    let cls=0;
    const observer = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) { const x=e as PerformanceEntry & { value?: number; hadRecentInput?: boolean }; if(!x.hadRecentInput) cls += x.value ?? 0; }
      record("CLS", cls);
    });
    observer.observe({ type: "layout-shift", buffered: true });
  } catch { /* unsupported */ }
  try {
    const longTasks = new PerformanceObserver((list) => { for(const e of list.getEntries()) record("LONG_TASK", e.duration); });
    longTasks.observe({ type: "longtask", buffered: true });
  } catch { /* unsupported */ }
}
