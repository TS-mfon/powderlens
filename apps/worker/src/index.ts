import { Pool } from "pg";

type ReplicationRow = {
  id: string;
  action: string;
  payload: Record<string, unknown>;
};

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "127.0.0.1",
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB || "powderlens",
  user: process.env.POSTGRES_USER || "powderlens",
  password: process.env.POSTGRES_PASSWORD || "change-me"
});

const peerConfigured = Boolean(
  process.env.PEER_POSTGRES_HOST &&
    process.env.PEER_POSTGRES_DB &&
    process.env.PEER_POSTGRES_USER &&
    process.env.PEER_POSTGRES_PASSWORD
);

const peerPool = peerConfigured
  ? new Pool({
      host: process.env.PEER_POSTGRES_HOST,
      port: Number(process.env.PEER_POSTGRES_PORT || process.env.POSTGRES_PORT || 5432),
      database: process.env.PEER_POSTGRES_DB,
      user: process.env.PEER_POSTGRES_USER,
      password: process.env.PEER_POSTGRES_PASSWORD
    })
  : null;

const serviceName = `${process.env.POSTGRES_DB || "powderlens"}-worker`;

const writePeer = async (action: string, payload: Record<string, unknown>) => {
  if (!peerPool) {
    return;
  }

  if (action === "create_alert_rule") {
    await peerPool.query(
      `insert into alert_rules (id, user_id, channel, condition, is_enabled, created_at)
       values ($1, $2, $3, $4, $5, coalesce($6::timestamptz, now()))
       on conflict (id) do update set channel = excluded.channel, condition = excluded.condition, is_enabled = excluded.is_enabled`,
      [payload.id, payload.userId, payload.channel, payload.condition, payload.isEnabled, payload.createdAt]
    );
    return;
  }

  if (action === "create_thesis") {
    await peerPool.query(
      `insert into saved_theses (id, user_id, signal_id, thesis, status, created_at)
       values ($1, $2, $3, $4, $5, coalesce($6::timestamptz, now()))
       on conflict (id) do update set thesis = excluded.thesis, status = excluded.status`,
      [payload.id, payload.userId, payload.signalId, payload.thesis, payload.status, payload.createdAt]
    );
    return;
  }

  if (action === "create_watchlist") {
    await peerPool.query(
      `insert into watchlists (id, user_id, name, created_at)
       values ($1, $2, $3, coalesce($4::timestamptz, now()))
       on conflict (id) do update set name = excluded.name`,
      [payload.id, payload.userId, payload.name, payload.createdAt]
    );
    return;
  }

  if (action === "upsert_wallet_label") {
    await peerPool.query(
      `insert into wallet_entities (id, address, label, category, conviction, created_at)
       values ($1, $2, $3, $4, $5, coalesce($6::timestamptz, now()))
       on conflict (address)
       do update set label = excluded.label, category = excluded.category, conviction = excluded.conviction`,
      [payload.id, payload.address, payload.label, payload.category, payload.conviction, payload.createdAt]
    );
    return;
  }

  if (action === "create_ai_feedback") {
    await peerPool.query(
      `insert into ai_feedback (id, signal_id, user_id, verdict, note, created_at)
       values ($1, $2, $3, $4, $5, coalesce($6::timestamptz, now()))
       on conflict (id) do update set verdict = excluded.verdict, note = excluded.note`,
      [payload.id, payload.signalId, payload.userId, payload.verdict, payload.note, payload.createdAt]
    );
    return;
  }

  throw new Error(`Unsupported replication action: ${action}`);
};

const retryReplication = async () => {
  if (!peerPool) {
    return { attempted: 0, replicated: 0 };
  }

  const rows = await pool.query<ReplicationRow>(
    `select id, action, payload
     from replication_events
     where status = 'failed'
     order by created_at asc
     limit 20`
  );

  let replicated = 0;
  for (const row of rows.rows) {
    try {
      await writePeer(row.action, row.payload);
      await pool.query(
        `update replication_events
         set status = 'replicated', error_message = '', resolved_at = now()
         where id = $1`,
        [row.id]
      );
      replicated += 1;
    } catch (error) {
      await pool.query(
        `update replication_events
         set error_message = $2
         where id = $1`,
        [row.id, error instanceof Error ? error.message : "Retry failed"]
      );
    }
  }

  return { attempted: rows.rowCount, replicated };
};

const cycle = async () => {
  const now = new Date().toISOString();
  console.log(`[${serviceName}] ${now} starting signal refresh cycle`);

  const signals = await pool.query<{ total: string }>(
    "select count(*) as total from rotation_signals"
  );
  const retryResult = await retryReplication();

  const details = `signalInventory=${signals.rows[0]?.total ?? "0"};replicationAttempted=${retryResult.attempted};replicated=${retryResult.replicated}`;
  await pool.query(
    `insert into worker_heartbeats (service_name, status, details, last_ran_at)
     values ($1, 'healthy', $2, now())
     on conflict (service_name)
     do update set status = excluded.status, details = excluded.details, last_ran_at = excluded.last_ran_at`,
    [serviceName, details]
  );
  console.log(`[${serviceName}] ${details}`);
};

void cycle();
setInterval(() => {
  void cycle();
}, 60_000);
