import { query } from "./db.js";
import { getReplicationEvents, recordReplication } from "./replication.js";

const systemUserId = "00000000-0000-0000-0000-000000000002";

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
  evidence_hash: string;
  created_at: string;
};

type EvidenceRow = {
  id: string;
  signal_id: string;
  evidence_type: string;
  title: string;
  body: string;
};

type FeedbackCountRow = {
  signal_id: string;
  accepted: string;
  rejected: string;
};

const trackFromDatabase = (databaseName: string) => {
  if (databaseName.includes("atlasyield")) {
    return "AI x RWA";
  }
  if (databaseName.includes("porter")) {
    return "Agentic Wallets & Economy";
  }
  if (databaseName.includes("forgepilot")) {
    return "AI DevTools";
  }
  if (databaseName.includes("nest")) {
    return "Consumer & Viral DApps";
  }
  return "AI Alpha & Data";
};

export const getSignals = async () => {
  const signals = await query<SignalRow>(
    `select id, headline, summary, confidence, severity, source_protocol, destination_protocol, source_asset, destination_asset, evidence_hash, created_at
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
    evidenceHash: signal.evidence_hash,
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
    created_at: string;
  }>(
    `insert into alert_rules (id, user_id, channel, condition, is_enabled)
     values (gen_random_uuid(), $1, $2, $3, true)
     returning id, channel, condition, is_enabled, created_at`,
    [systemUserId, channel, condition]
  );

  const row = rows[0];
  const replication = await recordReplication("create_alert_rule", "alert_rules", row.id, {
    id: row.id,
    userId: systemUserId,
    channel: row.channel,
    condition: row.condition,
    isEnabled: row.is_enabled,
    createdAt: row.created_at
  });

  return { ...row, replication };
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
     values (gen_random_uuid(), $1, $2, $3, 'tracking')
     returning id, status, created_at`,
    [systemUserId, signalId, thesis]
  );

  const row = rows[0];
  const replication = await recordReplication("create_thesis", "saved_theses", row.id, {
    id: row.id,
    userId: systemUserId,
    signalId,
    thesis,
    status: row.status,
    createdAt: row.created_at
  });

  return { ...row, replication };
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
     values (gen_random_uuid(), $1, $2)
     returning id, name, created_at`,
    [systemUserId, name]
  );

  const row = rows[0];
  const replication = await recordReplication("create_watchlist", "watchlists", row.id, {
    id: row.id,
    userId: systemUserId,
    name: row.name,
    createdAt: row.created_at
  });

  return { ...row, replication };
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
    created_at: string;
  }>(
    `insert into wallet_entities (id, address, label, category, conviction)
     values (gen_random_uuid(), $1, $2, $3, 70)
     on conflict (address)
     do update set label = excluded.label, category = excluded.category
     returning id, address, label, category, conviction, created_at`,
    [address, label, category]
  );

  await query(
    `insert into audit_logs (id, actor_email, action, target_type, target_id, reason)
     values (gen_random_uuid(), 'ops@mantle-ai.local', 'upsert_wallet_label', 'wallet', $1, $2)`,
    [address, reason]
  );

  const row = rows[0];
  const replication = await recordReplication("upsert_wallet_label", "wallet_entities", row.id, {
    id: row.id,
    address: row.address,
    label: row.label,
    category: row.category,
    conviction: row.conviction,
    reason,
    createdAt: row.created_at
  });

  return { ...row, replication };
};

export const getAiDecisions = async (databaseName: string) => {
  const signals = await getSignals();
  const feedback = await query<FeedbackCountRow>(
    `select signal_id,
            count(*) filter (where verdict = 'accepted')::text as accepted,
            count(*) filter (where verdict = 'rejected')::text as rejected
     from ai_feedback
     group by signal_id`
  );
  const feedbackBySignal = new Map(feedback.map((item) => [item.signal_id, item]));
  const track = trackFromDatabase(databaseName);

  return signals.map((signal) => {
    const accepted = Number(feedbackBySignal.get(signal.id)?.accepted ?? "0");
    const rejected = Number(feedbackBySignal.get(signal.id)?.rejected ?? "0");
    const consensusBoost = Math.min(8, accepted * 2) - Math.min(10, rejected * 3);
    const score = Math.max(0, Math.min(99, signal.confidence + consensusBoost));
    const directionalText = `${signal.sourceAsset} to ${signal.destinationAsset}`;
    const volatilityText = signal.severity === "critical" ? "high volatility" : "controlled volatility";

    const trackCopy = {
      "AI Alpha & Data": {
        type: "Smart-money anomaly",
        action: `Validate ${directionalText} rotation, then write the signal and evidence hash to Mantle.`,
        outcome: "Cleaner alpha feed with fewer false alerts and stronger whale-behavior confidence."
      },
      "AI x RWA": {
        type: "RWA rebalance",
        action: `Rebalance yield exposure from ${signal.sourceAsset} toward ${signal.destinationAsset} while monitoring ${volatilityText}.`,
        outcome: "Risk-adjusted yield thesis for tokenized treasury and mETH style positions."
      },
      "Agentic Wallets & Economy": {
        type: "Wallet autonomy policy",
        action: `Schedule an agent action for ${signal.destinationProtocol} only if wallet limits and slippage rules pass.`,
        outcome: "Self-driving wallet behavior with explicit policy constraints and reviewable execution logs."
      },
      "AI DevTools": {
        type: "Execution optimizer",
        action: `Simulate execution against ${signal.destinationProtocol} and select the cheapest safe path before writing results.`,
        outcome: "Lower gas spend and safer contract interaction paths for Mantle developers."
      },
      "Consumer & Viral DApps": {
        type: "Personalized quest economy",
        action: `Turn the ${signal.destinationAsset} opportunity into a user-specific challenge with capped reward exposure.`,
        outcome: "A Mantle-native consumer loop that converts market activity into explainable social quests."
      }
    }[track];

    return {
      id: signal.id,
      signalId: signal.id,
      track,
      modelVersion: "mantle-ai-planner-v2",
      decisionType: trackCopy.type,
      score,
      confidence: signal.confidence,
      rationale: `${signal.headline}. The agent scores this using live Mantle signal confidence, severity, protocol path, evidence density, and operator feedback.`,
      drivers: [
        `${signal.sourceProtocol} to ${signal.destinationProtocol}`,
        `${directionalText} path`,
        `${signal.evidence?.length ?? 0} evidence records`,
        `${accepted} accepted / ${rejected} rejected operator reviews`
      ],
      riskFlags: [
        signal.severity === "critical" ? "critical-severity-review" : "standard-review",
        rejected > accepted ? "operator-disagreement" : "feedback-aligned",
        score < 70 ? "low-confidence" : "actionable-confidence"
      ],
      recommendedAction: trackCopy.action,
      expectedOutcome: trackCopy.outcome,
      feedback: { accepted, rejected },
      evidenceHash: signal.evidenceHash,
      createdAt: signal.createdAt
    };
  });
};

export const getAiDecisionById = async (databaseName: string, id: string) => {
  return (await getAiDecisions(databaseName)).find((decision) => decision.id === id) ?? null;
};

export const createAiFeedback = async (
  signalId: string,
  verdict: "accepted" | "rejected",
  note: string
) => {
  const rows = await query<{
    id: string;
    signal_id: string;
    verdict: string;
    note: string;
    created_at: string;
  }>(
    `insert into ai_feedback (id, signal_id, user_id, verdict, note)
     values (gen_random_uuid(), $1, $2, $3, $4)
     returning id, signal_id, verdict, note, created_at`,
    [signalId, systemUserId, verdict, note]
  );

  const row = rows[0];
  const replication = await recordReplication("create_ai_feedback", "ai_feedback", row.id, {
    id: row.id,
    signalId: row.signal_id,
    userId: systemUserId,
    verdict: row.verdict,
    note: row.note,
    createdAt: row.created_at
  });

  return { ...row, replication };
};

export const getSignalPrediction = async (databaseName: string, signalId: string) => {
  const decision = await getAiDecisionById(databaseName, signalId);
  if (!decision) {
    return null;
  }

  return {
    signalId,
    modelVersion: decision.modelVersion,
    nextMoveProbability: decision.score,
    recommendedAction: decision.recommendedAction,
    expectedOutcome: decision.expectedOutcome,
    riskFlags: decision.riskFlags
  };
};

export const getReplicationQueue = async () => getReplicationEvents();

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
  const [{ total: aiFeedbackCount }] = await query<{ total: string }>(
    "select count(*)::text as total from ai_feedback"
  );
  const [{ total: failedReplicationCount }] = await query<{ total: string }>(
    "select count(*)::text as total from replication_events where status = 'failed'"
  );
  const latestReplication = await query<{ created_at: string }>(
    `select created_at
     from replication_events
     where status = 'replicated'
     order by created_at desc
     limit 1`
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
    aiFeedbackCount: Number(aiFeedbackCount),
    replication: {
      status: Number(failedReplicationCount) > 0 ? "degraded" : "healthy",
      failedCount: Number(failedReplicationCount),
      lastReplicationAt: latestReplication[0]?.created_at ?? null
    },
    heartbeats: heartbeats.map((item) => ({
      serviceName: item.service_name,
      status: item.status,
      details: item.details,
      lastRanAt: item.last_ran_at
    }))
  };
};
