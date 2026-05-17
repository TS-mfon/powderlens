import { appConfig } from "../config";

export function SettingsPage() {
  return (
    <main className="panel">
      <div className="eyebrow">Environment</div>
      <h1>System settings</h1>
      <div className="table">
        <div className="row">
          <div>Frontend host</div>
          <div className="muted">Vercel</div>
          <div>Execution chain</div>
          <div className="muted">{appConfig.chainName}</div>
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
    </main>
  );
}
