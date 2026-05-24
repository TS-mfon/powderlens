import { useMemo } from "react";

import { getJson } from "../api";
import { useApi } from "../hooks/useApi";
import type { AlertRule, ReplicationEvent, Review } from "../types";

type OpsPageProps = {
  backendAvailable: boolean;
};

export function OpsPage({ backendAvailable }: OpsPageProps) {
  const { data: alerts } = useApi(() => getJson<AlertRule[]>("/alerts"));
  const { data: reviews } = useApi(() => getJson<Review[]>("/admin/reviews"));
  const { data: replicationEvents } = useApi(() => getJson<ReplicationEvent[]>("/replication-events"));

  const queues = useMemo(
    () => ({
      alerts: alerts ?? [],
      reviews: reviews ?? [],
      replicationEvents: replicationEvents ?? []
    }),
    [alerts, reviews, replicationEvents]
  );

  return (
    <main className="dashboard-grid">
      <section className="panel">
        <div className="eyebrow">Operator queue</div>
        <h1>Alert routing</h1>
        <div className="table">
          {queues.alerts.map((rule) => (
            <div key={rule.id} className="row">
              <div>{rule.channel}</div>
              <div className="muted">{rule.condition}</div>
              <div>{String(rule.is_enabled ?? rule.isEnabled ?? true)}</div>
              <div>{backendAvailable ? "live" : "local fallback"}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="eyebrow">Review queue</div>
        <h1>Escalated signals</h1>
        <div className="table">
          {queues.reviews.map((review) => (
            <div key={review.id} className="row">
              <div>{review.headline}</div>
              <div>{review.confidence}%</div>
              <div>{review.severity}</div>
              <div>{review.status}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="panel ops-wide">
        <div className="eyebrow">VPS to Render consistency</div>
        <h1>Replication ledger</h1>
        <div className="table">
          {queues.replicationEvents.map((event) => (
            <div key={event.id} className="row">
              <div>{event.action}</div>
              <div>{event.status}</div>
              <div className="muted">{event.sourceRole} to {event.targetRole}</div>
              <div className="muted">{event.errorMessage || event.createdAt}</div>
            </div>
          ))}
          {queues.replicationEvents.length === 0 ? (
            <div className="row">
              <div>No replication events</div>
              <div className="muted">Writes will appear here after backend mutations.</div>
              <div />
              <div />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
