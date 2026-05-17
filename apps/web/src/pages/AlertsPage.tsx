import { FormEvent, useEffect, useState } from "react";

import { getJson, postJson } from "../api";
import { useApi } from "../hooks/useApi";
import type { AlertRule } from "../types";

export function AlertsPage() {
  const { data, error, isLoading } = useApi(() => getJson<AlertRule[]>("/alerts"));
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [channel, setChannel] = useState("telegram");
  const [condition, setCondition] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setAlerts(data);
    }
  }, [data]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Saving alert rule...");

    try {
      const created = await postJson<AlertRule>("/alerts", { channel, condition });
      setAlerts((current) => [created, ...current]);
      setCondition("");
      setStatus("Alert rule saved.");
    } catch (submitError) {
      setStatus(
        submitError instanceof Error ? submitError.message : "Failed to save alert rule."
      );
    }
  };

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
      <form className="stack" onSubmit={onSubmit}>
        <div className="split">
          <select className="input" value={channel} onChange={(event) => setChannel(event.target.value)}>
            <option value="telegram">Telegram</option>
            <option value="discord">Discord</option>
            <option value="email">Email</option>
          </select>
          <input
            className="input"
            placeholder="Alert when sticky LPs rotate into cmETH range positions"
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            minLength={8}
            required
          />
        </div>
        <button className="button" type="submit">
          Save operator rule
        </button>
        {status ? <div className="muted">{status}</div> : null}
      </form>
      <div className="table">
        {alerts.map((rule) => (
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
