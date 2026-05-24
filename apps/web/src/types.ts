export type Signal = {
  id: string;
  headline: string;
  summary: string;
  confidence: number;
  severity: string;
  sourceProtocol: string;
  destinationProtocol: string;
  sourceAsset: string;
  destinationAsset: string;
  createdAt?: string;
  evidence?: Array<{
    id: string;
    type: string;
    title: string;
    body: string;
  }>;
};

export type AlertRule = {
  id: string;
  channel: string;
  condition: string;
  is_enabled?: boolean;
  isEnabled?: boolean;
  createdAt?: string;
  replication?: ReplicationResult;
};

export type ReplicationResult = {
  status: "replicated" | "failed" | "disabled";
  error?: string;
};

export type AIDecision = {
  id: string;
  signalId: string;
  track: string;
  modelVersion: string;
  decisionType: string;
  score: number;
  confidence: number;
  rationale: string;
  drivers: string[];
  riskFlags: string[];
  recommendedAction: string;
  expectedOutcome: string;
  feedback: {
    accepted: number;
    rejected: number;
  };
  evidenceHash: string;
  createdAt: string;
};

export type ReplicationEvent = {
  id: string;
  action: string;
  targetTable: string;
  targetId: string;
  sourceRole: string;
  targetRole: string;
  status: string;
  errorMessage: string;
  createdAt: string;
  resolvedAt: string | null;
};

export type Review = {
  id: string;
  headline: string;
  confidence: number;
  severity: string;
  status: string;
};

export type ContractConfig = {
  signalRegistry: string;
  thesisRegistry: string;
  adminController: string;
};

export type ThemeConfig = {
  bg: string;
  surface: string;
  surfaceStrong: string;
  line: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  glowA: string;
  glowB: string;
  gradient: string;
};

export type HeroStat = {
  label: string;
  value: string;
};

export type MetricCard = {
  label: string;
  value: string;
  detail: string;
};

export type GuideStep = {
  title: string;
  body: string;
};

export type DocSection = {
  id: string;
  title: string;
  body: string;
  bullets: string[];
};

export type StarterCard = {
  id: string;
  title: string;
  summary: string;
  cta: string;
  thesis: string;
  signalId?: string;
};

export type AppConfig = {
  slug: string;
  name: string;
  tag: string;
  tagline: string;
  valueProp: string;
  launchLabel: string;
  docsLabel: string;
  aiAwakeningFit: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  guideIntro: string;
  docsIntro: string;
  chainId: number;
  chainHex: string;
  chainName: string;
  rpcUrl: string;
  explorerBaseUrl: string;
  contracts: ContractConfig;
  theme: ThemeConfig;
  heroStats: HeroStat[];
  metrics: MetricCard[];
  guideSteps: GuideStep[];
  docs: DocSection[];
  starterCards: StarterCard[];
  fallbackSignals: Signal[];
  defaultAlerts: AlertRule[];
};

export type TxState = {
  status: "idle" | "pending" | "success" | "error";
  message?: string;
  hash?: string;
  explorerUrl?: string;
};

export type ServiceHealth = {
  backendAvailable: boolean;
  lastCheckedAt: string | null;
  message: string;
  runtimeOrigin?: "vps" | "render" | null;
  backendRole?: "primary" | "fallback" | null;
};

export type RuntimeStatus = {
  service: string;
  database: string;
  runtimeOrigin: "vps" | "render";
  backendRole: "primary" | "fallback";
  signalCount: number;
  starterCount: number;
  alertCount: number;
  thesisCount: number;
  aiFeedbackCount: number;
  replication: {
    status: string;
    failedCount: number;
    lastReplicationAt: string | null;
  };
  heartbeats: Array<{
    serviceName: string;
    status: string;
    details: string;
    lastRanAt: string;
  }>;
};

export type ToastItem = {
  id: string;
  title: string;
  body: string;
  tone: "info" | "success" | "error";
  href?: string;
};
