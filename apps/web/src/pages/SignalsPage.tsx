import { FormEvent, useMemo, useState } from "react";

import { getJson } from "../api";
import { createThesisOnChain, recordSignalOnChain } from "../onchain";
import { useApi } from "../hooks/useApi";
import type { Signal, TxState } from "../types";

export function SignalsPage() {
  const { data, error, isLoading } = useApi(() => getJson<Signal[]>("/signals"));
  const [selectedSignalId, setSelectedSignalId] = useState<string>("");
  const [thesis, setThesis] = useState("");
  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  const signals = useMemo(() => data ?? [], [data]);
  const selectedSignal =
    signals.find((signal) => signal.id === selectedSignalId) ?? signals[0];

  const onRecordSignal = async (signal: Signal) => {
    setTxState({ status: "pending", message: `Recording ${signal.headline} on Mantle...` });

    try {
      const result = await recordSignalOnChain(signal);
      setTxState({
        status: "success",
        message: "Signal recorded on Mantle mainnet.",
        hash: result.hash,
        explorerUrl: result.explorerUrl
      });
    } catch (txError) {
      setTxState({
        status: "error",
        message: txError instanceof Error ? txError.message : "Signal transaction failed."
      });
    }
  };

  const onSubmitThesis = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSignal) {
      return;
    }

    setTxState({ status: "pending", message: "Publishing thesis to Mantle..." });

    try {
      const result = await createThesisOnChain(selectedSignal, thesis);
      setThesis("");
      setTxState({
        status: "success",
        message: "Thesis published on Mantle mainnet.",
        hash: result.hash,
        explorerUrl: result.explorerUrl
      });
    } catch (txError) {
      setTxState({
        status: "error",
        message: txError instanceof Error ? txError.message : "Thesis transaction failed."
      });
    }
  };

  if (isLoading) {
    return <main className="panel">Loading signals...</main>;
  }

  if (error) {
    return <main className="panel">Failed to load signals: {error}</main>;
  }

  return (
    <main className="panel">
      <div className="eyebrow">Signal queue</div>
      <h1>Live signals</h1>
      <div className="table">
        {signals.map((signal) => (
          <div key={signal.id} className="row">
            <div>{signal.headline}</div>
            <div>{signal.confidence}%</div>
            <div>{signal.severity}</div>
            <div className="stack">
              <div className="muted">{signal.summary}</div>
              <button className="button secondary" onClick={() => void onRecordSignal(signal)}>
                Record on Mantle
              </button>
            </div>
          </div>
        ))}
      </div>
      <form className="stack" onSubmit={onSubmitThesis}>
        <div className="eyebrow">Thesis publisher</div>
        <select
          className="input"
          value={selectedSignal?.id ?? ""}
          onChange={(event) => setSelectedSignalId(event.target.value)}
        >
          {signals.map((signal) => (
            <option key={signal.id} value={signal.id}>
              {signal.headline}
            </option>
          ))}
        </select>
        <textarea
          className="textarea"
          placeholder="Write the operator thesis you want to persist on Mantle."
          value={thesis}
          onChange={(event) => setThesis(event.target.value)}
          minLength={20}
          required
        />
        <button className="button" type="submit">
          Publish thesis on Mantle
        </button>
      </form>
      {txState.status !== "idle" ? (
        <div className="panel status-card">
          <div className="eyebrow">Transaction state</div>
          <div>{txState.message}</div>
          {txState.explorerUrl ? (
            <a className="tx-link" href={txState.explorerUrl} target="_blank" rel="noreferrer">
              View on Mantle Explorer
            </a>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
