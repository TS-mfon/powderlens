import { Pool, type QueryResultRow } from "pg";

import { env } from "./config.js";

export const pool = new Pool({
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  database: env.POSTGRES_DB,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30_000
});

export const peerDatabaseConfigured = Boolean(
  env.PEER_POSTGRES_HOST &&
    env.PEER_POSTGRES_DB &&
    env.PEER_POSTGRES_USER &&
    env.PEER_POSTGRES_PASSWORD
);

export const peerPool = peerDatabaseConfigured
  ? new Pool({
      host: env.PEER_POSTGRES_HOST,
      port: env.PEER_POSTGRES_PORT ?? env.POSTGRES_PORT,
      database: env.PEER_POSTGRES_DB,
      user: env.PEER_POSTGRES_USER,
      password: env.PEER_POSTGRES_PASSWORD,
      max: 5,
      idleTimeoutMillis: 30_000
    })
  : null;

export const query = async <T extends QueryResultRow>(
  text: string,
  values?: unknown[]
) => {
  const result = await pool.query<T>(text, values);
  return result.rows;
};

export const queryPeer = async <T extends QueryResultRow>(
  text: string,
  values?: unknown[]
) => {
  if (!peerPool) {
    throw new Error("Peer database is not configured");
  }

  const result = await peerPool.query<T>(text, values);
  return result.rows;
};
