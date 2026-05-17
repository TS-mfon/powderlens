import { getJson } from "../api";
import { useApi } from "../hooks/useApi";
import type { Signal } from "../types";

export function SignalsPage() {
  const { data, error, isLoading } = useApi(() => getJson<Signal[]>("/signals"));

  if (isLoading) {
    return <main className="panel">Loading signals...</main>;
  }

  if (error) {
    return <main className="panel">Failed to load signals: {error}</main>;
  }

  return (
    <main className="panel">
      <div className="eyebrow">Signal queue</div>
      <h1>Live signals</h1>
      <div className="table">
        {data?.map((signal) => (
          <div key={signal.id} className="row">
            <div>{signal.headline}</div>
            <div>{signal.confidence}%</div>
            <div>{signal.severity}</div>
            <div className="muted">{signal.summary}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
