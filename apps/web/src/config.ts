import type { AppConfig } from "./types";

export const appConfig: AppConfig = {
  slug: "powderlens",
  name: "PowderLens",
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
      destinationAsset: "cmETH"
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
      destinationAsset: "USDY"
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
