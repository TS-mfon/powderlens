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
};

export type AlertRule = {
  id: string;
  channel: string;
  condition: string;
  is_enabled?: boolean;
  isEnabled?: boolean;
};

export type Review = {
  id: string;
  headline: string;
  confidence: number;
  severity: string;
  status: string;
};
