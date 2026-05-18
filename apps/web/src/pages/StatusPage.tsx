import { appConfig } from "../config";
import type { ServiceHealth } from "../types";

type StatusPageProps = {
  health: ServiceHealth;
};

export function StatusPage({ health }: StatusPageProps) {
  return (
    <main className="page-stack">
      <section className="panel premium">
        <div className="eyebrow">System status</div>
        <h1>Runtime and contract environment</h1>
        <p className="copy">
          The frontend monitors the VPS health endpoint continuously. If the backend degrades, the site keeps Mantle transactions available and informs the user without crashing.
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
        </div>
      </section>
    </main>
  );
}
