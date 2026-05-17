import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  http,
  keccak256,
  parseAbi,
  stringToBytes
} from "viem";

import { appConfig } from "./config";
import type { Signal } from "./types";

const signalRegistryAbi = parseAbi([
  "function recordSignal(bytes32 signalId, bytes32 evidenceHash, uint8 confidence, string headline)"
]);

const thesisRegistryAbi = parseAbi([
  "function createThesis(bytes32 signalId, string thesis)"
]);

const mantleChain = defineChain({
  id: appConfig.chainId,
  name: appConfig.chainName,
  nativeCurrency: {
    name: "Mantle",
    symbol: "MNT",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [appConfig.rpcUrl]
    }
  },
  blockExplorers: {
    default: {
      name: "Mantle Explorer",
      url: appConfig.explorerBaseUrl
    }
  }
});

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] | object[] }) => Promise<unknown>;
    };
  }
}

const toSignalKey = (signal: Signal) =>
  keccak256(stringToBytes(`${appConfig.slug}:${signal.id}`));

const toEvidenceHash = (signal: Signal) =>
  keccak256(stringToBytes(`${signal.id}:${signal.headline}:${signal.summary}`));

const ensureWallet = async () => {
  if (!window.ethereum) {
    throw new Error("No injected wallet found. Open the app with MetaMask or Rabby.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: appConfig.chainHex }]
    });
  } catch (error) {
    const walletError = error as { code?: number };
    if (walletError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: appConfig.chainHex,
            chainName: appConfig.chainName,
            nativeCurrency: {
              name: "Mantle",
              symbol: "MNT",
              decimals: 18
            },
            rpcUrls: [appConfig.rpcUrl],
            blockExplorerUrls: [appConfig.explorerBaseUrl]
          }
        ]
      });
    } else if (walletError.code !== -32002) {
      throw error;
    }
  }

  const walletClient = createWalletClient({
    chain: mantleChain,
    transport: custom(window.ethereum)
  });

  const [account] = await walletClient.requestAddresses();

  const publicClient = createPublicClient({
    chain: mantleChain,
    transport: http(appConfig.rpcUrl)
  });

  return { walletClient, publicClient, account };
};

export const recordSignalOnChain = async (signal: Signal) => {
  const { walletClient, publicClient, account } = await ensureWallet();
  const hash = await walletClient.writeContract({
    address: appConfig.contracts.signalRegistry as `0x${string}`,
    abi: signalRegistryAbi,
    functionName: "recordSignal",
    args: [
      toSignalKey(signal),
      toEvidenceHash(signal),
      signal.confidence,
      signal.headline
    ],
    account
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return {
    hash,
    explorerUrl: `${appConfig.explorerBaseUrl}/tx/${hash}`
  };
};

export const createThesisOnChain = async (signal: Signal, thesis: string) => {
  const { walletClient, publicClient, account } = await ensureWallet();
  const hash = await walletClient.writeContract({
    address: appConfig.contracts.thesisRegistry as `0x${string}`,
    abi: thesisRegistryAbi,
    functionName: "createThesis",
    args: [toSignalKey(signal), thesis],
    account
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return {
    hash,
    explorerUrl: `${appConfig.explorerBaseUrl}/tx/${hash}`
  };
};
