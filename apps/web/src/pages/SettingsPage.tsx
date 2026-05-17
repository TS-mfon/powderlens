export function SettingsPage() {
  return (
    <main className="panel">
      <div className="eyebrow">Environment</div>
      <h1>System settings</h1>
      <div className="table">
        <div className="row">
          <div>Frontend host</div>
          <div className="muted">Vercel</div>
          <div>API host</div>
          <div className="muted">VPS</div>
        </div>
        <div className="row">
          <div>Database</div>
          <div className="muted">PostgreSQL on VPS</div>
          <div>Queue/cache</div>
          <div className="muted">Redis on VPS</div>
        </div>
      </div>
    </main>
  );
}
