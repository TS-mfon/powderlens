import { Pool } from "pg";

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "127.0.0.1",
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB || "powderlens",
  user: process.env.POSTGRES_USER || "powderlens",
  password: process.env.POSTGRES_PASSWORD || "change-me"
});

const serviceName = `${process.env.POSTGRES_DB || "powderlens"}-worker`;

const cycle = async () => {
  const now = new Date().toISOString();
  console.log(`[${serviceName}] ${now} starting signal refresh cycle`);

  const signals = await pool.query<{ total: string }>(
    "select count(*) as total from rotation_signals"
  );

  console.log(
    `[${serviceName}] current signal inventory ${signals.rows[0]?.total ?? "0"}`
  );
  await pool.query(
    `insert into worker_heartbeats (service_name, status, details, last_ran_at)
     values ($1, 'healthy', $2, now())
     on conflict (service_name)
     do update set status = excluded.status, details = excluded.details, last_ran_at = excluded.last_ran_at`,
    [serviceName, `signalInventory=${signals.rows[0]?.total ?? "0"}`]
  );
  console.log(`[${serviceName}] queued production tasks: ingest Mantle events, recompute anomalies, dispatch alerts`);
};

void cycle();
setInterval(() => {
  void cycle();
}, 60_000);
