import cors from "cors";
import express from "express";
import { readFile } from "node:fs/promises";
import { z } from "zod";

import { env } from "./config.js";
import { pool } from "./db.js";
import {
  createAlertRule,
  createAiFeedback,
  createThesis,
  createWatchlist,
  createWalletLabel,
  getAlertRules,
  getAiDecisionById,
  getAiDecisions,
  getProtocols,
  getReplicationQueue,
  getRuntimeStatus,
  getSignalPrediction,
  getSignals,
  getStarterWorkflows,
  getTheses,
  getWalletByAddress,
  getWatchlists
} from "./repository.js";

const app = express();
const allowedOrigins = env.CORS_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true
}));
app.use(express.json());

const asyncRoute =
  <T extends express.RequestHandler>(handler: T): express.RequestHandler =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);

const applyDatabaseBootstrap = async () => {
  const schemaSql = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
  const seedSql = await readFile(new URL("../db/seed.sql", import.meta.url), "utf8");
  await pool.query(schemaSql);
  await pool.query(seedSql);
};

app.get("/health", asyncRoute(async (_req, res) => {
  await pool.query("select 1");
  res.json({
    status: "ok",
    service: `${env.POSTGRES_DB}-api`,
    environment: env.NODE_ENV,
    runtimeOrigin: env.RUNTIME_ORIGIN,
    backendRole: env.BACKEND_ROLE,
    timestamp: new Date().toISOString()
  });
}));

app.get("/status", asyncRoute(async (_req, res) => {
  res.json(
    await getRuntimeStatus(
      `${env.POSTGRES_DB}-api`,
      env.POSTGRES_DB,
      env.RUNTIME_ORIGIN,
      env.BACKEND_ROLE
    )
  );
}));

app.get("/live-feed", asyncRoute(async (_req, res) => {
  res.json({
    generatedAt: new Date().toISOString(),
    signals: await getSignals()
  });
}));

app.get("/signals", asyncRoute(async (_req, res) => {
  res.json(await getSignals());
}));

app.get("/starter-workflows", asyncRoute(async (_req, res) => {
  res.json(await getStarterWorkflows());
}));

app.get("/signals/:id", asyncRoute(async (req, res) => {
  const signalId = String(req.params.id);
  const signal = (await getSignals()).find((item) => item.id === signalId);
  if (!signal) {
    res.status(404).json({ message: "Signal not found" });
    return;
  }

  res.json(signal);
}));

app.get("/signals/:id/prediction", asyncRoute(async (req, res) => {
  const prediction = await getSignalPrediction(env.POSTGRES_DB, String(req.params.id));
  if (!prediction) {
    res.status(404).json({ message: "Signal prediction not found" });
    return;
  }

  res.json(prediction);
}));

app.get("/wallets/:address", asyncRoute(async (req, res) => {
  const wallet = await getWalletByAddress(String(req.params.address));
  if (!wallet) {
    res.status(404).json({ message: "Wallet not found" });
    return;
  }

  res.json(wallet);
}));

app.get("/protocols", asyncRoute(async (_req, res) => {
  res.json(await getProtocols());
}));

app.get("/protocols/:slug", asyncRoute(async (req, res) => {
  const slug = String(req.params.slug);
  const protocol = (await getProtocols()).find((item) => item.slug === slug);
  if (!protocol) {
    res.status(404).json({ message: "Protocol not found" });
    return;
  }

  res.json(protocol);
}));

app.get("/ai-decisions", asyncRoute(async (_req, res) => {
  res.json(await getAiDecisions(env.POSTGRES_DB));
}));

app.get("/ai-decisions/:id", asyncRoute(async (req, res) => {
  const decision = await getAiDecisionById(env.POSTGRES_DB, String(req.params.id));
  if (!decision) {
    res.status(404).json({ message: "AI decision not found" });
    return;
  }

  res.json(decision);
}));

const aiFeedbackSchema = z.object({
  verdict: z.enum(["accepted", "rejected"]),
  note: z.string().min(3).max(500).default("Operator reviewed decision")
});

