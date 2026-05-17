import { useMemo } from "react";

import { getJson } from "../api";
import { useApi } from "../hooks/useApi";
import type { Signal } from "../types";

export function HomePage() {
  const { data, error, isLoading } = useApi(() => getJson<Signal[]>("/signals"));

  const signals = useMemo(() => data ?? [], [data]);
  const featured = signals[0];

  if (isLoading) {
    return <main className="panel">Loading signal intelligence...</main>;
  }

  if (error) {
    return <main className="panel">Failed to load signals: {error}</main>;
  }

  return (
    <main>
      <section className="hero">
        <div className="panel">
          <div className="eyebrow">Live Mantle intelligence</div>
          <h1 className="headline">See where Mantle yield capital is moving next.</h1>
          <p className="copy">
            PowderLens is built around one job: detect meaningful rotation between Mantle yield assets, incentive pools, and LP strategies before the rest of the market catches up.
          </p>
        </div>
        <div className="panel signal-card">
          <span className="chip">Highest conviction signal</span>
          <h2 style={{ margin: 0 }}>{featured?.headline}</h2>
          <p className="muted" style={{ margin: 0 }}>
            AI explanation: {featured?.summary}
          </p>
        </div>
      </section>

      <section className="grid" style={{ marginBottom: 28 }}>
        <div className="panel">
          <div className="metric">{signals.length}</div>
          <div className="metric-label">Live rotation signals</div>
        </div>
        <div className="panel">
          <div className="metric">6</div>
          <div className="metric-label">Tracked yield assets</div>
        </div>
        <div className="panel">
          <div className="metric">38</div>
          <div className="metric-label">Smart LP cohorts</div>
        </div>
      </section>

      <section className="panel">
        <div className="eyebrow">Capital rotation board</div>
        <h2>Signals judges can understand in 10 seconds</h2>
        <div className="table">
          {signals.map((signal) => (
            <div key={signal.id} className="row">
              <div>{signal.headline}</div>
              <div className="muted">
                {signal.sourceAsset} -&gt; {signal.destinationAsset}
              </div>
              <div className="muted">
                {signal.sourceProtocol} / {signal.destinationProtocol}
              </div>
              <div>{signal.confidence}%</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
