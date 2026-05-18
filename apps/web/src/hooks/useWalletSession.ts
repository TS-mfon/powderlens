import { useEffect, useState } from "react";

import { connectWallet, getConnectedWallet } from "../onchain";

export function useWalletSession() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getConnectedWallet()
      .then((value) => {
        if (active) {
          setAccount(value);
        }
      })
      .catch(() => {
        if (active) {
          setAccount(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const next = await connectWallet();
      setAccount(next);
      return next;
    } catch (connectError) {
      const message =
        connectError instanceof Error ? connectError.message : "Wallet connection failed.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    account,
    isConnecting,
    error,
    isConnected: Boolean(account),
    connect
  };
}
