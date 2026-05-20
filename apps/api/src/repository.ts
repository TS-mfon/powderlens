import { query } from "./db.js";

type SignalRow = {
  id: string;
  headline: string;
  summary: string;
  confidence: number;
  severity: string;
  source_protocol: string;
  destination_protocol: string;
  source_asset: string;
  destination_asset: string;
  created_at: string;
};

type EvidenceRow = {
  id: string;
  signal_id: string;
  evidence_type: string;
  title: string;
  body: string;
};

export const getSignals = async () => {
  const signals = await query<SignalRow>(
    `select id, headline, summary, confidence, severity, source_protocol, destination_protocol, source_asset, destination_asset, created_at
     from rotation_signals
     order by created_at desc`
  );

  const evidence = await query<EvidenceRow>(
    `select id, signal_id, evidence_type, title, body
     from signal_evidence`
  );

  return signals.map((signal) => ({
    id: signal.id,
    headline: signal.headline,
    summary: signal.summary,
    confidence: signal.confidence,
    severity: signal.severity,
    sourceProtocol: signal.source_protocol,
    destinationProtocol: signal.destination_protocol,
    sourceAsset: signal.source_asset,
    destinationAsset: signal.destination_asset,
    createdAt: signal.created_at,
    evidence: evidence
      .filter((item) => item.signal_id === signal.id)
      .map((item) => ({
        id: item.id,
        type: item.evidence_type,
        title: item.title,
        body: item.body
      }))
  }));
};

export const getStarterWorkflows = async () => {
  return query<{
    id: string;
    title: string;
    summary: string;
    cta: string;
    thesis: string;
    signal_id: string | null;
    created_at: string;
  }>(
    `select id, title, summary, cta, thesis, signal_id, created_at
     from starter_workflows
     order by created_at desc`
  );
};

export const getWalletByAddress = async (address: string) => {
  const rows = await query<{
    address: string;
    label: string;
    category: string;
    conviction: number;
  }>(
    `select address, label, category, conviction
     from wallet_entities
     where lower(address) = lower($1)
     limit 1`,
    [address]
  );

  return rows[0] ?? null;
};

export const getProtocols = async () => {
  const signals = await getSignals();
  const grouped = new Map<string, { slug: string; name: string; activeSignals: number; heatScore: number }>();

  for (const signal of signals) {
    const names = [signal.sourceProtocol, signal.destinationProtocol];
    for (const name of names) {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const existing = grouped.get(slug);
      if (existing) {
        existing.activeSignals += 1;
        existing.heatScore = Math.min(99, existing.heatScore + 3);
      } else {
        grouped.set(slug, {
          slug,
          name,
          activeSignals: 1,
          heatScore: 72
        });
      }
    }
  }

  return Array.from(grouped.values());
};

export const createAlertRule = async (channel: string, condition: string) => {
  const rows = await query<{
    id: string;
    channel: string;
    condition: string;
    is_enabled: boolean;
  }>(
    `insert into alert_rules (id, user_id, channel, condition, is_enabled)
     values (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', $1, $2, true)
     returning id, channel, condition, is_enabled`,
    [channel, condition]
  );

  return rows[0];
};

export const getAlertRules = async () => {
  const rows = await query<{
    id: string;
    channel: string;
    condition: string;
    is_enabled: boolean;
    created_at: string;
  }>(
    `select id, channel, condition, is_enabled, created_at
     from alert_rules
     order by created_at desc`
  );

  return rows.map((row) => ({
    id: row.id,
    channel: row.channel,
    condition: row.condition,
    isEnabled: row.is_enabled,
    createdAt: row.created_at
  }));
};

export const createThesis = async (signalId: string, thesis: string) => {
  const rows = await query<{
    id: string;
    status: string;
    created_at: string;
  }>(
    `insert into saved_theses (id, user_id, signal_id, thesis, status)
     values (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', $1, $2, 'tracking')
     returning id, status, created_at`,
    [signalId, thesis]
  );

  return rows[0];
};

export const getTheses = async () => {
  return query<{
    id: string;
    signal_id: string;
    thesis: string;
    status: string;
    created_at: string;
  }>(
    `select id, signal_id, thesis, status, created_at
     from saved_theses
     order by created_at desc`
  );
};

export const createWatchlist = async (name: string) => {
  const rows = await query<{
    id: string;
    name: string;
    created_at: string;
  }>(
    `insert into watchlists (id, user_id, name)
     values (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', $1)
     returning id, name, created_at`,
    [name]
  );

  return rows[0];
};

export const getWatchlists = async () => {
  return query<{
    id: string;
    name: string;
    created_at: string;
  }>(
    `select id, name, created_at
     from watchlists
     order by created_at desc`
  );
};

export const createWalletLabel = async (
  address: string,
  label: string,
  category: string,
  reason: string
) => {
  const rows = await query<{
    id: string;
    address: string;
    label: string;
    category: string;
    conviction: number;
  }>(
    `insert into wallet_entities (id, address, label, category, conviction)
     values (gen_random_uuid(), $1, $2, $3, 70)
     on conflict (address)
     do update set label = excluded.label, category = excluded.category
     returning id, address, label, category, conviction`,
    [address, label, category]
  );

  await query(
    `insert into audit_logs (id, actor_email, action, target_type, target_id, reason)
     values (gen_random_uuid(), 'ops@powderlens.ai', 'upsert_wallet_label', 'wallet', $1, $2)`,
    [address, reason]
  );

  return rows[0];
};

export const getRuntimeStatus = async (
  serviceName: string,
  databaseName: string,
  runtimeOrigin: "vps" | "render",
  backendRole: "primary" | "fallback"
) => {
  const [{ total: signalCount }] = await query<{ total: string }>(
    "select count(*)::text as total from rotation_signals"
  );
  const [{ total: starterCount }] = await query<{ total: string }>(
    "select count(*)::text as total from starter_workflows"
  );
  const [{ total: alertCount }] = await query<{ total: string }>(
    "select count(*)::text as total from alert_rules"
  );
  const [{ total: thesisCount }] = await query<{ total: string }>(
    "select count(*)::text as total from saved_theses"
  );
  const heartbeats = await query<{
    service_name: string;
    status: string;
    details: string;
    last_ran_at: string;
  }>(
    `select service_name, status, details, last_ran_at
     from worker_heartbeats
     order by last_ran_at desc`
  );

  return {
    service: serviceName,
    database: databaseName,
    runtimeOrigin,
    backendRole,
    signalCount: Number(signalCount),
    starterCount: Number(starterCount),
    alertCount: Number(alertCount),
    thesisCount: Number(thesisCount),
    heartbeats: heartbeats.map((item) => ({
      serviceName: item.service_name,
      status: item.status,
      details: item.details,
      lastRanAt: item.last_ran_at
    }))
  };
};