app.post("/ai-decisions/:id/feedback", asyncRoute(async (req, res) => {
  const parsed = aiFeedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid AI feedback payload",
      issues: parsed.error.issues
    });
    return;
  }

  const decision = await getAiDecisionById(env.POSTGRES_DB, String(req.params.id));
  if (!decision) {
    res.status(404).json({ message: "AI decision not found" });
    return;
  }

  const created = await createAiFeedback(decision.signalId, parsed.data.verdict, parsed.data.note);
  res.status(201).json({
    id: created.id,
    signalId: created.signal_id,
    verdict: created.verdict,
    note: created.note,
    createdAt: created.created_at,
    replication: created.replication
  });
}));

app.get("/replication-events", asyncRoute(async (_req, res) => {
  res.json(await getReplicationQueue());
}));

const alertRuleSchema = z.object({
  channel: z.enum(["telegram", "discord", "email"]),
  condition: z.string().min(8)
});

app.get("/alerts", asyncRoute(async (_req, res) => {
  res.json(await getAlertRules());
}));

app.post("/alerts", asyncRoute(async (req, res) => {
  const parsed = alertRuleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid alert rule",
      issues: parsed.error.issues
    });
    return;
  }

  const created = await createAlertRule(parsed.data.channel, parsed.data.condition);
  res.status(201).json({
    id: created.id,
    channel: created.channel,
    condition: created.condition,
    isEnabled: created.is_enabled,
    replication: created.replication
  });
}));

const thesisSchema = z.object({
  signalId: z.string().uuid(),
  thesis: z.string().min(20)
});

app.get("/theses", asyncRoute(async (_req, res) => {
  res.json(await getTheses());
}));

app.post("/theses", asyncRoute(async (req, res) => {
  const parsed = thesisSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid thesis payload",
      issues: parsed.error.issues
    });
    return;
  }

  const created = await createThesis(parsed.data.signalId, parsed.data.thesis);
  res.status(201).json({
    id: created.id,
    status: created.status,
    createdAt: created.created_at,
    signalId: parsed.data.signalId,
    thesis: parsed.data.thesis,
    replication: created.replication
  });
}));

const watchlistSchema = z.object({
  name: z.string().min(3)
});

app.get("/watchlists", asyncRoute(async (_req, res) => {
  res.json(await getWatchlists());
}));

app.post("/watchlists", asyncRoute(async (req, res) => {
  const parsed = watchlistSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid watchlist payload",
      issues: parsed.error.issues
    });
    return;
  }

  const created = await createWatchlist(parsed.data.name);
  res.status(201).json(created);
}));

const adminLabelSchema = z.object({
  address: z.string().min(10),
  label: z.string().min(3),
  category: z.string().min(3),
  reason: z.string().min(10)
});

app.post("/admin/labels", asyncRoute(async (req, res) => {
  const parsed = adminLabelSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid label request",
      issues: parsed.error.issues
    });
    return;
  }

  const created = await createWalletLabel(
    parsed.data.address,
    parsed.data.label,
    parsed.data.category,
    parsed.data.reason
  );

  res.status(201).json({
    id: created.id,
    address: created.address,
    label: created.label,
    category: created.category,
    conviction: created.conviction,
    reason: parsed.data.reason,
    createdAt: new Date().toISOString(),
    replication: created.replication
  });
}));

app.get("/admin/reviews", asyncRoute(async (_req, res) => {
  const signals = await getSignals();
  res.json(
    signals.map((signal) => ({
      id: signal.id,
      headline: signal.headline,
      confidence: signal.confidence,
      severity: signal.severity,
      status: signal.confidence >= 85 ? "escalated" : "queued"
    }))
  );
}));

app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(`[${env.POSTGRES_DB}-api] unhandled route error`, error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
);

const bootstrap = async () => {
  await applyDatabaseBootstrap();
  await pool.query("select 1");
  app.listen(env.API_PORT, () => {
    console.log(`${env.POSTGRES_DB} API listening on :${env.API_PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error(`Failed to start ${env.POSTGRES_DB} API`, error);
  process.exit(1);
});
