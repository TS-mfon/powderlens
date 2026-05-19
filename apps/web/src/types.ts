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
};

export type RuntimeStatus = {
  service: string;
  database: string;
  signalCount: number;
  starterCount: number;
  alertCount: number;
  thesisCount: number;
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
