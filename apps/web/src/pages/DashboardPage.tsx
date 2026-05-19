import { FormEvent, useEffect, useMemo, useState } from "react";

import { getJson, postJson } from "../api";
import { appConfig } from "../config";
import { useApi } from "../hooks/useApi";
import { createThesisOnChain, recordSignalOnChain } from "../onchain";
import type { AlertRule, Signal, StarterCard, ToastItem, TxState } from "../types";

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
  const { data: alertRules, isLoading: alertsLoading } = useApi(() => getJson<AlertRule[]>("/alerts"));
  const { data: starterWorkflows } = useApi(() => getJson<StarterCard[]>("/starter-workflows"));
  const [selectedSignalId, setSelectedSignalId] = useState("");
  const [thesis, setThesis] = useState("");
  const [alertChannel, setAlertChannel] = useState("telegram");
  const [alertCondition, setAlertCondition] = useState("");
  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  const signals = useMemo(() => data ?? [], [data]);
  const starters = useMemo(() => starterWorkflows ?? [], [starterWorkflows]);
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

  useEffect(() => {
    if (selectedSignal) {
      setAlertCondition(`Notify when ${selectedSignal.headline.toLowerCase()} changes materially.`);
    }
  }, [selectedSignal?.id]);

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

  const createAlert = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await postJson("/alerts", {
        channel: alertChannel,
        condition: alertCondition
      });
      onToast({
        title: "Alert created",
        body: `${alertChannel} rule saved to the VPS backend.`,
        tone: "success"
      });
      window.location.reload();
    } catch (alertError) {
      onToast({
        title: "Alert creation failed",
        body: alertError instanceof Error ? alertError.message : "Try again.",
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
    <main className={`dashboard dashboard-${appConfig.slug}`}>
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
        <div className="signal-board">
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
          {selectedSignal?.evidence?.length ? (
            <div className="evidence-stack">
              {selectedSignal.evidence.map((item) => (
                <article key={item.id} className="evidence-card">
                  <div className="eyebrow">{item.type}</div>
                  <h3>{item.title}</h3>
                  <p className="copy">{item.body}</p>
                </article>
              ))}
            </div>
          ) : null}
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

      <section className="dashboard-grid dashboard-grid-secondary">
        <article className="panel">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Alert routes</div>
              <h2>Persist watcher rules to the backend</h2>
            </div>
          </div>
          <form className="stack" onSubmit={createAlert}>
            <select className="input" value={alertChannel} onChange={(event) => setAlertChannel(event.target.value)}>
              <option value="telegram">Telegram</option>
              <option value="discord">Discord</option>
              <option value="email">Email</option>
            </select>
            <textarea
              className="textarea"
              value={alertCondition}
              onChange={(event) => setAlertCondition(event.target.value)}
              minLength={8}
              required
            />
            <button className="button secondary" type="submit">
              Save alert rule
            </button>
          </form>
          <div className="alert-list">
            {(alertRules ?? []).map((rule) => (
              <div key={rule.id} className="alert-row">
                <strong>{rule.channel}</strong>
                <span className="copy">{rule.condition}</span>
              </div>
            ))}
            {alertsLoading ? <p className="copy">Loading alert rules…</p> : null}
          </div>
        </article>
        <article className="panel">
          <div className="section-heading">
          <div>
            <div className="eyebrow">Starter library</div>
            <h2>Open a ready-made operator move</h2>
          </div>
          </div>
          <div className="starter-editorial-grid">
          {starters.map((card) => (
            <article key={card.id} className="story-card">
              <h3>{card.title}</h3>
              <p className="copy">{card.summary}</p>
              <button className="button secondary" onClick={() => onUseStarter(card)}>
                {card.cta}
              </button>
            </article>
          ))}
          </div>
        </article>
      </section>
    </main>
  );
}
