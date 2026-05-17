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

export const query = async <T extends QueryResultRow>(
  text: string,
  values?: unknown[]
) => {
  const result = await pool.query<T>(text, values);
  return result.rows;
};
