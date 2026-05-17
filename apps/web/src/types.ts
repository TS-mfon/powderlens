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

export type AppConfig = {
  slug: string;
  name: string;
  chainId: number;
  chainHex: string;
  chainName: string;
  rpcUrl: string;
  explorerBaseUrl: string;
  contracts: ContractConfig;
  fallbackSignals: Signal[];
  defaultAlerts: AlertRule[];
};

export type TxState = {
  status: "idle" | "pending" | "success" | "error";
  message?: string;
  hash?: string;
  explorerUrl?: string;
};
