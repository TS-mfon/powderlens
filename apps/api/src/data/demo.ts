export type Signal = {
  id: string;
  headline: string;
  summary: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  sourceProtocol: string;
  destinationProtocol: string;
  sourceAsset: string;
  destinationAsset: string;
  createdAt: string;
  evidence: Array<{
    id: string;
    type: string;
    title: string;
    body: string;
  }>;
};

export const liveSignals: Signal[] = [
  {
    id: "sig-meth-cmeth-rotation",
    headline: "Smart LP cohort rotated from mETH/MNT into cmETH/USDe liquidity",
    summary:
      "A cluster of yield-focused wallets exited directional mETH exposure and re-entered via cmETH/USDe ranges, suggesting a lower-volatility yield posture ahead of the next campaign window.",
    confidence: 87,
    severity: "high",
    sourceProtocol: "Merchant Moe",
    destinationProtocol: "Merchant Moe",
    sourceAsset: "mETH",
    destinationAsset: "cmETH",
    createdAt: "2026-05-16T14:00:00.000Z",
    evidence: [
      {
        id: "ev-1",
        type: "wallet-cluster",
        title: "5-wallet LP cohort overlap",
        body: "Five previously correlated LP addresses exited mETH/MNT within 14 minutes and rebuilt into cmETH/USDe with similar range width."
      },
      {
        id: "ev-2",
        type: "yield-shift",
        title: "Defensive yield repositioning",
        body: "The cohort reduced directional MNT beta while preserving yield exposure through cmETH and stable routing."
      }
    ]
  },
  {
    id: "sig-usde-usdy-allocation",
    headline: "Treasury-style wallets are increasing USDY exposure after USDe outflows",
    summary:
      "Wallets tagged as low-turnover allocators are moving stable liquidity from USDe-linked pools into USDY accumulation paths, consistent with a duration and policy-safety tilt.",
    confidence: 81,
    severity: "medium",
    sourceProtocol: "Agni Finance",
    destinationProtocol: "Ondo route",
    sourceAsset: "USDe",
    destinationAsset: "USDY",
    createdAt: "2026-05-16T13:30:00.000Z",
    evidence: [
      {
        id: "ev-3",
        type: "treasury-pattern",
        title: "Low-turnover wallet behavior",
        body: "Observed addresses historically rotate capital only during mandate or yield-thesis changes and maintain longer holding periods."
      }
    ]
  }
];

export const wallets = [
  {
    address: "0x9c9a4a45b0f6b9c4d6e54c8ddf8457085e8f4a11",
    label: "Sticky Yield Cohort 01",
    category: "smart-lp",
    conviction: 92,
    thesis: "Repeatedly rotates between liquid staking and stable yield routes ahead of emissions changes."
  },
  {
    address: "0x5cb912f87af0f4607d3fa10a1d7d00f7d8b96cc2",
    label: "Treasury Pattern Wallet",
    category: "treasury",
    conviction: 76,
    thesis: "Prefers lower-churn, policy-aligned yield exposure across stable and RWA-linked routes."
  }
];

export const protocols = [
  {
    slug: "merchant-moe",
    name: "Merchant Moe",
    summary: "Cornerstone Mantle liquidity venue used for concentrated capital rotation and yield-sensitive LP repositioning.",
    activeSignals: 12,
    heatScore: 91
  },
  {
    slug: "agni-finance",
    name: "Agni Finance",
    summary: "High-efficiency Mantle DEX and launch venue, often used for fast liquidity re-pricing and stable route changes.",
    activeSignals: 7,
    heatScore: 74
  }
];
