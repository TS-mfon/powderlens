import { randomUUID } from "node:crypto";

import { env } from "./config.js";
import { peerDatabaseConfigured, query, queryPeer } from "./db.js";

type ReplicationPayload = Record<string, unknown>;

type ReplicationEventRow = {
  id: string;
  action: string;
  target_table: string;
  target_id: string;
  payload: ReplicationPayload;
  source_role: string;
  target_role: string;
  status: string;
  error_message: string;
  created_at: string;
  resolved_at: string | null;
};

const targetRole = env.BACKEND_ROLE === "primary" ? "fallback" : "primary";

const peerWrite = async (action: string, payload: ReplicationPayload) => {
  switch (action) {
    case "create_alert_rule":
      await queryPeer(
        `insert into alert_rules (id, user_id, channel, condition, is_enabled, created_at)
         values ($1, $2, $3, $4, $5, coalesce($6::timestamptz, now()))
         on conflict (id) do update set channel = excluded.channel, condition = excluded.condition, is_enabled = excluded.is_enabled`,
        [
          payload.id,
          payload.userId,
          payload.channel,
          payload.condition,
          payload.isEnabled,
          payload.createdAt
        ]
      );
      return;
    case "create_thesis":
      await queryPeer(
        `insert into saved_theses (id, user_id, signal_id, thesis, status, created_at)
         values ($1, $2, $3, $4, $5, coalesce($6::timestamptz, now()))
         on conflict (id) do update set thesis = excluded.thesis, status = excluded.status`,
        [
          payload.id,
          payload.userId,
          payload.signalId,
          payload.thesis,
          payload.status,
          payload.createdAt
        ]
      );
      return;
    case "create_watchlist":
      await queryPeer(
        `insert into watchlists (id, user_id, name, created_at)
         values ($1, $2, $3, coalesce($4::timestamptz, now()))
         on conflict (id) do update set name = excluded.name`,
        [payload.id, payload.userId, payload.name, payload.createdAt]
      );
      return;
    case "upsert_wallet_label":
      await queryPeer(
        `insert into wallet_entities (id, address, label, category, conviction, created_at)
         values ($1, $2, $3, $4, $5, coalesce($6::timestamptz, now()))
         on conflict (address)
         do update set label = excluded.label, category = excluded.category, conviction = excluded.conviction`,
        [
          payload.id,
          payload.address,
          payload.label,
          payload.category,
          payload.conviction,
          payload.createdAt
        ]
      );
      await queryPeer(
        `insert into audit_logs (id, actor_email, action, target_type, target_id, reason, created_at)
         values ($1, $2, 'upsert_wallet_label', 'wallet', $3, $4, now())
         on conflict (id) do nothing`,
        [randomUUID(), "ops@mantle-ai.local", payload.address, payload.reason]
      );
      return;
    case "create_ai_feedback":
      await queryPeer(
        `insert into ai_feedback (id, signal_id, user_id, verdict, note, created_at)
         values ($1, $2, $3, $4, $5, coalesce($6::timestamptz, now()))
         on conflict (id) do update set verdict = excluded.verdict, note = excluded.note`,
        [
          payload.id,
          payload.signalId,
          payload.userId,
          payload.verdict,
          payload.note,
          payload.createdAt
        ]
      );
      return;
    default:
      throw new Error(`Unsupported replication action: ${action}`);
  }
};

export const recordReplication = async (
  action: string,
  targetTable: string,
  targetId: string,
  payload: ReplicationPayload
) => {
  const eventId = randomUUID();

  if (!peerDatabaseConfigured) {
    await query(
      `insert into replication_events (id, action, target_table, target_id, payload, source_role, target_role, status, error_message)
       values ($1, $2, $3, $4, $5::jsonb, $6, $7, 'disabled', 'Peer database is not configured')`,
      [
        eventId,
        action,
        targetTable,
        targetId,
        JSON.stringify(payload),
        env.BACKEND_ROLE,
        targetRole
      ]
    );
    return { status: "disabled", error: "Peer database is not configured" };
  }

  try {
    await peerWrite(action, payload);
    await query(
      `insert into replication_events (id, action, target_table, target_id, payload, source_role, target_role, status, resolved_at)
       values ($1, $2, $3, $4, $5::jsonb, $6, $7, 'replicated', now())`,
      [
        eventId,
        action,
        targetTable,
        targetId,
        JSON.stringify(payload),
        env.BACKEND_ROLE,
        targetRole
      ]
    );
    return { status: "replicated" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Peer replication failed";
    await query(
      `insert into replication_events (id, action, target_table, target_id, payload, source_role, target_role, status, error_message)
       values ($1, $2, $3, $4, $5::jsonb, $6, $7, 'failed', $8)`,
      [
        eventId,
        action,
        targetTable,
        targetId,
        JSON.stringify(payload),
        env.BACKEND_ROLE,
        targetRole,
        message
      ]
    );
    return { status: "failed", error: message };
  }
};

export const getReplicationEvents = async () => {
  const rows = await query<ReplicationEventRow>(
    `select id, action, target_table, target_id, payload, source_role, target_role, status, error_message, created_at, resolved_at
     from replication_events
     order by created_at desc
     limit 50`
  );

  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    targetTable: row.target_table,
    targetId: row.target_id,
    payload: row.payload,
    sourceRole: row.source_role,
    targetRole: row.target_role,
    status: row.status,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at
  }));
};

export const retryFailedReplicationEvents = async () => {
  if (!peerDatabaseConfigured) {
    return { attempted: 0, replicated: 0 };
  }

  const rows = await query<ReplicationEventRow>(
    `select id, action, target_table, target_id, payload, source_role, target_role, status, error_message, created_at, resolved_at
     from replication_events
     where status = 'failed'
     order by created_at asc
     limit 20`
  );

  let replicated = 0;
  for (const row of rows) {
    try {
      await peerWrite(row.action, row.payload);
      await query(
        `update replication_events
         set status = 'replicated', error_message = '', resolved_at = now()
         where id = $1`,
        [row.id]
      );
      replicated += 1;
    } catch (error) {
      await query(
        `update replication_events
         set error_message = $2
         where id = $1`,
        [row.id, error instanceof Error ? error.message : "Retry failed"]
      );
    }
  }

  return { attempted: rows.length, replicated };
};
