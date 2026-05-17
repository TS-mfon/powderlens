import { getJson } from "../api";
import { useApi } from "../hooks/useApi";
import type { AlertRule } from "../types";

export function AlertsPage() {
  const { data, error, isLoading } = useApi(() => getJson<AlertRule[]>("/alerts"));

  if (isLoading) {
    return <main className="panel">Loading alert rules...</main>;
  }

  if (error) {
    return <main className="panel">Failed to load alerts: {error}</main>;
  }

  return (
    <main className="panel">
      <div className="eyebrow">Operator actions</div>
      <h1>Alert rules</h1>
      <p className="copy">
        Configure Telegram, Discord, and email routing for high-conviction rotation events, treasury-style reallocations, and protocol heat spikes.
      </p>
      <div className="table">
        {data?.map((rule) => (
          <div key={rule.id} className="row">
            <div>{rule.channel}</div>
            <div className="muted">{rule.condition}</div>
            <div>{String(rule.is_enabled ?? rule.isEnabled ?? true)}</div>
            <div>{rule.id}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
