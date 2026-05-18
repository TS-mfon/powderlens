import type { AppConfig } from "./types";

export const appConfig: AppConfig = {
  slug: "powderlens",
  name: "PowderLens",
  tag: "AI Alpha & Data",
  tagline: "Mantle capital rotation radar",
  valueProp:
    "PowderLens turns Mantle wallet behavior, liquidity rotation, and yield migrations into operator-grade intelligence that traders, protocol teams, and treasury managers can act on in minutes.",
  launchLabel: "Launch Radar",
  docsLabel: "Read Intelligence Stack",
  aiAwakeningFit:
    "PowderLens fits AI Awakening by using AI to explain real Mantle capital movement, benchmark operator-grade signals, and persist on-chain conviction records for public verification.",
  dashboardTitle: "Live rotation board",
  dashboardSubtitle:
    "Monitor where sticky capital is moving, promote high-conviction insights on-chain, and spin up new operating theses from one command surface.",
  guideIntro:
    "Use PowderLens like an intelligence desk: review the rotation board, inspect the highest-conviction move, then record the insight and publish a thesis when you are ready to act.",
  docsIntro:
    "The stack combines a Mantle-aware signal registry, thesis registry, backend health checks, and operator-facing workflows designed for public AI benchmarking.",
  chainId: 5000,
  chainHex: "0x1388",
  chainName: "Mantle Mainnet",
  rpcUrl: "https://rpc.mantle.xyz",
  explorerBaseUrl: "https://mantlescan.xyz",
  contracts: {
    signalRegistry: "0x45119A32ca6C4d67424401dA92Abe4EC6c83f8Ce",
    thesisRegistry: "0xB0DBC829dF852Ea96C14A7D06cE8D773B1F8892b",
    adminController: "0x6855B0D90f618885d056F898b14AEa513D633048"
  },
  theme: {
    bg: "#071019",
    surface: "rgba(10, 22, 32, 0.78)",
    surfaceStrong: "rgba(12, 27, 40, 0.96)",
    line: "rgba(158, 255, 221, 0.12)",
    text: "#eefbf6",
    muted: "#92b6af",
    accent: "#87ffd6",
    accentSoft: "rgba(135, 255, 214, 0.12)",
    accentStrong: "#3ce6af",
    glowA: "rgba(60, 230, 175, 0.22)",
    glowB: "rgba(4, 195, 255, 0.16)",
    gradient: "linear-gradient(135deg, #87ffd6 0%, #04c3ff 100%)"
  },
  heroStats: [
    { label: "Tracked yield assets", value: "6" },
    { label: "Watchlisted wallets", value: "38" },
    { label: "High-conviction signals", value: "12" }
  ],
  metrics: [
    {
      label: "Capital rotation velocity",
      value: "14m",
      detail: "Median time between source exit and destination rebalance"
    },
    {
      label: "Signal conviction spread",
      value: "81-87%",
      detail: "Confidence band across the current live board"
    },
    {
      label: "Protocol heat focus",
      value: "Merchant Moe",
      detail: "Current dominant venue for tracked LP migration"
    }
  ],
  guideSteps: [
    {
      title: "Open the radar",
      body: "Start on the landing page, then jump into the live board to see which Mantle assets and protocols are currently pulling capital."
    },
    {
      title: "Inspect the lead move",
      body: "Use the dashboard to review the highest-conviction rotation, compare source and destination assets, and understand why the signal matters now."
    },
    {
      title: "Record and publish",
      body: "If you agree with the signal, write it to the SignalRegistry, then publish your operator thesis on-chain for transparent benchmarking."
    }
  ],
  docs: [
    {
      id: "problem",
      title: "Problem",
      body:
        "Mantle liquidity rotates quickly between yield-bearing assets, incentive programs, and LP ranges. Operators need more than raw wallet lists; they need timing, explanation, and accountability.",
      bullets: [
        "Generic dashboards miss why the move matters.",
        "Protocol teams need watchable signals, not after-the-fact analytics.",
        "Hackathon judges need visible proof that the AI system can explain itself."
      ]
    },
    {
      id: "architecture",
      title: "Architecture",
      body:
        "PowderLens uses a frontend dashboard, a Mantle contract pair for signal and thesis persistence, and a VPS health-aware runtime that degrades cleanly when backend services are unavailable.",
      bullets: [
        "SignalRegistry stores public signal attestations.",
        "ThesisRegistry stores operator conviction and timing.",
        "Frontend health monitor keeps on-chain actions live even when the backend is unavailable."
      ]
    },
    {
      id: "awakening",
      title: "AI Awakening Fit",
      body:
        "This dapp is shaped for AI Alpha & Data: the AI layer does not just summarize; it creates operationally relevant signal narratives that can be benchmarked and replayed.",
      bullets: [
        "Explains on-chain movement in plain language.",
        "Persists operator actions on Mantle for transparency.",
        "Creates a credible path from insight to recorded action."
      ]
    }
  ],
  starterCards: [
    {
      id: "yield-rotation",
      title: "Promote the cmETH rotation thesis",
      summary:
        "Use the highest-conviction powder move and publish a ready-to-use thesis about defensive yield repositioning.",
      cta: "Use this thesis",
      signalId: "20000000-0000-0000-0000-000000000001",
      thesis:
        "Sticky yield wallets are reducing directional beta and rebuilding through cmETH/USDe. The move looks like defensive capital preservation, not a full risk-off exit, which supports a follow-on watch on low-volatility yield routes."
    },
    {
      id: "treasury-watch",
      title: "Load the treasury allocator watch",
      summary:
        "Pre-fill an operator note for treasury-style wallets rotating from USDe into USDY accumulation paths.",
      cta: "Load watch note",
      signalId: "20000000-0000-0000-0000-000000000002",
      thesis:
        "Treasury-style wallets are behaving like slow, mandate-driven allocators. The USDY increase should be treated as a durable reweighting signal and not a short-term incentive chase."
    }
  ],
  fallbackSignals: [
    {
      id: "20000000-0000-0000-0000-000000000001",
      headline: "Smart LP cohort rotated from mETH/MNT into cmETH/USDe liquidity",
      summary:
        "A cluster of yield-focused wallets exited directional mETH exposure and re-entered via cmETH/USDe ranges, suggesting a lower-volatility yield posture.",
      confidence: 87,
      severity: "high",
      sourceProtocol: "Merchant Moe",
      destinationProtocol: "Merchant Moe",
      sourceAsset: "mETH",
      destinationAsset: "cmETH",
      createdAt: "2026-05-18T09:15:00.000Z"
    },
    {
      id: "20000000-0000-0000-0000-000000000002",
      headline: "Treasury-style wallets are increasing USDY exposure after USDe outflows",
      summary:
        "Wallets tagged as low-turnover allocators are moving stable liquidity from USDe-linked pools into USDY accumulation paths.",
      confidence: 81,
      severity: "medium",
      sourceProtocol: "Agni Finance",
      destinationProtocol: "Ondo route",
      sourceAsset: "USDe",
      destinationAsset: "USDY",
      createdAt: "2026-05-18T08:42:00.000Z"
    }
  ],
  defaultAlerts: [
    {
      id: "pl-alert-1",
      channel: "telegram",
      condition: "Fire when confidence is above 85 and cmETH rotation accelerates.",
      isEnabled: true
    },
    {
      id: "pl-alert-2",
      channel: "discord",
      condition: "Notify when treasury-style wallets increase USDY accumulation.",
      isEnabled: true
    }
  ]
};
