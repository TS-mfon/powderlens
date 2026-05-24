import { getJson } from "../api";
import { appConfig } from "../config";
import { useApi } from "../hooks/useApi";
import type { RuntimeStatus, ServiceHealth } from "../types";

type StatusPageProps = {
  health: ServiceHealth;
};

export function StatusPage({ health }: StatusPageProps) {
  const { data: status } = useApi(() => getJson<RuntimeStatus>("/status"));

  return (
    <main className="page-stack">
      <section className="panel premium">
        <div className="eyebrow">System status</div>
        <h1>Runtime and contract environment</h1>
        <p className="copy">
          The frontend probes the primary backend and automatically falls back to Render when the VPS is unavailable. If both runtimes degrade, the site keeps Mantle transactions available and informs the user without crashing.
        </p>
      </section>
      <section className="panel">
        <div className="table">
          <div className="row">
            <div>Backend availability</div>
            <div>{health.backendAvailable ? "healthy" : "degraded"}</div>
            <div>Last check</div>
            <div className="muted">{health.lastCheckedAt ?? "not available"}</div>
          </div>
          <div className="row">
            <div>Active runtime</div>
            <div>{health.runtimeOrigin ?? "unreachable"}</div>
            <div>Backend role</div>
            <div className="muted">{health.backendRole ?? "unreachable"}</div>
          </div>
          <div className="row">
            <div>Signal registry</div>
            <div className="muted">{appConfig.contracts.signalRegistry}</div>
            <div>Thesis registry</div>
            <div className="muted">{appConfig.contracts.thesisRegistry}</div>
          </div>
          <div className="row">
            <div>Admin controller</div>
            <div className="muted">{appConfig.contracts.adminController}</div>
            <div>RPC</div>
            <div className="muted">{appConfig.rpcUrl}</div>
          </div>
          {status ? (
            <>
              <div className="row">
                <div>Runtime origin</div>
                <div>{status.runtimeOrigin}</div>
                <div>Response role</div>
                <div className="muted">{status.backendRole}</div>
              </div>
              <div className="row">
                <div>Signals indexed</div>
                <div>{status.signalCount}</div>
                <div>Starter workflows</div>
                <div>{status.starterCount}</div>
              </div>
              <div className="row">
                <div>Alert rules</div>
                <div>{status.alertCount}</div>
                <div>Tracked theses</div>
                <div>{status.thesisCount}</div>
              </div>
              <div className="row">
                <div>AI feedback</div>
                <div>{status.aiFeedbackCount}</div>
                <div>Replication</div>
                <div className="muted">{status.replication.status}</div>
              </div>
              <div className="row">
                <div>Failed replications</div>
                <div>{status.replication.failedCount}</div>
                <div>Last replicated</div>
                <div className="muted">{status.replication.lastReplicationAt ?? "not yet replicated"}</div>
              </div>
              <div className="row">
                <div>Latest worker</div>
                <div className="muted">{status.heartbeats[0]?.serviceName ?? "not yet reported"}</div>
                <div>Heartbeat</div>
                <div className="muted">{status.heartbeats[0]?.lastRanAt ?? "not yet reported"}</div>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
