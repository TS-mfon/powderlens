import { FormEvent, useEffect, useMemo, useState } from "react";

import { getJson } from "../api";
import { appConfig } from "../config";
import { useApi } from "../hooks/useApi";
import { createThesisOnChain, recordSignalOnChain } from "../onchain";
import type { Signal, StarterCard, ToastItem, TxState } from "../types";

type DashboardPageProps = {
  backendAvailable: boolean;
  starterDraft: StarterCard | null;
  onClearStarter: () => void;
  onUseStarter: (starter: StarterCard) => void;
  onToast: (toast: Omit<ToastItem, "id">) => void;
};

export function DashboardPage({
  backendAvailable,
  starterDraft,
  onClearStarter,
  onUseStarter,
  onToast
}: DashboardPageProps) {
  const { data, error, isLoading } = useApi(() => getJson<Signal[]>("/signals"));
  const [selectedSignalId, setSelectedSignalId] = useState("");
  const [thesis, setThesis] = useState("");
  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  const signals = useMemo(() => data ?? [], [data]);
  const selectedSignal =
    signals.find((signal) => signal.id === selectedSignalId) ??
    (starterDraft?.signalId
      ? signals.find((signal) => signal.id === starterDraft.signalId)
      : undefined) ??
    signals[0];

  useEffect(() => {
    if (!starterDraft) {
      return;
    }

    setThesis(starterDraft.thesis);
    if (starterDraft.signalId) {
      setSelectedSignalId(starterDraft.signalId);
    }
  }, [starterDraft]);

  const recordSignal = async (signal: Signal) => {
    setTxState({ status: "pending", message: `Recording ${signal.headline}...` });

    try {
      const result = await recordSignalOnChain(signal);
      setTxState({
        status: "success",
        message: "Signal recorded on Mantle.",
        hash: result.hash,
        explorerUrl: result.explorerUrl
      });
      onToast({
        title: "Signal recorded",
        body: signal.headline,
        tone: "success",
        href: result.explorerUrl
      });
    } catch (txError) {
      const message =
        txError instanceof Error ? txError.message : "Signal transaction failed.";
      setTxState({ status: "error", message });
      onToast({
        title: "Signal transaction failed",
        body: message,
        tone: "error"
      });
    }
  };

  const publishThesis = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSignal) {
      return;
    }

    setTxState({ status: "pending", message: "Publishing thesis on Mantle..." });

    try {
      const result = await createThesisOnChain(selectedSignal, thesis);
      setTxState({
        status: "success",
        message: "Thesis published on Mantle.",
        hash: result.hash,
        explorerUrl: result.explorerUrl
      });
      onToast({
        title: "Thesis published",
        body: selectedSignal.headline,
        tone: "success",
        href: result.explorerUrl
      });
    } catch (txError) {
      const message =
        txError instanceof Error ? txError.message : "Thesis transaction failed.";
      setTxState({ status: "error", message });
      onToast({
        title: "Thesis transaction failed",
        body: message,
        tone: "error"
      });
    }
  };

  if (isLoading) {
    return <main className="panel">Loading Mantle intelligence...</main>;
  }

  if (error) {
    return <main className="panel">Failed to load signals: {error}</main>;
  }

  return (
    <main className="dashboard">
      <section className="panel dashboard-lead">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Dashboard</div>
            <h1>{appConfig.dashboardTitle}</h1>
            <p className="copy">{appConfig.dashboardSubtitle}</p>
          </div>
          <span className={`health-pill ${backendAvailable ? "healthy" : "degraded"}`}>
            {backendAvailable ? "Indexer live" : "Indexer degraded"}
          </span>
        </div>
        <div className="table table-tight">
          {signals.map((signal) => (
            <button
              key={signal.id}
              className={`signal-row ${selectedSignal?.id === signal.id ? "active" : ""}`}
              onClick={() => setSelectedSignalId(signal.id)}
            >
              <div>
                <strong>{signal.headline}</strong>
                <div className="muted">
                  {signal.sourceAsset} → {signal.destinationAsset}
                </div>
              </div>
              <span>{signal.confidence}%</span>
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel detail-panel">
          <div className="eyebrow">Selected signal</div>
          <h2>{selectedSignal?.headline}</h2>
          <p className="copy">{selectedSignal?.summary}</p>
          <div className="meta-grid">
            <div>
              <span className="muted">Source</span>
              <strong>{selectedSignal?.sourceProtocol}</strong>
            </div>
            <div>
              <span className="muted">Destination</span>
              <strong>{selectedSignal?.destinationProtocol}</strong>
            </div>
            <div>
              <span className="muted">Asset path</span>
              <strong>
                {selectedSignal?.sourceAsset} → {selectedSignal?.destinationAsset}
              </strong>
            </div>
            <div>
              <span className="muted">Severity</span>
              <strong>{selectedSignal?.severity}</strong>
            </div>
          </div>
          <div className="cta-row">
            {selectedSignal ? (
              <button className="button" onClick={() => void recordSignal(selectedSignal)}>
                Record signal on Mantle
              </button>
            ) : null}
            {starterDraft ? (
              <button className="button secondary" onClick={onClearStarter}>
                Clear starter
              </button>
            ) : null}
          </div>
        </article>

        <article className="panel composer-panel">
          <div className="eyebrow">Thesis composer</div>
          <h2>Publish operator conviction</h2>
          <form className="stack" onSubmit={publishThesis}>
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
              value={thesis}
              onChange={(event) => setThesis(event.target.value)}
              placeholder="Write the Mantle thesis you want judges and operators to see on-chain."
              minLength={20}
              required
            />
            <button className="button" type="submit">
              Publish thesis on Mantle
            </button>
          </form>
          {txState.status !== "idle" ? (
            <div className="status-block">
              <strong>{txState.message}</strong>
              {txState.explorerUrl ? (
                <a href={txState.explorerUrl} target="_blank" rel="noreferrer">
                  View on Mantle Explorer
                </a>
              ) : null}
            </div>
          ) : null}
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Starter library</div>
            <h2>Open a ready-made operator move</h2>
          </div>
        </div>
        <div className="card-grid">
          {appConfig.starterCards.map((card) => (
            <article key={card.id} className="story-card">
              <h3>{card.title}</h3>
              <p className="copy">{card.summary}</p>
              <button className="button secondary" onClick={() => onUseStarter(card)}>
                {card.cta}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
